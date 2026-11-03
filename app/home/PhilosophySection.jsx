
import styles from "./PhilosophySection.module.css";
import CountUp from "./CountUp";

const METRICS = [
  {
    label: "Vetted ratio",
    value: 98.4,
    suffix: "%",
    decimals: 1,
    note: "Deployment adherence",
  },
  {
    label: "Primary cities",
    value: 4,
    suffix: "",
    decimals: 0,
    note: "AMD / GNR / BDQ / ST",
    pad: 2,
  },
  {
    label: "Dispatch time",
    value: 3,
    prefix: "< ",
    suffix: " HR",
    decimals: 0,
    note: "For urgent contingencies",
  },
  {
    label: "Compliance",
    value: 100,
    suffix: "%",
    decimals: 0,
    note: "Police & ID verified",
  },
];

export default function PhilosophySection() {
  return (
    <section
      id="philosophy"
      className={styles.section}
      aria-labelledby="philosophy-title"
    >
      <div className={styles.container}>
        <div className={styles.aside}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} />
            01 // Philosophy
          </p>

          <h2 id="philosophy-title" className={styles.title}>
            The Gujarat <span>Directive.</span>
          </h2>

          <p className={styles.tagline}>
            Synchronizing local logistical strength with bespoke
            cultural hospitality standards.
          </p>

          <div className={styles.location}>
            <span className={styles.locationDot} />
            GUJARAT, INDIA
          </div>
        </div>

        <div className={styles.content}>
          <blockquote className={styles.quote}>
            “The magic is on stage.
            <br />
            <span>The team makes it happen.</span>
          </blockquote>

          <p className={styles.body}>
            Every seamless event depends on people who know their role,
            care about the details, and work together when it matters.
            From managing 4,000 attendees at Mahatma Mandir,
            Gandhinagar, to hosting intimate family celebrations in
            Vadodara, execution is defined by disciplined human presence.
          </p>

          <dl className={styles.metrics}>
            {METRICS.map((metric, index) => (
              <div
                key={metric.label}
                className={styles.metric}
                style={{ "--metric-index": index }}
              >
                <dt className={styles.metricLabel}>
                  {metric.label}
                </dt>

                <dd className={styles.metricValue}>
                  <CountUp
                    value={metric.value}
                    prefix={metric.prefix || ""}
                    suffix={metric.suffix || ""}
                    decimals={metric.decimals}
                    pad={metric.pad || 0}
                  />
                </dd>

                <dd className={styles.metricNote}>
                  {metric.note}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
