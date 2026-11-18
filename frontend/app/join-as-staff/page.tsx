"use client";

import { useEffect, useRef, useState } from "react";
import "../hire-manpower/hire-manpower.css";
import "./join-as-staff.css";
import StaffRegistrationWizard from "./StaffRegistrationWizard";

const DESK_PHONE = "+91 9510572460";
const DESK_PHONE_HREF = "tel:+919510572460";

function RosterCount() {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    const duration = 1500;
    const start = performance.now();
    let frame = 0;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(4820 * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return (
    <strong ref={ref as any} aria-label="4,820 plus">
      {count.toLocaleString("en-IN")}+
    </strong>
  );
}

const questions = [
  {
    question: "HOW DO PAYOUTS WORK AND WHEN ARE FUNDS DISBURSED?",
    answer:
      "Crew Connect disburses payments directly via Indian NEFT or verified UPI VPA within 24 to 48 hours following the successful completion and digital check-out scan of your assigned event shift. We never charge processing cuts, registration deductions, or delayed escrow fees to crew members.",
  },
  {
    question: "DO I NEED PRIOR EVENT EXPERIENCE TO APPLY?",
    answer:
      "Prior event experience can help, but it is not required for every role. We review your skills, availability, and role fit, then share any role-specific briefing or requirements before a shift.",
  },
  {
    question: "WHAT IS THE MANDATORY CREW DRESS CODE?",
    answer:
      "The standard crew uniform is all black, clean, and professional unless your shift brief specifies another outfit. Wear comfortable, closed-toe footwear suitable for the assignment.",
  },
  {
    question: "HOW ARE SHIFT OPPORTUNITIES OFFERED ONCE I AM APPROVED?",
    answer:
      "Opportunity alerts are shared with suitable crew based on client requirements, role vetting, location, and availability. Each shift has its own details and confirmation process; joining the roster does not guarantee an immediate allocation.",
  },
  {
    question: "IS THIS A FULL-TIME JOB OR FLEXIBLE GIG WORK?",
    answer:
      "Crew opportunities are shift based and flexible. You can share the cities and times that work for you, and be considered for suitable assignments as they become available.",
  },
];

export default function JoinCrewPage() {
  useEffect(() => {
    document.title = "Join the Crew | Crew Connect";
  }, []);

  return (
    <main className="mp-page join-page">
      <div className="mp-topline">
        <div className="mp-container mp-topline-inner">
          <span>
            <i aria-hidden="true" /> Join the crew · candidate registration desk
          </span>
          <span>Registration fee ₹0 · WhatsApp verified intake</span>
        </div>
      </div>

      <section className="mp-hero join-hero">
        <div className="mp-container mp-hero-inner">
          <div className="mp-hero-main">
            <span className="mp-eyebrow">CrewConnect / Candidate network</span>
            <h1>
              Your skills.
              <br />
              <span>Your next opportunity.</span>
            </h1>
            <p>
              Join the CrewConnect network and share your profile for
              consideration on suitable event work across Ahmedabad, Vadodara,
              Surat, Gandhinagar, and beyond. Every registration is reviewed by
              the candidate desk before any shift is offered.
            </p>
            <div className="mp-trust">
              <span>No registration fee</span>
              <span>WhatsApp verified</span>
              <span>Flexible shift work</span>
              <span>Gujarat-wide roster</span>
            </div>
          </div>

          <aside className="mp-desk-card join-desk-card">
            <div className="mp-desk-head">
              <span>Candidate desk</span>
              <span className="mp-live">
                <i aria-hidden="true" /> Open
              </span>
            </div>
            <p>
              Build a verified crew profile with your skills, availability and
              documents. Add everything in one sitting, then track your status
              with the registration desk.
            </p>
            <div className="mp-desk-list">
              <div>
                <b>01</b>
                <span>Verify WhatsApp and share your details</span>
              </div>
              <div>
                <b>02</b>
                <span>Desk reviews skills and availability</span>
              </div>
              <div>
                <b>03</b>
                <span>Shortlisted crew receive shift briefs</span>
              </div>
            </div>
            <div className="join-roster">
              <RosterCount />
              <span>Credentialed crew on roster</span>
            </div>
            <a href={DESK_PHONE_HREF}>
              <small>Candidate line</small>
              <strong>{DESK_PHONE} ↗</strong>
            </a>
          </aside>
        </div>
      </section>

      <StaffRegistrationWizard />

    
    </main>
  );
}
