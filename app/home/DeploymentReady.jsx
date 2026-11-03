
import "./DeploymentReady.css";

const regionalHubs = [
  { city: "AHMEDABAD", code: "079" },
  { city: "GANDHINAGAR", code: "079" },
  { city: "VADODARA", code: "0265" },
  { city: "SURAT", code: "0261" },
];

export default function DeploymentReady() {
  return (
    <section className="deployment-section" id="deployment-ready">
      <div className="deployment-container">
        <span className="deployment-eyebrow">
          07 // DEPLOYMENT READY
        </span>

        <h2 className="deployment-heading">
          LET’S MAKE YOUR NEXT EVENT
          <br />
          <span>HAPPEN.</span>
        </h2>

        <p className="deployment-description">
          Whether you need an elite front-of-house unit for an
          Ahmedabad luxury summit or are ready to represent
          Gujarat’s premier events as a verified crew member.
        </p>

        <div className="deployment-actions">
          <a href="/hire-staff" className="deployment-btn deployment-btn-primary">
            HIRE EVENT STAFF <span aria-hidden="true">→</span>
          </a>

          <a href="/join-crew" className="deployment-btn deployment-btn-secondary">
            JOIN THE CREW <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="deployment-hubs" aria-label="Regional service locations">
          {regionalHubs.map((hub, index) => (
            <div className="deployment-hub" key={hub.city}>
              <span className="deployment-city">
                {hub.city} [{hub.code}]
              </span>

              {index < regionalHubs.length - 1 && (
                <span className="deployment-separator" aria-hidden="true">
                  •
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
