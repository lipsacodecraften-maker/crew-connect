"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StaffDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/staff-portal/profile").then((r) => r.json()).then((d) => setProfile(d.profile));
    fetch("/api/staff-portal/assignments").then((r) => r.json()).then((d) => setAssignments(d.assignments || []));
    fetch("/api/staff-portal/applications").then((r) => r.json()).then((d) => setApplications(d.applications || []));
  }, []);

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 24 }}>Welcome, {profile?.fullName || "staff member"}</h1>
      <p style={{ color: "var(--adm-muted)", marginTop: 6 }}>
        Status: {profile?.status || "—"} · City: {profile?.currentCity || "—"}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 18 }}>
        <div className="admin-card" style={{ padding: 16 }}>
          <div className="admin-subtle admin-small">Assignments</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{assignments.length}</div>
        </div>
        <div className="admin-card" style={{ padding: 16 }}>
          <div className="admin-subtle admin-small">Applications</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{applications.length}</div>
        </div>
      </div>
      <div style={{ marginTop: 18, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link href="/staff/profile" className="admin-btn is-primary">Update profile</Link>
        <Link href="/staff/jobs" className="admin-btn is-ghost">Browse jobs</Link>
        <Link href="/staff/assignments" className="admin-btn is-ghost">View assignments</Link>
      </div>
    </div>
  );
}
