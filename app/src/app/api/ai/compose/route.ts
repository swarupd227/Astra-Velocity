import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAiUser } from "@/ai/authz";
import { callModel } from "@/ai/gateway";
import { contentStore } from "@/content/store";

export const dynamic = "force-dynamic";

/**
 * Engagement Copilot: a prose brief about a client situation → structured
 * sector × scenario placement with rationale and suggested library elements.
 * Keys are validated against published content; anything the model invents is
 * dropped, and an unplaceable brief returns needsClarification instead of a guess.
 */

const BodySchema = z.object({
  brief: z.string().trim().min(20, "Describe the client situation in a sentence or two").max(4000),
});

const ComposeOutputSchema = z.object({
  sectorKey: z.string(),
  scenarioKey: z.string(),
  rationale: z.string().min(1),
  suggestedElementKeys: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const guard = await requireAiUser("ai.use");
  if ("error" in guard) return guard.error;

  const body = BodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const [sectors, scenarios, elements] = await Promise.all([
    contentStore.sectors(),
    contentStore.scenarios(),
    contentStore.elements(),
  ]);

  const catalog = [
    ...sectors.map((s) => `SECTOR key=${s.key} name="${s.name}" tagline="${s.tagline}"`),
    ...scenarios.map((s) => `SCENARIO key=${s.key} name="${s.name}" tagline="${s.tagline}"`),
    ...elements.map((el) => `ELEMENT key=${el.key} name="${el.name}"`),
  ].join("\n");

  const user = `CATALOG (published sectors, scenarios, and elements — the only valid keys):\n${catalog}\n\nBRIEF:\n${body.data.brief}`;

  const result = await callModel({
    feature: "copilot-compose",
    template: { key: "copilot-compose" },
    user,
    schema: ComposeOutputSchema,
    maxTokens: 1500,
    userId: guard.user.id,
  });

  if (result.status === "killed") {
    return NextResponse.json({ error: result.errorDetail, killed: true }, { status: 503 });
  }
  if (result.status !== "ok" || !result.data) {
    return NextResponse.json(
      { error: "The copilot could not structure this brief. Try adding more detail.", detail: result.errorDetail },
      { status: 502 },
    );
  }

  const sector = sectors.find((s) => s.key === result.data!.sectorKey);
  const scenario = scenarios.find((s) => s.key === result.data!.scenarioKey);

  if (!sector || !scenario) {
    return NextResponse.json({
      needsClarification: true,
      message:
        result.data.rationale ||
        "The brief doesn't identify a line of business or governance objective clearly enough. Add the client's sector and what outcome they're chasing.",
      degraded: result.degraded,
    });
  }

  const knownElements = new Set(elements.map((el) => el.key));
  const suggestedElementKeys = (result.data.suggestedElementKeys ?? []).filter((k) =>
    knownElements.has(k),
  );

  return NextResponse.json({
    sectorKey: sector.key,
    sectorName: sector.name,
    scenarioKey: scenario.key,
    scenarioName: scenario.name,
    rationale: result.data.rationale,
    suggestedElementKeys,
    suggestedElements: suggestedElementKeys.map((k) => {
      const el = elements.find((e) => e.key === k)!;
      return { key: el.key, name: el.name };
    }),
    composerHref: `/composer?sector=${sector.key}&scenario=${scenario.key}`,
    degraded: result.degraded,
    provider: result.provider,
    redactions: result.redactionReport,
  });
}
