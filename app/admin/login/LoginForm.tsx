"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiMail } from "react-icons/fi";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let payload: any = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        setError(payload?.message || "Could not sign in. Please try again.");
        return;
      }

      router.replace(next || "/admin");
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="admin-login-form" onSubmit={submit}>
      <div className="admin-field">
        <label className="admin-label" htmlFor="admin-email">
          Work email
        </label>
        <input
          id="admin-email"
          className="admin-input"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@crewconnect.in"
          autoComplete="username"
          inputMode="email"
          required
          disabled={pending}
        />
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="admin-password">
          Password
        </label>
        <input
          id="admin-password"
          className="admin-input"
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your admin password"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </div>

      {error ? (
        <div className="admin-form-error" role="alert">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        className="admin-btn is-primary"
        disabled={pending}
      >
        <FiMail aria-hidden="true" />
        {pending ? "Checking credentials…" : "Sign in securely"}
        {!pending ? <FiArrowRight aria-hidden="true" /> : null}
      </button>
    </form>
  );
}
