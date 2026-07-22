"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Persistent dismissal flag backed by localStorage, exposed through
 * useSyncExternalStore so components stay hidden during SSR/hydration and
 * reveal themselves only after the client has checked storage — no
 * setState-in-effect, no hydration mismatch.
 */

const listeners = new Set<() => void>();
// In-memory fallback so dismissal still works this session when storage is
// unavailable (private mode, blocked third-party storage, …).
const memoryDismissed = new Set<string>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function isDismissed(key: string): boolean {
  if (memoryDismissed.has(key)) return true;
  try {
    return window.localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function useDismissable(key: string): { dismissed: boolean; dismiss: () => void } {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => isDismissed(key),
    // Server snapshot: treat as dismissed so nothing flashes before the
    // client has read storage.
    () => true,
  );

  const dismiss = useCallback(() => {
    memoryDismissed.add(key);
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      // memory fallback already covers this session
    }
    listeners.forEach((listener) => listener());
  }, [key]);

  return { dismissed, dismiss };
}
