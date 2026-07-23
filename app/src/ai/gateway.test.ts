import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { blankPayloadForKind } from "@/app/studio/kind-schemas";
import { BestPracticeSchema, ElementSchema } from "@/content/types";

/**
 * Gateway pipeline tests — no network, no database. The store (settings,
 * templates, ai_calls) and env are mocked; ollama is exercised via a stubbed
 * global fetch to drive the schema retry path through real gateway code.
 */

vi.mock("@/lib/env", () => ({
  env: {
    ANTHROPIC_API_KEY: "",
    OLLAMA_BASE_URL: "http://127.0.0.1:11434",
    NODE_ENV: "test",
  },
}));

vi.mock("@/ai/store", () => ({
  getAiSetting: vi.fn(),
  getPromptTemplate: vi.fn(),
  recordAiCall: vi.fn(),
}));

import { callModel } from "./gateway";
import { getAiSetting, getPromptTemplate, recordAiCall } from "./store";

const getAiSettingMock = vi.mocked(getAiSetting);
const getPromptTemplateMock = vi.mocked(getPromptTemplate);
const recordAiCallMock = vi.mocked(recordAiCall);

function settings(map: Record<string, unknown>) {
  getAiSettingMock.mockImplementation(async (key: string) => map[key] ?? null);
}

beforeEach(() => {
  vi.resetAllMocks();
  settings({});
  getPromptTemplateMock.mockResolvedValue(null);
  recordAiCallMock.mockResolvedValue(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("gateway kill-switch", () => {
  it("refuses with status killed and still writes the audit row", async () => {
    settings({ "killswitch.all": true });

    const result = await callModel({
      feature: "library-qa",
      system: "You are a test.",
      user: "Which obligations cover claims data?",
    });

    expect(result.status).toBe("killed");
    expect(result.errorDetail).toMatch(/paused by an administrator/i);
    expect(recordAiCallMock).toHaveBeenCalledTimes(1);
    expect(recordAiCallMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: "killed", feature: "library-qa" }),
    );
  });

  it("honours a per-feature kill-switch", async () => {
    settings({ "killswitch.copilot-compose": "true" });
    const result = await callModel({
      feature: "copilot-compose",
      system: "test",
      user: "brief",
    });
    expect(result.status).toBe("killed");
  });
});

describe("gateway redaction + audit", () => {
  it("redacts PII before dispatch and lands the report in the ai_calls row", async () => {
    // Default routing → anthropic, but no API key → automatic mock fallback.
    const result = await callModel({
      feature: "adhoc",
      system: "You are a test.",
      user: "Client SSN 123-45-6789, email jane.doe@carrier.com — summarize exposure.",
    });

    expect(result.status).toBe("ok");
    expect(result.redactionReport.ssn).toBe(1);
    expect(result.redactionReport.email).toBe(1);
    expect(recordAiCallMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "ok",
        redactionReport: expect.objectContaining({ ssn: 1, email: 1 }),
      }),
    );
  });
});

describe("gateway provider fallback", () => {
  it("falls back to mock with degraded flag when anthropic has no key", async () => {
    settings({ "routing.default": { provider: "anthropic", model: "claude-opus-4-8" } });

    const result = await callModel({
      feature: "adhoc",
      system: "You are a test.",
      user: "hello",
    });

    expect(result.status).toBe("ok");
    expect(result.degraded).toBe(true);
    expect(result.provider).toBe("mock");
    expect(result.text.length).toBeGreaterThan(0);
    // Audit records the provider that actually answered.
    expect(recordAiCallMock).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "mock", status: "ok" }),
    );
  });

  it("falls back to mock when ollama is unreachable", async () => {
    settings({ "routing.default": { provider: "ollama", model: "llama3" } });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED")),
    );

    const result = await callModel({ feature: "adhoc", system: "test", user: "hello" });

    expect(result.status).toBe("ok");
    expect(result.degraded).toBe(true);
    expect(result.provider).toBe("mock");
    expect(result.errorDetail).toMatch(/fell back to mock/i);
  });
});

describe("gateway schema gate", () => {
  const Shape = z.object({ ok: z.boolean(), label: z.string() });

  function ollamaReply(content: string) {
    return {
      ok: true,
      json: async () => ({ message: { content }, prompt_eval_count: 10, eval_count: 5 }),
    };
  }

  it("retries once on invalid JSON and succeeds on the corrected reply", async () => {
    settings({ "routing.default": { provider: "ollama", model: "llama3" } });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(ollamaReply("definitely not json"))
      .mockResolvedValueOnce(ollamaReply('{"ok": true, "label": "fixed"}'));
    vi.stubGlobal("fetch", fetchMock);

    const result = await callModel({
      feature: "adhoc",
      system: "test",
      user: "give me json",
      schema: Shape,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    // The corrective retry names the validation problem.
    const retryBody = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(retryBody.messages[1].content).toMatch(/failed validation/);
    expect(result.status).toBe("ok");
    expect(result.data).toEqual({ ok: true, label: "fixed" });
  });

  it("returns status error when the retry is still invalid, and audits it", async () => {
    settings({ "routing.default": { provider: "ollama", model: "llama3" } });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(ollamaReply('{"ok": "not-a-boolean"}')),
    );

    const result = await callModel({
      feature: "adhoc",
      system: "test",
      user: "give me json",
      schema: Shape,
    });

    expect(result.status).toBe("error");
    expect(result.data).toBeUndefined();
    expect(recordAiCallMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "error",
        errorDetail: expect.stringContaining("schema validation failed"),
      }),
    );
  });
});

