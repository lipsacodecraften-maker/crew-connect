"use client";

import { useState } from "react";
import "./hire-staff.css";

const steps = ["Event scope", "Roles & count", "Venue & time", "Organizer", "Dispatch"];
const eventTypes = ["Grand wedding", "Corporate summit", "Exhibition / expo", "Private gala", "Live concert", "Brand activation"];
const attendance = ["< 100 guests", "100 – 500", "500 – 2,000", "2,000+ scaled"];
const cities = ["AMD // AHMEDABAD", "GNR // GANDHINAGAR", "BDQ // VADODARA", "ST // SURAT", "DESTINATION GUJ"];
const roleTypes = ["Event stewards", "Registration crew", "Hospitality hosts", "Security & bouncers", "Stage managers", "Production crew"];

function ChoiceGroup({ label, options, value, onChange, multiple = false }) {
  const selected = (option) => multiple ? value.includes(option) : value === option;
  const toggle = (option) => onChange(multiple
    ? selected(option) ? value.filter((item) => item !== option) : [...value, option]
    : option);
  return <fieldset className="hire-choice-group"><legend>{label}</legend><div className="hire-choices">{options.map((option) => <button className={`hire-choice ${selected(option) ? "is-selected" : ""}`} type="button" key={option} aria-pressed={selected(option)} onClick={() => toggle(option)}>{option}</button>)}</div></fieldset>;
}

