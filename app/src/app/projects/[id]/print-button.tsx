"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Print / Export via the browser's print dialog (print CSS makes it paper-safe). */
export function PrintButton() {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="no-print"
      onClick={() => window.print()}
    >
      <Printer className="h-4 w-4" /> Print / Export
    </Button>
  );
}
