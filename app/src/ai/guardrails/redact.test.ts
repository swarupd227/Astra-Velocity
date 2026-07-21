import { describe, expect, it } from "vitest";
import { redact } from "./redact";

describe("redact", () => {
  it("redacts SSNs, emails, phones", () => {
    const r = redact("Contact John at john.doe@corp.com or 555-867-5309. SSN 123-45-6789.");
    expect(r.text).not.toContain("john.doe@corp.com");
    expect(r.text).not.toContain("123-45-6789");
    expect(r.report.email).toBe(1);
    expect(r.report.ssn).toBe(1);
    expect(r.redactedTotal).toBeGreaterThanOrEqual(3);
  });

  it("redacts labeled policy and claim numbers", () => {
    const r = redact("Breach on policy #HO-2284-991-X and claim CLM-2026-118822 flagged.");
    expect(r.text).toContain("[REDACTED:POLICY-NUMBER]");
    expect(r.text).toContain("[REDACTED:CLAIM-NUMBER]");
  });

  it("redacts valid credit cards but not arbitrary digit runs", () => {
    const valid = redact("Card 4111 1111 1111 1111 on file.");
    expect(valid.report["credit-card"]).toBe(1);
    const invalid = redact("Batch 1234 5678 9012 3456 rows processed.");
    expect(invalid.report["credit-card"]).toBeUndefined();
  });

  it("leaves ordinary governance text alone", () => {
    const input = "Earned premium reconciliation rules run nightly across 42 CDEs in Schedule P feeds.";
    const r = redact(input);
    expect(r.text).toBe(input);
    expect(r.redactedTotal).toBe(0);
  });

  it("report contains counts only, never values", () => {
    const r = redact("SSN 123-45-6789");
    expect(JSON.stringify(r.report)).not.toContain("123");
  });
});
