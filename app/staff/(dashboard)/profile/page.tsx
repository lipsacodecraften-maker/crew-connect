"use client";

import { useEffect, useState } from "react";

export default function StaffProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/staff-portal/profile")
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile);
        setForm({
          currentCity: d.profile?.currentCity || "",
          availableFrom: d.profile?.availableFrom || "",
          availableUntil: d.profile?.availableUntil || "",
          skills: (d.profile?.skills || []).join(", "),
          shiftTypes: d.profile?.shiftTypes || [],
          willingToTravel: d.profile?.willingToTravel === "yes",
          transportAvailable: d.profile?.transportAvailable === "yes",
          expectedPayment: d.profile?.expectedPayment || "",
        });
      });
  }, []);

  async function save() {
    setMessage("");
    const payload = {
      currentCity: form.currentCity,
      availableFrom: form.availableFrom,
      availableUntil: form.availableUntil,
      skills: form.skills.split(",").map((s: string) => s.trim()).filter(Boolean),
      shiftTypes: form.shiftTypes,
      willingToTravel: form.willingToTravel ? "yes" : "no",
      transportAvailable: form.transportAvailable ? "yes" : "no",
      expectedPayment: Number(form.expectedPayment) || 0,
    };
    const res = await fetch("/api/staff-portal/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data?.message || "Update failed.");
      return;
    }
    setProfile(data.profile);
    setMessage("Profile updated.");
  }

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22 }}>Profile</h1>
      <p style={{ color: "var(--adm-muted)" }}>{profile.fullName} · {profile.status}</p>
      <div style={{ display: "grid", gap: 12, maxWidth: 560, marginTop: 16 }}>
        <div className="admin-field">
          <label className="admin-label">Current city</label>
          <input className="admin-input" value={form.currentCity} onChange={(e) => setForm({ ...form, currentCity: e.target.value })} />
        </div>
        <div className="admin-field">
          <label className="admin-label">Available from</label>
          <input className="admin-input" type="date" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} />
        </div>
        <div className="admin-field">
          <label className="admin-label">Available until</label>
          <input className="admin-input" type="date" value={form.availableUntil} onChange={(e) => setForm({ ...form, availableUntil: e.target.value })} />
        </div>
        <div className="admin-field">
          <label className="admin-label">Skills (comma separated)</label>
          <input className="admin-input" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </div>
        <div className="admin-field">
          <label className="admin-label">Expected payment</label>
          <input className="admin-input" type="number" value={form.expectedPayment} onChange={(e) => setForm({ ...form, expectedPayment: e.target.value })} />
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={form.willingToTravel} onChange={(e) => setForm({ ...form, willingToTravel: e.target.checked })} />
          Willing to travel
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={form.transportAvailable} onChange={(e) => setForm({ ...form, transportAvailable: e.target.checked })} />
          Transport available
        </label>
        <button className="admin-btn is-primary" onClick={save}>Save changes</button>
        {message ? <div className="admin-form-error" role="alert">{message}</div> : null}
      </div>
    </div>
  );
}
