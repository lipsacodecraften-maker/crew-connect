import { FiKey, FiShield, FiUser } from "react-icons/fi";

import { getAdminSession } from "@/lib/admin/auth";
import { ADMIN_ROLES } from "@/lib/admin/constants";
import { listRecentAudit } from "@/lib/admin/db";
import { formatTimestamp } from "@/lib/admin/format";
import {
  CardHead,
  PageHeader,
  StatusPill,
} from "../../_components/ui";
import { initials } from "../../_components/status";
import PasswordForm from "./PasswordForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getAdminSession();
  const audit = await listRecentAudit(20);
  const role = ADMIN_ROLES[session!.role as keyof typeof ADMIN_ROLES];

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="My account"
        subtitle="Review your role permissions, secure your password and inspect recent audit activity."
      />

      <div className="admin-split">
        <div className="admin-stack">
          <section className="admin-card">
            <CardHead
              title="Profile"
              action={<StatusPill status="active" label="Signed in" />}
            />
            <div className="admin-card-body">
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <span
                  className="admin-avatar"
                  style={{ width: 64, height: 64, fontSize: 20 }}
                >
                  {initials(session!.name)}
                </span>
                <div>
                  <strong className="admin-row-title">{session!.name}</strong>
                  <span className="admin-row-sub">{session!.email}</span>
                  <span className="admin-row-sub">{session!.roleLabel}</span>
                </div>
              </div>

              <div className="admin-info-grid">
                <div className="admin-info">
                  <dt>Admin ID</dt>
                  <dd className="admin-mono">{session!.id}</dd>
                </div>
                <div className="admin-info">
                  <dt>Session ID</dt>
                  <dd className="admin-mono">{session!.sessionId}</dd>
                </div>
                <div className="admin-info">
                  <dt>Role</dt>
                  <dd>{role?.label || session!.role}</dd>
                </div>
                <div className="admin-info">
                  <dt>Session expires</dt>
                  <dd>
                    {session!.expiresAt
                      ? formatTimestamp(session!.expiresAt)
                      : "—"}
                  </dd>
                </div>
              </div>

              <div className="admin-form-note" style={{ marginTop: 12 }}>
                {role?.description}
              </div>
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Change password"
              subtitle="Passwords are stored as scrypt hashes with a per-user salt."
            />
            <div className="admin-card-body">
              <PasswordForm />
            </div>
          </section>

          <section className="admin-card">
            <CardHead
              title="Recent audit activity"
              subtitle="The last 20 actions recorded for the whole admin team."
            />
            {audit.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Actor</th>
                      <th>Entity</th>
                      <th>Detail</th>
                      <th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audit.map((entry) => (
                      <tr key={entry.id}>
                        <td className="is-nowrap">
                          <span className="admin-mono admin-small">
                            {entry.action}
                          </span>
                        </td>
                        <td className="is-nowrap">{entry.adminName}</td>
                        <td className="is-nowrap">
                          {entry.entityType}
                          {entry.entityId ? (
                            <span className="admin-row-sub">
                              {entry.entityId}
                            </span>
                          ) : null}
                        </td>
                        <td>{entry.detail || "—"}</td>
                        <td className="is-nowrap">
                          {formatTimestamp(entry.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty">
                <strong>No audit activity yet</strong>
              </div>
            )}
          </section>
        </div>

        <div className="admin-stack">
          <section className="admin-card">
            <CardHead
              title="Your permissions"
              subtitle="Every page and API route checks this same list."
              action={
                <span className="admin-count-chip">
                  {session!.permissions.length}
                </span>
              }
            />
            <div className="admin-card-body">
              <div className="admin-inline-list">
                {session!.permissions.map((permission) => (
                  <span className="admin-tag" key={permission}>
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-card-body">
              <div className="admin-form-note">
                <FiShield aria-hidden="true" /> Dashboard sessions use an
                HttpOnly, same-site cookie. Only a SHA-256 hash of the session
                token is stored in the database.
                <br />
                <br />
                <FiKey aria-hidden="true" /> Signing in from another device does
                not revoke this session. Use Create password change to revoke
                other devices.
                <br />
                <br />
                <FiUser aria-hidden="true" /> Role changes take effect the next
                time a session is validated (within 12 hours) or immediately
                after signing in again.
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
