import type { Artifact } from "../../types";
import { CORE_ARTIFACTS } from "./core";
import { EXTENDED_ARTIFACTS } from "./extended";
import { ANCHOR_DEEP_DIVE_ARTIFACTS } from "./anchor-deep-dive";

/** All element artifacts, keyed by element key. Merged into the bundle. */
export const ARTIFACTS: Record<string, Artifact> = {
  ...CORE_ARTIFACTS,
  ...EXTENDED_ARTIFACTS,
  ...ANCHOR_DEEP_DIVE_ARTIFACTS,
};
