/**
 * PII/NPPI redaction — runs on every prompt BEFORE it leaves the boundary.
 *
 * Insurance-tuned pattern set: identity (SSN, DOB, contact), financial (cards,
 * bank accounts), and insurance identifiers (policy/claim numbers). Redaction is
 * deterministic and reversible only within the request scope (placeholder map is
 * never persisted); the redaction report (counts by type, never values) is stored
 * with the AI audit record.
 */

export interface RedactionResult {
  text: string;
  /** Counts by pattern type — safe to log/persist. Never contains raw values. */
  report: Record<string, number>;
  redactedTotal: number;
}

interface PatternDef {
  type: string;
  pattern: RegExp;
}

const PATTERNS: PatternDef[] = [
  { type: "ssn", pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { type: "ssn", pattern: /\b(?:SSN|social security)[:\s#]*\d{9}\b/gi },
  { type: "credit-card", pattern: /\b(?:\d[ -]*?){13,19}\b(?<=\d)/g },
  { type: "email", pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  { type: "phone", pattern: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/g },
  { type: "dob", pattern: /\b(?:DOB|date of birth|born)[:\s]*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi },
  // Insurance identifiers: labeled policy/claim numbers (labels required to
  // avoid over-redacting ordinary numerics in governance content).
  { type: "policy-number", pattern: /\b(?:policy|pol)[.\s#:no]*[A-Z0-9][A-Z0-9-]{5,}\b/gi },
  { type: "claim-number", pattern: /\b(?:claim|clm)[.\s#:no]*[A-Z0-9][A-Z0-9-]{5,}\b/gi },
  { type: "member-id", pattern: /\b(?:member|subscriber)\s?(?:id|no|number)[.\s#:]*[A-Z0-9-]{6,}\b/gi },
  { type: "bank-account", pattern: /\b(?:account|acct|routing)\s?(?:no|number|#)[.\s:]*\d{6,}\b/gi },
];

/** Luhn check to keep credit-card redaction from eating harmless digit runs. */
function luhnValid(candidate: string): boolean {
  const digits = candidate.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function redact(input: string): RedactionResult {
  let text = input;
  const report: Record<string, number> = {};

  for (const { type, pattern } of PATTERNS) {
    text = text.replace(pattern, (match) => {
      if (type === "credit-card" && !luhnValid(match)) return match;
      report[type] = (report[type] ?? 0) + 1;
      return `[REDACTED:${type.toUpperCase()}]`;
    });
  }

  return {
    text,
    report,
    redactedTotal: Object.values(report).reduce((a, b) => a + b, 0),
  };
}
