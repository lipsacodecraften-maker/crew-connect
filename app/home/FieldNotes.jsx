
import Link from "next/link";
import "./FieldNotes.css";

const dispatches = [
  {
    category: "OP-ED",
    date: "OCTOBER 2024",
    readTime: "6 MIN READ",
    title: "PLANNING EVENT STAFFING FOR A GRAND WEDDING IN GUJARAT",
    description:
      "Navigating multi-day dietary protocols, high-velocity guest turnarounds, and VIP coordination without compromising warmth.",
    image: "/images/field-notes/Background-1.png",
    imageAlt: "Hospitality team preparing for a grand wedding reception",
    href: "/dispatches/event-staffing-gujarat-wedding",
  },
  {
    category: "METHODOLOGY",
    date: "NOVEMBER 2024",
    readTime: "4 MIN READ",
    title: "THE ART OF GUEST MANAGEMENT AT SCALE",
    description:
      "How bottleneck analysis and clear attendee segmentation make registration desks at trade exhibitions practically invisible.",
    image: "/images/field-notes/Background-2.png",
    imageAlt: "Event registration team welcoming exhibition attendees",
    href: "/dispatches/guest-management-at-scale",
  },
  {
    category: "FIELD GUIDE",
    date: "DECEMBER 2024",
    readTime: "5 MIN READ",
    title: "WHAT EVENT CREW MEMBERS SHOULD KNOW BEFORE THEIR FIRST SHIFT",
    description:
      "Professional grooming baselines, radio etiquette, spatial awareness, and what top event directors immediately notice.",
    image: "/images/field-notes/Background-3.jpg",
    imageAlt: "Event crew preparing backstage before an event",
    href: "/dispatches/event-crew-first-shift",
  },
];

export default function FieldNotes() {
  return (
    <section className="field-notes-section" id="field-notes">
      <div className="field-notes-container">
        <header className="field-notes-header">
          <div className="field-notes-heading-group">
            <p className="field-notes-eyebrow">06 // FIELD NOTES</p>
            <h2>THE WORK BEHIND THE MOMENT</h2>
          </div>

          <Link
            href="/dispatches"
            className="field-notes-all-link"
          >
            <span>READ ALL DISPATCHES</span>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 13 13 3M4 3h9v9"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </header>

        <div className="field-notes-grid">
          {dispatches.map((dispatch) => (
            <article
              className="field-notes-card"
              key={dispatch.category}
            >
              <div className="field-notes-card-main">
                <Link
                  href={dispatch.href}
                  className="field-notes-image-link"
                  aria-label={`Read ${dispatch.title}`}
                >
                  <div className="field-notes-image-wrap">
                    <img
                      src={dispatch.image}
                      alt={dispatch.imageAlt}
                      className="field-notes-image"
                      loading="lazy"
                    />
                    
                  </div>
                </Link>

                <div className="field-notes-meta">
                  <span>{dispatch.category}</span>
                  <span className="field-notes-dot" aria-hidden="true">
                    •
                  </span>
                  <span>{dispatch.date}</span>
                  <span className="field-notes-dot" aria-hidden="true">
                    •
                  </span>
                  <span>{dispatch.readTime}</span>
                </div>

                <h3>
                  <Link href={dispatch.href}>
                    {dispatch.title}
                  </Link>
                </h3>

                <p className="field-notes-description">
                  {dispatch.description}
                </p>
              </div>

              <Link
                href={dispatch.href}
                className="field-notes-read-link"
              >
                <span>READ DISPATCH</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10h12m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
