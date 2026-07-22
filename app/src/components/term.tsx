"use client";

import { useId } from "react";

/**
 * Inline jargon tooltip: <Term k="gpi">GPI</Term> renders its children with a
 * dotted underline and an accessible definition shown on hover or keyboard
 * focus. Apply to the first occurrence of a term on a page — not every one.
 */

const DEFINITIONS = {
  gpi: {
    term: "GPI — Governance Performance Index",
    definition:
      "A 0–100 composite score of how well-governed a data product is: ownership, quality, lineage, and access controls rolled into one number.",
  },
  cde: {
    term: "CDE — Critical Data Element",
    definition:
      "A field whose accuracy a regulator, financial filing, or executive decision directly depends on — the elements governance protects first.",
  },
  nppi: {
    term: "NPPI — Non-Public Personal Information",
    definition:
      "Customer data protected under GLBA and state privacy law; its discovery and masking drive classification and access-policy work.",
  },
  ibnr: {
    term: "IBNR — Incurred But Not Reported",
    definition:
      "Reserves for claims that have happened but are not yet in the system — an actuarial estimate highly sensitive to upstream data quality.",
  },
  cope: {
    term: "COPE — Construction, Occupancy, Protection, Exposure",
    definition:
      "The core property-underwriting attributes every risk model expects to be complete and consistent.",
  },
  fnol: {
    term: "FNOL — First Notice of Loss",
    definition:
      "The intake event that opens a claim; capture quality at FNOL drives everything downstream, from reserving to fraud detection.",
  },
  "semantic-layer": {
    term: "Semantic layer",
    definition:
      "The shared business definitions — metrics, dimensions, hierarchies — that sit between raw tables and reports so every team computes the same numbers.",
  },
  lineage: {
    term: "Lineage",
    definition:
      "The traced path data takes from source system to report — the evidence an auditor asks for when a published number is challenged.",
  },
  dq: {
    term: "DQ — Data Quality",
    definition:
      "Measured fitness of data against explicit rules (completeness, validity, timeliness). Rule breaches are triaged by severity and owner.",
  },
  steward: {
    term: "Steward",
    definition:
      "The named person accountable for a data domain: approves definitions, resolves DQ breaches, and decides on agent suggestions.",
  },
  "velocity-pack": {
    term: "Velocity Pack",
    definition:
      "A curated bundle of ready-to-use governance assets — standards, rule libraries, templates, agents — that jump-starts an engagement.",
  },
  obligation: {
    term: "Obligation",
    definition:
      "A regulatory or contractual requirement (NAIC, SEC, state DOI, …) that specific governance evidence must satisfy.",
  },
} as const;

export type TermKey = keyof typeof DEFINITIONS;

export function Term({ k, children }: { k: TermKey; children: React.ReactNode }) {
  const id = useId();
  const def = DEFINITIONS[k];

  return (
    <span className="group/term relative inline-block">
      <span
        tabIndex={0}
        aria-describedby={id}
        className="cursor-help rounded-sm underline decoration-slate-500 decoration-dotted underline-offset-4 outline-none focus-visible:ring-1 focus-visible:ring-teal-500/60"
      >
        {children}
      </span>
      <span
        role="tooltip"
        id={id}
        className="pointer-events-none invisible absolute left-0 top-full z-50 mt-2 block w-72 max-w-[80vw] rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-left font-sans text-xs font-normal normal-case leading-relaxed tracking-normal text-slate-600 dark:text-slate-300 opacity-0 shadow-xl shadow-slate-300/60 dark:shadow-slate-950/60 transition-opacity duration-150 group-focus-within/term:visible group-focus-within/term:opacity-100 group-hover/term:visible group-hover/term:opacity-100"
      >
        <span className="mb-1 block font-semibold text-teal-700 dark:text-teal-300">{def.term}</span>
        {def.definition}
      </span>
    </span>
  );
}
