import { FiShield, FiUsers } from "react-icons/fi";

import { can, getAdminSession } from "@/lib/admin/auth";
import { listAdminUsers } from "@/lib/admin/db";
import { ADMIN_ROLES } from "@/lib/admin/constants";
import {
  CardHead,
  EmptyState,
  MetricCard,
  PageHeader,
} from "../../_components/ui";
import TeamManager from "./TeamManager";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await getAdminSession();

  if (!can(session!, "team.manage")) {
    return (
      <section className="admin-card">
        <EmptyState title="Only super admins can manage the admin team">
          Your role does not include the team.manage permission.
        </EmptyState>
      </section>
    );
  }

  const users = await listAdminUsers();
  const active = users.filter((user) => user.status === "active").length;
  const superAdmins = users.filter(
    (user) => user.role === "super_admin" && user.status === "active",
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Admin team"
        subtitle="Create admin accounts, assign roles, disable access and reset passwords. Every action is written to the audit log."
        actions={
          <span className="admin-topbar-chip">
            <i aria-hidden="true" /> {active} active account
            {active === 1 ? "" : "s"}
          </span>
        }
      />

      <section className="admin-grid admin-grid-4" style={{ marginBottom: 16 }}>
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Admin accounts"
          value={users.length}
          suffix="total"
          tone="accent"
          foot={`${active} active`}
        />
        <MetricCard
          icon={<FiShield aria-hidden="true" />}
          label="Super admins"
          value={superAdmins}
          suffix="active"
          tone="green"
          foot="At least one is always required"
        />
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Operations managers"
          value={
            users.filter(
              (user) =>
                user.role === "operations_manager" && user.status === "active",
            ).length
          }
          suffix="active"
          tone="blue"
          foot="Bookings, staffing and jobs"
        />
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Coordinators"
          value={
            users.filter(
              (user) => user.role === "coordinator" && user.status === "active",
            ).length
          }
          suffix="active"
          tone="yellow"
          foot="Desk operations and attendance"
        />
      </section>

      <section className="admin-card">
        <CardHead
          title="Team directory"
          subtitle="Roles map directly to the permission catalogue used by the dashboard and every API route."
          action={
            <span className="admin-count-chip">
              {ADMIN_ROLES.super_admin.label} required for team changes
            </span>
          }
        />
        <TeamManager users={users} currentUserId={session!.id} />
      </section>
    </>
  );
}
