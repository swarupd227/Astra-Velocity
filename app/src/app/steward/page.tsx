import { ShieldCheck } from "lucide-react";
import { PersonaPlaceholder } from "@/components/persona-placeholder";

export const metadata = { title: "Steward My Day — Astra Velocity" };

export default function StewardPage() {
  return (
    <PersonaPlaceholder
      icon={ShieldCheck}
      title="Steward — My Day"
      subtitle="Agent suggestions to review, breaches to triage, and the audit trail behind it all."
      items={[
        "Agent suggestion queue",
        "DQ breach triage",
        "Glossary curation",
        "Agent performance & benching",
        "Approval audit trail",
        "Steward leverage metrics",
      ]}
    />
  );
}
