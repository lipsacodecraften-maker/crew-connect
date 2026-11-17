"use client";

import { useState } from "react";
import { FiLock } from "react-icons/fi";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setPending(true);
    const response = await fetch("/api/admin/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);

    if (!response.ok) {
      setError(payload?.message || "Could not change the password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage(
      "Password updated. Other signed-in devices were signed out.",
    );
  };

  return (
    <form onSubmit={submit} className="admin-stack-sm">
      <div className="admin-field">
        <label className="admin-label" htmlFor="password-current">
          Current password
        </label>
        <input
          id="password-current"
          type="password"
          className="admin-input"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
          autoComplete="current-password"
          disabled={pending}
        />
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor="password-new">
          New password
        </label>
        <input
          id="password-new"
          type="password"
          className="admin-input"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={10}
          autoComplete="new-password"
          disabled={pending}
        />
      </div>
      <div className="admin-field">
        <label className="admin-label" htmlFor="password-confirm">
          Confirm new password
        </label>
        <input
          id="password-confirm"
          type="password"
          className="admin-input"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          minLength={10}
          autoComplete="new-password"
          disabled={pending}
        />
      </div>

      <div className="admin-form-note">
        Use at least 10 characters with letters and numbers. Changing the
        password keeps this session signed in and revokes every other session.
      </div>

      {error ? <div className="admin-form-error">{error}</div> : null}
      {message ? <div className="admin-alert is-success">{message}</div> : null}

      <button type="submit" className="admin-btn is-primary" disabled={pending}>
        <FiLock aria-hidden="true" />
        {pending ? "Updating…" : "Change password"}
      </button>
    </form>
  );
}
