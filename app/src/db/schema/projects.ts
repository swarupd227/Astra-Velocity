import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users, workspaces } from "./core";

export const projectStatus = pgEnum("project_status", ["draft", "active", "archived"]);

/**
 * A composed Data Governance Project: a (sector, scenario) pair plus the
 * velocity-pack elements selected in the Composer. Blueprint and dashboards
 * derive from this row + the content library at render time.
 */
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    clientLabel: text("client_label"),
    sectorKey: text("sector_key").notNull(),
    scenarioKey: text("scenario_key").notNull(),
    /** Element keys selected in the composer (content_items element keys). */
    selectedElementKeys: jsonb("selected_element_keys").notNull().$type<string[]>(),
    status: projectStatus("status").notNull().default("draft"),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("projects_workspace_idx").on(t.workspaceId)],
);