export default function HireStaffPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ title: "", eventType: "", attendance: "", city: "", roles: [], counts: {}, venue: "", date: "", startTime: "", endTime: "", name: "", organization: "", email: "", phone: "", notes: "" });
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const next = () => {
    if (step === 0 && (!form.title.trim() || !form.eventType || !form.attendance || !form.city)) return;
    if (step === 1 && !form.roles.length) return;
    if (step === 2 && (!form.venue.trim() || !form.date)) return;
    if (step === 3 && (!form.name.trim() || !form.email.trim() || !form.phone.trim())) return;
    if (step < steps.length - 1) setStep((current) => current + 1);
    else setSubmitted(true);
  };

  return <main className="hire-page">
    <div className="hire-ribbon">
      <span><i /> PORTAL MODE: DIRECT ORGANIZER PROCUREMENT <b>|</b> DESPATCH DISK: GUJARAT COMMERCE DECK</span>
      <span>AVERAGE SLA RESPONSE: 3.4 HRS <b>|</b> DIRECT LINE: +91 (079) 4920-8800</span>
    </div>
    <div className="hire-shell">
      <header className="hire-hero">
        <div className="hire-hero-main">
          <div className="hire-kicker">
            <span>05 // ORGANIZER ENQUIRY</span>
            <span>ROSTER RESERVATION DESK</span>
          </div>
          <h1>LET’S BUILD YOUR<br /><em>EVENT TEAM.</em></h1>
          <p>Tell us what you are planning, where it is taking place, and the exact headcount and skills your production demands. Our staffing team reviews every brief and responds within 24 hours.</p>
          <div className="hire-trust"><div>
            <span className="trust-icon"><img src="/images/icons/verified-shield.svg" alt="" aria-hidden="true" /></span>
            <span>✓ VETTED &amp; BRIEFED STAFF</span>
          </div>
            <div>
              <span className="trust-icon"><img src="/images/icons/team-supervisors.svg" alt="" aria-hidden="true" /></span>
              <span>✓ ON-SITE TEAM SUPERVISORS</span>
            </div>
            <div>
              <span className="trust-icon"><img src="/images/icons/standard-attire.svg" alt="" aria-hidden="true" /></span>
              <span>✓ STANDARDIZED BLACK ATTIRE</span>
            </div>
            <div>
              <span className="trust-icon"><img src="/images/icons/roster-gear.svg" alt="" aria-hidden="true" /></span>
              <span>✓ SCALABLE ROSTER ACROSS GUJARAT</span>
            </div>
          </div>
        </div>
        <aside className="hire-coverage">
          <div className="coverage-title">
            <span>DISPATCH TERMINAL</span>
            <span>SECURE LINK</span>
          </div>
          <div className="coverage-compliance">
            <h2>STATE REGISTRY COMPLIANCE</h2>
            <p>Every deployed squad lead holds comprehensive liability indemnity, verified Aadhar KYC, and direct radio communication suites.</p>
          </div>
          <div className="coverage-roster">
            <div className="coverage-city">
              <span>AHMEDABAD CENTRAL</span><b>142 <small>STAFF ON CALL</small></b>
            </div>
            <div className="coverage-city">
              <span>GANDHINAGAR GIFT CITY</span><b>88 <small>STAFF ON CALL</small>
              </b></div>
            <div className="coverage-city">
              <span>SURAT &amp; VADODARA</span><b>190 <small>STAFF ON CALL</small></b>
            </div>
          </div>
          <div className="coverage-urgent">
            <small>URGENT CALLS (&lt; 24H NOTICE)</small>
            <a href="tel:+9107988002739">+91 (079) 8800-CREW </a>
          </div>
        </aside>
      </header>

      <section className="hire-builder" aria-label="Staffing enquiry form">
        <nav className="hire-stepper" aria-label="Enquiry steps">{steps.map((name, index) =>
          <button type="button" key={name} className={`hire-step ${index === step ? "active" : ""} ${index < step ? "complete" : ""}`} onClick={() => index < step && setStep(index)}>
            <span>{index < step ? "✓" : `0${index + 1} // STEP`}</span><b>{name}</b>
          </button>)}
        </nav>
        {submitted ? <div className="hire-success">
          <span className="hire-kicker">05 // BRIEF RECEIVED</span>
          <h2>Your event team starts here.</h2><p>Thanks, {form.name}. Your enquiry for
            <strong>{form.title}</strong> in {form.city.split(" // ").at(-1)} is ready for our dispatch desk. Our team will reach you within 24 hours.</p>
          <button type="button" className="hire-primary" onClick={() => { setSubmitted(false); setStep(0); }}>START ANOTHER ENQUIRY ↗</button>
        </div>
          :
          <div className={`hire-form-layout ${step === 0 ? "hire-form-layout-scope" : ""}`}>
            <div className="hire-form">
              {step > 0 &&
                <div className="hire-stage-head">
                  <span>STAGE 0{step + 1} OF 05</span>

                  <span>ALL FIELDS MARKED * REQUIRED</span>
                </div>}
              {step === 0 && <>
                <label className="hire-field">
                  <span>01.1 // EVENT TITLE OR CLIENT ENTITY *</span>
                  <input required placeholder="e.g., Zydus Annual Leadership Summit 2025" value={form.title} onChange={(event) => update("title", event.target.value)} /></label>
                <ChoiceGroup label="01.2 // EVENT NATURE / FORMAT *" options={eventTypes} value={form.eventType} onChange={(value) => update("eventType", value)} />
                <ChoiceGroup label="01.3 // ESTIMATED GUEST ATTENDANCE *" options={attendance} value={form.attendance} onChange={(value) => update("attendance", value)} />
                <ChoiceGroup label="01.4 // TARGET TERRITORY / CITY *" options={cities} value={form.city} onChange={(value) => update("city", value)} /></>}
              {step === 1 && <>
                <h2>Build your roster</h2>
                <p className="hire-intro">Select the teams you need. Add an estimated headcount for each role; your coordinator can refine the roster with you.</p>
                <ChoiceGroup label="STAFFING ROLES *" options={roleTypes} value={form.roles} onChange={(value) => update("roles", value)} multiple />{form.roles.map((role, index) =>
                  <label className="hire-field hire-count" key={role}>
                    <span>ROLE 0{index + 1} // {role.toUpperCase()} COUNT</span>
                    <input type="number" min="1" placeholder="Number of staff" value={form.counts[role] || ""} onChange={(event) => update("counts", { ...form.counts, [role]: event.target.value })} />
                  </label>)}
                <label className="hire-field">
                  <span>ADDITIONAL ROLE NOTES</span>
                  <textarea placeholder="Tell us about any specific experience or skills you need." value={form.notes} onChange={(event) => update("notes", event.target.value)} /></label></>}
              {step === 2 && <>
                <h2>Venue &amp; timing</h2>
                <p className="hire-intro">Share the venue and schedule so our local dispatch team can plan arrival, briefing, and coverage.</p>
                <label className="hire-field">
                  <span>VENUE / LOCATION *</span>
                  <input required placeholder="Venue name and area" value={form.venue} onChange={(event) => update("venue", event.target.value)} /></label>
                <div className="hire-field-row">
                  <label className="hire-field">
                    <span>EVENT DATE *</span>
                    <input type="date" required value={form.date} onChange={(event) => update("date", event.target.value)} /></label>
                  <label className="hire-field">
                    <span>STAFF ARRIVAL TIME</span>
                    <input type="time" value={form.startTime} onChange={(event) => update("startTime", event.target.value)} /></label>
                </div>
                <label className="hire-field">
                  <span>EXPECTED WRAP TIME</span>
                  <input type="time" value={form.endTime} onChange={(event) => update("endTime", event.target.value)} /></label>
                <p className="hire-note">
                  <span>RAPID REPLACEMENT PROTOCOL</span> A 10% standby contingent is maintained near Mahatma Mandir, YMCA Club, and Surat Exhibition Center.</p></>}
              {step === 3 && <>
                <h2>Organizer details</h2>
                <p className="hire-intro">Who should our roster desk contact about this event? We’ll use these details to follow up on your brief.</p>
                <label className="hire-field">
                  <span>YOUR NAME *</span>
                  <input required autoComplete="name" placeholder="Full name" value={form.name} onChange={(event) => update("name", event.target.value)} />
                </label>
                <label className="hire-field">
                  <span>ORGANIZATION / AGENCY</span>
                  <input autoComplete="organization" placeholder="Company or organization name" value={form.organization} onChange={(event) => update("organization", event.target.value)} />
                </label>
                <label className="hire-field">
                  <span>WORK EMAIL *</span>
                  <input type="email" required autoComplete="email" placeholder="you@company.com" value={form.email} onChange={(event) => update("email", event.target.value)} />
                </label>
                <label className="hire-field">
                  <span>DIRECT PHONE *</span>
                  <input type="tel" required autoComplete="tel" placeholder="+91" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
                </label>
              </>}
              {step === 4 && <><h2>Review &amp; dispatch</h2><p className="hire-intro">Check your event brief before sending it to our Gujarat staffing desk.</p><div className="hire-review"><div><span>EVENT</span><b>{form.title}</b></div><div><span>FORMAT / ATTENDANCE</span><b>{form.eventType} · {form.attendance}</b></div><div><span>TERRITORY</span><b>{form.city.split(" // ").at(-1)}</b></div><div><span>ROLES</span><b>{form.roles.map((role) => `${role}${form.counts[role] ? ` (${form.counts[role]})` : ""}`).join(", ")}</b></div><div><span>VENUE / DATE</span><b>{form.venue} · {form.date}</b></div><div><span>ORGANIZER</span><b>{form.name} · {form.email} · {form.phone}</b></div></div><p className="hire-note"><span>FLEXIBLE COMMERCIALS</span> Direct billing is available for corporate accounts, event production agencies, and private trust wedding accounts with transparent credit terms.</p></>}
              <div className="hire-form-actions">{step > 0 &&
                <button type="button" className="hire-back" onClick={() => setStep((current) => current - 1)}>← BACK</button>}
                <button type="button" className="hire-primary" onClick={next}>{step === 4 ? "SEND ENQUIRY TO DISPATCH" : step === 0 ? "PROCEED TO STAFFING BUILDER" : "CONTINUE TO NEXT STEP"}
                  <span>→</span>
                </button>
              </div>
            </div>
            {step === 0 ? <aside className="hire-foundation"><div className="hire-foundation-intro"><div className="hire-stage-head"><span>STAGE 01 OF 05</span></div><h2>FOUNDATION BRIEF</h2><p>Define the production magnitude. The guest attendance directly dictates mandatory safety supervisor ratios and stewarding density under municipal norms.</p></div><p className="hire-note"><span>GUJARAT CIVIC JURISDICTION:</span> Deployments exceeding 1,000 attendees automatically qualify for on-ground Crew Connect Stage Managers at zero supplemental commission.</p></aside> : <aside className="hire-compliance"><span className="hire-kicker">DISPATCH INTELLIGENCE</span><div><b>01</b><span>GUJARAT POLICE COMPLIANCE<small>Staff are vetted with state police character verifications before production allotment.</small></span></div><div><b>02</b><span>RAPID REPLACEMENT PROTOCOL<small>Local standby crews support last-minute changes across key venues.</small></span></div><div><b>03</b><span>FLEXIBLE COMMERCIALS<small>Transparent terms for corporate, agency, and private event organizers.</small></span></div><a href="tel:+9107949208800">NEED TO SPEAK TO US? <strong>+91 (079) 4920-8800 ↗</strong></a></aside>}
          </div>}
      </section>
      <section className="hire-broadside" aria-label="Operational policies">
        <div className="hire-broadside-grid">
          <article>
            <h2>GUJARAT POLICE COMPLIANCE</h2>
            <p>All event stewards and bouncers are vetted with Gujarat State Police character verifications prior to production allotment.</p>
          </article>
          <article>
            <h2>RAPID REPLACEMENT PROTOCOL</h2>
            <p>10% standby contingent maintained on hot standby within 15 km of Mahatma Mandir, YMCA Club, and Surat Exhibition Center.</p>
          </article>
          <article>
            <h2>FLEXIBLE COMMERCIALS</h2>
            <p>Direct billing to corporate accounts, event production agencies, and private trust wedding accounts with transparent credit terms.</p>
          </article>
        </div>
      </section>
    </div>
  </main>;
}
