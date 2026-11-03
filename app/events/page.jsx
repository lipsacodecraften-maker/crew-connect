"use client";

import { useEffect, useMemo, useState } from "react";
import useSectionMotion from "../components/useSectionMotion";
import Link from "next/link";
import Image from "next/image";
import './event.css';

function AnimatedMetric({ value, decimals = 0, suffix = "", padLength = 0 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frameId;
    const duration = 1500;
    let startTime;

    const tick = (timestamp) => {
      if (startTime === undefined) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = 1 - (1 - progress) ** 3;
      setCount(value * easedProgress);

      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [value]);

  const formattedCount = count.toFixed(decimals);
  const displayCount = padLength
    ? formattedCount.padStart(padLength, "0")
    : formattedCount;

  return <span className="cc-event-metric-number">{displayCount}{suffix}</span>;
}

const events = [
  {
    id: "01.A",
    zone: "BRC",
    city: "Vadodara",
    category: "wedding",
    categoryLabel: "LUXURY HERITAGE",
    title: "The Royal Heritage Sangeet & Grand Reception",
    venue: "Laxmi Vilas Palace Grounds",
    location: "VADODARA",
    image: "/images/event/royal.jpg",
    crew: 60,
    audience: "1,800 GUESTS",
    crewLabel: "STEWARDS",
    description:
      "Supplied 60 silver-service stewards, valet logistics dispatchers, and bilingual bride/groom personal coordinators across an 18-acre open palace estate.",
    roles: [
      "VIP SILVER SERVICE",
      "VALET RELAY",
      "HERITAGE ESCORTS",
    ],
    client: "Royal Heritage",
  },
  {
    id: "02.B",
    zone: "GNR",
    city: "Gandhinagar",
    category: "exhibition",
    categoryLabel: "TRADE EXPO PAVILION",
    title: "Vibrant Gujarat Logistics & Expo Pavilion",
    venue: "Helipad Exhibition Complex",
    location: "GANDHINAGAR",
    image: "/images/event/vibrant.jpg",
    crew: 35,
    audience: "12,000 VISITORS",
    crewLabel: "TECH STAFF",
    description:
      "Multi-day deployment featuring 35 badge scanning crews, stage riggers, load-in stagehands, and continuous booth logistics coordinators.",
    roles: [
      "TURNSTILE BADGING",
      "TECHNICAL RIGGER",
      "LOAD-IN CREW",
    ],
    client: "Vibrant Gujarat",
  },
  {
    id: "03.C",
    zone: "AMD",
    city: "Ahmedabad",
    category: "concert",
    categoryLabel: "ARENA CONCERT",
    title: "Acoustic Arena World Tour (Live Concert)",
    venue: "YMCA Club Arena, SG Highway",
    location: "AHMEDABAD",
    image: "/images/event/concert.jpg",
    crew: 52,
    audience: "8,500 ATTENDEES",
    crewLabel: "CREW",
    description:
      "Barricade containment, box office wristbanding, backstage artist runners, and green-room catering attendants across high-velocity 14-hour shifts.",
    roles: [
      "PIT BARRICADE OPS",
      "WRISTBAND VERIFICATION",
      "BACKSTAGE RELAY",
    ],
    client: "Acoustic Arena",
  },
  {
    id: "04.D",
    zone: "ST",
    city: "Surat",
    category: "corporate",
    categoryLabel: "COMMERCE GALA",
    title: "Annual International Buyers Conclave",
    venue: "Surat Diamond Bourse Atrium",
    location: "KHAJOD",
    image: "/images/event/international.jpg",
    crew: 40,
    audience: "SURAT",
    crewLabel: "PROTOCOL HOSTS",
    description:
      "Rigorous high-security buyer registration, Gujarati/English/Hindi bilingual hosts, VIP buyer escorts, and secure ballroom table stewardship.",
    roles: [
      "BILINGUAL CONCIERGE",
      "SECURE ESCORT",
      "HIGH-SECURITY BADGING",
    ],
    client: "International Buyers Conclave",
  },
  {
    id: "05.E",
    zone: "AMD",
    city: "Ahmedabad",
    category: "exhibition",
    categoryLabel: "CULTURAL BIENNALE",
    title: "Ahmedabad Contemporary Design Biennale",
    venue: "Sanskar Kendra Pavilion",
    location: "AHMEDABAD",
    image: "/images/event/design.jpg",
    crew: 22,
    audience: "5-DAY RESIDENCY",
    crewLabel: "DOCENTS",
    description:
      "Curatorial gallery docents, ticketing terminal operators, crowd cadence regulators, and artwork supervision personnel across five consecutive days.",
    roles: [
      "GALLERY DOCENTS",
      "CATALOG DESK",
      "ART SECURITY",
    ],
    client: "Contemporary Design Biennale",
  },
  {
    id: "06.F",
    zone: "GNR",
    city: "Gandhinagar",
    category: "corporate",
    categoryLabel: "TECH CONCLAVE",
    title: "Tech Gujarat Founder & Capital Conclave",
    venue: "GIFT City Club Auditorium",
    location: "GANDHINAGAR",
    image: "/images/event/tech-gujarat.jpeg",
    crew: 18,
    audience: "GIFT CITY",
    crewLabel: "SPECIALISTS",
    description:
      "Rapid keynote stage transitions, roving floor microphone handlers, VC lounge hospitality attendants, and digital attendee check-in tablets.",
    roles: [
      "MIC RUNNERS",
      "KEYNOTE STAGEHANDS",
      "VIP LOUNGE HOST",
    ],
    client: "Tech Gujarat",
  },
];

const categories = [
  { label: "ALL EVENTS", value: "all", count: 48 },
  { label: "GRAND WEDDINGS & RECEPTIONS", value: "wedding", count: 16 },
  { label: "CORPORATE SUMMITS", value: "corporate", count: 14 },
  { label: "EXHIBITIONS & TRADE EXPOS", value: "exhibition", count: 10 },
  { label: "LIVE CONCERTS & FESTIVALS", value: "concert", count: 8 },
];

const zones = [
  { label: "ALL GUJARAT", value: "all" },
  { label: "AMD // AHMEDABAD", value: "AMD" },
  { label: "GNR // GANDHINAGAR", value: "GNR" },
  { label: "BRC // VADODARA", value: "BRC" },
  { label: "ST // SURAT", value: "ST" },
];

const divisions = [
  { name: "VIP Protocol & Diplomatic Concierge", count: "14 STAFF" },
  { name: "Multilingual Check-in Desk & RFID Badging", count: "16 STAFF" },
  { name: "Stage AV Runners & Keynote Teleprompter Support", count: "08 STAFF" },
  { name: "Executive Perimeter Stewards", count: "10 STAFF" },
];

export default function EventPage() {
  useSectionMotion(".cc-events");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeZone, setActiveZone] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const openEvent = (event) => {
    const card = document.getElementById(`event-card-${event.id}`);
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setSelectedEvent(event), card ? 450 : 0);
  };

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      const matchesCategory =
        activeCategory === "all" || event.category === activeCategory;

      const matchesZone =
        activeZone === "all" || event.zone === activeZone;

      const searchableText = [
        event.title,
        event.venue,
        event.location,
        event.city,
        event.client,
        event.categoryLabel,
        ...event.roles,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        query === "" || searchableText.includes(query);

      return matchesCategory && matchesZone && matchesSearch;
    });
  }, [activeCategory, activeZone, searchQuery]);

  return (
    <main className="cc-events">
      {/* ARCHIVE HERO */}
      <section className="cc-event-hero" id="event-archive">
        <div className="cc-event-topline">
          <span>ARCHIVE CLASSIFICATION // DOSSIER 03</span>
          <span className="cc-event-top-dot">●</span>
          <span>OPERATIONAL DISPATCH REGISTRY · GUJARAT CORRIDOR</span>
          <span className="cc-event-verification">
            VERIFIED METRICS: Q1-2025 COMPLIANT
          </span>
        </div>

        <div className="cc-event-hero-content">
          <div className="cc-event-hero-left">
            <div className="cc-event-hero-copy">
              <div className="cc-event-eyebrow">
                <span>03 // DISPATCH PORTFOLIO</span>
                <span>GUJARAT JURISDICTION</span>
              </div>

              <div className="cc-event-active">
                <span className="cc-event-status-dot" />
                ACTIVE BROADSHEET
              </div>

              <h1>
                THE PEOPLE BEHIND
                <br />
                <span> THE EXPERIENCE.</span>
              </h1>

              <p className="cc-event-intro">
                A verified operational record of sovereign summits, royal
                receptions, technical expos, and high-density arena productions
                powered by Crew Connect&apos;s credentialed on-demand talent
                across Ahmedabad, Gandhinagar, Vadodara, and Surat.
              </p>

              <a className="cc-event-scroll-link" href="#curated-archive">
                EXPLORE THE ARCHIVE <span>↓</span>
              </a>
            </div>

          </div>
          <div className="cc-event-hero-right">
            <div className="cc-event-telemetry">
              <div className="cc-event-telemetry-heading">
                <span>LIVE FLEET TELEMETRY</span>
                <span className="cc-event-system-status">
                  <span className="cc-event-status-dot" />
                  SYSTEM NOMINAL
                </span>
              </div>

              <div className="cc-event-metrics-grid">
                <div className="cc-event-metric">
                  <AnimatedMetric value={480} suffix="+" />
                  <span className="cc-event-metric-label">EVENTS MOBILIZED</span>
                </div>

                <div className="cc-event-metric">
                  <AnimatedMetric value={4} padLength={2} />
                  <span className="cc-event-metric-label">COMMAND HUBS</span>
                </div>

                <div className="cc-event-metric">
                  <AnimatedMetric value={99.2} decimals={1} suffix="%" />
                  <span className="cc-event-metric-label">SHIFT COMPLETION</span>
                </div>

                <div className="cc-event-metric">
                  <AnimatedMetric value={0} decimals={2} />
                  <span className="cc-event-metric-label">INFRACTION RATE</span>
                </div>
              </div>

              <div className="cc-event-telemetry-footer">


                <div className="cc-event-response">
                  <span>AVERAGE STANDBY RESPONSE</span>
                  <strong>14.2 MIN</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENT ARCHIVE FILTERS */}
      <section className="cc-event-filters" aria-label="Filter events">
        <div className="cc-event-category-filter">
          <div className="cc-event-category-options">
            {categories.map((category) => (
              <button
                type="button"
                key={category.value}
                className={
                  activeCategory === category.value
                    ? "cc-event-filter-btn active"
                    : "cc-event-filter-btn"
                }
                onClick={() => setActiveCategory(category.value)}
                aria-pressed={activeCategory === category.value}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        <div className="cc-event-search-row">
          <div className="cc-event-zone-filter">
            <span className="cc-event-filter-label">ZONE FILTER //</span>
            <div className="cc-event-zone-options">
              {zones.map((zone) => (
                <button
                  type="button"
                  key={zone.value}
                  className={
                    activeZone === zone.value
                      ? "cc-event-zone-btn active"
                      : "cc-event-zone-btn"
                  }
                  onClick={() => setActiveZone(zone.value)}
                  aria-pressed={activeZone === zone.value}
                >
                  {zone.label}
                </button>
              ))}
            </div>
          </div>

          <label className="cc-event-search">
            <span className="cc-event-search-icon" aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="SEARCH BY VENUE, CLIENT, ROLE..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              aria-label="Search events by venue, client, title or role"
            />
            {searchQuery && (
              <button
                type="button"
                className="cc-event-clear-search"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </label>
        </div>
      </section>

      {/* FEATURED DOSSIER */}
      <section className="cc-event-featured" id="featured-event">
        <div className="cc-event-section-heading">
          <div>
            <span className="cc-event-section-index">
              LANDMARK ARCHIVE 01.0
            </span>
            <h2>ENTERPRISE HEADLINE DISPATCH</h2>
          </div>

          <span className="cc-event-verified-tag">
            <span className="cc-event-status-dot" />
            VERIFIED DEPLOYMENT
          </span>
        </div>

        <div className="cc-event-featured-layout">
          <div className="cc-event-featured-image">
            <Image
              src="/images/event/Exhibition.jpg"
              alt="Leadership summit in a convention and exhibition centre"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
            />

            <div className="cc-event-image-overlay" />

            <div className="cc-event-featured-image-top">
              <span>SUMMIT CODE // ZYD-2025-LDR</span>
              <span>VERIFIED DEPLOYMENT</span>
            </div>


            <div className="cc-event-image-roster">
              <span className="cc-event-image-roster-label">
                CREW ROSTER MANIFEST
              </span>
              <div className="cc-event-image-roster-stats">
                <strong>48 CERTIFIED AGENTS</strong>
                <span aria-hidden="true">•</span>
                <strong>04 SECTORS SECURED</strong>
                <span aria-hidden="true">•</span>
                <strong>00 ESCALATIONS</strong>
              </div>
            </div>
          </div>

          <div className="cc-event-featured-content">
            <div className="cc-event-featured-details">
              <div className="cc-event-featured-title">
                <span className="cc-event-kicker">
                  MAHATMA MANDIR CONVENTION & EXHIBITION CENTRE
                </span>

                <h3>
                  ZYDUS ANNUAL
                  <br />
                  LEADERSHIP SUMMIT
                </h3>
              </div>

              <div className="cc-event-division-table">
                <div className="cc-event-division-heading">
                  <span>DEPLOYED DIVISIONS</span>
                  <span>CREW COUNT</span>
                </div>
                <div className="cc-event-divisions">
                  {divisions.map((division) => (
                    <div className="cc-event-division" key={division.name}>
                      <span>{division.name}</span>
                      <strong>{division.count}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <blockquote className="cc-event-testimonial">
                <p>
                  “Crew Connect eliminated our primary execution anxiety.
                  Handling over 2,400 senior stakeholders with zero check-in
                  bottlenecks across three convention halls in Gandhinagar
                  requires razor-sharp discipline.”
                </p>
                <cite>
                  — RAJESH MEHTA, VP CORPORATE COMMUNICATIONS, EVENT STEERING
                  BOARD
                </cite>
              </blockquote>
            </div>

            <div className="cc-event-featured-actions">
              <Link href="/contact" className="cc-event-primary-btn">
                HIRE SIMILAR ROSTER <span>→</span>
              </Link>

              <button
                type="button"
                className="cc-event-text-btn"
                onClick={() =>
                  setSelectedEvent({
                    title: "Zydus Annual Leadership Summit",
                    venue: "Mahatma Mandir Convention & Exhibition Centre",
                    location: "Gandhinagar",
                    crew: 48,
                    audience: "2,400 DELEGATES",
                    description:
                      "Executive summit deployment covering VIP protocol, multilingual check-in, RFID badging, stage AV support, keynote teleprompter operations and executive perimeter management.",
                    roles: divisions.map((division) => division.name),
                  })
                }
              >
                AUDIT CASE BRIEF <span>↗</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CURATED EVENT ARCHIVE */}
      <section className="cc-event-archive" id="curated-archive">
        <div className="cc-event-section-heading cc-event-archive-heading">
          <div>
            <span className="cc-event-section-index">
              04 // CURATED PRODUCTION ARCHIVE
            </span>
            <h2>OPERATIONAL MANIFESTS ACROSS GUJARAT REGION</h2>
          </div>

          <span className="cc-event-archive-count">
            SHOWING {filteredEvents.length} REGISTERED {filteredEvents.length === 1 ? "DOSSIER" : "DOSSIERS"}
          </span>
        </div>

        {/* EVENT CARDS */}
        {filteredEvents.length > 0 ? (
          <div className="cc-event-grid">
            {filteredEvents.map((event) => (
              <article
                className="cc-event-card"
                id={`event-card-${event.id}`}
                key={event.id}
                tabIndex={0}
                aria-label={`Open specification for ${event.title}`}
                onClick={() => openEvent(event)}
                onKeyDown={(keyboardEvent) => {
                  if (
                    keyboardEvent.target === keyboardEvent.currentTarget &&
                    (keyboardEvent.key === "Enter" || keyboardEvent.key === " ")
                  ) {
                    keyboardEvent.preventDefault();
                    openEvent(event);
                  }
                }}
              >
                <div className="cc-event-card-topline">
                  <span>[{event.id} / {event.zone}]</span>
                  <span className="cc-event-card-category">{event.categoryLabel}</span>
                </div>

                <div className="cc-event-card-image">
                  <Image
                    src={event.image}
                    alt={`${event.title} at ${event.venue}`}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                  />

                  <div className="cc-event-card-image-overlay" />
                  <div className="cc-event-card-stats cc-event-card-image-stats">
                    <span>
                      {event.crew} {event.crewLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{event.audience}</span>
                  </div>
                </div>

                <div className="cc-event-card-body">
                  <div className="cc-event-card-venue">
                    {event.venue} · {event.location}
                  </div>

                  <h3>{event.title}</h3>

                  <p className="cc-event-card-description">
                    {event.description}
                  </p>

                  <div className="cc-event-card-roles">
                    {event.roles.map((role) => (
                      <span key={role}>{role}</span>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="cc-event-specification-btn"
                    onClick={(clickEvent) => {
                      clickEvent.stopPropagation();
                      openEvent(event);
                    }}
                  >
                    VIEW SPECIFICATION <span>↗</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="cc-event-empty">
            <span>NO MATCHING DOSSIERS FOUND</span>
            <p>
              Try another classification, Gujarat zone, venue, client or
              staff role.
            </p>

            <button
              type="button"
              className="cc-event-primary-btn"
              onClick={() => {
                setActiveCategory("all");
                setActiveZone("all");
                setSearchQuery("");
              }}
            >
              RESET ALL FILTERS <span>↻</span>
            </button>
          </div>
        )}


      </section>

      {/* DISPATCH PROTOCOL */}
      <section className="cc-event-protocol">
        <div className="cc-event-protocol-heading">
          <article className="cc-event-protocol-reference">
            <span>05 // ARCHITECTURAL REDUNDANCY</span>
            <h3>THE ZERO-FAILURE DISPATCH PROTOCOL.</h3>
            <p>
              Standardized deployment parameters designed to withstand sudden
              guest spikes, credential anomalies, and immediate venue
              redistributions across Gujarat.
            </p>
          </article>
          <article className="cc-event-protocol-reference">
            <svg className="cc-event-protocol-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true" focusable="false">
              <circle cx="10" cy="10" r="5" />
              <circle cx="10" cy="10" r="1.5" />
              <path d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M16 4l-1.4 1.4M5.4 14.6 4 16M16 16l-1.4-1.4M5.4 5.4 4 4" />
            </svg>
            <span>STANDBY RESERVE // 10% BUFFER</span>
            <h3>15-KM RADIUS HOT STANDBY</h3>
            <p>
              Every deployment over 20 personnel automatically
              assigns a 10% unbilled standby squad stationed within
              15 km of Mahatma Mandir, YMCA SG Highway, or Surat
              Exhibition Grounds for rapid 20-minute drop-in
              replacement.
            </p>
            <span>AVERAGE REPLACEMENT LATENCY: &lt; 22 MIN</span>
          </article>
          <article className="cc-event-protocol-reference">
            <svg className="cc-event-protocol-icon" viewBox="0 0 20 22" fill="none" aria-hidden="true" focusable="false">
              <path d="M10 1.2 18 4v5.1c0 5.1-3.3 8.4-8 10.7C5.3 17.5 2 14.2 2 9.1V4l8-2.8Z" />
              <path d="m6.7 10.5 2.1 2.1 4.6-4.8" />
            </svg>
            <span>DRESS STANDARD // CLASS A</span>
            <h3>UNIFIED ATTIRE & SECURE BADGING</h3>
            <p>
              Rigid monochrome wardrobe requirements: tailored all-
              black buttoned uniforms, matte black footwear,
              discrete acoustic-tube earpieces, and tamper-evident
              QR digital credentials verified via municipal security
              records.
            </p>
            <span>100% PRE-SHIFT GROOMING CLEARANCE</span>
          </article>
        </div>

        <div className="cc-event-final-cta">
          <div>
            <span>PLANNING A PRODUCTION IN GUJARAT?</span>
            <h2>
              SECURE YOUR MANIFEST IN UNDER 4 HOURS.
            </h2>

            <p>
              From a 10-person registration team in GIFT City to a 100-steward
              luxury wedding crew in Vadodara, direct your specifications to
              our Gujarat dispatch room.
            </p>
          </div>

          <div className="cc-event-final-actions">
            <Link href="/contact" className="cc-event-primary-btn">
              HIRE EVENT STAFF <span>→</span>
            </Link>

            <Link href="/contact" className="cc-event-secondary-btn">
              SUBMIT TENDER BRIEF <span>↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* EVENT SPECIFICATION MODAL */}
      {
        selectedEvent && (
          <div
            className="cc-event-modal-backdrop"
            onClick={() => setSelectedEvent(null)}
          >
            <section
              className="cc-event-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cc-event-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="cc-event-modal-layout">
                <div className="cc-event-modal-main">
                  <div className="cc-event-modal-header">
                    <span>ARCHIVE SPECIFICATION // VERIFIED RECORD</span>

                    <button
                      type="button"
                      onClick={() => setSelectedEvent(null)}
                      aria-label="Close event specification"
                    >
                      ×
                    </button>
                  </div>

                  <h2 id="cc-event-modal-title">{selectedEvent.title}</h2>

                  <p className="cc-event-modal-venue">
                    {selectedEvent.venue} · {selectedEvent.location}
                  </p>

                  <div className="cc-event-modal-stat">
                    <span>DEPLOYED CREW</span>
                    <strong>{selectedEvent.crew} PERSONNEL</strong>
                  </div>

                  <p className="cc-event-modal-description">
                    {selectedEvent.description}
                  </p>

                  <span className="cc-event-modal-label">DEPLOYED ROLES</span>

                  <div className="cc-event-modal-roles">
                    {selectedEvent.roles.map((role) => (
                      <span key={role}>{role}</span>
                    ))}
                  </div>

                  <div className="cc-event-modal-actions">
                    <Link href="/contact" className="cc-event-primary-btn">
                      HIRE SIMILAR ROSTER <span>→</span>
                    </Link>

                    <button
                      type="button"
                      className="cc-event-secondary-btn"
                      onClick={() => setSelectedEvent(null)}
                    >
                      CLOSE DOSSIER
                    </button>
                  </div>
                </div>

                <aside className="cc-event-modal-related" aria-label="Other events">
                  <span className="cc-event-modal-label">OTHER EVENTS</span>
                  <div className="cc-event-modal-related-list">
                    {filteredEvents
                      .filter((event) => event.id !== selectedEvent.id)
                      .map((event) => (
                        <button
                          type="button"
                          className="cc-event-modal-related-item"
                          key={event.id}
                          onClick={() => openEvent(event)}
                        >
                          <span>[{event.id} / {event.zone}]</span>
                          <strong>{event.title}</strong>
                        </button>
                      ))}
                  </div>
                </aside>
              </div>
            </section>
          </div>
        )
      }
    </main >
  );
}
