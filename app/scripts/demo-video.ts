import { chromium, type Page } from "playwright";
import { mkdirSync } from "node:fs";
import path from "node:path";

/**
 * Records a ~2.5-3 minute guided demo of Astra Velocity as a video, with
 * caption overlays injected into the page (so they render into the recording).
 * Run against the local Docker app:  npx tsx scripts/demo-video.ts
 * Output: ../demo/astra-velocity-demo.webm (convert to mp4 with ffmpeg after).
 */

const BASE = process.env.DEMO_BASE_URL ?? "http://localhost:3100";
// Run from app/ — output lands in the repo-root demo/ folder.
const OUT_DIR = path.resolve(process.cwd(), "..", "demo");
const EMAIL = "platform.admin@astra.demo";
const PASSWORD = process.env.SEED_PASSWORD ?? "AstraDemo!2026";

async function caption(page: Page, text: string) {
  await page.evaluate((t) => {
    let el = document.getElementById("demo-caption");
    if (!el) {
      el = document.createElement("div");
      el.id = "demo-caption";
      Object.assign(el.style, {
        position: "fixed",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "82%",
        padding: "10px 22px",
        borderRadius: "9999px",
        background: "rgba(2, 6, 23, 0.88)",
        border: "1px solid rgba(45, 212, 191, 0.5)",
        color: "#f1f5f9",
        fontSize: "16px",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        zIndex: "99999",
        boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
      });
      document.body.appendChild(el);
    }
    el.textContent = t;
  }, text);
}

async function dwell(page: Page, ms: number) {
  await page.waitForTimeout(ms);
}

async function scrollBy(page: Page, px: number, steps = 5) {
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, px / steps);
    await page.waitForTimeout(220);
  }
}

async function go(page: Page, url: string, text: string, settleMs = 1400) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle" });
  await caption(page, text);
  await dwell(page, settleMs);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  // --- 1. Login (~12s)
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await caption(page, "Astra Velocity — the insurance data governance platform. Role-based access for six personas.");
  await dwell(page, 2500);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await dwell(page, 1200);
  await caption(page, "Signing in as Platform Admin…");
  await Promise.all([page.waitForURL("**/admin", { timeout: 30000 }), page.click('button[type="submit"]')]);
  await dwell(page, 2000);

  // --- 2. Explore (~20s)
  await go(page, "/explore", "The Landscape Explorer — nine insurance sectors, modeled stage by stage.");
  await dwell(page, 1800);
  await scrollBy(page, 500, 3);
  const stage = page.locator("button", { hasText: "Claims — FNOL & Triage" }).first();
  if (await stage.count()) {
    await stage.click();
    await caption(page, "Each value-chain stage carries its data domains and the pain points governance must fix.");
    await dwell(page, 3500);
  }
  await go(page, "/explore?sector=life-annuities", "Switch sector and everything re-reads — Life & Annuities has its own chain, obligations, and KPIs.");
  await scrollBy(page, 600, 4);
  await dwell(page, 1500);

  // --- 3. Scenarios (~12s)
  await go(page, "/scenarios?sector=pc-personal", "Ten governance scenarios — each one re-interpreted for the chosen sector.");
  await scrollBy(page, 700, 5);
  await dwell(page, 2000);

  // --- 4. Library + artifacts (~30s)
  await go(page, "/library", "The Velocity Pack Library — 22 packs, 94 elements, each carrying a real working asset.");
  await scrollBy(page, 600, 4);
  await dwell(page, 1500);
  await go(page, "/library/pc-glossary-starter", "Cards open into artifacts: a P&C glossary with real definitions — not a slide.");
  await scrollBy(page, 700, 5);
  await dwell(page, 2000);
  await go(page, "/library/insurance-dq-rule-library", "Data-quality rules with executable expressions, severity, and the obligation each protects.");
  await scrollBy(page, 700, 5);
  await dwell(page, 1500);

  // --- 5. Best Practices (~12s)
  await go(page, "/practices", "The Best Practices Hub — every practice with its anti-pattern, evidence, and the elements that operationalize it.");
  await scrollBy(page, 800, 5);
  await dwell(page, 2000);

  // --- 6. Composer (~20s)
  await go(
    page,
    "/composer?sector=pc-personal&scenario=report-integrity",
    "The Composer assembles a governance project — every recommendation explained and tiered.",
    2200,
  );
  await scrollBy(page, 600, 4);
  await caption(page, "Best practices and regulatory obligations are the visible rationale — 'why this is in your pack'.");
  await dwell(page, 3500);
  await scrollBy(page, 600, 4);
  await dwell(page, 1500);

  // --- 7. Project blueprint (~14s)
  await go(page, "/projects", "Saved projects become delivery-ready blueprints.");
  await dwell(page, 1200);
  const projectLink = page.locator('a[href^="/projects/"]').first();
  if (await projectLink.count()) {
    await projectLink.click();
    await page.waitForLoadState("networkidle");
    await caption(page, "Phases, waves, pod pairing, train-the-trainer, risks, and the dashboard set — printable for the client.");
    await scrollBy(page, 900, 6);
    await dwell(page, 2500);
  }

  // --- 8. Copilot (~18s)
  await go(page, "/copilot", "The Governance Copilot — grounded in the library, PII-redacted, every call audited.");
  await page.fill('input[aria-label="Ask the library"]', "What does good lineage look like for Schedule P?");
  await dwell(page, 800);
  await page.keyboard.press("Enter");
  await caption(page, "Answers cite their sources — and admit when something is not in the library.");
  await dwell(page, 6000);
  await scrollBy(page, 300, 2);
  await dwell(page, 1500);

  // --- 9. Steward + agents (~20s)
  await go(page, "/steward", "Agents draft — stewards decide. Glossary terms, DQ rules, and classifications arrive as suggestions.");
  await scrollBy(page, 500, 3);
  await dwell(page, 2000);
  const approve = page.locator("button", { hasText: "Approve" }).first();
  if (await approve.count()) {
    await approve.click();
    await caption(page, "One click to approve — the decision lands in the audit log with the steward's name on it.");
    await dwell(page, 3000);
  }
  await go(page, "/agents", "Six agent co-workers with live acceptance telemetry — agents that drift get benched.");
  await scrollBy(page, 600, 4);
  await dwell(page, 1500);

  // --- 10. Dashboards (~20s)
  await go(page, "/dashboards/gpi", "Live dashboards: the Governance Performance Index — burn-up toward 150 governed data products.");
  await scrollBy(page, 600, 4);
  await dwell(page, 2000);
  await go(page, "/dashboards/value", "Executive value — incidents avoided, cycle times, and the economics of agent leverage.");
  await scrollBy(page, 500, 3);
  await dwell(page, 2000);

  // --- 11. Admin (~14s)
  await go(page, "/admin/ai", "AI administration: model routing, kill-switches, encrypted provider keys, and cost telemetry.");
  await scrollBy(page, 500, 3);
  await dwell(page, 2500);

  // --- 12. Close (~8s)
  await go(page, "/exec", "Astra Velocity — compose the pack, govern with agents, prove the value. Thank you.");
  await dwell(page, 4000);

  const video = page.video();
  await context.close();
  await browser.close();
  if (video) {
    const p = await video.path();
    console.log(`VIDEO:${p}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
