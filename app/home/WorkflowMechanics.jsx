
"use client";

import { useState } from "react";
import "./WorkflowMechanics.css";

const organizerSteps = [
  {
    phase: "PHASE 01",
    title: "SHARE EVENT DETAILS",
    description:
      "Submit event date, city coordinates (Ahmedabad, Gandhinagar, Surat, or Vadodara), venue scope, and overarching guest capacity.",
    footer: "STEP 01 OF 04",
  },
  {
    phase: "PHASE 02",
    title: "DEFINE ROLES & NUMBERS",
    description:
      "Pinpoint precise squad allocations across hospitality stewards, registration hosts, setup teams, or licensed security.",
    footer: "STEP 02 OF 04",
  },
  {
    phase: "PHASE 03",
    title: "REVIEW ARRANGEMENTS",
    description:
      "Receive a structured manifest specifying verified crew tiers, uniform codes, duty schedules, and operational logistics.",
    footer: "STEP 03 OF 04",
  },
  {
    phase: "PHASE 04",
    title: "OPERATIONAL DEPLOYMENT",
    description:
      "On-site crew check-in under designated floor lead supervision with live roll-call reporting directly to your desk.",
    footer: "DIRECT READY",
  },
];

const applicantSteps = [
  {
    phase: "PHASE 01",
    title: "SUBMIT YOUR PROFILE",
    description:
      "Share your contact information, location, relevant experience, and preferred event staffing roles.",
    footer: "STEP 01 OF 04",
  },
  {
    phase: "PHASE 02",
    title: "VERIFY YOUR DETAILS",
    description:
      "Provide the required identification, experience details, and credentials for the relevant staffing role.",
    footer: "STEP 02 OF 04",
  },
  {
    phase: "PHASE 03",
    title: "MATCH WITH OPPORTUNITIES",
    description:
      "Review suitable event assignments based on your skills, availability, location, and operational requirements.",
    footer: "STEP 03 OF 04",
  },
  {
    phase: "PHASE 04",
    title: "CONFIRM YOUR DEPLOYMENT",
    description:
      "Receive assignment details, reporting instructions, shift timings, and the designated on-site contact.",
    footer: "READY FOR REVIEW",
  },
];

export default function WorkflowMechanics() {
  const [activeTab, setActiveTab] = useState("organizer");

  const steps =
    activeTab === "organizer" ? organizerSteps : applicantSteps;

  return (
    <section className="workflow-section" id="workflow">
      <div className="workflow-container">
        <header className="workflow-header">
          <div className="workflow-heading">
            <p className="workflow-eyebrow">
              05 // WORKFLOW MECHANICS
            </p>

            <h2>PRECISION DISPATCH PIPELINE</h2>
          </div>

          <div
            className="workflow-tabs"
            role="tablist"
            aria-label="Workflow type"
          >
            <button
              type="button"
              role="tab"
              id="organizer-tab"
              aria-selected={activeTab === "organizer"}
              aria-controls="workflow-panel"
              className={`workflow-tab ${
                activeTab === "organizer" ? "active" : ""
              }`}
              onClick={() => setActiveTab("organizer")}
            >
              ORGANIZER PROCESS
            </button>

            <button
              type="button"
              role="tab"
              id="applicant-tab"
              aria-selected={activeTab === "applicant"}
              aria-controls="workflow-panel"
              className={`workflow-tab ${
                activeTab === "applicant" ? "active" : ""
              }`}
              onClick={() => setActiveTab("applicant")}
            >
              CREW APPLICANT PROCESS
            </button>
          </div>
        </header>

        <div
          className="workflow-grid"
          id="workflow-panel"
          role="tabpanel"
          aria-labelledby={
            activeTab === "organizer"
              ? "organizer-tab"
              : "applicant-tab"
          }
        >
          {steps.map((step, index) => (
            <article className="workflow-card" key={`${activeTab}-${step.phase}`}>
              <div className="workflow-card-content">
                <span className="workflow-phase">{step.phase}</span>

                <h3>{step.title}</h3>

                <p className="workflow-description">
                  {step.description}
                </p>
              </div>

              <div className="workflow-card-footer">
                <span>{step.footer}</span>
                
              </div>
            </article>
          ))}
        </div>

        <aside className="workflow-notice">
          <svg
            className="workflow-notice-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v5" />
            <path d="M12 7h.01" />
          </svg>

          <p>
            <strong>Operational Transparency:</strong>{" "}
            Staffing availability and assignments are strictly subject
            to operational vetting, credential review, and confirmed
            business bookings across Gujarat partner venues.
          </p>
        </aside>
      </div>
    </section>
  );
}
