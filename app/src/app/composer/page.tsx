import { Blocks } from "lucide-react";
import { PersonaPlaceholder } from "@/components/persona-placeholder";

export const metadata = { title: "Composer — Astra Velocity" };

export default function ComposerPage() {
  return (
    <PersonaPlaceholder
      icon={Blocks}
      title="Project Composer"
      subtitle="Pick a sector and scenario; compose a governance project from Velocity Pack elements."
      items={[
        "Insurance Landscape Explorer",
        "Scenario catalog",
        "Velocity Pack recommendation canvas",
        "Capability coverage heatmap",
        "Engagement Copilot",
        "Blueprint generator",
      ]}
    />
  );
}
