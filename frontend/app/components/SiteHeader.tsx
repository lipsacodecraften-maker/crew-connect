"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FiMapPin } from "react-icons/fi";
import styles from "./SiteHeader.module.css";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Our Services", href: "/services" },
  { label: "Event Categories", href: "/event-categories" },
  { label: "Hire Manpower", href: "/hire-manpower" },
  { label: "Join as Staff", href: "/join-as-staff" },
  // { label: "Available Jobs", href: "/available-jobs" },
  { label: "Contact Us", href: "/contact-us" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.mainbar}>
        <div className={styles.mainbarInner}>
          <Link className={styles.brand} href="/" aria-label="CrewConnect Home">
            <Image
              src="/logo-1.png"
              alt="CrewConnect"
              width={150}
              height={45}
              priority
              unoptimized
              key="/logo.png"
              className={styles.logo}
            />

            <span className={styles.brandLocation}>
              <FiMapPin className={styles.locationIcon} />
              PAN INDIA
            </span>
          </Link>

          <nav className={styles.nav} aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={styles.navLabel}>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls="primary-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.menuIcon} aria-hidden="true">
              <span />
              <span />
            </span>
            Menu
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="primary-menu" aria-label="Site menu" className={styles.menu}>
          <div className={styles.menuTop}>
            <div className={styles.menuTopRight}>
              <button
                ref={closeButtonRef}
                type="button"
                className={styles.closeButton}
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                Close
                <span className={styles.closeIcon} aria-hidden="true">
                  ✕
                </span>
              </button>
            </div>
          </div>

          <nav className={styles.menuNav} aria-label="Mobile">
            {NAV_LINKS.map((link, index) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`${styles.menuLink} ${isActive ? styles.navLinkActive : ""}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className={styles.menuLinkMain}>
                    <span className={styles.menuLinkIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className={styles.menuLinkLabel}>{link.label}</span>
                  </span>

                  <span className={styles.menuLinkArrow} aria-hidden="true">
                    ↗
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className={styles.menuBottom}>
            <div className={styles.menuActions}>
              <Link
                className={styles.menuButtonSolid}
                href="/hire-manpower"
                onClick={() => setMenuOpen(false)}
              >
                Hire staff
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                className={styles.menuButtonOutline}
                href="/join-as-staff"
                onClick={() => setMenuOpen(false)}
              >
                Join the crew
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
