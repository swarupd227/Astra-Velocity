"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search, X } from "lucide-react";

/**
 * Global command palette (Ctrl/Cmd-K). The server side of the app shell builds
 * a compact searchable index (src/lib/search-index.ts) and passes it down as
 * plain rows — filtering, grouping, and keyboard navigation happen here.
 */

export interface SearchRow {
  label: string;
  sublabel?: string;
  href: string;
  group: string;
}

const MAX_TOTAL = 30;
const MAX_PER_GROUP = 6;

export function CommandPalette({ rows }: { rows: SearchRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // State resets happen at the event sites (not in effects) so opening always
  // starts from a blank query with the first result active.
  const openPalette = useCallback(() => {
    setQuery("");
    setActive(0);
    setOpen(true);
  }, []);

  // Global shortcut: Ctrl/Cmd-K toggles, Esc closes — works from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) setOpen(false);
        else openPalette();
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPalette]);

  // While open: focus the input and lock body scroll.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  // Substring match on label + sublabel; empty query shows navigation only.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const perGroup = new Map<string, number>();
    const out: SearchRow[] = [];
    for (const row of rows) {
      if (out.length >= MAX_TOTAL) break;
      if (q) {
        const hay = `${row.label} ${row.sublabel ?? ""}`.toLowerCase();
        if (!hay.includes(q)) continue;
        const n = perGroup.get(row.group) ?? 0;
        if (n >= MAX_PER_GROUP) continue;
        perGroup.set(row.group, n + 1);
      } else if (row.group !== "Navigate") {
        continue;
      }
      out.push(row);
    }
    return out;
  }, [rows, query]);

  // Preserve row order but render under group headings.
  const grouped = useMemo(() => {
    const groups: { group: string; items: { row: SearchRow; index: number }[] }[] = [];
    results.forEach((row, index) => {
      const last = groups[groups.length - 1];
      if (last && last.group === row.group) last.items.push({ row, index });
      else groups.push({ group: row.group, items: [{ row, index }] });
    });
    return groups;
  }, [results]);

  // Keep the active row visible while arrowing through a long list.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = results[active];
      if (row) go(row.href);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        aria-label="Search the platform (Ctrl+K)"
        className="flex items-center gap-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-2 text-sm text-slate-500 dark:text-slate-400 transition hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200 md:px-3 md:py-1.5"
      >
        <Search className="h-4 w-4" aria-hidden />
        <span className="hidden md:inline">Search</span>
        <kbd className="hidden rounded border border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800/80 px-1.5 py-0.5 font-sans text-[10px] font-medium text-slate-500 dark:text-slate-400 md:inline">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="toast-in absolute left-1/2 top-[12vh] w-[min(40rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-300 dark:shadow-slate-950"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 px-4">
              <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKeyDown}
                placeholder="Search elements, practices, KPIs, pages…"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-palette-results"
                aria-activedescendant={results[active] ? `palette-option-${active}` : undefined}
                className="w-full bg-transparent py-3.5 text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-slate-500 transition hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div
              ref={listRef}
              id="command-palette-results"
              role="listbox"
              aria-label="Search results"
              className="max-h-[50vh] overflow-y-auto p-2"
            >
              {grouped.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-slate-500">
                  No matches for &ldquo;{query}&rdquo;.
                </p>
              ) : (
                grouped.map((g) => (
                  <div key={g.group}>
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-600">
                      {g.group}
                    </p>
                    {g.items.map(({ row, index }) => (
                      <button
                        key={`${row.href}-${row.label}`}
                        id={`palette-option-${index}`}
                        data-index={index}
                        role="option"
                        aria-selected={index === active}
                        type="button"
                        onMouseEnter={() => setActive(index)}
                        onClick={() => go(row.href)}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                          index === active
                            ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate">{row.label}</span>
                          {row.sublabel && (
                            <span className="block truncate text-xs text-slate-500">
                              {row.sublabel}
                            </span>
                          )}
                        </span>
                        {index === active && (
                          <CornerDownLeft
                            className="h-3.5 w-3.5 shrink-0 text-slate-500"
                            aria-hidden
                          />
                        )}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center gap-4 border-t border-slate-200 dark:border-slate-800 px-4 py-2 text-[11px] text-slate-400 dark:text-slate-600">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
