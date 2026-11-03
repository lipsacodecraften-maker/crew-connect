"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSectionMotion from "../components/useSectionMotion";
import "./blogs.css";

function CountUp({ value, decimals = 0, prefix = "", suffix = "", label }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setCount(value);
      setStarted(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true);
        observer.disconnect();
      }
    }, { threshold: 0.35 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);

  useEffect(() => {
    if (!started) return undefined;

    let frameId;
    let startTime;
    const duration = 1400;
    const tick = (timestamp) => {
      if (startTime === undefined) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setCount(value * eased);
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [started, value]);

  return <span ref={elementRef} aria-label={label}>{prefix}{count.toFixed(decimals)}{suffix}</span>;
}

const categories = [
  "All articles",
  "Event planning",
  "Hospitality protocols",
  "Logistics & crew tradecraft",
  "Gujarat police & compliance",
  "Candidate dispatches",
];

const articles = [
  {
    id: "118",
    city: "Gandhinagar // 079",
    category: "Guest operations",
    topic: "Hospitality protocols",
    read: "6 min read",
    title: "The art of guest management: how bottleneck analysis cuts VIP entry wait times under 90 seconds at Mahatma Mandir.",
    description: "Analyzing entry chokepoints during international summits and designing multi-tiered security funnels that respect state protocol without causing vehicular pileups.",
    date: "April 10, 2025",
    image: "/images/blog/blog-1.png",
  },
  {
    id: "117",
    city: "Gujarat-wide",
    category: "Crew career",
    topic: "Candidate dispatches",
    read: "5 min read",
    title: "What every crew member should know before their first shift: grooming standards, radio etiquette, and the zero-delay mandate.",
    description: "A field guide to passing morning inspection, channel discipline on two-way radios, and why arriving 15 minutes early is already on the verge of late.",
    date: "April 08, 2025",
    image: "/images/blog/blog-2.jpg",
  },
  {
    id: "116",
    city: "Legal desk // AMD · Surat",
    category: "Regulatory & safety",
    topic: "Gujarat police & compliance",
    read: "7 min read",
    title: "Navigating PSARA compliance and event security licensing in Ahmedabad & Surat: an organizer’s essential checklist.",
    description: "A comprehensive legal dossier covering state bouncer registration, jurisdictional fire clearances notifications, and mandatory emergency exit-to-guard ratios.",
    date: "April 05, 2025",
    image: "/images/blog/blog-3.jpg",
  },
  {
    id: "115",
    city: "Vadodara // 0265",
    category: "Production AV",
    topic: "Logistics & crew tradecraft",
    read: "6 min read",
    title: "Technical production crewing: why stage hands and lighting console operators require standardized rigging certification.",
    description: "Mitigating catastrophic stage failure through certified ground support calculations and strict electrical distribution load distribution guidelines.",
    date: "April 02, 2025",
    image: "/images/blog/blog-4.jpg",
  },
  {
    id: "114",
    city: "GIFT City // GNR",
    category: "Case methodology",
    topic: "Event planning",
    read: "9 min read",
    title: "Managing 4,000-attendee medical congresses: case study on delegate badging and queue balancing.",
    description: "How deploying 24 trained hostess stations with RFID sync eradicated morning rush bottlenecks and kept parallel keynote sessions precisely on schedule.",
    date: "March 29, 2025",
    image: "/images/blog/blog-5.jpg",
  },
  {
    id: "113",
    city: "Finance desk",
    category: "Dispatch operations",
    topic: "Candidate dispatches",
    read: "4 min read",
    title: "Direct NEFT & UPI payouts: why transparent financial logistics retain Gujarat’s top 5% event talent.",
    description: "Field evidence showing how automated 24-hour shift disbursements cut no-show rates by 42% across consecutive multi-day wedding and expos schedules.",
    date: "March 24, 2025",
    image: "/images/blog/blog-6.jpg",
  },
];

export default function BlogPage() {
  useSectionMotion(".cc-blog");
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesCategory = activeCategory === categories[0] || article.topic === activeCategory;
      const matchesQuery = !q || `${article.title} ${article.description} ${article.city} ${article.category} ${article.topic}`.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const featured = {
    title: "Planning event staffing for high-stakes weddings in Gujarat: a 48-hour logistical playbook.",
    description: "From coordinating multi-dietary banquet rotations to navigating 1,500-guest sangeet arrivals across SG Highway and Vadodara heritage estates, why precision staffing beats raw headcount volume every single time.",
  };

  function chooseCategory(category) {
    setActiveCategory(category);
    setPage(1);
  }

  function submitNewsletter(event) {
    event.preventDefault();
    if (email.trim()) setSubscribed(true);
  }

  return (
    <main className="cc-blog">
      <section className="blog-hero">
        <div className="blog-container">
          <div className="blog-kicker">
            <span className="blog-live-dot" />04 // EDITORIAL DESK · OPERATIONAL BROADSHEET
          </div>
          <div className="blog-hero-row">
            <div className="blog-heading-block">
              <h1>THE WORK BEHIND THE MOMENT.</h1>
              <p>Field notes, staffing logistics, regulatory compliance, and backstage tradecraft from Gujarat’s premier commercial and cultural event circuit.</p>
            </div>
            <div className="blog-issue-card">
              <div className="issue-column">
                <span className="issue-label">ISSUE VOL. XXIV</span>
                <strong>Q2 ARCHIVE · GUJARAT CIRCUIT</strong>
              </div>
              <span className="issue-divider" aria-hidden="true" />
              <div className="issue-column issue-column-right">
                <span className="issue-label">ACTIVE CREW NODES</span>
                <strong>AMD · GNR · BRC · ST</strong>
              </div>
            </div>
          </div>
          <div className="blog-search-panel">
            <label className="blog-search">
              <svg aria-hidden="true" viewBox="0 0 20 20">
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="m13 13 4 4" />
              </svg>
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search articles, protocols, city guides, incident logs..." aria-label="Search dispatches" />
            </label>
            <div className="blog-categories" aria-label="Filter by category">
              {categories.map((category) =>
                <button key={category} onClick={() => chooseCategory(category)} className={activeCategory === category ? "is-active" : ""} aria-pressed={activeCategory === category}>{category}
                </button>)}
            </div>
          </div>
        </div>
      </section>

      <section className="blog-feature-section">
        <div className="blog-container">
          <article className="feature-card">
            <div className="feature-image" role="img" aria-label="Event team coordinating guest arrivals at a venue">
              <div className="feature-image-top">
                <span>Cover feature · 01</span>
                <span>Field verified</span>
              </div>

              <div className="image-dispatch-ref">
                <span>DISPATCH REF // AMD-STG-9402</span>
                <span>LOCATION: SG HIGHWAY ESTATE CORRIDOR</span>
              </div>
            </div>
            <div className="feature-copy">
              <div className="feature-meta">
                <span>HOSPITALITY & PLANNING</span>
                <span>8 MIN READ</span>
              </div>
              <div className="feature-location">AHMEDABAD HUB <span>•</span> DISPATCH #118</div>
              <h2>Planning event staffing for high-stakes weddings in Gujarat: a 48-hour logistical playbook.</h2>
              <p>From coordinating multi-dietary banquet rotations to navigating 1,500-guest sangeet arrivals across SG Highway and Vadodara heritage estates, why precision staffing beats raw headcount volume every single time.</p>
              <div className="feature-stats">
                <div>
                  <strong><CountUp value={99.4} decimals={1} suffix="%" label="99.4 percent" /></strong>
                  <small>PUNCTUALITY SCORE</small>
                </div>
                <div>
                  <strong>&lt;<CountUp value={120} suffix="s" label="less than 120 seconds" /></strong>
                  <small>STEWARD ROTATION CYCLE</small>
                </div>
              </div>
              <div className="feature-action-row">
                <div className="feature-author">
                  <span className="feature-author-mark">ED</span>
                  <span className="feature-author-copy">
                    <strong>BY EDITORIAL DESK</strong>
                    <small>PUBLISHED 14 APRIL 2025</small>
                  </span>
                </div>
                <button className="text-link" onClick={() =>
                  setSelectedArticle({
                    ...featured, category: "Hospitality & planning",
                    date: "Published 14 April 2025", read: "8 min read"
                  })}>
                  <span className="text-link-arrow" aria-hidden="true">→</span>Read full dispatch
                </button>
              </div>
            </div>
          </article>

        </div>
      </section>

      <section className="blog-telemetry">
        <div className="telemetry-grid">
          <div className="telemetry-stat">
            <div className="telemetry-stat-heading"><span>DISPATCH DENSITY // Q2</span><svg className="telemetry-icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M1.5 1.5h11v11h-11zM4 10V7m3 3V4m3 6V6.5" /></svg></div>
            <div className="telemetry-value-row"><strong><CountUp value={142} label="142" /></strong><small>+18.4% MoM</small></div>
            <p>Published operational manuals, checklists, and incident analyses.</p>
          </div>
          <div className="telemetry-stat">
            <div className="telemetry-stat-heading"><span>AUDIENCE READERSHIP</span><svg className="telemetry-icon telemetry-icon-people" viewBox="0 0 17 12" aria-hidden="true"><path d="M6 5.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Zm4.5-1.25a2 2 0 1 0 0-4m-10 11V9.9c0-.65.35-1.2.95-1.5A10 10 0 0 1 6 7.25c1.65 0 3.15.4 4.55 1.15.6.3.95.85.95 1.5v1.35Zm11 0V9.75c0-.85-.6-1.65-1.7-2.2a9 9 0 0 0-2.2-.8" /></svg></div>
            <div className="telemetry-value-row"><strong><CountUp value={18.6} decimals={1} suffix="K" label="18.6 thousand" /></strong><small>PRODUCERS</small></div>
            <p>Active Gujarat event directors, venue GMs, and stage coordinators.</p>
          </div>
          <div className="telemetry-stat">
            <div className="telemetry-stat-heading"><span>COMPLIANCE READINESS</span><svg className="telemetry-icon telemetry-icon-shield" viewBox="0 0 12 15" aria-hidden="true"><path d="M6 1 10.5 2.7v4.1c0 3-1.8 5.5-4.5 6.9C3.3 12.3 1.5 9.8 1.5 6.8V2.7L6 1Z" /><path d="m3.7 7.1 1.5 1.5 3.2-3.2" /></svg></div>
            <div className="telemetry-value-row"><strong><CountUp value={100} suffix="%" label="100 percent" /></strong><small>PSARA ALIGNED</small></div>
            <p>Statutory municipal and state security staffing clearance rate.</p>
          </div>
          <div className="telemetry-stat telemetry-chart-card">
            <div className="telemetry-stat-heading"><span>CIRCUIT TELEMETRY</span><small>LIVE HOURLY</small></div>
            <svg className="telemetry-chart" viewBox="0 0 258 48" preserveAspectRatio="none" role="img" aria-label="Hourly circuit activity trending upward">
              <path className="telemetry-chart-fill" d="M0 40 L30 34 L55 37 L82 20 L107 27 L134 13 L158 20 L184 9 L209 17 L234 3 L258 8 L258 48 L0 48Z" />
              <path className="telemetry-chart-line" d="M0 40 L30 34 L55 37 L82 20 L107 27 L134 13 L158 20 L184 9 L209 17 L234 3 L258 8" />
            </svg>
            <div className="telemetry-peak">PEAK SURGE: SURAT CONVENTION WEEK</div>
          </div>
        </div>
      </section>

      <section className="blog-archive" id="dispatch-chronology">
        <div className="blog-container">
          <div className="archive-heading">
            <div>
              <div className="overline">Dispatch chronology</div>
              <h2>BACKSTAGE TRADE &amp; FIELD GUIDES
              </h2>
            </div>
            <div className="archive-count">
              <span>FILTERING: {activeCategory === categories[0] ? "ALL CATEGORIES" : activeCategory.toUpperCase()} • {filtered.length} RECENT PRINTS</span>
            </div>
          </div>
          {filtered.length ?
            <div className="article-grid">{filtered.map((article, index) =>
              <article className="article-card" key={article.id}>
                <div className="article-image" style={{ "--article-image": `url(${article.image})` }}>
                  <span className="article-city-badge">{article.city}</span>
                  <span className="article-image-arrow">↗</span>
                  <span className="article-read-badge">{article.read}</span>
                </div>
                <div className="article-card-content">
                  <span className="article-category">{article.category}</span>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <div className="article-bottom">
                    <span>{article.date}</span>
                    <button onClick={() => setSelectedArticle(article)}>Dispatch <span>→</span>
                    </button>
                  </div>
                </div>
              </article>)}
            </div> :
            <div className="empty-results">
              <span>NO DISPATCHES FOUND</span>
              <p>Try a different search or select another category.</p>
              <button onClick={() => { setQuery(""); chooseCategory(categories[0]); }}>Clear filters ↗
              </button>
            </div>}
          <div className="archive-pagination">
            <span>SHOWING {filtered.length ? String((page - 1) * 6 + 1).padStart(2, "0") : "00"} – {String(Math.min(page * 6, filtered.length)).padStart(2, "0")} OF {activeCategory === categories[0] && !query.trim() ? 48 : filtered.length} DISPATCHES</span>
            <div>
              <button type="button" disabled={page === 1} onClick={() => setPage(Math.max(1, page - 1))}>← PREVIOUS ARCHIVE</button>
              <button type="button" className="page-number is-current" aria-current="page">1</button>
              <button type="button" disabled>2</button>
              <button type="button" disabled>3</button>
              <button type="button" disabled>NEXT ARCHIVE →</button>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-newsletter">
        <div className="newsletter-layout">
          <div className="newsletter-copy">
            <div className="overline">Knowledge terminal transmission</div>
            <h2>RECEIVE THE MONTHLY CREW CONNECT<br />
              <span>DISPATCH.</span>
            </h2>
            <p>Direct field intelligence for Gujarat venue operators, production managers, and lead coordinators. Curated staffing post-mortems, regulatory updates, and tradecraft shifts delivered once per month.</p>
            <form onSubmit={submitNewsletter}>
              <label className="sr-only" htmlFor="blog-email">Work email address</label>
              <input id="blog-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter work email address..." required disabled={subscribed} />
              <button type="submit" disabled={subscribed}>
                {subscribed ? "YOU’RE ON THE LIST ✓" : "SUBSCRIBE TO FIELD NOTES →"}
              </button>
            </form>
            <div className="newsletter-assurances">
              <span><svg className="assurance-icon" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 1 12 3v3.5c0 3-2 5.3-5 6.5-3-1.2-5-3.5-5-6.5V3z" /><path d="m4.2 6.8 1.8 1.8 3.8-3.8" /></svg>STRICT ZERO-SPAM POLICY</span>
              <span><svg className="assurance-icon assurance-lock" viewBox="0 0 10 14" aria-hidden="true"><path d="M2 6V4a3 3 0 0 1 6 0v2M1 6h8v7H1zM5 9v2" /></svg>ENCRYPTED READER PRIVACY</span>
              <span><svg className="assurance-icon assurance-clock" viewBox="0 0 13 13" aria-hidden="true"><circle cx="6.5" cy="6.5" r="5.5" /><path d="M6.5 3.5v3l2 1.5" /></svg>1 DISPATCH / 30 DAYS</span>
            </div>
          </div>
        </div>
      </section>

      <section className="blog-cta">
        <div className="cta-grid">
          <div className="cta-card cta-organizer">
            <div className="cta-card-copy">
              <span className="overline">01 // Producers • venue operators</span>
              <h2>Need a crew for an upcoming date?</h2>
              <p>Directly access pre-screened hospitality staff, technical stagehands, and VIP coordinators across Ahmedabad, Gandhinagar, Surat, and Vadodara.</p>
            </div>
            <a href="/hire-staff">Hire staff <span>→</span></a>
          </div>
          <div className="cta-card cta-talent">
            <div className="cta-card-copy">
              <span className="overline">02 // Talent • field professionals</span>
              <h2>Want to contribute or join<br />roster?</h2>
              <p>Submit field post-mortems for editorial compensation, or enroll in active shifts across premier high-production events in Gujarat.</p>
            </div>
            <a href="/join-crew">Join the crew <span>↗</span></a>
          </div>
        </div>
      </section>

      {selectedArticle && <div className="article-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedArticle(null); }}>
        <article className="article-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close" onClick={() => setSelectedArticle(null)} aria-label="Close dispatch">×</button>
          <div className="overline">Crew Connect / Editorial desk / Dispatch {selectedArticle.id || "118"}</div>
          <span className="article-category">{selectedArticle.category}</span>
          <h2 id="modal-title">{selectedArticle.title}</h2>
          <p>{selectedArticle.description}</p>
          <div className="modal-note">{selectedArticle.date} <span>·</span> {selectedArticle.read}</div>
          <a className="text-link" href="/hire-staff">Plan your next event with Crew Connect <span>↗</span></a>
        </article>
      </div>}
    </main>
  );
}
