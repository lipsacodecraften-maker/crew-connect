
import "./SectorProfiles.css";

const sectors = [
  {
    code: "AMD // AHMEDABAD",
    title: "WEDDINGS & GRAND RECEPTIONS",
    description:
      "Bespoke hospitality, royal dining stewards, and family liaison teams.",
    image: "/images/sector/wedding.png",
    className: "sector-card--corporate",
  },
  {
    code: "GNR // GANDHINAGAR",
    title: "CORPORATE GALAS & SUMMITS",
    description:
      "Confidential boardroom hosts, registration desk leads, and AV ops.",
    image:
      "/images/sector/summit.png",
    className: "sector-card--wedding",
  },
  {
    code: "BRC // VADODARA",
    title: "PRIVATE CELEBRATIONS",
    description:
      "Discrete, boutique staffing for milestone gatherings.",
    image:
      "/images/sector/celebration.png",
    className: "sector-card--private",
  },
  {
    code: "ST // SURAT",
    title: "EXHIBITIONS & TRADE EXPOS",
    description:
      "Multi-day booth hosts and scanning crew deployments.",
    image:
      "/images/sector/expo.png",
    className: "sector-card--expos",
  },
  {
    code: "PAN-GUJARAT",
    title: "CONCERTS & LIVE PRODUCTIONS",
    description:
      "Heavy-duty staging hands, barricade marshals, and tech units.",
    image:
      "/images/sector/concert.png",
    className: "sector-card--concerts",
  },
];

export default function SectorProfiles() {
  return (
    <section className="sector-profiles" id="sector-profiles">
      <div className="sector-container">
        <header className="sector-header">
          <div className="sector-heading">
            <span className="sector-eyebrow">
              04 // SECTOR PROFILES
            </span>

            <h2>EVERY EVENT HAS ITS OWN ENERGY</h2>
          </div>

          <p className="sector-intro">
            Precision matching based on cultural cadence, guest
            tiering, and operational tempo.
          </p>
        </header>

        <div className="sector-grid">
          {sectors.map((sector) => (
            <article
              className={`sector-card ${sector.className}`}
              key={sector.title}
              style={{ "--sector-image": `url("${sector.image}")` }}
            >
              <div className="sector-card-image" aria-hidden="true" />
              <div className="sector-card-overlay" />

              <div className="sector-card-content">
                <span className="sector-code">{sector.code}</span>

                <h3>{sector.title}</h3>

                <p>{sector.description}</p>
              </div>

              <span className="sector-card-index" aria-hidden="true">
                ↗
              </span>
            </article>
          ))}
        </div>

        <footer className="sector-caption">
          CATEGORY SHOWCASE // ILLUSTRATIVE OPERATIONAL FRAMEWORKS
          ACROSS GUJARAT COMMERCIAL HUBS
        </footer>
      </div>
    </section>
  );
}
