
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./SiteHeader.module.css";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Events", href: "/events" },
  { label: "Blogs", href: "/blogs" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeButtonRef = useRef(null);
  const headerRef = useRef(null);

  // Close the mobile menu using Escape or an outside click.
  useEffect(() => {
    if (!menuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    const handlePointerDown = (event) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target)
      ) {
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
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [menuOpen]);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.mainbar}>
        <div className={styles.mainbarInner}>
          {/* Brand / Home link */}
          <Link
            className={styles.brand}
            href="/"
            aria-label="Crew Connect, home"
          >
            <span className={styles.brandCopy}>
              <span className={styles.brandName}>
                Crew Connect
              </span>

              <span className={styles.brandLocation}>
                Gujarat, IN
              </span>
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className={styles.nav} aria-label="Primary">
            {NAV_LINKS.map((link, index) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`${styles.navLink} ${
                    isActive ? styles.navLinkActive : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* <span className={styles.navIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span> */}

                  <span className={styles.navLabel}>
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop action buttons */}
          <div className={styles.actions}>
            <Link
              className={`${styles.button} ${styles.buttonSolid}`}
              href="/hire-staff"
            >
              Hire staff
              <span
                className={styles.buttonArrow}
                aria-hidden="true"
              >
                →
              </span>
            </Link>

            <Link
              className={`${styles.button} ${styles.buttonOutline}`}
              href="/join-crew"
            >
              Join the crew
              <span
                className={styles.buttonArrow}
                aria-hidden="true"
              >
                ↗
              </span>
            </Link>
          </div>

          {/* Mobile menu toggle */}
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

      {/* Mobile navigation menu */}
      {menuOpen && (
        <div
          id="primary-menu"
          aria-label="Site menu"
          className={styles.menu}
        >
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

                <span
                  className={styles.closeIcon}
                  aria-hidden="true"
                >
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
                  className={`${styles.menuLink} ${
                    isActive ? styles.navLinkActive : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className={styles.menuLinkMain}>
                    <span className={styles.menuLinkIndex}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className={styles.menuLinkLabel}>
                      {link.label}
                    </span>
                  </span>

                  <span
                    className={styles.menuLinkArrow}
                    aria-hidden="true"
                  >
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
                href="/hire-staff"
                onClick={() => setMenuOpen(false)}
              >
                Hire staff
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                className={styles.menuButtonOutline}
                href="/join-crew"
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
