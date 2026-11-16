"use client";

import { useEffect, useState } from "react";

export default function StaffApplicationsPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/staff-portal/applications").then((r) => r.json()).then((d) => setItems(d.applications || []));
  }, []);
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22 }}>My applications</h1>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((a) => (
          <div key={a.id} className="admin-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700 }}>{a.job?.jobRole || a.listingId} · {a.job?.eventCity}</div>
            <div style={{ color: "var(--adm-muted)", fontSize: 12, marginTop: 4 }}>Status: {a.status}</div>
            <div style={{ color: "var(--adm-muted)", fontSize: 12, marginTop: 4 }}>Applied: {a.createdAt}</div>
          </div>
        ))}
        {!items.length ? <p>No applications yet.</p> : null}
      </div>
    </div>
  );
}
