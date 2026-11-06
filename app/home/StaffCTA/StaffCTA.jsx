
import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Users,
} from "lucide-react";
import styles from "./StaffCTA.module.css";

const opportunities = [
  "WEDDINGS & CELEBRATIONS",
  "CORPORATE EVENTS",
  "EXHIBITIONS & CONFERENCES",
  "CONCERTS & LIVE EVENTS",
];

export default function StaffCTA() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.panel}>
          <div className={styles.leftContent}>
            <span className={styles.eyebrow}>
              JOIN THE CREWCONNECT NETWORK
            </span>

            <h2>
              YOUR NEXT
              <br />
              OPPORTUNITY
              <br />
              STARTS <span>HERE.</span>
            </h2>

            <p className={styles.description}>
              Ready to be part of exciting events? Register with CrewConnect
              and explore staffing opportunities across weddings, corporate
              events, exhibitions, and live experiences.
            </p>

            <Link href="/hire-staff" className={styles.registerButton}>
              JOIN OUR CREW
              <ArrowUpRight size={20} />
            </Link>

            <span className={styles.note}>
              REGISTER YOUR PROFILE. EXPLORE EVENT OPPORTUNITIES.
            </span>
          </div>

          <div className={styles.rightContent}>
            <div className={styles.visualTop}>
              <div className={styles.visualIcon}>
                <Users size={30} />
              </div>
              <span>CREWCONNECT // STAFF NETWORK</span>
            </div>

            <div className={styles.visualMain}>
              <span className={styles.visualEyebrow}>
                BE PART OF THE EXPERIENCE
              </span>

              <h3>
                SHOW UP.
                <br />
                <span>STAND OUT.</span>
                <br />
                MAKE IT HAPPEN.
              </h3>

              <div className={styles.opportunityList}>
                {opportunities.map((item) => (
                  <div className={styles.opportunity} key={item}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.visualBottom}>
              <span>
                <BriefcaseBusiness size={15} />
                EVENT STAFF OPPORTUNITIES
              </span>
              <span>GUJARAT, INDIA</span>
            </div>
          </div>

          <div className={styles.bottomLine}>
            <span>YOUR SKILLS. YOUR OPPORTUNITY. YOUR CREW.</span>
            <span>TAKE THE FIRST STEP <ArrowUpRight size={14} /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
