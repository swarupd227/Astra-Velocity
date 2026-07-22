import Link from "next/link";
import { redirect } from "next/navigation";
import { count, eq, gte } from "drizzle-orm";
import {
  Activity,
  ArrowRight,
  Building2,
  Cpu,
  Inbox,
  LibraryBig,
  ScrollText,
  Users,
} from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db/client";
import { agentSuggestions, aiCalls, contentItems, users, workspaces } from "@/db/schema";
import { hasPermission } from "@/lib/roles";
import { AccessDenied } from "@/components/access-denied";
import { WelcomePanel } from "@/components/welcome-panel";

export const metadata = { title: "Admin — Astra Velocity" };

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!hasPermission(session.user.role, "admin.platform")) {
    return (
      <AccessDenied
        title="Platform Administration"
        message="This surface manages users, AI routing, guardrails, and the audit trail — it requires platform administration rights."
        role={session.user.role}
      />
    );
  }

  const since7d = new Date();
  since7d.setDate(since7d.getDate() - 7);
  const [[userCount], [workspaceCount], [publishedCount], [aiCallCount], [pendingCount]] =
    await Promise.all([
      db.select({ n: count() }).from(users),
      db.select({ n: count() }).from(workspaces),
      db.select({ n: count() }).from(contentItems).where(eq(contentItems.status, "published")),
      db.select({ n: count() }).from(aiCalls).where(gte(aiCalls.createdAt, since7d)),
      db
        .select({ n: count() })
        .from(agentSuggestions)
        .where(eq(agentSuggestions.status, "pending")),
    ]);

  return (
    <div className="space-y-8">
      <WelcomePanel workspace="admin" />

      <header>
        <h1 className="font-display text-3xl text-white">Platform Administration</h1>
        <p className="mt-1 text-sm text-slate-400">
          Users, AI routing and kill-switches, cost telemetry, and the unified audit trail — every
          change made here is itself audited.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile icon={<Users className="h-4 w-4 text-teal-400" />} label="Users" value={userCount.n} />
        <StatTile
          icon={<Building2 className="h-4 w-4 text-teal-400" />}
          label="Workspaces"
          value={workspaceCount.n}
        />
        <StatTile
          icon={<LibraryBig className="h-4 w-4 text-teal-400" />}
          label="Published content items"
          value={publishedCount.n}
        />
        <StatTile
          icon={<Activity className="h-4 w-4 text-teal-400" />}
          label="AI calls — last 7 days"
          value={aiCallCount.n}
        />
        <StatTile
          icon={<Inbox className="h-4 w-4 text-teal-400" />}
          label="Pending suggestions"
          value={pendingCount.n}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <LinkCard
          href="/admin/users"
          icon={<Users className="h-5 w-5 text-teal-400" />}
          title="Users & Roles"
          description="Invite users, assign platform roles, and deactivate accounts. Role changes take effect at next sign-in."
        />
        <LinkCard
          href="/admin/ai"
          icon={<Cpu className="h-5 w-5 text-teal-400" />}
          title="AI Administration"
          description="Model routing per feature, kill-switches, cost and usage telemetry, and the guardrail posture."
        />
        <LinkCard
          href="/admin/audit"
          icon={<ScrollText className="h-5 w-5 text-teal-400" />}
          title="Audit Center"
          description="The unified, append-only trail of human, agent, and system actions — plus every AI model call."
        />
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      {icon}
      <div>
        <p className="text-lg font-semibold leading-tight text-white tabular-nums">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function LinkCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-teal-500/50"
    >
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <ArrowRight className="ml-auto h-4 w-4 text-slate-600 transition group-hover:text-teal-400" />
      </div>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </Link>
  );
}
