import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAiUser } from "@/ai/authz";
import { callModel } from "@/ai/gateway";
import { formatSnippets, searchLibrary } from "@/ai/retrieval";

export const dynamic = "force-dynamic";

/**
 * Library Q&A: question → full-text retrieval over published content →
 * gateway call with a citations-required prompt. Answers come ONLY from
 * retrieved snippets; citations are re-checked against the snippet set so the
 * model can never mint a source.
 */

const BodySchema = z.object({
  question: z.string().trim().min(3, "Ask a fuller question").max(2000),
});

const QaOutputSchema = z.object({
  answer: z.string().min(1),
  citations: z
    .array(
      z.object({
        kind: z.string(),
        key: z.string(),
        name: z.string(),
      }),
    )
    .default([]),
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
  const { question } = body.data;

  const snippets = await searchLibrary(question);
  const user = `LIBRARY SNIPPETS (published governance content — the ONLY permitted sources):\n\n${
    snippets.length > 0 ? formatSnippets(snippets) : "(no matching snippets found)"
  }\n\nQUESTION: ${question}`;

  const result = await callModel({
    feature: "library-qa",
    template: { key: "library-qa" },
    user,
    schema: QaOutputSchema,
    maxTokens: 1500,
    userId: guard.user.id,
  });

  if (result.status === "killed") {
    return NextResponse.json({ error: result.errorDetail, killed: true }, { status: 503 });
  }
  if (result.status !== "ok" || !result.data) {
    return NextResponse.json(
      { error: "The copilot could not produce a grounded answer. Try rephrasing.", detail: result.errorDetail },
      { status: 502 },
    );
  }

  // Grounding enforcement: only citations that exist in the retrieved set survive.
  const allowed = new Map(snippets.map((s) => [`${s.kind}:${s.key}`, s]));
  const citations = result.data.citations
    .filter((c) => allowed.has(`${c.kind}:${c.key}`))
    .map((c) => {
      const snippet = allowed.get(`${c.kind}:${c.key}`)!;
      return { kind: snippet.kind, key: snippet.key, name: snippet.name };
    });

  return NextResponse.json({
    answer: result.data.answer,
    citations,
    degraded: result.degraded,
    provider: result.provider,
    redactions: result.redactionReport,
  });
}
