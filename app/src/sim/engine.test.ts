import { describe, expect, it } from "vitest";
import {
  CURRENT_QUARTER_INDEX,
  PLAN_QUARTERS,
  hashSeed,
  mulberry32,
  simulate,
} from "./engine";
import { draftSuggestions } from "./generate-suggestions";

describe("PRNG", () => {
  it("is deterministic for the same seed", () => {
    const a = mulberry32(hashSeed("workspace-demo"));
    const b = mulberry32(hashSeed("workspace-demo"));
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("differs for different seeds", () => {
    const a = mulberry32(hashSeed("seed-one"));
    const b = mulberry32(hashSeed("seed-two"));
    expect(Array.from({ length: 10 }, () => a())).not.toEqual(
      Array.from({ length: 10 }, () => b()),
    );
  });
});

describe("simulate", () => {
  it("same seed → identical output", () => {
    const a = simulate("11111111-2222-3333-4444-555555555555");
    const b = simulate("11111111-2222-3333-4444-555555555555");
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("different seeds → different output", () => {
    const a = simulate("workspace-alpha");
    const b = simulate("workspace-bravo");
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it("portfolio has 18–30 products with GPI trajectories bounded 0–100", () => {
    for (const seed of ["s1", "s2", "s3", "s4", "s5", "another-workspace"]) {
      const sim = simulate(seed);
      expect(sim.portfolio.products.length).toBeGreaterThanOrEqual(18);
      expect(sim.portfolio.products.length).toBeLessThanOrEqual(30);
      for (const p of sim.portfolio.products) {
        expect(p.gpiByQuarter).toHaveLength(PLAN_QUARTERS.length);
        for (const v of p.gpiByQuarter) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it("burn-up runs the plan quarters with actuals only through the current quarter", () => {
    const sim = simulate("burnup-check");
    expect(sim.portfolio.burnUp).toHaveLength(PLAN_QUARTERS.length);
    sim.portfolio.burnUp.forEach((pt, i) => {
      if (i <= CURRENT_QUARTER_INDEX) expect(pt.actual).not.toBeNull();
      else expect(pt.actual).toBeNull();
      expect(pt.projected).toBeGreaterThanOrEqual(0);
      expect(pt.projected).toBeLessThanOrEqual(sim.portfolio.burnUpTarget);
    });
    expect(sim.portfolio.burnUp.at(-1)!.projected).toBe(sim.portfolio.burnUpTarget);
  });

  it("honors a configurable burn-up target", () => {
    const sim = simulate("target-check", { target: 220 });
    expect(sim.portfolio.burnUpTarget).toBe(220);
    expect(sim.portfolio.burnUp.at(-1)!.projected).toBe(220);
  });

  it("uses provided steward-weeks-saved when a project supplies it", () => {
    const sim = simulate("value-check", { stewardWeeksSaved: 62.5 });
    expect(sim.value.stewardWeeksSaved).toBe(63);
    const fallback = simulate("value-check");
    expect(fallback.value.stewardWeeksSaved).toBeGreaterThan(0);
  });

  it("keeps DQ and leverage figures in sane ranges", () => {
    const sim = simulate("dq-check");
    expect(sim.dq.byCapability).toHaveLength(7);
    for (const cap of sim.dq.byCapability) {
      expect(cap.rules).toBeGreaterThan(0);
      expect(cap.executions).toBeGreaterThan(cap.rules);
      for (const b of cap.breaches) expect(b.count).toBeGreaterThanOrEqual(0);
    }
    expect(sim.leverage.agents).toHaveLength(6);
    for (const a of sim.leverage.agents) {
      expect(a.acceptanceRate).toBeGreaterThanOrEqual(0.5);
      expect(a.acceptanceRate).toBeLessThanOrEqual(1);
      expect(a.leverageRatio).toBeGreaterThan(1);
    }
  });
});

describe("draftSuggestions", () => {
  it("is deterministic per seed and differs across seeds", () => {
    expect(draftSuggestions("ws-demo")).toEqual(draftSuggestions("ws-demo"));
    expect(JSON.stringify(draftSuggestions("ws-a"))).not.toBe(
      JSON.stringify(draftSuggestions("ws-b")),
    );
  });

  it("draws 15–25 drafts with confidence spread 0.55–0.98 and no duplicate titles", () => {
    for (const seed of ["a", "b", "c", "d", "e"]) {
      const drafts = draftSuggestions(seed);
      expect(drafts.length).toBeGreaterThanOrEqual(15);
      expect(drafts.length).toBeLessThanOrEqual(25);
      const titles = new Set(drafts.map((d) => d.title));
      expect(titles.size).toBe(drafts.length);
      for (const d of drafts) {
        expect(d.confidence).toBeGreaterThanOrEqual(0.55);
        expect(d.confidence).toBeLessThanOrEqual(0.98);
        expect(d.title.length).toBeGreaterThan(4);
        expect(d.payload).toBeTruthy();
      }
    }
  });

  it("covers multiple agents in a single run", () => {
    const drafts = draftSuggestions("coverage-seed");
    const agents = new Set(drafts.map((d) => d.agentKey));
    expect(agents.size).toBeGreaterThanOrEqual(4);
  });
});
