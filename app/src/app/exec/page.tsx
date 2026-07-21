import { TrendingUp } from "lucide-react";
import { PersonaPlaceholder } from "@/components/persona-placeholder";

export const metadata = { title: "Executive View — Astra Velocity" };

export default function ExecPage() {
  return (
    <PersonaPlaceholder
      icon={TrendingUp}
      title="Executive Value"
      subtitle="Portfolio maturity, value narrative, and the 2028 burn-up — at a glance."
      items={[
        "Governance Performance Index burn-up",
        "Incidents avoided on priority reports",
        "Cost-curve actuals vs. manual baseline",
        "Value moments timeline",
        "Capability radar by data product",
        "Funding & adoption view",
      ]}
    />
  );
}
