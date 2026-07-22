import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/roles";
import { CopilotWorkbench } from "@/components/copilot/copilot-workbench";

export const metadata = { title: "Copilot — Astra Velocity" };

/**
 * Governance Copilot: grounded Library Q&A plus brief-to-engagement composition.
 * Every model call runs through the AI gateway — redacted, contained, audited.
 */
export default async function CopilotPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const allowed = hasPermission(session.user.role, "ai.use");

  return (
    <section>
      <h1 className="font-display text-3xl text-slate-900 dark:text-white">Governance Copilot</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
        Ask the published library, or hand over a client brief and get a sector × scenario
        engagement shape back. Answers cite their sources; nothing leaves the boundary unredacted.
      </p>
      <div className="mt-6">
        {allowed ? (
          <CopilotWorkbench />
        ) : (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 text-sm text-slate-500 dark:text-slate-400">
            Your current role doesn&apos;t include AI assistance. Switch persona or ask a platform
            admin to grant <span className="text-slate-700 dark:text-slate-200">ai.use</span>.
          </div>
        )}
      </div>
    </section>
  );
}
