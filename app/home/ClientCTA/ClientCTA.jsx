
import Link from "next/link";
import { ArrowUpRight, MoveRight, Users } from "lucide-react";
import styles from "./ClientCTA.module.css";

export default function ClientCTA() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.ctaPanel}>
          <div className={styles.topLine}>
            <span>CLIENT STAFFING REQUEST</span>
            <span className={styles.status}>
              <span className={styles.statusDot} />
              NOW ACCEPTING ENQUIRIES
            </span>
          </div>

          <div className={styles.content}>
            <div className={styles.mainContent}>
              <span className={styles.eyebrow}>
                YOUR EVENT. OUR CREW.
              </span>

              <h2>
                PLANNING AN EVENT?
                <br />
                LET'S BUILD YOUR <span>TEAM.</span>
              </h2>

              <p>
                Tell us what your event needs. From hospitality and guest
                management to security and production support, we'll help
                you find the right people for the right roles.
              </p>

              <Link href="/contact" className={styles.primaryButton}>
                REQUEST EVENT STAFF
                <ArrowUpRight size={20} />
              </Link>

              <span className={styles.note}>
                SHARE YOUR REQUIREMENTS. WE'LL HELP PLAN YOUR CREW.
              </span>
            </div>

            <div className={styles.visual}>
              <div className={styles.visualIcon}>
                <Users size={42} strokeWidth={1.4} />
              </div>

              {/* <span className={styles.visualLabel}>
                CREWCONNECT // DEPLOYMENT
              </span> */}

              <div className={styles.visualHeading}>
                <span>THE RIGHT</span>
                <strong>PEOPLE.</strong>
                <span>THE RIGHT</span>
                <strong>EXECUTION.</strong>
              </div>

              <div className={styles.visualBottom}>
                <span>GUJARAT, INDIA</span>
                <MoveRight size={20} />
              </div>
            </div>
          </div>

          <div className={styles.bottomLine}>
            <span>WEDDINGS / CORPORATE / EXHIBITIONS / LIVE EVENTS</span>
            <span>LET'S MAKE IT HAPPEN <ArrowUpRight size={14} /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
