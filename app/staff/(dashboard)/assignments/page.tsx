"use client";

import { useEffect, useState } from "react";

export default function StaffAssignmentsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/staff-portal/assignments").then((r) => r.json()).then((d) => setItems(d.assignments || []));
  }, []);

  async function respond(id: string, action: "accept" | "decline") {
    setMessage("");
    const res = await fetch(`/api/staff-portal/assignments/${id}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data?.message || "Action failed.");
      return;
    }
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status: data.status } : a)));
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22 }}>Assignments</h1>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((a) => (
          <div key={a.id} className="admin-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700 }}>{a.role} · {a.city}</div>
            <div style={{ color: "var(--adm-muted)", fontSize: 12, marginTop: 4 }}>
              {a.workDate} · {a.shiftStart || "—"}–{a.shiftEnd || "—"} · Status: {a.status}
            </div>
            <div style={{ color: "var(--adm-muted)", fontSize: 12, marginTop: 4 }}>
              Pay: {a.payRate ? `₹${a.payRate}` : "TBC"} · Attendance: {a.attendanceStatus}
            </div>
            {a.status === "proposed" ? (
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="admin-btn is-primary" onClick={() => respond(a.id, "accept")}>Accept</button>
                <button className="admin-btn is-ghost" onClick={() => respond(a.id, "decline")}>Decline</button>
              </div>
            ) : null}
          </div>
        ))}
        {!items.length ? <p>No assignments yet.</p> : null}
      </div>
      {message ? <div className="admin-form-error" role="alert" style={{ marginTop: 12 }}>{message}</div> : null}
    </div>
  );
}
