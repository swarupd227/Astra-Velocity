import { LibraryBig } from "lucide-react";
import { PersonaPlaceholder } from "@/components/persona-placeholder";

export const metadata = { title: "Library Studio — Astra Velocity" };

export default function StudioPage() {
  return (
    <PersonaPlaceholder
      icon={LibraryBig}
      title="Library Studio"
      subtitle="Author, review, and publish Velocity Pack content — versioned, curated, governed."
      items={[
        "Content drafts & review queue",
        "Velocity Pack catalog management",
        "Best practice authoring",
        "Ontology editor (sectors, obligations, KPIs)",
        "Version history & diffs",
        "Usage analytics",
      ]}
    />
  );
}
