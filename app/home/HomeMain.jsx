import styles from "./HomeMain.module.css";

export default function HomeMain() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.taglineRow}>
          <div className={styles.taglineGroup}>
            <span className={styles.dot} aria-hidden="true" />
            <p className={styles.taglineText}>
              EVENT STAFFING / GUJARAT, INDIA — AHMEDABAD · GANDHINAGAR · VADODARA · SURAT
            </p>
          </div>
          <div className={styles.taglineChip}>
            <span>VOL. 25 // DIRECT-DISPATCH DESK</span>
          </div>
        </div>

        <header className={styles.headlineBlock}>
          <h1 className={styles.headline}>
            Big moments.
            <br />
            The right people.
          </h1>
        </header>

        <div className={styles.introGrid}>
          <p className={styles.introText}>
            From weddings and celebrations to corporate events and live productions, we
            help connect event organizers with the people who bring every detail to life
            across Gujarat’s premiere venues.
          </p>
          <div className={styles.ctaGroup}>
            <a className={styles.ctaGhost} href="/hire-staff">
              HIRE EVENT STAFF <span aria-hidden="true">→</span>
            </a>
            <a className={styles.ctaSolid} href="/join-crew">
              JOIN THE CREW <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

               <div className={styles.visualWrap}>
          {/* Main hero image */}
          <div className={styles.visualMain}>
            <div className={styles.visualMainImage} aria-hidden="true" />
            <div className={styles.visualMainOverlay} />
            <div className={styles.visualMainGradient} />

            <div className={styles.visualMainInfo}>
              <div className={styles.visualMainInfoText}>
                <span className={styles.visualMainLabel}>
                  DISPATCH // LIVE ARCHIVES
                </span>
                <span className={styles.visualMainTitle}>
                  AHMEDABAD CULTURAL FORUM
                </span>
              </div>

              <span className={styles.visualMainSub}>
                STAGE OPS &amp; LUXURY CONCIERGE
              </span>
            </div>
          </div>

          <aside className={styles.visualSide}>
            {/* Side image */}
            <div className={styles.sideImage}>
              <div className={styles.sideImageTag}>
                <span>VIP HOSPITALITY</span>
              </div>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}>
                <span className={styles.sideCardLabel}>
                  ACTIVE DEPLOYMENTS
                </span>
                <span className={styles.sideCardDot} aria-hidden="true" />
              </div>

              <div className={styles.sideCardStat}>
                <span className={styles.sideCardNumber}>142</span>
                <span className={styles.sideCardUnit}>CREWS TODAY</span>
              </div>

              <p className={styles.sideCardText}>
                Direct-vetted front-of-house stewards and stage technicians
                assigned to ongoing sessions.
              </p>

              <div className={styles.sideCardFooter}>
                <span>EXPLORE CITIES</span>
                <span className={styles.sideCardArrow} aria-hidden="true" />
              </div>
            </div>
          </aside>
        </div>

        <div className={styles.scrollRow}>
          <div className={styles.scrollGroup}>
            <span className={styles.scrollIcon} aria-hidden="true" />
            <span className={styles.scrollText}>SCROLL FOR SYSTEM BLUEPRINT</span>
          </div>
          <div className={styles.scrollBar}>
            <div className={styles.scrollBarFill} />
          </div>
        </div>
      </div>
    </section>
  );
}
