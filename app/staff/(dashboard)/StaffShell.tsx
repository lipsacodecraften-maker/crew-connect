"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu } from "react-icons/fi";

export default function StaffShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/staff", label: "Dashboard" },
    { href: "/staff/profile", label: "Profile" },
    { href: "/staff/jobs", label: "Jobs" },
    { href: "/staff/applications", label: "Applications" },
    { href: "/staff/assignments", label: "Assignments" },
    { href: "/staff/work-history", label: "Work history" },
  ];

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <div className="admin-brand">
          <span className="admin-brand-mark">CC</span>
          <span>
            <strong>CrewConnect staff</strong>
            <small className="admin-subtle admin-small">{name}</small>
          </span>
        </div>
        <nav className="admin-nav" aria-label="Staff sections">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="admin-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/staff/auth/logout" method="post" style={{ marginTop: "auto" }}>
          <button type="submit" className="admin-btn is-ghost" style={{ width: "100%" }}>
            Sign out
          </button>
        </form>
      </aside>

      <div className="admin-content-wrap">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-btn is-ghost admin-mobile-nav"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open navigation"
          >
            <FiMenu aria-hidden="true" />
          </button>
          <strong style={{ marginLeft: 8 }}>Staff dashboard</strong>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
