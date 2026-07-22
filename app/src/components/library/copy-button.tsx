"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copy-to-clipboard for code artifacts, passwords, and other one-liners. */
export function CopyButton({
  text,
  ariaLabel = "Copy to clipboard",
}: {
  text: string;
  ariaLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white"
      aria-label={ariaLabel}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
