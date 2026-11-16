"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiActivity,
  FiBriefcase,
  FiClipboard,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiShield,
  FiTarget,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import type { AdminSessionUser } from "@/lib/admin/auth";
import type { AdminPermission } from "@/lib/admin/constants";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  permission?: AdminPermission;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

function initials(name: string) {
  return String(name || "CC")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminShell({
  session,
  counts,
  children,
}: {
  session: AdminSessionUser;
  counts: {
    pendingStaff: number;
    upcomingEvents: number;
    openApplications: number;
    openJobs: number;
  };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const permissions = new Set(session.permissions);

  const groups: NavGroup[] = [
    {
      label: "Operations",
      items: [
        {
          href: "/admin",
          label: "Overview",
          icon: <FiGrid />,
        },
        {
          href: "/admin/bookings",
          label: "Client requests",
          icon: <FiClipboard />,
          badge: counts.upcomingEvents,
        },
        {
          href: "/admin/matching",
          label: "Staff matching",
          icon: <FiTarget />,
        },
      ],
    },
    {
      label: "People & work",
      items: [
        {
          href: "/admin/staff",
          label: "Manage staff",
          icon: <FiUsers />,
          badge: counts.pendingStaff,
        },
        {
          href: "/admin/jobs",
          label: "Job board",
          icon: <FiBriefcase />,
          badge: counts.openApplications,
        },
      ],
    },
    {
      label: "Administration",
      items: [
        ...(permissions.has("team.manage")
          ? [
              {
                href: "/admin/team",
                label: "Admin team",
                icon: <FiShield />,
              },
            ]
          : []),
        {
          href: "/admin/account",
          label: "My account",
          icon: <FiUser />,
        },
      ],
    },
  ];

  const flat = groups.flatMap((group) => group.items);
  const current =
    [...flat]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) =>
        item.href === "/admin"
          ? pathname === "/admin"
          : pathname === item.href || pathname.startsWith(`${item.href}/`),
      ) || flat[0];

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || permissions.has(item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  };

  return (
    <div className="admin-shell">
      {open ? (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside className={`admin-sidebar ${open ? "is-open" : ""}`}>
        <Link href="/admin" className="admin-brand">
          <span className="admin-brand-mark">CC</span>
          <span>
            <strong>CrewConnect</strong>
            <small>Operations desk</small>
          </span>
        </Link>

        <nav className="admin-nav" aria-label="Admin sections">
          {visibleGroups.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <span className="admin-nav-label">{group.label}</span>
              {group.items.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-link ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="admin-nav-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="admin-nav-badge">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <div className="admin-user">
            <span className="admin-user-avatar">{initials(session.name)}</span>
            <span className="admin-user-meta">
              <strong>{session.name}</strong>
              <small>{session.roleLabel}</small>
            </span>
          </div>
          <button
            type="button"
            className="admin-signout"
            onClick={signOut}
            disabled={signingOut}
          >
            <FiLogOut aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-menu-button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <FiX /> : <FiMenu />}
          </button>

          <div className="admin-topbar-title">
            <strong>{current?.label || "Operations"}</strong>
            <span>
              {session.roleLabel} · secure session
            </span>
          </div>

          <div className="admin-topbar-right">
            <span className="admin-topbar-chip">
              <i aria-hidden="true" />
              Live database
            </span>
            <Link href="/admin/account" className="admin-topbar-chip">
              <FiActivity aria-hidden="true" />
              {session.email}
            </Link>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
