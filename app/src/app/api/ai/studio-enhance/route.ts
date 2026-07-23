import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAiUser } from "@/ai/authz";
import { callModel } from "@/ai/gateway";
import { CONTENT_KINDS } from "@/content/types";
import { KIND_SCHEMAS } from "@/app/studio/kind-schemas";

export const dynamic = "force-dynamic";

/**
 * AI Enhance for Library Studio: given the CURRENT payload for a content
 * kind and a free-text instruction, ask the model for a full revised
 * payload. This never saves or publishes anything — the caller (a manual
 * JSON editor, side by side with this feature) applies the suggestion into
 * its own textarea state, where the existing live Zod validation and the
 * existing saveDraftAction remain the only path to persistence.
 */

const BodySchema = z.object({
  kind: z.enum(CONTENT_KINDS),
  currentPayload: z.unknown(),
  instruction: z.string().trim().min(4, "Describe the change in a bit more detail").max(2000),
});

export async function POST(request: Request) {
  const guard = await requireAiUser(["library.author", "ai.use"]);
  if ("error" in guard) return guard.error;

  const body = BodySchema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }
  const { kind, currentPayload, instruction } = body.data;
  const schema = KIND_SCHEMAS[kind];

  const user = `CONTENT KIND: ${kind}\n\nCURRENT PAYLOAD:\n${JSON.stringify(currentPayload)}\n\nINSTRUCTION:\n${instruction}`;

  const result = await callModel({
    feature: "studio-enhance",
    template: { key: "studio-content-enhance", variables: { kind } },
    user,
    schema,
    maxTokens: 3000,
    userId: guard.user.id,
  });

  if (result.status === "killed") {
    return NextResponse.json({ error: result.errorDetail, killed: true }, { status: 503 });
  }
  if (result.status !== "ok" || result.data === undefined) {
    return NextResponse.json(
      {
        error: "The assistant could not produce a schema-valid suggestion. Try a more specific instruction.",
        detail: result.errorDetail,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    suggestedPayload: result.data,
    degraded: result.degraded,
    callId: result.callId,
  });
}