describe("mock provider schema-valid canned output", () => {
  const ComposeShape = z.object({
    sectorKey: z.string(),
    scenarioKey: z.string(),
    rationale: z.string(),
    suggestedElementKeys: z.array(z.string()).optional(),
  });

  it("keyword-matches a brief against the catalog for copilot-compose", async () => {
    settings({ "routing.default": { provider: "mock", model: "mock" } });

    const user = [
      'SECTOR key=pc-commercial name="Commercial P&C" tagline="Complex commercial lines and specialty risk"',
      'SECTOR key=life-annuities name="Life & Annuities" tagline="Long-duration reserving and policyholder data"',
      'SCENARIO key=regulatory-reporting name="Regulatory Reporting" tagline="Statutory filings and examiner evidence"',
      'SCENARIO key=claims-analytics name="Claims Analytics" tagline="Claims data quality and loss insight"',
      'ELEMENT key=schedule-p-cde-library name="Schedule P CDE Library"',
      "",
      "BRIEF:",
      "Commercial lines carrier under statutory reporting pressure; examiners flagged Schedule P restatements.",
    ].join("\n");

    const result = await callModel({
      feature: "copilot-compose",
      system: "test",
      user,
      schema: ComposeShape,
    });

    expect(result.status).toBe("ok");
    expect(result.data?.sectorKey).toBe("pc-commercial");
    expect(result.data?.scenarioKey).toBe("regulatory-reporting");
    expect(result.data?.rationale.length).toBeGreaterThan(10);
  });

  it("answers library-qa from SNIPPET lines with citations, or admits the gap", async () => {
    settings({ "routing.default": { provider: "mock", model: "mock" } });
    const QaShape = z.object({
      answer: z.string(),
      citations: z.array(z.object({ kind: z.string(), key: z.string(), name: z.string() })),
    });

    const withSnippets = await callModel({
      feature: "library-qa",
      system: "test",
      user: 'SNIPPET kind=best-practice key=cde-first name="CDE First"\nStart every governance push from critical data elements.\n\nQUESTION: Where do we start?',
      schema: QaShape,
    });
    expect(withSnippets.status).toBe("ok");
    expect(withSnippets.data?.citations).toEqual([
      { kind: "best-practice", key: "cde-first", name: "CDE First" },
    ]);

    const withoutSnippets = await callModel({
      feature: "library-qa",
      system: "test",
      user: "(no matching snippets found)\n\nQUESTION: What is the meaning of life?",
      schema: QaShape,
    });
    expect(withoutSnippets.status).toBe("ok");
    expect(withoutSnippets.data?.answer).toMatch(/not in the library/i);
    expect(withoutSnippets.data?.citations).toEqual([]);
  });

  it("studio-enhance: extends the artifact's own array on an 'add'/'more' instruction, preserving unrelated fields", async () => {
    settings({ "routing.default": { provider: "mock", model: "mock" } });

    const payload = {
      key: "cde-glossary-starter",
      packKey: "vp-01",
      type: "cde-library",
      name: "Claims CDE Glossary",
      pitch: "A starter glossary of claims critical data elements.",
      description: "Five plain-English definitions curators can extend as coverage grows.",
      soWhat: "Stewards stop reinventing definitions ad hoc.",
      audience: ["data-steward"],
      capabilities: ["catalog_metadata"],
      bestPracticeKeys: ["cde-first"],
      sectorAffinity: {},
      scenarioAffinity: {},
      toolTags: ["catalog-suite (Collibra, Atlan)"],
      artifact: {
        kind: "glossary",
        terms: [
          { term: "Claim Number", definition: "Unique identifier for a claim." },
          { term: "Loss Date", definition: "Date the insured event occurred." },
          { term: "Reserve", definition: "Estimated liability for an open claim." },
          { term: "Adjuster", definition: "Person handling claim investigation and settlement." },
          { term: "Coverage Line", definition: "The policy coverage the claim is filed under." },
        ],
      },
    };

    const user = `CONTENT KIND: element\n\nCURRENT PAYLOAD:\n${JSON.stringify(payload)}\n\nINSTRUCTION:\nAdd another glossary term for reinsurance cession`;

    const result = await callModel({
      feature: "studio-enhance",
      system: "test",
      user,
      schema: ElementSchema,
    });

    expect(result.status).toBe("ok");
    const data = result.data as typeof payload;
    expect(data.artifact.terms).toHaveLength(payload.artifact.terms.length + 1);
    expect(data.name).toBe(payload.name);
    expect(data.key).toBe(payload.key);
  });

  it("studio-enhance: fills TODO placeholders (recursively) when the instruction is a plain edit, never touching the key", async () => {
    settings({ "routing.default": { provider: "mock", model: "mock" } });

    const payload = blankPayloadForKind("best-practice", "cde-first-always") as Record<
      string,
      unknown
    >;
    const user = `CONTENT KIND: best-practice\n\nCURRENT PAYLOAD:\n${JSON.stringify(payload)}\n\nINSTRUCTION:\nTighten the statement to be more concrete`;

    const result = await callModel({
      feature: "studio-enhance",
      system: "test",
      user,
      schema: BestPracticeSchema,
    });

    expect(result.status).toBe("ok");
    const data = result.data as Record<string, unknown>;
    expect(data.key).toBe("cde-first-always");
    expect(data.statement).not.toMatch(/^TODO/);
    expect(data.title).not.toMatch(/^TODO/);
  });
});
