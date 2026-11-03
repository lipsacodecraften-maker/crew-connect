"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useSectionMotion from "../components/useSectionMotion";
import './services.css';
import MetricsCounter from "./components/MetricsCounter";

const services = [
  {
    id: "hospitality",
    number: "01",
    category: "HOSPITALITY",
    unit: "UNIT 01 // FRONT-LINE EXCELLENCE",
    location: "AMD // BRC",
    title: "HOSPITALITY & SERVING STAFF",
    description:
      "Poised, disciplined, and silver-service trained stewards capable of seamlessly integrating into high-end celebrations and diplomatic banquets without operational friction.",
    deployment:
      "Luxury weddings in Ahmedabad, corporate galas, and VIP private dining retreats in Vadodara.",
    image: "/images/services/hospital.jpg",

    alt: "Hospitality staff serving guests at a formal event",
    caption: "CREW UNIFORM: MANDATORY PROTOCOL 01 (ALL BLACK)",
    verification: "VERIFIED SERVICE LEVEL 5",
    leftTitle: "01 / CAPABILITY SCOPE",
    rightTitle: "02 / CORE METRICS",
    left: [
      "Formal banquet plate synchronization",
      "VIP head-table sommelier assistance",
      "Continuous dining table refreshment",
      "Cocktail lounge order pacing",
    ],
    right: [
      "1:8 VIP steward-to-guest ratio capacity",
      "Multilingual: Gujarati, Hindi, English",
      "100% pre-briefed on menu allergens",
      "Strict zero-break dining continuity",
    ],
  },
  {
    id: "guest-management",
    number: "02",
    category: "GUEST MGMT",
    unit: "UNIT 02 // ACCESS ORCHESTRATION",
    location: "GNR // AMD",
    title: "GUEST MANAGEMENT & REGISTRATION DESK",
    description:
      "The initial visual and operational contact point for your attendees. Our desk personnel eliminate lobby bottlenecks and deliver effortless credential verification.",
    deployment:
      "Tech summits in Gandhinagar, medical and trade congresses, and 2,000+ attendee reception lobbies.",
    image: "/images/services/guest.jpg",
    alt: "Event registration staff checking in attendees",
    caption: "TECH STACK COMPLIANT // RFID / QR / ON-SITE THERMAL",
    leftTitle: "FRONT-OF-HOUSE SCOPE",
    rightTitle: "SYSTEM FAMILIARITY",
    left: [
      "Digital QR check-in and instant badge print",
      "Delegate kit assembly and controlled release",
      "Multi-door queue arbitration",
      "Protocol escort for dignitaries and CXOs",
    ],
    right: [
      "Eventbrite / Townscript / Custom CRM",
      "Rapid offline fallback registry protocol",
      "Native Gujarati-Hindi-English clarity",
      "VIP line management",
    ],
  },
  {
    id: "logistics",
    number: "03",
    category: "SETUP & LOGISTICS",
    unit: "UNIT 03 // INFRASTRUCTURE & RANSIT",
    location: "ALL REGIONS",
    title: "SETUP, LOGISTICS & BREAKDOWN CREW",
    description:
      "Relentless structural muscle with operational common sense.From overnight exhibition assembly to rapid 3-hour stadium de-rigs, our teams protect both vendor equipment and venue floor integrity.",
    deployment:
      "Trade fairs at Gujarat University Convention Centre, concert stages, and multi-acre outdoor pavilion grounds.",
    image: "/images/services/setup.jpg",
    alt: "Event crew assembling a stage and event equipment",
    caption: "SAFETY RIGGING STANDARDS: EN-13814 COMPLIANT",
    verification: "HEAVY LOAD CERTIFIED",
    leftTitle: "OPERATIONAL SCOPE",
    rightTitle: "SLA HIGHLIGHTS",
    left: [
      "Production truck unloading and flight case transit",
      "Octanorm & custom booth modular fitting",
      "Truss positioning & backdrop banner alignment",
      "Final venue carpet clearance & hygiene pack",
    ],
    right: [
      "24/7 Night-shift staging availability",
      "Steel-toe footware and high-visibility adherence",
      "Zero-damage equipment handling warranty",
      "Dedicated loading dock yard coordination",
    ],
  },
  {
    id: "security",
    number: "04",
    category: "SECURITY",
    unit: "UNIT 04 // PROTOCOL & PERIMETER",
    location: "ST // AMD",
    title: "SECURITY & CROWD MANAGEMENT",
    description:
      "Calm authority, decisive gatekeeping, and uncompromising perimeter vigilance. We maintain structural safety without intimidating or alienating legitimate guests.",
    deployment:
      "Large-scale industrial exhibitions in Surat, live music festivals, and high-profile corporate galas.",
    image: "/images/services/security-crowd-1.jpg",

    alt: "Security personnel monitoring an event entrance",
    leftTitle: "SCREENING & CONTROL",
    rightTitle: "PROTECTION PROFILES",
    left: [
      "Handheld metal detector (HHMD) operation",
      "Bag inspection & prohibited-item cataloging",
      "Stage perimeter & green-room cordons",
      "Emergency egress and fire aisle maintenance",
    ],
    right: [
      "Executive Close Protection Officers (CPO)",
      "Female marshals for specialized checkpoints",
      "Crowd pressure arbitration specialists",
      "Central command liaison radiomen",
    ],
  },
  {
    id: "coordinators",
    number: "05",
    category: "COORDINATORS",
    unit: "UNIT 05 // FIELD COMMAND",
    location: "ALL HUBS",
    title: "EVENT MANAGERS & FLOOR COORDINATORS",
    description:
      "The operational linchpin between your creative deck and physical reality. Our coordinators manage timing discrepancies, vendor cross-talk, and live contingencies so you have never have to panic.",
    deployment:
      "Multi-stage conferences, wedding sangeets with complex cue sequences, and corporate brand launches.",
    image: "/images/services/event-manager.jpg",
    alt: "Event coordinator wearing a headset backstage",
    caption: "DIRECT FIELD REPORTING: LIVE CLIENT DASHBOARD INTEGRATED",
    verification: "CUE-ACCURACY: ±30 SEC",
    leftTitle: "CORE DUTIES",
    rightTitle: "EQUIPMENT & LOGISTICS",
    left: [
      "Run-of-show minute-by-minute execution",
      "Cross-agency vendor sync (Catering, decor, AV)",
      "Keynote Speaker and talent green-room callouts",
      "Crisis escalation and rapid workarounds",
    ],
    right: [
      "Discrete earpiece & multichannel radio standard",
      "Digital manifest reconciliation on tablet",
      "Stage-left direct cues & teleprompter oversight",
      "Post-event asset reconciliation reports",
    ],
  },
  {
    id: "production-av",
    number: "06",
    category: "PRODUCTION AV",
    unit: "UNIT 06 // PRODUCTION RIG & SIGNAL",
    location: "AMD // GNR // BRC",
    title: "AV TECHNICIANS & PRODUCTION CREW",
    description:
      "Signal integrity, spotless wireless RF, and visual immersion. We provide qualified console engineers and experienced stagehands who treat expensive gear with technical respect.",
    deployment:
      "High-intensity arena concerts, multi-lingual plenary sessions, and high-definition virtual broadcasts.",
    image: "/images/services/av-technician.jpg",
    alt: "AV technicians operating a live event production console",
    caption: "EQUIPMENT EXPERTISE // DIGICO / YAMAHA / GRANDMA / ROE",
    leftTitle: "TECHNICAL CAPABILITY",
    rightTitle: "SKILL VERIFICATION",
    left: [
      "FOH and monitor audio mixing engineers",
      "GrandMA2 / GrandMA3 lighting programmers",
      "Novastar LED wall processor alignment",
      "Multicam broadcast operators & cable wranglers",
    ],
    right: [
      "Rigorous hardware qualification benchmarks",
      "DMX addressing & Dante network certification",
      "Rapid Redundancy and patch switching",
      "Zero-dropout Wireless RF frequency coordination",
    ],
  },
];

