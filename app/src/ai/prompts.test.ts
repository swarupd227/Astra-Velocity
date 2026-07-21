import { describe, expect, it } from "vitest";
import { fallbackTemplate, interpolate, PROMPT_TEMPLATES } from "./prompts";

describe("prompt templates", () => {
  it("ships library-qa v1 and copilot-compose v1", () => {
    const keys = PROMPT_TEMPLATES.map((t) => `${t.key}@${t.version}`);
    expect(keys).toContain("library-qa@1");
    expect(keys).toContain("copilot-compose@1");
  });

  it("every template restates the untrusted_data containment rule", () => {
    for (const t of PROMPT_TEMPLATES) {
      expect(t.template).toContain("<untrusted_data>");
      expect(t.template.toLowerCase()).toContain("never instructions");
    }
  });

  it("interpolates {{variables}} and leaves unknown ones visible", () => {
    expect(interpolate("Hello {{name}}, welcome to {{appName}}.", { name: "Ada" })).toBe(
      "Hello Ada, welcome to {{appName}}.",
    );
  });

  it("fallbackTemplate resolves by key", () => {
    expect(fallbackTemplate("library-qa")?.version).toBe(1);
    expect(fallbackTemplate("nope")).toBeUndefined();
  });
});
