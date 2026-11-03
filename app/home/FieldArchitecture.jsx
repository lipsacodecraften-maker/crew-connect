
"use client";

import "./FieldArchitecture.css";

const disciplines = [
  {
    number: "01",
    title: "HOSPITALITY & SERVING STAFF",
    description:
      "Food & beverage stewards, high-table banquet service teams, and dedicated VIP hospitality leads trained in diplomatic etiquette.",
    image: "/images/field/hospitality.jpg",
    alt: "Hospitality staff serving guests at an event",
    icon: "utensils",
  },
  {
    number: "02",
    title: "GUEST MANAGEMENT & REGISTRATION",
    description:
      "Check-in desk officers, welcome hosts, badge verification leads, and attendee flow marshals fluent in English, Gujarati, and Hindi.",
    image: "/images/field/registration.jpg",
    alt: "Staff managing guest registration at an event",
    icon: "users",
  },
  {
    number: "03",
    title: "SETUP & LOGISTICS CREW",
    description:
      "Staging prep crews, inventory haulers, material handling specialists, and swift midnight tear-down squads.",
    image: "/images/field/logistics.jpg",
    alt: "Event setup and logistics team preparing equipment",
    icon: "archive",
  },
  {
    number: "04",
    title: "SECURITY STAFF",
    description:
      "Crowd coordination and licensed security personnel subject to local regulatory compliance, access gating, and escort protocols.",
    image: "/images/field/security.jpg",
    alt: "Security personnel managing event access",
    icon: "shield",
  },
  {
    number: "05",
    title: "FLOOR MANAGERS & COORDINATORS",
    description:
      "On-site zone supervisors, run-of-show timekeepers, vendor liaisons, and emergency pivot operators on radio frequencies.",
    image: "/images/field/managers.jpg",
    alt: "Event floor manager coordinating a team",
    icon: "clipboard",
  },
  {
    number: "06",
    title: "TECHNICIANS & PRODUCTION CREW",
    description:
      "Certified AV technicians, lighting console operators, LED wall engineers, and agile stagehands for real-time cue execution.",
    image: "/images/field/production.jpg",
    alt: "Production crew working with stage and lighting equipment",
    icon: "settings",
  },
];

const iconPaths = {
  utensils: (
    <>
      <path d="M7 2v7" />
      <path d="M4 2v4a3 3 0 0 0 6 0V2" />
      <path d="M7 9v13" />
      <path d="M17 2v20" />
      <path d="M17 2c4 2 4 8 0 10" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
      <path d="m16 11 2 2 4-4" />
    </>
  ),
  archive: (
    <>
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <path d="M5 9v11h14V9" />
      <path d="M10 13h4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" />

    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="1" />
      <path d="M9 4V2h6v2" />
      <path d="m9 13 2 2 4-4" />
    </>
  ),
  settings: (
    <>
      <path d="M0 16V8H4V16H0V16M6 16V0H10V16H6V16M12 16V5H16V16H12V16" fill="#8E9192" />
    </>
  ),
};

function DisciplineIcon({ name }) {
  return (
    <svg
      className="field-discipline-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

export default function FieldArchitecture() {
  return (
    <section
      className="field-architecture"
      id="field-architecture"
      aria-labelledby="field-architecture-title"
    >
      <div className="field-container">
        <header className="field-header">
          <div className="field-heading-group">
            <p className="field-eyebrow">03 // FIELD ARCHITECTURE</p>

            <h2 id="field-architecture-title">
              PEOPLE FOR EVERY PART OF THE EXPERIENCE
            </h2>
          </div>

          <span className="field-count">06 CORE DISCIPLINES</span>
        </header>

        <div className="field-grid">
          {disciplines.map((item) => (
            <article className="field-card" key={item.number}>
              <div className="field-card-top">
                <span className="field-number">{item.number}</span>
                <DisciplineIcon name={item.icon} />
              </div>

              <div className="field-image-wrap">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="field-image"
                  loading="lazy"
                />
              </div>

              <div className="field-card-content">
                <h3>{item.title}</h3>

                <p className="field-description">{item.description}</p>

                <a
                  href={`/disciplines/${item.number}`}
                  className="field-link"
                  aria-label={`Explore ${item.title.toLowerCase()}`}
                >
                  EXPLORE DISCIPLINE
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
