"use client";

import { useEffect, useState } from "react";

export default function StaffWorkHistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/staff-portal/work-history").then((r) => r.json()).then((d) => setItems(d.history || []));
  }, []);
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22 }}>Work history</h1>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((h) => (
          <div key={h.id} className="admin-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700 }}>{h.eventName} · {h.role}</div>
            <div style={{ color: "var(--adm-muted)", fontSize: 12, marginTop: 4 }}>
              {h.workDate} · {h.city} · {h.shiftHours ? `${h.shiftHours}h` : ""} · {h.payRate ? `₹${h.payRate}` : ""}
            </div>
            {h.notes ? <div style={{ color: "var(--adm-muted)", fontSize: 12, marginTop: 4 }}>{h.notes}</div> : null}
          </div>
        ))}
        {!items.length ? <p>No completed work history yet.</p> : null}
      </div>
    </div>
  );
}
