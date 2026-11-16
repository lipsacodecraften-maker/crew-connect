"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffLoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"send" | "verify">("send");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function sendCode() {
    setMessage("");
    setPending(true);
    try {
      const res = await fetch("/api/staff/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: mobile }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || "Could not send code.");
      setStep("verify");
      if (payload?.devCode) setMessage(`Dev code: ${payload.devCode}`);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setPending(false);
    }
  }

  async function verifyCode() {
    setMessage("");
    setPending(true);
    try {
      const res = await fetch("/api/staff/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: mobile, code }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.message || "Verification failed.");
      const loginRes = await fetch("/api/staff/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: mobile, verificationToken: payload.verificationToken }),
      });
      const loginPayload = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginPayload?.message || "Login failed.");
      router.replace("/staff");
      router.refresh();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="admin-login">
      <section className="admin-login-panel">
        <div className="admin-login-card">
          <h2>Staff sign in</h2>
          <p>Log in with the mobile number you registered.</p>
          {step === "send" ? (
            <>
              <div className="admin-field">
                <label className="admin-label">Mobile number</label>
                <input className="admin-input" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="9876543210" />
              </div>
              <button className="admin-btn is-primary" onClick={sendCode} disabled={pending}>
                {pending ? "Sending..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              <div className="admin-field">
                <label className="admin-label">6-digit code</label>
                <input className="admin-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
              </div>
              <button className="admin-btn is-primary" onClick={verifyCode} disabled={pending}>
                {pending ? "Verifying..." : "Verify and sign in"}
              </button>
              <button className="admin-btn is-ghost" onClick={() => setStep("send")} disabled={pending}>
                Change number
              </button>
            </>
          )}
          {message ? <div className="admin-form-error" role="alert">{message}</div> : null}
        </div>
      </section>
    </div>
  );
}
