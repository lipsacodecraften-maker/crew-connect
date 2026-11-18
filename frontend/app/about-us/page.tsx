"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiUsers, FiShield, FiClock, FiTrendingUp, FiMapPin } from "react-icons/fi";
import styles from "./AboutUs.module.css";

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const match = value.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  const numeric = match ? parseFloat(match[1].replace(/,/g, "")) : 0;
  const suffix = match ? match[2] : "";
  const decimals = match && match[1].includes(".") ? match[1].split(".")[1].length : 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1400;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(numeric * eased);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [numeric]);

  const display =
    decimals > 0
      ? count.toFixed(decimals)
      : Math.round(count).toLocaleString();

  return (
    <div className={styles.statCard}>
      <span className={styles.statValue}>
        {display}
        {suffix}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export default function AboutUs() {
  const stats = [
    { label: "Cities Covered", value: "4+" },
    { label: "Vetted Crew Members", value: "1,500+" },
    { label: "Events Managed", value: "250+" },
    { label: "On-Time Rate", value: "99.8%" },
  ];

  const features = [
    {
      icon: <FiShield className={styles.cardIcon} />,
      title: "Vetted & Verified Profiles",
      desc: "Every crew member undergoes background checks and skill assessments before deployment.",
    },
    {
      icon: <FiUsers className={styles.cardIcon} />,
      title: "Trained Event Staff",
      desc: "From VIP concierges to stage technicians, our teams are prepped specifically for high-stakes events.",
    },
    {
      icon: <FiClock className={styles.cardIcon} />,
      title: "Punctual Deployment",
      desc: "Guaranteed on-time arrival with real-time attendance tracking and shift management.",
    },
    {
      icon: <FiTrendingUp className={styles.cardIcon} />,
      title: "Transparent Payouts",
      desc: "Fair compensation model for crew members and transparent pricing structures for organizers.",
    },
  ];

  return (
    <main id="main" className={styles.container}>
      <section className={styles.hero}>
        <div className={styles.badge}>
          <FiMapPin size={14} /> Gujarat’s Trusted Staffing Partner
        </div>
        <h1 className={styles.title}>
          Powering Exceptional Events with <span className={styles.highlight}>Reliable Crew</span>
        </h1>
        <p className={styles.subtitle}>
          Crew Connect deploys vetted, trained manpower across weddings, exhibitions, concerts, corporate events, and festivals — connecting organizers with top-tier hospitality teams, security, and technical staff.
        </p>
      </section>

      <section className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <AnimatedStat key={idx} value={stat.value} label={stat.label} />
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What We Do</h2>
        <p className={styles.sectionDesc}>
          From front-of-house stewards and registration desks to stage technicians and VIP concierge, we match the right crew to your event&apos;s exact scale and requirements with complete operational reliability.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why Choose Us</h2>
        <div className={styles.grid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.iconWrapper}>{feature.icon}</div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.missionBanner}>
        <h2 className={styles.sectionTitle}>Our Mission</h2>
        <p className={styles.missionDesc}>
          Make event staffing effortless for organizers while creating dependable, well-paid work opportunities for skilled crew members across Ahmedabad, Gandhinagar, Surat, and Vadodara.
        </p>
      </section>

      <div className={styles.ctaGroup}>
        <Link href="/hire-manpower" className={styles.primaryBtn}>
          Hire Manpower
        </Link>
        <Link href="/join-as-staff" className={styles.secondaryBtn}>
          Join Our Crew
        </Link>
      </div>
    </main>
  );
}
