"use client";

import { useEffect, useState } from "react";

export default function StaffJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/staff-portal/jobs").then((r) => r.json()).then((d) => setJobs(d.listings || []));
  }, []);

  async function apply(id: string) {
    setMessage("");
    const res = await fetch(`/api/staff-portal/jobs/${id}/apply`, { method: "POST" });
    const data = await res.json();
    setMessage(res.ok ? "Applied successfully." : data?.message || "Apply failed.");
    if (res.ok) fetch("/api/staff-portal/jobs").then((r) => r.json()).then((d) => setJobs(d.listings || []));
  }

  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 22 }}>Available jobs</h1>
      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {jobs.map((job) => (
          <div key={job.id} className="admin-card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 700 }}>{job.jobRole} · {job.eventCity}</div>
            <div style={{ color: "var(--adm-muted)", fontSize: 12, marginTop: 4 }}>
              {job.eventType} · {job.eventDate} · {job.dutyStartTime}–{job.dutyEndTime}
            </div>
            <div style={{ color: "var(--adm-muted)", fontSize: 12, marginTop: 4 }}>
              Pay: ₹{job.paymentMin}–₹{job.paymentMax} · {job.openings} openings
            </div>
            <button className="admin-btn is-primary" style={{ marginTop: 10 }} onClick={() => apply(job.id)}>
              Apply
            </button>
          </div>
        ))}
        {!jobs.length ? <p>No open jobs right now.</p> : null}
      </div>
      {message ? <div className="admin-form-error" role="alert" style={{ marginTop: 12 }}>{message}</div> : null}
    </div>
  );
}