const pillars = [
  {
    number: "01",
    icon: "identity",
    title: "IDENTITY & BACKGROUND VETTING",
    description:
      "Every candidate undergoes biometric Aadhaar verification, municipal police record screening, and previous employer validation before induction into the Gujarat active roster.",
    footer: "100% AUDITED CREDENTIALS",
  },
  {
    number: "02",
    icon: "briefing",
    title: "BRIEFING & UNIFORM PROTOCOL",
    description:
      "Strict all-black tailored attire standard. Mandatory 45-minute on-site orientation covering emergency exists, guest discretion rules, and hygiene etiquette prior to call-time.",
    footer: "ALL BLACK ATTIRE COMPLIANT",
  },
  {
    number: "03",
    icon: "supervisor",
    title: "ON-SITE SUPERVISOR SUPPORT",
    description:
      "For deployments over 10 crew members, a dedicated non-billing Lead Supervisor is stationed on-site to handle shift rotations, meal schedules, and immediate client directives.",
    footer: "DEDICATED FLOOR LEADERSHIP",
  },
  {
    number: "04",
    icon: "location",
    title: "GUJARAT HUB AVAILABILITY",
    description:
      "Active stand-by dispatch pods strategically positioned across Ahmedabad, Surat, Vadodara, and Gandhinagar to guarantee zero delay arrival and last-minute backup replacements.",
    footer: "AMD / ST / BRC / GNR READY",
  },
];

