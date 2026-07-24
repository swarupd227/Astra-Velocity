import { chromium, type Page } from "playwright";
import { mkdirSync } from "node:fs";
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

/** The header role-switcher is the only bare <select> outside /library's Format filter. */
async function switchPersona(page: Page, label: string) {
  const select = page.locator("header select").first();
  await select.selectOption({ label });
  await dwell(page, 1000);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  // --- 1. Login (~14s)
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await caption(page, "Astra Velocity — insurance data governance, composed. Six roles, one platform.");
  await dwell(page, 2500);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await dwell(page, 1200);
  await caption(page, "Signing in as Platform Admin…");
  await Promise.all([page.waitForURL("**/admin", { timeout: 30000 }), page.click('button[type="submit"]')]);
  await dwell(page, 2000);

  // --- 2. Role switcher (~16s)
  await caption(page, "One login, six functional experiences — the role switcher reshapes nav without changing the underlying permission.");
  await dwell(page, 2500);
  await switchPersona(page, "Data Steward");
  await page.waitForLoadState("networkidle");
  await caption(page, "Viewing as Data Steward — the sidebar now shows My Day and Agents, nothing an admin-only surface would dead-end into.");
  await dwell(page, 3000);
  await switchPersona(page, "Executive / CDO");
  await page.waitForLoadState("networkidle");
  await caption(page, "Viewing as Executive — value dashboards and portfolio burn-up, not authoring tools.");
  await dwell(page, 2500);
  await switchPersona(page, "Platform Admin");
  await page.waitForLoadState("networkidle");
  await dwell(page, 1200);

  // --- 3. Composer: sector, business context, scenario (~24s)
  await go(page, "/composer", "The Composer — pick the client's sector and scenario, and a third dimension: their actual technology stack.");
  const sectorCard = page.locator('a[href*="sector=pc-personal"]').first();
  if (await sectorCard.count()) {
    await sectorCard.click();
    await page.waitForLoadState("networkidle");
  }
  const bizContext = page.getByRole("button", { name: "Business context" }).first();
  if (await bizContext.count()) {
    await bizContext.click();
    await caption(page, "Business context arrives on demand — value chain, obligations, KPIs — not a slideware page you have to leave the workflow for.");
    await dwell(page, 3200);
    const closeBiz = page.locator('button[aria-label="Close business context"]');
    if (await closeBiz.count()) await closeBiz.click();
    await dwell(page, 600);
  }

  // --- 4. Composer: platform & technology stack (~26s)
  await go(
    page,
    "/composer?sector=pc-personal&scenario=report-integrity",
    "Technology & Platform Stack — the recommendation engine reads the client's real stack, not a generic template.",
    2000,
  );
  await scrollBy(page, 500, 3);
  const platformChip = page.locator("button[aria-pressed]").first();
  if (await platformChip.count()) {
    await platformChip.click();
    await dwell(page, 800);
  }
  const aboutBtn = page.locator('button[aria-label^="About "]').first();
  if (await aboutBtn.count()) {
    await aboutBtn.click();
    await caption(page, "Every platform's native AI is described honestly — including where it's thin, not just where it's marketed.");
    await dwell(page, 3200);
    const closeProfile = page.locator('button[aria-label="Close platform profile"]');
    if (await closeProfile.count()) await closeProfile.click();
    await dwell(page, 600);
  }
  const addVariant = page.getByRole("button", { name: "Add a market variant" });
  if (await addVariant.count()) {
    await addVariant.click();
    await caption(page, "Market variants — model a platform outside the named anchor list without losing the recommendation logic.");
    await dwell(page, 2500);
    const removeVariant = page.locator('button[aria-label="Remove market variant"]').first();
    if (await removeVariant.count()) await removeVariant.click();
  }
  await scrollBy(page, 600, 4);
  await caption(page, "Best practices and regulatory obligations are the visible rationale — 'why this is in your pack'.");
  await dwell(page, 3000);

  // --- 5. Library + governance-as-code (~28s)
  await go(page, "/library", "The Velocity Pack Library — every element carries a real working asset, not a description of one.");
  const formatSelect = page.locator('select[aria-label="Filter by format"]');
  if (await formatSelect.count()) {
    await formatSelect.selectOption("code");
    await caption(page, "Governance-as-code: declarative classification, DQ rules, and access policy that deploy into the stack, not documents about it.");
    await dwell(page, 3000);
  }
  const codeElement = page.locator('a[href^="/library/"]').first();
  if (await codeElement.count()) {
    await codeElement.click();
    await page.waitForLoadState("networkidle");
    await scrollBy(page, 500, 3);
    await caption(page, "Real source — dbt tests, Immuta policy YAML, BigID classifiers — copy-ready, with the platform it targets named.");
    await dwell(page, 3500);
  }

  // --- 6. Best Practices (~10s)
  await go(page, "/practices", "The Best Practices Hub — every practice with its anti-pattern and the elements that operationalize it.");
  await scrollBy(page, 700, 4);
  await dwell(page, 1800);

  // --- 7. Library Studio + AI Enhance (~26s)
  await go(page, "/studio", "Library Studio — draft, validate, publish. Every authoring scenario now has an AI option beside the manual one.");
  const openDraft = page
    .locator("a, button")
    .filter({ hasText: /Open draft revision|Create draft revision/ })
    .first();
  if (await openDraft.count()) {
    await openDraft.click();
    await page.waitForLoadState("networkidle");
    await caption(page, "AI Enhance sits side by side with the manual draft — never a hidden replacement for the human editor.");
    await dwell(page, 2500);
    const instruction = page.locator('textarea[aria-label="AI Enhance instruction"]');
    if (await instruction.count()) {
      await instruction.fill("Tighten the description and add one missing edge case.");
      await dwell(page, 600);
      const enhanceBtn = page.getByRole("button", { name: "Enhance with AI" });
      await enhanceBtn.click();
      await caption(page, "Every AI call runs through the same gateway — PII redaction, provider routing, full audit — no side channel.");
      await dwell(page, 5000);
      const applyBtn = page.getByRole("button", { name: "Apply to draft" });
      if (await applyBtn.count()) {
        await caption(page, "The curator reviews and applies — or discards. AI drafts, a human still decides.");
        await dwell(page, 2500);
      }
    }
  }

  // --- 8. Copilot (~16s)
  await go(page, "/copilot", "The Governance Copilot — grounded in the library, PII-redacted, every call audited.");
  const askInput = page.locator('input[aria-label="Ask the library"]');
  if (await askInput.count()) {
    await askInput.fill("What does good lineage look like for Schedule P?");
    await dwell(page, 800);
    await page.keyboard.press("Enter");
    await caption(page, "Answers cite their sources — and admit when something is not in the library.");
    await dwell(page, 5500);
  }

  // --- 9. Steward + agents (~18s)
  await go(page, "/steward", "Agents draft — stewards decide. Glossary terms, DQ rules, and classifications arrive as suggestions.");
  await scrollBy(page, 500, 3);
  const approve = page.locator("button", { hasText: "Approve" }).first();
  if (await approve.count()) {
    await approve.click();
    await caption(page, "One click to approve — the decision lands in the audit log with the steward's name on it.");
    await dwell(page, 3000);
  }
  await go(page, "/agents", "Six agent co-workers with live acceptance telemetry — agents that drift get benched.");
  await scrollBy(page, 500, 3);
  await dwell(page, 1500);

  // --- 10. Dashboards (~16s)
  await go(page, "/dashboards/gpi", "Live dashboards: the Governance Performance Index — burn-up toward 150 governed data products.");
  await scrollBy(page, 500, 3);
  await go(page, "/dashboards/value", "Executive value — incidents avoided, cycle times, and the economics of agent leverage.");
  await scrollBy(page, 400, 3);
  await dwell(page, 1800);

  // --- 11. Admin: Workspaces CRUD (~30s)
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

  // --- 12. Admin: AI governance (~14s)
  await go(page, "/admin/ai", "AI administration: model routing, kill-switches, encrypted provider keys, and cost telemetry.");
  await scrollBy(page, 500, 3);
  await dwell(page, 2500);

  // --- 13. Theme (~8s)
  const themeToggle = page.locator('button[aria-label="Toggle light / dark theme"]');
  if (await themeToggle.count()) {
    await caption(page, "Full light and dark theming — not an afterthought.");
    await themeToggle.click();
    await dwell(page, 2200);
    await themeToggle.click();
    await dwell(page, 800);
  }

  // --- 14. Close (~8s)
  await go(page, "/exec", "Astra Velocity — compose the pack, model the real stack, govern with agents, prove the value. Thank you.");
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
