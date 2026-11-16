export type StatusTone = "new" | "progress" | "success" | "danger" | "warning" | "muted";

const TONES: Record<string, StatusTone> = {
  // Booking pipeline
  received: "new",
  under_review: "progress",
  staffing: "warning",
  confirmed: "success",
  completed: "success",
  cancelled: "danger",

  // Staff review
  pending_review: "new",
  under_verification: "progress",
  approved: "success",
  rejected: "danger",
  on_hold: "warning",

  // Assignments and attendance
  proposed: "new",
  checked_in: "warning",
  no_show: "danger",
  pending: "muted",
  checked_out: "success",
  absent: "danger",

  // Jobs and applications
  draft: "muted",
  open: "new",
  closed: "muted",
  filled: "success",
  submitted: "new",
  shortlisted: "progress",
  selected: "success",
  not_selected: "muted",
  withdrawn: "muted",

  // Quotations
  sent: "progress",
  accepted: "success",

  // Admin users
  active: "success",
  disabled: "danger",
};

export function statusTone(status: string): StatusTone {
  return TONES[status] || "muted";
}

export function statusClass(status: string) {
  return `admin-pill is-${statusTone(status)}`;
}

export function initials(name: string) {
  return String(name || "CC")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function fillTone(assigned: number, requested: number) {
  if (!requested) return "";
  const percent = (assigned / requested) * 100;
  if (percent >= 100) return "is-success";
  if (percent >= 60) return "is-warning";
  return "";
}