export default function ServicesPage() {
  useSectionMotion(".cc-services");
  const [activeService, setActiveService] = useState("");

  return (
    <main className="cc-services" id="top">
      <header className="cc-services-header">
        <div className="cc-heading-grid">
          <div>
            <div className="cc-eyebrow">
              <span>02 // CAPABILITIES & WORKFORCE</span>
              <span className="cc-eyebrow-line" />
              <span>GUJARAT DISPATCH MANIFEST</span>
            </div>

            <h1>
              THE RIGHT PEOPLE.
              <br />
              THE RIGHT ROLES.
            </h1>
          </div>

          <p className="cc-intro">
            Explore staffing support for celebrations, business events, and
            live experiences across Gujarat. Every team member vetted,
            coordinated, and briefed for flawless execution.
          </p>
        </div>

        <nav className="cc-quick-jump" aria-label="Quick jump to services">
          <span className="cc-jump-label">QUICK JUMP //</span>

          <div className="cc-jump-links">
            {services.map((service) => (
              <a
                key={service.id}
                href={`#${service.id}`}
                className={activeService === service.id ? "active" : ""}
                onClick={() => setActiveService(service.id)}
              >
                {service.number} {service.category}
              </a>
            ))}
          </div>

          <span className="cc-active-cities">
            <span className="cc-status-dot" />
            4 CITIES ACTIVE TODAY
          </span>
        </nav>
      </header>

      <section className="cc-service-list" aria-label="Our staffing services">
        {services.map((service, index) => (
          <article
            className={`cc-service-card ${index % 2 === 1 ? "cc-service-reverse" : ""
              }`}
            id={service.id}
            key={service.id}
          >
            <div className="cc-service-copy">
              <div>
                <div className="cc-eyebrow cc-unit-eyebrow">
                  <span>{service.unit}</span>
                  <span className="cc-location-tag">{service.location}</span>
                </div>

                <h2>{service.title}</h2>

                <p className="cc-service-description">
                  {service.description}
                </p>

                <div className="cc-deployment">
                  <span>DEPLOYMENT MATCH</span>
                  <p>{service.deployment}</p>
                </div>
              </div>

              <Link
                className="cc-request-button"
                href={`/contact?service=${service.id}`}
              >
                REQUEST {service.category}<span>↗ </span>
              </Link>
            </div>

            <div className="cc-service-visual">
              <figure className="cc-service-image">
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  sizes="(max-width: 760px) 100vw, 55vw"
                  className="cc-image-element"
                  priority={index === 0}
                />


                {(service.caption || service.verification) && (
                  <div className="cc-image-overlay">
                    <span className="cc-image-caption">
                      {service.caption}
                    </span>

                    <span className="cc-verification">
                      {service.verification}
                    </span>
                  </div>
                )}
              </figure>

              {service.id === "security" && (
                <div className="cc-regulatory-banner">

                  <div className="cc-regulatory-icon" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 12 15"
                      width="12"
                      height="15"
                      fill="none"
                    >
                      <path
                        d="M5.2125 10.1625L9.45 5.925L8.38125 4.85625L5.2125 8.025L3.6375 6.45L2.56875 7.51875L5.2125 10.1625ZM6 15C4.2625 14.5625 2.82812 13.5656 1.69687 12.0094C0.565625 10.4531 0 8.725 0 6.825V2.25L6 0L12 2.25V6.825C12 8.725 11.4344 10.4531 10.3031 12.0094C9.17188 13.5656 7.7375 14.5625 6 15ZM6 13.425C7.3 13.0125 8.375 12.1875 9.225 10.95C10.075 9.7125 10.5 8.3375 10.5 6.825V3.28125L6 1.59375L1.5 3.28125V6.825C1.5 8.3375 1.925 9.7125 2.775 10.95C3.625 12.1875 4.7 13.0125 6 13.425Z"
                        fill="#C9C6C5"
                      />
                    </svg>
                  </div>
                  <div className="cc-regulatory-content">
                    <h4>STATUTORY REGULATORY ADHERENCE</h4>
                    <p>
                      All security personnel provided in strict adherence to applicable
                      licensing, state qualifications, and statutory regulations mandated
                      by the Government of Gujarat and local city police commissionerates.
                    </p>
                  </div>
                </div>
              )}


              <div className="cc-spec-grid">
                <div className="cc-spec-panel">
                  <h3>{service.leftTitle}</h3>
                  <ul>
                    {service.left.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="cc-spec-panel">
                  <h3>{service.rightTitle}</h3>
                  <ul>
                    {service.right.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="cc-quality-section" id="quality">
        <div className="cc-eyebrow">
          03 // QUALITY ASSURANCE FRAMEWORK
        </div>

        <h2>OUR FOUR NON-NEGOTIABLE OPERATIONAL PILLARS</h2>

        <p className="cc-quality-intro">
          Every staffing request through CrewConnect is governed by
          standardized oversight, legal compliances, applicable compliance checks, and
          operational readiness and physical readiness checks before arriving at your venue.
        </p>


        <div className="cc-pillar-grid">
          {pillars.map((pillar) => (
            <article className="cc-pillar-card" key={pillar.number}>
              <div className="cc-pillar-icon" aria-hidden="true">
                {pillar.icon === "identity" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <path d="M1.66667 16.6667C1.20833 16.6667 0.815972 16.5035 0.489583 16.1771C0.163194 15.8507 0 15.4583 0 15V5.83333C0 5.375 0.163194 4.98264 0.489583 4.65625C0.815972 4.32986 1.20833 4.16667 1.66667 4.16667H5.83333V1.66667C5.83333 1.20833 5.99653 0.815972 6.32292 0.489583C6.64931 0.163194 7.04167 0 7.5 0H9.16667C9.625 0 10.0174 0.163194 10.3438 0.489583C10.6701 0.815972 10.8333 1.20833 10.8333 1.66667V4.16667H15C15.4583 4.16667 15.8507 4.32986 16.1771 4.65625C16.5035 4.98264 16.6667 5.375 16.6667 5.83333V15C16.6667 15.4583 16.5035 15.8507 16.1771 16.1771C15.8507 16.5035 15.4583 16.6667 15 16.6667H1.66667ZM1.66667 15H15V5.83333H10.8333C10.8333 6.29167 10.6701 6.68403 10.3438 7.01042C10.0174 7.33681 9.625 7.5 9.16667 7.5H7.5C7.04167 7.5 6.64931 7.33681 6.32292 7.01042C5.99653 6.68403 5.83333 6.29167 5.83333 5.83333H1.66667V15Z" fill="#8E9192" />
                    <path d="M3.33333 13.3333H8.33333V12.9583C8.33333 12.7222 8.26736 12.5035 8.13542 12.3021C8.00347 12.1007 7.81944 11.9444 7.58333 11.8333C7.30556 11.7083 7.02431 11.6146 6.73958 11.5521C6.45486 11.4896 6.15278 11.4583 5.83333 11.4583C5.51389 11.4583 5.21181 11.4896 4.92708 11.5521C4.64236 11.6146 4.36111 11.7083 4.08333 11.8333C3.84722 11.9444 3.66319 12.1007 3.53125 12.3021C3.39931 12.5035 3.33333 12.7222 3.33333 12.9583V13.3333ZM10 12.0833H13.3333V10.8333H10V12.0833ZM5.83333 10.8333C6.18056 10.8333 6.47569 10.7118 6.71875 10.4688C6.96181 10.2257 7.08333 9.93056 7.08333 9.58333C7.08333 9.23611 6.96181 8.94097 6.71875 8.69792C6.47569 8.45486 6.18056 8.33333 5.83333 8.33333C5.48611 8.33333 5.19097 8.45486 4.94792 8.69792C4.70486 8.94097 4.58333 9.23611 4.58333 9.58333C4.58333 9.93056 4.70486 10.2257 4.94792 10.4688C5.19097 10.7118 5.48611 10.8333 5.83333 10.8333ZM10 9.58333H13.3333V8.33333H10V9.58333ZM7.5 5.83333H9.16667V1.66667H7.5V5.83333Z" fill="#8E9192" />
                  </svg>
                )}

                {pillar.icon === "briefing" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="14" viewBox="0 0 17 14" fill="none">
                    <path d="M0.833333 13.3333C0.597222 13.3333 0.399306 13.2535 0.239583 13.0938C0.0798611 12.934 0 12.7361 0 12.5C0 12.3611 0.0277778 12.2326 0.0833333 12.1146C0.138889 11.9965 0.222222 11.9028 0.333333 11.8333L7.5 6.45833V5C7.5 4.76389 7.58333 4.56597 7.75 4.40625C7.91667 4.24653 8.11806 4.16667 8.35417 4.16667C8.70139 4.16667 8.99306 4.04167 9.22917 3.79167C9.46528 3.54167 9.58333 3.24306 9.58333 2.89583C9.58333 2.54861 9.46181 2.25694 9.21875 2.02083C8.97569 1.78472 8.68056 1.66667 8.33333 1.66667C7.98611 1.66667 7.69097 1.78819 7.44792 2.03125C7.20486 2.27431 7.08333 2.56944 7.08333 2.91667H5.41667C5.41667 2.11111 5.70139 1.42361 6.27083 0.854167C6.84028 0.284722 7.52778 0 8.33333 0C9.13889 0 9.82639 0.28125 10.3958 0.84375C10.9653 1.40625 11.25 2.09028 11.25 2.89583C11.25 3.54861 11.059 4.13194 10.6771 4.64583C10.2951 5.15972 9.79167 5.51389 9.16667 5.70833V6.45833L16.3333 11.8333C16.4444 11.9028 16.5278 11.9965 16.5833 12.1146C16.6389 12.2326 16.6667 12.3611 16.6667 12.5C16.6667 12.7361 16.5868 12.934 16.4271 13.0938C16.2674 13.2535 16.0694 13.3333 15.8333 13.3333H0.833333ZM3.33333 11.6667H13.3333L8.33333 7.91667L3.33333 11.6667Z" fill="#8E9192" />
                  </svg>
                )}

                {pillar.icon === "supervisor" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="14" viewBox="0 0 17 14" fill="none">
                    <path d="M12.5 9.16667C11.9167 9.16667 11.4236 8.96528 11.0208 8.5625C10.6181 8.15972 10.4167 7.66667 10.4167 7.08333C10.4167 6.5 10.6181 6.00694 11.0208 5.60417C11.4236 5.20139 11.9167 5 12.5 5C13.0833 5 13.5764 5.20139 13.9792 5.60417C14.3819 6.00694 14.5833 6.5 14.5833 7.08333C14.5833 7.66667 14.3819 8.15972 13.9792 8.5625C13.5764 8.96528 13.0833 9.16667 12.5 9.16667ZM8.33333 13.3333V12.1667C8.33333 11.8333 8.42014 11.5243 8.59375 11.2396C8.76736 10.9549 9.01389 10.75 9.33333 10.625C9.83333 10.4167 10.3507 10.2604 10.8854 10.1562C11.4201 10.0521 11.9583 10 12.5 10C13.0417 10 13.5799 10.0521 14.1146 10.1562C14.6493 10.2604 15.1667 10.4167 15.6667 10.625C15.9861 10.75 16.2326 10.9549 16.4062 11.2396C16.5799 11.5243 16.6667 11.8333 16.6667 12.1667V13.3333H8.33333ZM6.66667 6.66667C5.75 6.66667 4.96528 6.34028 4.3125 5.6875C3.65972 5.03472 3.33333 4.25 3.33333 3.33333C3.33333 2.41667 3.65972 1.63194 4.3125 0.979167C4.96528 0.326389 5.75 0 6.66667 0C7.58333 0 8.36806 0.326389 9.02083 0.979167C9.67361 1.63194 10 2.41667 10 3.33333C10 4.25 9.67361 5.03472 9.02083 5.6875C8.36806 6.34028 7.58333 6.66667 6.66667 6.66667Z" fill="#8E9192" />
                  </svg>
                )}

                {pillar.icon === "location" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="17"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 15L5 13.25L1.125 14.75C0.847222 14.8611 0.590278 14.8299 0.354167 14.6562C0.118056 14.4826 0 14.25 0 13.9583V2.29167C0 2.11111 0.0520833 1.95139 0.15625 1.8125C0.260417 1.67361 0.402778 1.56944 0.583333 1.5L5 0L10 1.75L13.875 0.25C14.1528 0.138889 14.4097 0.170139 14.6458 0.34375C14.8819 0.517361 15 0.75 15 1.04167V12.7083C15 12.8889 14.9479 13.0486 14.8438 13.1875C14.7396 13.3264 14.5972 13.4306 14.4167 13.5L10 15ZM9.16667 12.9583V3.20833L5.83333 2.04167V11.7917L9.16667 12.9583ZM10.8333 12.9583L13.3333 12.125V2.25L10.8333 3.20833V12.9583ZM1.66667 12.75L4.16667 11.7917V2.04167L1.66667 2.875V12.75Z"
                      fill="#8E9192"
                    />
                  </svg>
                )}
              </div>

              <span className="cc-pillar-number">
                PILLAR // {pillar.number}
              </span>

              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
              <span className="cc-pillar-footer">{pillar.footer}</span>
            </article>
          ))}
        </div>


        <MetricsCounter />

      </section>

      <section className="cc-dispatch-section" id="hire-staff">
        <div className="cc-dispatch-copy">
          <div className="cc-eyebrow">
            IMMEDIATE QUOTE & DISPATCH ESTIMATION
          </div>

          <h2>
            READY TO DISCUSS TEAM SIZE AND ROSTER REQUIREMENTS?
          </h2>

          <p>
            Tell us about your event timeline, venue, and exact role
            breakdown. Our team can review your requirements and help
            configure a suitable crew manifest.
          </p>

          <div className="cc-dispatch-meta">
            <span>STAFFING TURNAROUND: CONFIRM WITH OUR TEAM</span>
            <span>DIGITAL CREW IDENTIFICATION</span>
            <span>GST-COMPLIANT B2B BILLING, WHERE APPLICABLE</span>
          </div>
        </div>

        <div className="cc-dispatch-actions">
          <Link
            className="cc-request-button"
            href="/hire-staff"
          >
            HIRE STAFF FORM <span>→</span>
          </Link>

          <Link className="cc-secondary-button" href="/contact">
            TALK TO DISPATCH DESK
          </Link>
        </div>
      </section>
    </main>
  );
}
