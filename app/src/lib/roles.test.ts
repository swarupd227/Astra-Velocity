import { describe, expect, it } from "vitest";
import {
  assumablePersonas,
  hasPermission,
  PERMISSIONS,
  ROLE_HOMES,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  ROLES,
} from "./roles";

describe("roles model", () => {
  it("every role has a label, home route, and permission set", () => {
    for (const role of ROLES) {
      expect(ROLE_LABELS[role]).toBeTruthy();
      expect(ROLE_HOMES[role]).toMatch(/^\//);
      expect(ROLE_PERMISSIONS[role].length).toBeGreaterThan(0);
    }
  });

  it("platform_admin holds every permission", () => {
    for (const p of PERMISSIONS) {
      expect(hasPermission("platform_admin", p)).toBe(true);
    }
  });

  it("executive cannot author content or administer the platform", () => {
    expect(hasPermission("executive", "library.author")).toBe(false);
    expect(hasPermission("executive", "admin.users")).toBe(false);
    expect(hasPermission("executive", "dashboards.executive")).toBe(true);
  });

  it("non-admins can only assume their own persona plus the executive lens", () => {
    expect(assumablePersonas("data_steward").sort()).toEqual(
      ["data_steward", "executive"].sort(),
    );
  });

  it("platform_admin and demo workspaces unlock all personas", () => {
    expect(assumablePersonas("platform_admin")).toEqual([...ROLES]);
    expect(assumablePersonas("executive", { demoWorkspace: true })).toEqual([...ROLES]);
  });
});
