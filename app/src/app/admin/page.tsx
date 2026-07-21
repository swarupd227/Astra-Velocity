import { Settings2 } from "lucide-react";
import { PersonaPlaceholder } from "@/components/persona-placeholder";

export const metadata = { title: "Admin — Astra Velocity" };

export default function AdminPage() {
  return (
    <PersonaPlaceholder
      icon={Settings2}
      title="Platform Administration"
      subtitle="Users, workspaces, AI configuration, guardrails, and the unified audit log."
      items={[
        "Users & roles",
        "Workspaces",
        "LLM providers & model routing",
        "Guardrail policies & kill-switches",
        "AI cost dashboard",
        "Audit center",
      ]}
    />
  );
}
