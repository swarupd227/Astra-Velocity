"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { PlatformKeySchema, ScenarioKeySchema, SectorKeySchema } from "@/content/types";
import { createProject } from "@/lib/projects";

const PlatformVariantSchema = z.object({
  label: z.string().trim().min(1, "Variant label is required").max(60),
  platformKeys: z.array(z.string().min(1)).max(20),
});

const SaveProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required").max(120),
  clientLabel: z.string().trim().max(120).optional(),
  sectorKey: SectorKeySchema,
  scenarioKey: ScenarioKeySchema,
  selectedElementKeys: z.array(z.string().min(1)).min(1, "Select at least one element").max(300),
  platformKeys: z.array(PlatformKeySchema).max(20).default([]),
  platformVariants: z.array(PlatformVariantSchema).max(4).default([]),
});

/** Save the composed project and jump straight to its blueprint. */
export async function saveProjectAction(formData: FormData): Promise<void> {
  let selectedElementKeys: unknown;
  let platformKeys: unknown;
  let platformVariants: unknown;
  try {
    selectedElementKeys = JSON.parse(String(formData.get("selectedElementKeys") ?? "[]"));
    platformKeys = JSON.parse(String(formData.get("platformKeys") ?? "[]"));
    platformVariants = JSON.parse(String(formData.get("platformVariants") ?? "[]"));
  } catch {
    throw new Error("Invalid element selection payload");
  }

  const input = SaveProjectSchema.parse({
    name: formData.get("name"),
    clientLabel: String(formData.get("clientLabel") ?? "").trim() || undefined,
    sectorKey: formData.get("sectorKey"),
    scenarioKey: formData.get("scenarioKey"),
    selectedElementKeys,
    platformKeys,
    platformVariants,
  });

  // createProject re-checks auth + RBAC + content keys server-side.
  const project = await createProject({
    name: input.name,
    clientLabel: input.clientLabel ?? null,
    sectorKey: input.sectorKey,
    scenarioKey: input.scenarioKey,
    selectedElementKeys: input.selectedElementKeys,
    platformKeys: input.platformKeys,
    platformVariants: input.platformVariants,
  });

  redirect(`/projects/${project.id}`);
}
