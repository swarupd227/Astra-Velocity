"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react";

/**
 * Lightweight toast system with no context threading: `toast()` dispatches a
 * CustomEvent on window and the single <Toaster /> mounted in the root layout
 * listens. That makes it callable from any client component — including ones
 * rendered deep inside server trees — without a provider wrapping children.
 */

export type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

const TOAST_EVENT = "astra:toast";
const AUTO_DISMISS_MS = 4000;
const MAX_STACK = 5;

/** Fire a toast from any client component. No-op during SSR. */
export function toast(message: string, variant: ToastVariant = "info"): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, variant } }));
}

/**
 * Next.js signals redirect()/notFound() by throwing — those must be rethrown,
 * never swallowed into an error toast, when wrapping a server action call.
 */
export function isNextRedirect(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    ((err as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
      (err as { digest: string }).digest === "NEXT_NOT_FOUND")
  );
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-teal-500/40 text-teal-800 dark:text-teal-200",
  error: "border-red-500/40 text-red-700 dark:text-red-200",
  info: "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200",
};

const VARIANT_ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CircleCheck className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" aria-hidden />,
  error: <TriangleAlert className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" aria-hidden />,
  info: <Info className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />,
};

let nextToastId = 1;

/** Fixed bottom-right toast stack. Mount exactly once, in the root layout. */
export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent).detail as
        | { message?: unknown; variant?: unknown }
        | undefined;
      const message = typeof detail?.message === "string" ? detail.message : "";
      if (!message) return;
      const variant: ToastVariant =
        detail?.variant === "success" || detail?.variant === "error" ? detail.variant : "info";
      const id = nextToastId++;
      setToasts((prev) => [...prev.slice(-(MAX_STACK - 1)), { id, message, variant }]);
      window.setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        AUTO_DISMISS_MS,
      );
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in flex items-start gap-2.5 rounded-xl border bg-white/95 dark:bg-slate-900/95 px-3.5 py-3 text-sm shadow-lg shadow-slate-300/50 dark:shadow-slate-950/50 backdrop-blur ${VARIANT_STYLES[t.variant]}`}
        >
          <span className="mt-0.5">{VARIANT_ICONS[t.variant]}</span>
          <p className="flex-1 leading-snug">{t.message}</p>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="rounded p-0.5 text-slate-500 transition hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
