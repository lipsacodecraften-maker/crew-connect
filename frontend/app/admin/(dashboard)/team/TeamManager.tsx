"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiSave, FiUserX } from "react-icons/fi";

import { ADMIN_ROLE_IDS, ADMIN_ROLES } from "@/lib/admin/constants";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default function TeamManager({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("coordinator");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const [editingId, setEditingId] = useState("");
  const [editRole, setEditRole] = useState("coordinator");
  const [editStatus, setEditStatus] = useState("active");
  const [editPassword, setEditPassword] = useState("");
  const [savingId, setSavingId] = useState("");

  const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const response = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.message || "Could not create the admin user.");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");
    setRole("coordinator");
    setShowCreate(false);
    setMessage(`Admin ${payload.user.name} created.`);
    startTransition(() => router.refresh());
  };

  const startEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditPassword("");
    setError("");
    setMessage("");
  };

  const saveEdit = async (user: AdminUser) => {
    setSavingId(user.id);
    setError("");
    setMessage("");

    const body: Record<string, string> = {
      userId: user.id,
      role: editRole,
      status: editStatus,
    };
    if (editPassword) body.password = editPassword;

    const response = await fetch("/api/admin/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    setSavingId("");

    if (!response.ok) {
      setError(payload?.message || "Could not update the admin user.");
      return;
    }

    setEditingId("");
    setEditPassword("");
    setMessage(
      `Updated ${payload.user.name}.${
        editPassword ? " Password reset and sessions revoked." : ""
      }`,
    );
    startTransition(() => router.refresh());
  };

  return (
    <div className="admin-stack">
      <div className="admin-card-body">
        <div className="admin-btn-row">
          <button
            type="button"
            className="admin-btn is-primary"
            onClick={() => setShowCreate((value) => !value)}
          >
            <FiPlus aria-hidden="true" />
            {showCreate ? "Close form" : "Add admin user"}
          </button>
          <span className="admin-small admin-subtle">
            {users.length} admin account{users.length === 1 ? "" : "s"} ·{" "}
            {users.filter((user) => user.status === "active").length} active
          </span>
        </div>

        {error ? <div className="admin-form-error">{error}</div> : null}
        {message ? <div className="admin-alert is-success">{message}</div> : null}

        {showCreate ? (
          <form onSubmit={createUser} className="admin-stack-sm" style={{ marginTop: 12 }}>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label className="admin-label" htmlFor="team-name">
                  Full name
                </label>
                <input
                  id="team-name"
                  className="admin-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={120}
                  disabled={pending}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="team-email">
                  Email
                </label>
                <input
                  id="team-email"
                  type="email"
                  className="admin-input"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={pending}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="team-password">
                  Temporary password
                </label>
                <input
                  id="team-password"
                  type="password"
                  className="admin-input"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={10}
                  autoComplete="new-password"
                  disabled={pending}
                />
              </div>
              <div className="admin-field">
                <label className="admin-label" htmlFor="team-role">
                  Role
                </label>
                <select
                  id="team-role"
                  className="admin-select"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  disabled={pending}
                >
                  {ADMIN_ROLE_IDS.map((roleId) => (
                    <option key={roleId} value={roleId}>
                      {ADMIN_ROLES[roleId].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-form-note">
              Passwords must be at least 10 characters and include letters and
              numbers. Share the temporary password securely; the admin can
              change it from My account.
            </div>
            <button type="submit" className="admin-btn is-primary" disabled={pending}>
              <FiPlus aria-hidden="true" />
              {pending ? "Creating…" : "Create admin"}
            </button>
          </form>
        ) : null}
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Admin</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last login</th>
              <th>Created</th>
              <th className="is-right">Manage</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <span className="admin-row-title">
                    {user.name}
                    {user.id === currentUserId ? " (you)" : ""}
                  </span>
                  <span className="admin-row-sub">{user.email}</span>
                </td>
                <td className="is-nowrap">
                  {editingId === user.id ? (
                    <select
                      className="admin-select"
                      value={editRole}
                      onChange={(event) => setEditRole(event.target.value)}
                      disabled={savingId === user.id}
                      aria-label={`Role for ${user.name}`}
                    >
                      {ADMIN_ROLE_IDS.map((roleId) => (
                        <option key={roleId} value={roleId}>
                          {ADMIN_ROLES[roleId].label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    ADMIN_ROLES[user.role as keyof typeof ADMIN_ROLES]?.label ||
                    user.role
                  )}
                </td>
                <td className="is-nowrap">
                  {editingId === user.id ? (
                    <select
                      className="admin-select"
                      value={editStatus}
                      onChange={(event) => setEditStatus(event.target.value)}
                      disabled={savingId === user.id || user.id === currentUserId}
                      aria-label={`Status for ${user.name}`}
                    >
                      <option value="active">Active</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  ) : (
                    <span
                      className={`admin-pill ${
                        user.status === "active" ? "is-success" : "is-danger"
                      }`}
                    >
                      {user.status}
                    </span>
                  )}
                </td>
                <td className="is-nowrap">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString("en-IN")
                    : "Never"}
                </td>
                <td className="is-nowrap">
                  {new Date(user.createdAt).toLocaleDateString("en-IN")}
                </td>
                <td className="is-right">
                  {editingId === user.id ? (
                    <div className="admin-stack-sm" style={{ minWidth: 200 }}>
                      <input
                        className="admin-input"
                        type="password"
                        value={editPassword}
                        onChange={(event) => setEditPassword(event.target.value)}
                        placeholder="New password (optional)"
                        autoComplete="new-password"
                        disabled={savingId === user.id}
                      />
                      <div className="admin-btn-row">
                        <button
                          type="button"
                          className="admin-btn is-small is-primary"
                          onClick={() => saveEdit(user)}
                          disabled={savingId === user.id}
                        >
                          <FiSave aria-hidden="true" />
                          {savingId === user.id ? "Saving…" : "Save"}
                        </button>
                        <button
                          type="button"
                          className="admin-btn is-small is-ghost"
                          onClick={() => setEditingId("")}
                          disabled={savingId === user.id}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="admin-btn is-small is-ghost"
                      onClick={() => startEdit(user)}
                    >
                      <FiUserX aria-hidden="true" /> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
