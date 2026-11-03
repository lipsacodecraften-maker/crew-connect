import styles from "./OperationalPathways.module.css";

const ORGANIZER_TAGS = [
  "Hospitality",
  "Guest Desk",
  "Stage Ops",
  "VIP Hosts",
];

const CREW_TAGS = [
  "Flexible Shifts",
  "Prompt Payouts",
  "Professional Vetting",
];

export default function OperationalPathways() {
  return (
    <section
      id="pathways"
      className={styles.section}
      aria-labelledby="pathways-title"
    >
      <div className={styles.container}>
        <div className={styles.topRow}>
          <p className={styles.eyebrow}>02 // Operational Pathways</p>
          <p id="pathways-title" className={styles.topNote}>
            Choose your portal
          </p>
        </div>

        <div className={styles.panels}>
          <article className={`${styles.panel} ${styles.panelDark}`}>
            <div className={styles.panelBody}>
              <div className={styles.panelHeader}>
                <span className={styles.badge}>
                  01 / For Event Organizers
                </span>
                <span className={styles.icon} aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 18"
                    fill="none"
                  >
                    <path
                      d="M0 18V0H10V4H20V18H0V18M2 16H4V14H2V16V16M2 12H4V10H2V12V12M2 8H4V6H2V8V8M2 4H4V2H2V4V4M6 16H8V14H6V16V16M6 12H8V10H6V12V12M6 8H8V6H6V8V8M6 4H8V2H6V4V4M10 16H18V6H10V8H12V10H10V12H12V14H10V16V16M14 10V8H16V10H14V10M14 14V12H16V14H14V14"
                      fill="#C4C7C7"
                    />
                  </svg>
                </span>
              </div>

              <h3 className={styles.heading}>
                You have the vision. 
                <br/>We help build the team.
              </h3>

              <p className={styles.copy}>
                Tell us about your event, your staffing needs, and your
                location. We will review your requirements and help you explore
                the right staffing solution with credentialed regional teams.
              </p>

              <div className={styles.tagsBlock}>
                <p className={styles.tagsLabel}>Verified squad capabilities</p>
                <ul className={styles.tags}>
                  {ORGANIZER_TAGS.map((tag) => (
                    <li key={tag} className={styles.tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a className={`${styles.cta} ${styles.ctaDark}`} href="/hire-staff">
              Hire event staff
              <span aria-hidden="true">↗</span>
            </a>
          </article>

          <article className={`${styles.panel} ${styles.panelLight}`}>
            <div className={styles.panelBody}>
              <div className={styles.panelHeader}>
                <span className={styles.badge}>02 / For Talent &amp; Crew</span>
                <span className={styles.icon} aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <path
                      d="M2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V7C0 6.45 0.195833 5.97917 0.5875 5.5875C0.979167 5.19583 1.45 5 2 5H7V2C7 1.45 7.19583 0.979167 7.5875 0.5875C7.97917 0.195833 8.45 0 9 0H11C11.55 0 12.0208 0.195833 12.4125 0.5875C12.8042 0.979167 13 1.45 13 2V5H18C18.55 5 19.0208 5.19583 19.4125 5.5875C19.8042 5.97917 20 6.45 20 7V18C20 18.55 19.8042 19.0208 19.4125 19.4125C19.0208 19.8042 18.55 20 18 20H2V20M2 18H18V7H13C13 8.1 12.1 9 11 9H9C7.9 9 7 8.1 7 7H2V18M4 16H10V15.55C10 15.2667 9.92083 15.0042 9.7625 14.7625C9.60417 14.5208 9.38333 14.3333 9.1 14.2C8.76667 14.05 8.42917 13.9375 8.0875 13.8625C7.74583 13.7875 7.38333 13.75 7 13.75C6.61667 13.75 6.25417 13.7875 5.9125 13.8625C5.57083 13.9375 5.23333 14.05 4.9 14.2C4.61667 14.3333 4.39583 14.5208 4.2375 14.7625C4.07917 15.0042 4 15.2667 4 15.55V16M12 14.5H16V13H12V14.5M7 13C7.41667 13 7.77083 12.8542 8.0625 12.5625C8.35417 12.2708 8.5 11.9167 8.5 11.5C8.5 11.0833 8.35417 10.7292 8.0625 10.4375C7.77083 10.1458 7.41667 10 7 10C6.58333 10 6.22917 10.1458 5.9375 10.4375C5.64583 10.7292 5.5 11.0833 5.5 11.5C5.5 11.9167 5.64583 12.2708 5.9375 12.5625C6.22917 12.8542 6.58333 13 7 13M12 11.5H16V10H12V11.5M9 7H11V2H9V7"
                      fill="#505050"
                    />
                  </svg>
                </span>
              </div>

              <h3 className={styles.heading}>Your next event <br/> starts here.</h3>

              <p className={styles.copy}>
                Create your crew profile, share your skills and availability,
                and get considered for suitable event opportunities across
                Ahmedabad, Vadodara, Gandhinagar, and Surat.
              </p>

              <div className={styles.tagsBlock}>
                <p className={styles.tagsLabel}>Operational advantages</p>
                <ul className={styles.tags}>
                  {CREW_TAGS.map((tag) => (
                    <li key={tag} className={styles.tag}>
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <a className={`${styles.cta} ${styles.ctaLight}`} href="/join-crew">
              Join the crew roster
              <span aria-hidden="true">↗</span>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
