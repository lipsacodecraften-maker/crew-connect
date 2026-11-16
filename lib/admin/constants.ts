/**
 * Central RBAC catalogue for the CrewConnect admin dashboard.
 *
 * A permission is a small string such as `staff.review`. Each role owns a set
 * of permissions. UI navigation and every admin API route are gated by the
 * same catalogue so the browser cannot bypass a hidden button.
 */

export const ADMIN_PERMISSIONS = [
  "dashboard.view",
  "bookings.view",
  "bookings.manage",
  "quotations.manage",
  "staff.view",
  "staff.review",
  "assignments.manage",
  "attendance.manage",
  "matching.view",
  "jobs.view",
  "jobs.manage",
  "applications.manage",
  "team.manage",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export type AdminRoleId =
  | "super_admin"
  | "operations_manager"
  | "coordinator"
  | "viewer";

type RoleDefinition = {
  label: string;
  description: string;
  permissions: readonly AdminPermission[];
};

const ALL_PERMISSIONS = ADMIN_PERMISSIONS;

export const ADMIN_ROLES: Record<AdminRoleId, RoleDefinition> = {
  super_admin: {
    label: "Super admin",
    description: "Full control, including creating and disabling admin users.",
    permissions: ALL_PERMISSIONS,
  },
  operations_manager: {
    label: "Operations manager",
    description:
      "Runs bookings, staffing, matching and the job board. Cannot manage admin users.",
    permissions: ALL_PERMISSIONS.filter(
      (permission) => permission !== "team.manage",
    ),
  },
  coordinator: {
    label: "Coordinator",
    description:
      "Day-to-day desk role: reviews staff, assigns crew, tracks attendance and works the job board.",
    permissions: [
      "dashboard.view",
      "bookings.view",
      "bookings.manage",
      "quotations.manage",
      "staff.view",
      "staff.review",
      "assignments.manage",
      "attendance.manage",
      "matching.view",
      "jobs.view",
      "jobs.manage",
      "applications.manage",
    ],
  },
  viewer: {
    label: "Viewer",
    description: "Read-only access to dashboards, requests, staff and jobs.",
    permissions: [
      "dashboard.view",
      "bookings.view",
      "staff.view",
      "matching.view",
      "jobs.view",
    ],
  },
};

export const ADMIN_ROLE_IDS = Object.keys(ADMIN_ROLES) as AdminRoleId[];

export function isAdminRole(value: unknown): value is AdminRoleId {
  return typeof value === "string" && Object.hasOwn(ADMIN_ROLES, value);
}

export function permissionsForRole(role: string): AdminPermission[] {
  if (!isAdminRole(role)) return [];
  return [...ADMIN_ROLES[role].permissions];
}

export function roleLabel(role: string) {
  return isAdminRole(role) ? ADMIN_ROLES[role].label : role;
}

export function hasPermission(
  role: string,
  permission: AdminPermission,
): boolean {
  return permissionsForRole(role).includes(permission);
}

export const ADMIN_STATUSES = ["active", "disabled"] as const;
export type AdminStatus = (typeof ADMIN_STATUSES)[number];

export const BOOKING_STATUSES = [
  "received",
  "under_review",
  "staffing",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  received: "Request received",
  under_review: "Under review",
  staffing: "Staffing in progress",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STAFF_REVIEW_STATUSES = [
  "pending_review",
  "under_verification",
  "approved",
  "rejected",
  "on_hold",
] as const;

export const STAFF_REVIEW_LABELS: Record<string, string> = {
  pending_review: "Pending review",
  under_verification: "Under verification",
  approved: "Approved",
  rejected: "Not approved",
  on_hold: "Additional details needed",
};

export const ASSIGNMENT_STATUSES = [
  "proposed",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number];

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  proposed: "Proposed",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No show",
};

export const ACTIVE_ASSIGNMENT_STATUSES = [
  "proposed",
  "confirmed",
  "checked_in",
  "completed",
] as const;

export const ATTENDANCE_STATUSES = [
  "pending",
  "checked_in",
  "checked_out",
  "absent",
] as const;

export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  pending: "Not marked",
  checked_in: "On site",
  checked_out: "Checked out",
  absent: "Absent",
};

export const QUOTATION_STATUSES = ["draft", "sent", "accepted", "rejected"] as const;

export const QUOTATION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent to client",
  accepted: "Accepted",
  rejected: "Rejected",
};

export function isAssignmentStatus(value: unknown): value is AssignmentStatus {
  return (
    typeof value === "string" &&
    (ASSIGNMENT_STATUSES as readonly string[]).includes(value)
  );
}
