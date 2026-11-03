"use client";

import { useEffect, useRef, useState } from "react";
import "./join-crew.css";


const stages = [
  { title: "PERSONAL DETAILS", subtitle: "Name, WhatsApp OTP, Primary City, Age" },
  { title: "ROLES & CAPABILITIES", subtitle: "Specializations, Prior Tenures, Stamina" },
  { title: "AVAILABILITY & CITIES", subtitle: "Deployment radius, Shift windows, Mobility" },
  { title: "MEDIA & HEADSHOT", subtitle: "Clear headshot, Resume file, Encryption" },
  { title: "REVIEW & CONSENT", subtitle: "Code of conduct, Direct alerts consent" },
];

const initial = {
  name: "", phone: "", email: "", city: "", age: "", languages: [],
  roles: [], experience: "", stamina: "", radius: "", shifts: [],
  otherCities: "", mobility: "", headshot: null, resume: null,
  ageConfirmed: false, conduct: false, alerts: false,
};

const roleOptions = ["Guest experience", "Hospitality", "Registration", "Security", "Production & stage", "Logistics"];
const shiftOptions = ["Weekdays", "Weekends", "Day shifts", "Evening shifts", "Overnight"];

function RegistrationWizard() {
  const [stage, setStage] = useState(0);
  const [data, setData] = useState(initial);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  const update = (key, value) => setData((current) => ({ ...current, [key]: value }));
  const toggle = (key, value) => setData((current) => ({
    ...current,
    [key]: current[key].includes(value)
      ? current[key].filter((item) => item !== value)
      : [...current[key], value],
  }));

  const validate = () => {
    const next = {};
    if (stage === 0) {
      if (!data.name.trim()) next.name = "Enter your legal name.";
      if (!/^[+\d][\d\s()-]{7,}$/.test(data.phone.trim())) next.phone = "Enter a valid mobile number.";
      if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) next.email = "Enter a valid email address.";
      if (!data.city) next.city = "Select your primary city.";
      if (!data.age || Number(data.age) < 18) next.age = "Applicants must be at least 18.";
      if (data.languages.length === 0) next.languages = "Select at least one language.";
    }
    if (stage === 1 && data.roles.length === 0) next.roles = "Choose at least one role.";
    if (stage === 2 && data.shifts.length === 0) next.shifts = "Choose at least one shift window.";
    if (stage === 3 && !data.headshot) next.headshot = "Add a headshot to continue.";
    if (stage === 4) {
      if (!data.ageConfirmed) next.ageConfirmed = "Confirm the age eligibility declaration.";
      if (!data.conduct) next.conduct = "Accept the code of conduct to continue.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const nextStage = (event) => {
    event.preventDefault();
    setNotice("");
    if (validate()) {
      setStage((current) => Math.min(current + 1, 4));
      setErrors({});
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    const lines = [
      "Crew Connect crew registration",
      `Name: ${data.name}`,
      `WhatsApp: ${data.phone}`,
      `Email: ${data.email}`,
      `Primary city: ${data.city}`,
      `Age: ${data.age}`,
      `Languages: ${data.languages.join(", ")}`,
      `Roles: ${data.roles.join(", ")}`,
      `Experience: ${data.experience || "Not specified"}`,
      `Shift windows: ${data.shifts.join(", ")}`,
      `Other cities: ${data.otherCities || "Not specified"}`,
    ];
    const message = encodeURIComponent(lines.join("\n"));
    window.open(`https://wa.me/917940018820?text=${message}`, "_blank", "noopener,noreferrer");
    setNotice("Your application summary is ready in WhatsApp. Attach your headshot and resume in that chat, then send it to the Candidate Desk.");
  };

  const field = (key, label, placeholder, type = "text", extra = {}) => (
    <label className="reg-field">
      <span>{label} *</span>
      <input type={type} value={data[key]} placeholder={placeholder} onChange={(event) => update(key, event.target.value)} aria-invalid={Boolean(errors[key])} {...extra} />
      {errors[key] && <small className="reg-error">{errors[key]}</small>}
    </label>
  );

  const choices = (key, label, options, errorKey = key) => (
    <fieldset className="reg-choices">
      <legend>{label} *</legend>
      <div className="reg-choice-grid">{options.map((option) => <label className={`reg-choice ${data[key].includes(option) ? "is-selected" : ""}`} key={option}><input type="checkbox" checked={data[key].includes(option)} onChange={() => toggle(key, option)} /><span>{option}</span></label>)}</div>
      {errors[errorKey] && <small className="reg-error">{errors[errorKey]}</small>}
    </fieldset>
  );

  return (
    <section className="registration-shell" id="registration">
      <div className="registration-layout">
        <aside className="registration-rail">
          <p className="reg-kicker">REGISTRATION PROTOCOL // 5 STAGES</p>
          <h2>APPLICATION<br />DOSSIER</h2>
          <p className="reg-rail-intro">Complete each stage with valid legal credentials. All documents are encrypted per Indian IT Act compliance.</p>
          <nav className="reg-step-list" aria-label="Registration stages">{stages.map((item, index) => <div className={`reg-step ${index === stage ? "is-current" : ""} ${index < stage ? "is-complete" : ""}`} key={item.title} aria-current={index === stage ? "step" : undefined}><span className="reg-step-dot" /><span className="reg-step-number">0{index + 1} // { ["INTAKE", "CLASSIFICATION", "LOGISTICS", "VERIFICATION", "COMMITMENT"][index]}</span><strong>{item.title}</strong><small>{item.subtitle}</small></div>)}</nav>
          <div className="reg-help"><strong>CREW LIAISON DESK</strong><p>Experiencing trouble uploading or verifying OTP?<br />Reach the Ahmedabad Candidate Desk via WhatsApp:</p><a href="https://wa.me/917940018820" target="_blank" rel="noreferrer">+91 79 4001 8820 ↗</a></div>
        </aside>

        <form className="registration-form" onSubmit={stage === 4 ? submit : nextStage} noValidate>
          <div className="reg-form-heading"><div><span>STAGE 0{stage + 1} OF 05</span><h3>{stages[stage].title}</h3></div><span className="reg-progress-label">{Math.round(((stage + 1) / 5) * 100)}% COMPLETE</span></div>
          <div className="reg-progress"><span style={{ width: `${((stage + 1) / 5) * 100}%` }} /></div>

          {stage === 0 && <div className="reg-fields">
            {field("name", "Full legal name (as per Aadhaar / PAN)", "e.g. Aarav Jayeshbhai Patel", "text", { autoComplete: "name" })}
            <label className="reg-field"><span>WHATSAPP / MOBILE NUMBER *</span><div className="reg-phone"><b>+91</b><input type="tel" value={data.phone} placeholder="98765 43210" onChange={(event) => update("phone", event.target.value)} autoComplete="tel-national" aria-invalid={Boolean(errors.phone)} /></div>{errors.phone && <small className="reg-error">{errors.phone}</small>}<small>WhatsApp OTP verification will be requested when the verification service is connected.</small></label>
            {field("email", "Email address", "aarav.patel@domain.com", "email", { autoComplete: "email" })}
            <label className="reg-field"><span>Primary base city (Gujarat) *</span><select value={data.city} onChange={(event) => update("city", event.target.value)} aria-invalid={Boolean(errors.city)}><option value="">Select Primary Base City...</option>{["Ahmedabad", "Gandhinagar", "Vadodara", "Surat", "Other Gujarat city"].map((city) => <option key={city}>{city}</option>)}</select>{errors.city && <small className="reg-error">{errors.city}</small>}</label>
            {field("age", "Age", "18 or above", "number", { min: 18, max: 100 })}
            {choices("languages", "Primary spoken languages (select all that apply)", ["Gujarati (ગુજરાતી)", "Hindi (हिंदी)", "English"])}
          </div>}

          {stage === 1 && <div className="reg-fields">{choices("roles", "Roles & specializations (select all that apply)", roleOptions)}<label className="reg-field"><span>Prior event work / relevant experience</span><textarea value={data.experience} onChange={(event) => update("experience", event.target.value)} placeholder="Tell us about relevant roles, venues, or event experience." rows={4} /></label><label className="reg-field"><span>Physical readiness</span><select value={data.stamina} onChange={(event) => update("stamina", event.target.value)}><option value="">Select an option...</option><option>Comfortable standing for extended shifts</option><option>Some limitations to discuss</option></select><small>Some roles involve long periods on your feet and active event-floor work.</small></label></div>}

          {stage === 2 && <div className="reg-fields"><label className="reg-field"><span>Deployment radius</span><select value={data.radius} onChange={(event) => update("radius", event.target.value)}><option value="">Select preferred radius...</option><option>Within my primary city</option><option>Within 50 km</option><option>Across Gujarat</option></select></label>{choices("shifts", "Availability & shift windows (select all that apply)", shiftOptions)}<label className="reg-field"><span>Other cities you can travel to</span><input value={data.otherCities} onChange={(event) => update("otherCities", event.target.value)} placeholder="e.g. Ahmedabad, Surat, Vadodara" /></label><label className="reg-field"><span>Mobility / travel notes</span><textarea value={data.mobility} onChange={(event) => update("mobility", event.target.value)} placeholder="Share any relevant travel availability." rows={3} /></label></div>}

          {stage === 3 && <div className="reg-fields"><label className="reg-field reg-upload"><span>Clear headshot *</span><input type="file" accept="image/*" onChange={(event) => update("headshot", event.target.files?.[0] || null)} aria-invalid={Boolean(errors.headshot)} /><small>{data.headshot ? data.headshot.name : "Choose a recent, clear photo of yourself."}</small>{errors.headshot && <small className="reg-error">{errors.headshot}</small>}</label><label className="reg-field reg-upload"><span>Resume file (optional)</span><input type="file" accept=".pdf,.doc,.docx" onChange={(event) => update("resume", event.target.files?.[0] || null)} /><small>{data.resume ? data.resume.name : "PDF or Word document."}</small></label><p className="reg-privacy-note">Your documents are included only when you send your application through WhatsApp. Avoid uploading Aadhaar or PAN scans here.</p></div>}

          {stage === 4 && <div className="reg-fields"><div className="reg-review"><span>APPLICATION SUMMARY</span><p><b>{data.name}</b><br />{data.email} · +91 {data.phone}<br />{data.city} · Age {data.age}<br />Languages: {data.languages.join(", ")}<br />Interested roles: {data.roles.join(", ")}<br />Availability: {data.shifts.join(", ")}</p><small>Headshot: {data.headshot?.name || "Not attached"} · Resume: {data.resume?.name || "Not attached"}</small></div><label className="reg-consent"><input type="checkbox" checked={data.ageConfirmed} onChange={(event) => update("ageConfirmed", event.target.checked)} /><span><b>AGE ELIGIBILITY DECLARATION *</b><br />I solemnly confirm that I am at least 18 years of age and legally permitted to engage in professional shift engagements under Indian contract regulations.</span></label>{errors.ageConfirmed && <small className="reg-error">{errors.ageConfirmed}</small>}<label className="reg-consent"><input type="checkbox" checked={data.conduct} onChange={(event) => update("conduct", event.target.checked)} /><span><b>CODE OF CONDUCT *</b><br />I agree to follow Crew Connect’s professional conduct, attendance, and event safety requirements.</span></label>{errors.conduct && <small className="reg-error">{errors.conduct}</small>}<label className="reg-consent"><input type="checkbox" checked={data.alerts} onChange={(event) => update("alerts", event.target.checked)} /><span><b>DIRECT SHIFT ALERTS</b><br />I agree to receive relevant opportunity alerts by WhatsApp or email.</span></label></div>}

          {notice && <p className="reg-submit-notice" role="status">{notice}</p>}
          <div className="reg-form-actions">{stage > 0 && <button type="button" className="reg-back" onClick={() => { setStage((current) => current - 1); setErrors({}); setNotice(""); }}>← BACK</button>}<button type="submit" className="reg-next">{stage === 4 ? "PREPARE WHATSAPP APPLICATION" : `NEXT: ${["ROLES & CAPABILITIES", "AVAILABILITY & CITIES", "MEDIA & HEADSHOT", "REVIEW & CONSENT"][stage]}`} <span aria-hidden="true">↗</span></button></div>
        </form>
      </div>
    </section>
  );
}




function RosterCount() {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setActive(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    const duration = 1500;
    const start = performance.now();
    let frame;

    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(Math.round(4820 * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return <strong ref={ref} aria-label="4,820 plus">{count.toLocaleString("en-IN")}+</strong>;
}


function RecruitmentBanner() {
  return (
    <div className="join-ops-banner" aria-label="Recruitment information">
      <div className="join-ops-left">
        <span className="join-ops-dot" aria-hidden="true" />
        <span className="join-ops-active">Spring/Summer 2025 Recruitment Active</span>
        <span className="join-ops-divider" aria-hidden="true">|</span>
        <span className="join-ops-desks">Direct Recruitment Desk: AMD / GNR / BDQ / ST</span>
      </div>
      <div className="join-ops-right">
        <span>Registration Fee: ₹0.00 (Strictly Prohibited)</span>
        <span className="join-ops-divider" aria-hidden="true">/</span>
        <span className="join-ops-directive">Verification Directive</span>
      </div>
    </div>
  );
}



function CandidateIntake() {
  return (
    <section className="join-intake">
      <div className="join-intake-layout">
        <div className="join-intake-copy">
          <div className="join-intake-kickers"><span>04 / TALENT NETWORK — GUJARAT</span><span>CANDIDATE INTAKE DESK</span></div>
          <h1>YOUR SKILLS.<br />YOUR NEXT OPPORTUNITY.</h1>
          <p>Join the Crew Connect network and share your profile for consideration for suitable event work across Ahmedabad, Vadodara, Surat, Gandhinagar, and beyond.</p>
        </div>
        <aside className="join-roster-card" aria-label="Crew network metric">
          <div className="join-roster-card-head"><span>NETWORK AUDIT METRIC</span><code>CC-IND-2025</code></div>
          <div className="join-roster-total"><RosterCount /><span>CREDENTIALED CREW ON ROSTER</span></div>
          <div className="join-roster-meter"><span /></div>
          <div className="join-roster-foot"><span>ACTIVE ENGAGEMENT: 91.4%</span><span>DIRECT BANK TRANSFERS</span></div>
        </aside>
      </div>
      <aside className="join-notice">
        <span className="join-notice-icon" aria-hidden="true">!</span>
        <div className="join-notice-copy">
          <div className="join-notice-heading"><strong>TRANSPARENT RECRUITMENT DIRECTIVE</strong><span>MANDATORY NOTICE</span></div>
          <p>We are a premier event staffing network. Registration submits your profile for review and consideration for future opportunities. We do not charge fees to join and we do not guarantee immediate shift allocation. Shift allocations depend strictly on client demands, role vetting, physical readiness, and punctuality scoring.</p>
        </div>
      </aside>
    </section>
  );
}


const questions = [
  {
    question: "HOW DO PAYOUTS WORK AND WHEN ARE FUNDS DISBURSED?",
    answer: "Crew Connect disburses payments directly via Indian NEFT or verified UPI VPA within 24 to 48 hours following the successful completion and digital check-out scan of your assigned event shift. We never charge processing cuts, registration deductions, or delayed escrow fees to crew members.",
  },
  {
    question: "DO I NEED PRIOR EVENT EXPERIENCE TO APPLY?",
    answer: "Prior event experience can help, but it is not required for every role. We review your skills, availability, and role fit, then share any role-specific briefing or requirements before a shift.",
  },
  {
    question: "WHAT IS THE MANDATORY CREW DRESS CODE?",
    answer: "The standard crew uniform is all black, clean, and professional unless your shift brief specifies another outfit. Wear comfortable, closed-toe footwear suitable for the assignment.",
  },
  {
    question: "HOW ARE SHIFT OPPORTUNITIES OFFERED ONCE I AM APPROVED?",
    answer: "Opportunity alerts are shared with suitable crew based on client requirements, role vetting, location, and availability. Each shift has its own details and confirmation process; joining the roster does not guarantee an immediate allocation.",
  },
  {
    question: "IS THIS A FULL-TIME JOB OR FLEXIBLE GIG WORK?",
    answer: "Crew opportunities are shift based and flexible. You can share the cities and times that work for you, and be considered for suitable assignments as they become available.",
  },
];

function CrewFaq() {
  return (
    <section className="crew-faq" aria-labelledby="crew-faq-title">
      <div className="crew-faq-layout">
        <div className="crew-faq-aside">
          <p className="crew-faq-kicker">02 // FIELD INTELLIGENCE</p>
          <h2 id="crew-faq-title">CANDIDATE<br />DISPATCH FAQ</h2>
          <p className="crew-faq-intro">Essential protocols covering direct payouts, dress codes, regulatory compliance, and day-of-event conduct across Gujarat conventions.</p>
          <aside className="crew-rate-card">
            <span className="crew-rate-label"><i aria-hidden="true" /> TRANSPARENT REMUNERATION</span>
            <p>Standard day rates in Ahmedabad, Gandhinagar, and Surat range from <strong>₹1,000 to ₹3,500+</strong> per shift based strictly on role certification, hours, and supervisory rank.</p>
          </aside>
        </div>
        <div className="crew-faq-list">
          {questions.map((item, index) => (
            <details className="crew-faq-item" key={item.question} open={index === 0}>
              <summary><span><b>0{index + 1} //</b> {item.question}</span><i aria-hidden="true" /></summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}


function DispatchAssistance() {
  return (
    <section className="crew-assistance" aria-label="Regional crew assistance">
      <div className="crew-assistance-inner">
        <div className="crew-assistance-copy">
          <span className="crew-assistance-icon" aria-hidden="true">↗</span>
          <strong>ALREADY REGISTERED CREW?</strong>
          <p>Check shift status or update banking details via the regional dispatch desk.</p>
        </div>
        <div className="crew-assistance-action">
          <span>DISPATCH WHATSAPP:</span>
          <a href="https://wa.me/917940018820" target="_blank" rel="noreferrer">+91 79 4001 8820 <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}

export default function JoinCrewPage() {
  useEffect(() => {
    document.title = "Join the Crew | Crew Connect";
  }, []);

  return (
    <main className="join-page">
      <RecruitmentBanner />
      <CandidateIntake />
      <RegistrationWizard />
      <CrewFaq />
      <DispatchAssistance />
    </main>
  );
}