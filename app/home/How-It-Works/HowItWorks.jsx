
"use client";

import { useState } from "react";
import styles from "./HowItWorks.module.css";

const organizerSteps = [
  {
    phase: "STEP 01",
    title: "TELL US ABOUT YOUR EVENT",
    description:
      "Share your event date, location, venue, event type, and expected number of guests.",
    footer: "EVENT REQUIREMENTS",
  },
  {
    phase: "STEP 02",
    title: "CHOOSE YOUR STAFF",
    description:
      "Select the staff roles and quantities you need, including hospitality, guest management, security, and event support.",
    footer: "STAFFING SELECTION",
  },
  {
    phase: "STEP 03",
    title: "GET YOUR STAFFING PLAN",
    description:
      "Receive a customized proposal with team details, availability, schedules, and pricing for your event.",
    footer: "PLAN & CONFIRMATION",
  },
  {
    phase: "STEP 04",
    title: "WE DEPLOY THE CREW",
    description:
      "Our team coordinates staff deployment, venue reporting, and on-site support to help your event run smoothly.",
    footer: "EVENT EXECUTION",
  },
];

const applicantSteps = [
  {
    phase: "STEP 01",
    title: "REGISTER WITH US",
    description:
      "Submit your profile with contact details, city, experience, and preferred event staffing roles.",
    footer: "PROFILE REGISTRATION",
  },
  {
    phase: "STEP 02",
    title: "GET YOUR PROFILE VERIFIED",
    description:
      "Our team reviews your information, experience, identification, and relevant credentials.",
    footer: "PROFILE VERIFICATION",
  },
  {
    phase: "STEP 03",
    title: "EXPLORE JOB OPPORTUNITIES",
    description:
      "Get matched with suitable event assignments based on your skills, location, and availability.",
    footer: "OPPORTUNITY MATCHING",
  },
  {
    phase: "STEP 04",
    title: "START YOUR ASSIGNMENT",
    description:
      "Confirm your assignment and receive shift timings, venue details, and reporting instructions.",
    footer: "READY FOR DEPLOYMENT",
  },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState("organizer");

  const steps =
    activeTab === "organizer"
      ? organizerSteps
      : applicantSteps;

  return (
    <section className={styles.workflowSection} id="workflow">
      <div className={styles.workflowContainer}>

        {/* Section Header */}
        <header className={styles.workflowHeader}>
          <div className={styles.workflowHeading}>
            <p className={styles.workflowEyebrow}>
              <span className={styles.dot}></span>
              HOW IT WORKS
            </p>

            <h2>
              SIMPLE PROCESS.
              <br />
              <span>SEAMLESS EXECUTION.</span>
            </h2>

            <p className={styles.workflowIntro}>
              From finding the right crew to joining our staffing
              network, CrewConnect makes every step simple,
              organized, and reliable.
            </p>
          </div>

          {/* Tabs */}
          <div
            className={styles.workflowTabs}
            role="tablist"
            aria-label="Choose your process"
          >
            <button
              type="button"
              role="tab"
              id="organizer-tab"
              aria-selected={activeTab === "organizer"}
              aria-controls="workflow-panel"
              className={`${styles.workflowTab} ${
                activeTab === "organizer" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("organizer")}
            >
              HIRE STAFF
            </button>

            <button
              type="button"
              role="tab"
              id="applicant-tab"
              aria-selected={activeTab === "applicant"}
              aria-controls="workflow-panel"
              className={`${styles.workflowTab} ${
                activeTab === "applicant" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("applicant")}
            >
              JOIN OUR TEAM
            </button>
          </div>
        </header>

        {/* Workflow Cards */}
        <div
          className={styles.workflowGrid}
          id="workflow-panel"
          role="tabpanel"
          aria-labelledby={
            activeTab === "organizer"
              ? "organizer-tab"
              : "applicant-tab"
          }
        >
          {steps.map((step, index) => (
            <article
              className={styles.workflowCard}
              key={`${activeTab}-${step.phase}`}
            >
              <div className={styles.workflowCardContent}>
                <div className={styles.workflowCardTop}>
                  <span className={styles.workflowPhase}>
                    {step.phase}
                  </span>

                  <span className={styles.workflowNumber}>
                    0{index + 1}
                  </span>
                </div>

                <h3>{step.title}</h3>

                <p className={styles.workflowDescription}>
                  {step.description}
                </p>
              </div>

              <div className={styles.workflowCardFooter}>
                <span>{step.footer}</span>
                <span className={styles.workflowArrow}>↗</span>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={styles.workflowBottom}>
          <p>
            {activeTab === "organizer"
              ? "PLANNING AN EVENT? LET'S BUILD YOUR TEAM."
              : "READY TO WORK WITH US? TAKE THE FIRST STEP."}
          </p>

          <a
            href={
              activeTab === "organizer"
                ? "/contact"
                : "/hire-staff"
            }
            className={styles.workflowCta}
          >
            {activeTab === "organizer"
              ? "REQUEST STAFF"
              : "REGISTER NOW"}
            <span>↗</span>
          </a>
        </div>

      </div>
    </section>
  );
}
