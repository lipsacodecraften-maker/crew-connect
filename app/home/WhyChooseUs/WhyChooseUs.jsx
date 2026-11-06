
import styles from "./WhyChooseUs.module.css";
import {
  ShieldCheck,
  Users,
  MapPin,
  ClipboardCheck,
  Clock3,
  Headset,
} from "lucide-react";

const advantages = [
  {
    number: "01",
    icon: ShieldCheck,
    title: "VERIFIED & TRUSTED STAFF",
    description:
      "Our staff verification process helps ensure dependable, professional people for your event requirements.",
  },
  {
    number: "02",
    icon: Users,
    title: "THE RIGHT PEOPLE FOR EVERY ROLE",
    description:
      "From hospitality and guest management to security and production support, find the right team for every requirement.",
  },
  {
    number: "03",
    icon: MapPin,
    title: "GUJARAT-WIDE COVERAGE",
    description:
      "Access event staffing support across Ahmedabad, Gandhinagar, Vadodara, Surat, and other locations in Gujarat.",
  },
  {
    number: "04",
    icon: ClipboardCheck,
    title: "ORGANIZED STAFF MANAGEMENT",
    description:
      "Structured role allocation, shift planning, reporting instructions, and coordinated crew deployment.",
  },
  {
    number: "05",
    icon: Clock3,
    title: "ON-TIME DEPLOYMENT",
    description:
      "Planned reporting schedules and coordinated communication help your event team stay on track.",
  },
  {
    number: "06",
    icon: Headset,
    title: "DEDICATED EVENT SUPPORT",
    description:
      "Get coordination support throughout the staffing process, from initial planning to event-day execution.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div className={styles.headingContent}>
            {/* <span className={styles.eyebrow}>
              THE CREWCONNECT ADVANTAGE
            </span> */}

            <h2 className={styles.heading}>
              WHY <span>CREWCONNECT?</span>
            </h2>
          </div>

          {/* <p className={styles.intro}>
            From weddings and corporate events to exhibitions and concerts,
            we bring dependable people, organized coordination, and
            professional staffing support to events across Gujarat.
          </p> */}
        </div>

        <div className={styles.content}>
          <div className={styles.sideInfo}>
            {/* <span className={styles.sideLabel}>WHY CREWCONNECT?</span> */}

            <h3>
              MORE THAN
              <br />
              JUST <span>STAFFING.</span>
            </h3>

            <p>
              We connect event organizers with people, planning, and
              operational support to help every event run smoothly.
            </p>

            <a href="/contact" className={styles.cta}>
              HIRE PROFESSIONAL STAFF
              <span>↗</span>
            </a>
          </div>

          <div className={styles.grid}>
            {advantages.map((item) => {
              const Icon = item.icon;

              return (
                <article className={styles.card} key={item.number}>
                  <div className={styles.cardTop}>
                    <span className={styles.number}>{item.number}</span>
                    <Icon className={styles.icon} size={23} />
                  </div>

                  <h4>{item.title}</h4>

                  <p>{item.description}</p>

                  <div className={styles.cardLine} />
                </article>
              );
            })}
          </div>
        </div>

        {/* <div className={styles.bottomBar}>
          <span>CREWCONNECT // EVENT STAFFING NETWORK</span>
          <span>BUILT FOR EVENTS. READY FOR ACTION.</span>
        </div> */}

      </div>
    </section>
  );
}
