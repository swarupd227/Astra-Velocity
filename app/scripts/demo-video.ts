import { chromium, type Page } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Records a guided demo of Astra Velocity as a video, with caption overlays
 * injected into the page (so they render into the recording).
 * Run against the local Docker app:  npx tsx scripts/demo-video.ts
 * Output: ../demo/astra-velocity-demo.webm (convert to mp4 with ffmpeg after).
 */

const BASE = process.env.DEMO_BASE_URL ?? "http://localhost:3100";
// Run from app/ — output lands in the repo-root demo/ folder.
const OUT_DIR = path.resolve(process.cwd(), "..", "demo");
const LOGO_PATH = path.resolve(process.cwd(), "scripts", "assets", "artizent-logo.png");
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

/** Shared look for the title cards — same dark theme + teal accent as the app itself. */
function titleCardShell(logoDataUri: string, logoWidth: number, body: string) {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    width: 1280px; height: 720px; overflow: hidden;
    background: #020617;
    font-family: system-ui, -apple-system, sans-serif;
  }
  .stage {
    width: 100%; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 20px; text-align: center; padding: 0 120px;
    animation: fadein 700ms ease-out;
  }
  @keyframes fadein { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .logo { width: ${logoWidth}px; height: auto; display: block; }
  .brand { font-size: 15px; font-weight: 600; letter-spacing: 0.35em; text-transform: uppercase; color: #2dd4bf; }
  .wordmark { font-family: Georgia, "Times New Roman", serif; font-size: 56px; color: #ffffff; }
  .wordmark-sm { font-family: Georgia, "Times New Roman", serif; font-size: 34px; color: #ffffff; }
  .tagline { font-size: 22px; color: #cbd5e1; max-width: 760px; line-height: 1.5; }
  .closing { font-family: Georgia, "Times New Roman", serif; font-size: 34px; color: #ffffff; max-width: 820px; line-height: 1.4; }
  .cta-lead { font-size: 19px; color: #94a3b8; }
  .cta-pill {
    display: inline-flex; align-items: center; gap: 10px;
    background: #2dd4bf; color: #020617; font-weight: 700; font-size: 20px;
    padding: 12px 28px; border-radius: 9999px;
  }
</style>
</head>
<body>
  <div class="stage">
    <img class="logo" src="${logoDataUri}" alt="Artizent" />
    ${body}
  </div>
</body>
</html>`;
}

// The logo file already carries the "ARTIZENT" wordmark baked in (white text,
// invisible against a white preview background but rendered fine on this dark
// card) — no separate brand label needed on top of it.
function introHtml(logoDataUri: string) {
  return titleCardShell(
    logoDataUri,
    260,
    `
    <span class="wordmark">Astra Velocity</span>
    <p class="tagline">Insurance data governance — composed, explained, and governed with AI.</p>
    `,
  );
}

function outroHtml(logoDataUri: string) {
  return titleCardShell(
    logoDataUri,
    190,
    `
    <span class="wordmark-sm">Astra Velocity</span>
    <p class="closing">Compose the pack. Govern with agents. Prove the value.</p>
    <p class="cta-lead">Ready to see it on your stack?</p>
    <span class="cta-pill">Get in touch — www.artizent.com</span>
    `,
  );
}

async function titleCard(page: Page, html: string, ms: number) {
  await page.setContent(html, { waitUntil: "load" });
  await dwell(page, ms);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const logoDataUri = `data:image/png;base64,${readFileSync(LOGO_PATH).toString("base64")}`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  // --- 0. Opening title card (~4.5s)
  await titleCard(page, introHtml(logoDataUri), 4500);

  // --- 1. Login (~8s, no login-mechanics narration)
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await caption(page, "Real insurance obligations, real platforms, real working assets — not a generic governance template.");
  await dwell(page, 3000);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await Promise.all([page.waitForURL("**/admin", { timeout: 30000 }), page.click('button[type="submit"]')]);
  await dwell(page, 1500);

  // --- 2. Composer: sector — Personal Lines P&C (~14s)
  await go(page, "/composer", "P&C — Personal Lines: high-volume auto and home, priced by the model, judged by the month-end flash.");
  const sectorCard = page.locator('a[href*="sector=pc-personal"]').first();
  if (await sectorCard.count()) {
    await sectorCard.click();
    await page.waitForLoadState("networkidle");
  }

  // --- 3. Composer: business context — the obligations and KPIs this sector actually carries (~20s)
  const bizContext = page.getByRole("button", { name: "Business context" }).first();
  if (await bizContext.count()) {
    await bizContext.click();
    await caption(page, "Schedule P loss development, the NAIC Model Audit Rule, SOX 302/404 ICFR — obligations this sector actually carries.");
    await dwell(page, 4000);
    await scrollBy(page, 400, 3);
    await caption(page, "Loss ratio, combined ratio, written and earned premium — each with its real formula, not a placeholder metric.");
    await dwell(page, 4000);
    const closeBiz = page.locator('button[aria-label="Close business context"]');
    if (await closeBiz.count()) await closeBiz.click();
    await dwell(page, 600);
  }

  // --- 4. Composer: scenario — Report Integrity, then the assembled pack (~14s)
  await go(
    page,
    "/composer?sector=pc-personal&scenario=report-integrity",
    "Scenario: Report Integrity — one number, one definition, one lineage, so leadership stops caveating its own reports.",
    2200,
  );
  await scrollBy(page, 400, 3);

  // --- 5. Composer: the client's actual technology & platform stack (~34s)
  await caption(page, "Technology & Platform Stack — model the client's real vendors, not a reference architecture.");
  await dwell(page, 2600);
  const snowflakeChip = page.getByRole("button", { name: /Snowflake/ }).first();
  if (await snowflakeChip.count()) await snowflakeChip.click();
  const bigidChip = page.getByRole("button", { name: /^BigID/ }).first();
  if (await bigidChip.count()) await bigidChip.click();
  const immutaChip = page.getByRole("button", { name: /^Immuta/ }).first();
  if (await immutaChip.count()) await immutaChip.click();
  await dwell(page, 1000);
  await caption(page, "Snowflake for enforcement, BigID for classification, Immuta for purpose-based access — this client's actual stack.");
  await dwell(page, 3200);
  const aboutImmuta = page.locator('button[aria-label="About Immuta"]').first();
  if (await aboutImmuta.count()) {
    await aboutImmuta.click();
    await caption(page, "Immuta's own profile, stated plainly: it enforces purpose-based policy — it does not generate the labels it enforces. Those come from BigID.");
    await dwell(page, 4200);
    const closeProfile = page.locator('button[aria-label="Close platform profile"]');
    if (await closeProfile.count()) await closeProfile.click();
    await dwell(page, 600);
  }
  await scrollBy(page, 600, 4);
  await caption(page, "Every recommended element traces back to a named obligation or KPI — Schedule P, SOX ICFR, loss ratio — 'why this is in your pack.'");
  await dwell(page, 3800);

  // --- 6. Library: the Velocity Pack Library (~10s)
  await go(page, "/library", "The Velocity Pack Library — 22 packs, every element a real working asset, not a description of one.");
  await dwell(page, 1200);

  // --- 7. Library: governance-as-code, VP-03 (~34s)
  const formatSelect = page.locator('select[aria-label="Filter by format"]');
  if (await formatSelect.count()) {
    await formatSelect.selectOption("code");
    await caption(page, "VP-03 — the Governance-as-Code Starter Repo: declarative policy that deploys into the stack, not documentation about it.");
    await dwell(page, 3800);
  }
  const immutaCodeLink = page.locator('a[href="/library/immuta-purpose-policy-as-code"]').first();
  if (await immutaCodeLink.count()) {
    await immutaCodeLink.click();
    await page.waitForLoadState("networkidle");
    await scrollBy(page, 400, 3);
    await caption(page, "Immuta's purpose-based policy in YAML — claims handling vs. analytics access to claimant medical and financial fields.");
    await dwell(page, 4200);
    await caption(page, "It consumes BigID's classification tags rather than inventing its own labels — copy-ready, platform named.");
    await dwell(page, 3400);
  }
  const bigidCodeLink = page.locator('a[href="/library/bigid-classifier-correlation-policy-as-code"]').first();
  if (await bigidCodeLink.count()) {
    await bigidCodeLink.click();
    await page.waitForLoadState("networkidle");
    await scrollBy(page, 400, 3);
    await caption(page, "BigID's own classifier and cross-source correlation policy — the label Immuta consumes, matching policy, claims, and producer-licensing records to one subject.");
    await dwell(page, 4200);
  }

  // --- 8. Library Studio + AI Enhance (~26s)
  await go(page, "/studio", "Library Studio — draft, validate, publish. Every authoring scenario has AI enhancement beside the manual draft.");
  const openDraft = page
    .locator("a, button")
    .filter({ hasText: /Open draft revision|Create draft revision/ })
    .first();
  if (await openDraft.count()) {
    await openDraft.click();
    await page.waitForLoadState("networkidle");
    await caption(page, "AI Enhance sits side by side with the manual draft — never a hidden replacement for the human curator.");
    await dwell(page, 2800);
    const instruction = page.locator('textarea[aria-label="AI Enhance instruction"]');
    if (await instruction.count()) {
      await instruction.fill("Tighten the description and add one missing edge case.");
      await dwell(page, 600);
      const enhanceBtn = page.getByRole("button", { name: "Enhance with AI" });
      await enhanceBtn.click();
      await caption(page, "Every AI call — including this one — runs through one gateway: PII redaction, provider routing, full audit.");
      await dwell(page, 5000);
      const applyBtn = page.getByRole("button", { name: "Apply to draft" });
      if (await applyBtn.count()) {
        await caption(page, "The curator reviews and applies — or discards. AI drafts, a human still decides.");
        await dwell(page, 2600);
      }
    }
  }

  // --- 9. Copilot (~18s)
  await go(page, "/copilot", "The Governance Copilot — grounded in the library, PII-redacted, every call audited.");
  const askInput = page.locator('input[aria-label="Ask the library"]');
  if (await askInput.count()) {
    await askInput.fill("What does good lineage look like for Schedule P?");
    await dwell(page, 800);
    await page.keyboard.press("Enter");
    await caption(page, "Answers cite their sources against the actual library — and admit when something isn't in it.");
    await dwell(page, 6000);
  }

  // --- 10. Steward + agents (~22s)
  await go(page, "/steward", "Agents draft — stewards decide. NPPI classifications and Schedule P data-quality suggestions arrive for review, not auto-applied.");
  await scrollBy(page, 500, 3);
  await dwell(page, 1200);
  const approve = page.locator("button", { hasText: "Approve" }).first();
  if (await approve.count()) {
    await approve.click();
    await caption(page, "One click to approve — the decision lands in the audit log with the steward's name on it.");
    await dwell(page, 3200);
  }
  await go(page, "/agents", "Six agent co-workers with live acceptance telemetry — an agent that drifts on real decisions gets benched, not trusted blindly.");
  await scrollBy(page, 500, 3);
  await dwell(page, 2000);

  // --- 11. Dashboards (~20s)
  await go(page, "/dashboards/gpi", "Governance Performance Index — burn-up toward governed data products, the ones behind every loss-ratio and combined-ratio report.");
  await scrollBy(page, 500, 3);
  await dwell(page, 1200);
  await go(page, "/dashboards/value", "Executive value — incidents avoided, access cycle time, and the economics of agent leverage, quarter over quarter.");
  await scrollBy(page, 400, 3);
  await dwell(page, 2200);

  // --- 12. Admin: Workspaces CRUD (~30s)
  await go(page, "/admin/workspaces", "Admin now has full CRUD beyond seeded content — starting with workspaces.");
  const slug = `demo-video-${Date.now()}`;
  const nameInput = page.locator('input[placeholder="Workspace name"]');
  const slugInput = page.locator('input[placeholder="workspace-slug"]');
  if ((await nameInput.count()) && (await slugInput.count())) {
    await nameInput.fill("Demo Video Workspace");
    await slugInput.fill(slug);
    await dwell(page, 600);
    await page.getByRole("button", { name: "Create", exact: true }).click();
    // createWorkspaceAction redirects straight to the new workspace's detail page — it
    // never stays on the list, so wait for that navigation rather than a list row.
    const createdOk = await page
      .waitForURL(/\/admin\/workspaces\/[0-9a-f-]{36}$/, { timeout: 15000 })
      .then(() => true)
      .catch(() => false);
    if (createdOk) {
      await page.waitForLoadState("networkidle");
      await caption(page, "A new workspace, created live — not seeded.");
      await dwell(page, 2200);
      await caption(page, "Rename, archive, scope its default sectors and platform stack, manage members — real admin surfaces, not a seed script.");
      await scrollBy(page, 500, 3);
      await dwell(page, 3000);
      const deleteBtn = page.getByRole("button", { name: "Permanently delete workspace" });
      if (await deleteBtn.count()) {
        await deleteBtn.click();
        await caption(page, "Hard delete is allowed for admins — but only after typing the exact workspace slug. No accidental clicks.");
        await dwell(page, 2500);
        const confirmInput = page.locator('input[aria-label^="Type "]');
        if (await confirmInput.count()) {
          await confirmInput.fill(slug);
          await dwell(page, 600);
          const confirmDelete = page.getByRole("button", { name: "Delete workspace permanently" });
          if (await confirmDelete.count()) {
            await confirmDelete.click();
            // deleteWorkspaceAction redirects to the plain /admin/workspaces list —
            // wait for that navigation explicitly rather than the networkidle
            // heuristic, which can race the redirect and read the stale URL.
            await page
              .waitForURL(/\/admin\/workspaces\/?$/, { timeout: 15000 })
              .catch(() => page.waitForLoadState("networkidle"));
            await dwell(page, 1500);
          }
        }
      }
    }
  }

  // --- 13. Admin: AI governance (~14s)
  await go(page, "/admin/ai", "AI administration: model routing, kill-switches, encrypted provider keys, and cost telemetry.");
  await scrollBy(page, 500, 3);
  await dwell(page, 2500);

  // --- 14. Close (~10s)
  await go(
    page,
    "/exec",
    "P&C Personal Lines, Report Integrity, Snowflake/BigID/Immuta — compose the pack, govern with agents, prove the value.",
    4200,
  );

  // --- 15. Closing title card (~5.5s)
  await titleCard(page, outroHtml(logoDataUri), 5500);

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
