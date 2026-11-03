import styles from "./SiteFooter.module.css";

const FOOTER_COLUMNS = [
  {
    index: "01",
    title: "Organizers",
    links: [
      { label: "Book Roster", href: "#hire" },
      { label: "VIP & Hospitality", href: "#services" },
      { label: "Technical Production", href: "#services" },
      { label: "Multi-Day Festivals", href: "#events" },
      { label: "Enterprise SLA", href: "#hire" },
    ],
  },
  {
    index: "02",
    title: "Crew Talent",
    links: [
      { label: "Open Shifts", href: "/join-crew" },
      { label: "Verification Track", href: "/join-crew" },
      { label: "Payout Timelines", href: "/join-crew" },
      { label: "Crew Handbook", href: "/join-crew" },
      { label: "Uniform Standards", href: "/join-crew" },
    ],
  },
  {
    index: "03",
    title: "Company",
    links: [
      { label: "Market Manifesto", href: "#home" },
      { label: "Curated Folio", href: "#events" },
      { label: "Editorial Desk", href: "#blogs" },
      { label: "Press Dispatches", href: "#blogs" },
      { label: "Careers", href: "/join-crew" },
    ],
  },
  {
    index: "04",
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#home" },
      { label: "Terms of Service", href: "#home" },
      { label: "Safety Protocols", href: "#home" },
      { label: "Licensing Regs", href: "#home" },
    ],
  },
];

const REGIONAL_HUBS = [
  { code: "AMD", name: "Ahmedabad" },
  { code: "GNR", name: "Gandhinagar" },
  { code: "BRC", name: "Vadodara" },
  { code: "ST", name: "Surat" },
];

export default function SiteFooter() {
  // const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <p className={styles.eyebrow}>
              00 // Marketplace operational broadsheet
            </p>

            <h2 className={styles.heading}>
              One connection. The people behind unforgettable events.
            </h2>

            <p className={styles.blurb}>
              Direct-dispatch staging, luxury hospitality, technical crews, and
              credentialed event logistics across prime convention and cultural
              centers of Gujarat.
            </p>
          </div>

          <nav className={styles.columns} aria-label="Footer">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className={styles.column}>
                <h3 className={styles.columnTitle}>
                  <span className={styles.columnIndex}>{column.index}</span>
                  <span aria-hidden="true">//</span>
                  <span>{column.title}</span>
                </h3>

                <ul className={styles.columnLinks}>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a className={styles.columnLink} href={link.href}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className={styles.hubs}>
          <p className={styles.hubsLabel}>
            Operational regional hubs // Gujarat
          </p>

          <ul className={styles.hubList}>
            {REGIONAL_HUBS.map((hub) => (
              <li key={hub.code}>
                <a className={styles.hub} href="#home">
                  <span className={styles.hubCode}>{hub.code}</span>
                  <span aria-hidden="true">//</span>
                  <span>{hub.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.directive}>
          <p>
            Compliance &amp; licensing directive: All hospitality stewards,
            logistics crew, and security personnel coordinated via Crew Connect
            adhere to statutory labor codes, police verifications, and event
            safety protocols mandated by the Government of Gujarat and municipal
            event jurisdictions.
          </p>
        </div>

        <div className={styles.bottom}>
          <p>
            © 2025 Crew Connect Marketplace Private Limited. All rights
            reserved.
          </p>
          <p className={styles.bottomNote}>
            Designed for Gujarat commerce &amp; culture
          </p>
        </div>
      </div>
    </footer>
  );
}
