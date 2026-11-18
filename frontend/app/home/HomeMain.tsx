import styles from "./HomeMain.module.css";
import EventCategoriesSection from "./Event-Categories/EventCategories";
import StaffingServices from "./Staffing/StaffingServices";
import HowItWorks from "./How-It-Works/HowItWorks";
import WhyChooseUs from "./WhyChooseUs/WhyChooseUs";
import CitiesWeServe from "./CitiesWeServe/CitiesWeServe";
import ClientCTA from "./ClientCTA/ClientCTA";
import StaffCTA from "./StaffCTA/StaffCTA";
import FAQ from "./FAQ/FAQ";
import ContactSupport from "./ContactSupport/ContactSupport";

export default function HomeMain() {
  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={styles.headlineBlock}>
            <h1 className={styles.headline}>
              The Right People
              <br />
              <span>for Every Event.</span>
            </h1>
          </header>

          <div className={styles.introGrid}>
            <p className={styles.introText}>
              From grand weddings and exhibitions to concerts, corporate
              events and festivals, Crew Connect helps you find trained
              manpower, hospitality teams, bouncers, technical supervisors
              and professional event staff.
            </p>

            <div className={styles.ctaGroup}>
              <a className={styles.ctaSolid} href="/hire-manpower">
                HIRE MANPOWER <span aria-hidden="true">→</span>
              </a>

              <a className={styles.ctaGhost} href="/join-as-staff">
                JOIN AS STAFF <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className={styles.visualWrap}>
            <div className={styles.visualMain}>
              <div className={styles.visualMainImage} aria-hidden="true" />
              <div className={styles.visualMainOverlay} />
              <div className={styles.visualMainGradient} />

              <div className={styles.visualMainInfo}>
                <div className={styles.visualMainInfoText}>
                  <span className={styles.visualMainLabel}>DISPATCH // LIVE ARCHIVES</span>
                  <span className={styles.visualMainTitle}>AHMEDABAD CULTURAL FORUM</span>
                </div>

                <span className={styles.visualMainSub}>
                  STAGE OPS &amp; LUXURY CONCIERGE
                </span>
              </div>
            </div>

            <aside className={styles.visualSide}>
              <div className={styles.sideImage}>
                <div className={styles.sideImageTag}>
                  <span>VIP HOSPITALITY</span>
                </div>
              </div>

              <div className={styles.sideCard}>
                <div className={styles.sideCardHeader}>
                  <span className={styles.sideCardLabel}>ACTIVE DEPLOYMENTS</span>
                  <span className={styles.sideCardDot} aria-hidden="true" />
                </div>

                <div className={styles.sideCardStat}>
                  <span className={styles.sideCardNumber}>142</span>
                  <span className={styles.sideCardUnit}>CREWS TODAY</span>
                </div>

                <p className={styles.sideCardText}>
                  Direct-vetted front-of-house stewards and stage technicians assigned to ongoing sessions.
                </p>

                <a className={styles.sideCardFooter} href="/event-categories">
                  <span>EXPLORE EVENTS</span>
                  <span className={styles.sideCardArrow} aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <EventCategoriesSection />
      <StaffingServices />
      <HowItWorks />
      <WhyChooseUs />
      <CitiesWeServe />
      <ClientCTA />
      <StaffCTA />
      <FAQ />
      <ContactSupport />
    </>
  );
}
