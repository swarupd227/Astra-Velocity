import { KanbanSquare } from "lucide-react";
import { PersonaPlaceholder } from "@/components/persona-placeholder";

export const metadata = { title: "Projects — Astra Velocity" };

export default function ProjectsPage() {
  return (
    <PersonaPlaceholder
      icon={KanbanSquare}
      title="Delivery Projects"
      subtitle="Run composed governance projects: waves, milestones, pods, and enablement."
      items={[
        "Project portfolio",
        "Wave & milestone tracking",
        "Pod pairing & trainee roster",
        "Readiness demonstrations",
        "Per-product economics",
        "Risk register",
      ]}
    />
  );
}
