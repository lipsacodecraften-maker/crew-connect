
import styles from "./CitiesWeServe.module.css";
import { MapPin, ArrowUpRight } from "lucide-react";

const cities = [
  {
    code: "AMD",
    name: "Ahmedabad",
    region: "CENTRAL GUJARAT",
    description:
      "Professional staffing support for weddings, corporate events, exhibitions, and live experiences.",
    number: "01",
  },
  {
    code: "GNR",
    name: "Gandhinagar",
    region: "NORTH-CENTRAL GUJARAT",
    description:
      "Reliable event crew for conferences, business gatherings, exhibitions, and special occasions.",
    number: "02",
  },
  {
    code: "BRC",
    name: "Vadodara",
    region: "CENTRAL GUJARAT",
    description:
      "Organized manpower support for celebrations, corporate functions, and event operations.",
    number: "03",
  },
  {
    code: "ST",
    name: "Surat",
    region: "SOUTH GUJARAT",
    description:
      "Event staffing solutions for weddings, exhibitions, hospitality, and large gatherings.",
    number: "04",
  },
];

export default function CitiesWeServe() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              <span className={styles.dot}></span>
              OUR SERVICE NETWORK
            </span>

            <h2 className={styles.heading}>
              LOCAL PRESENCE.
              <br />
              <span>GUJARAT-WIDE</span> REACH.
            </h2>
          </div>

          <p className={styles.intro}>
            Wherever your event takes place, CrewConnect helps you access
            professional event staffing support across key cities in Gujarat.
          </p>
        </div>

        <div className={styles.cityGrid}>
          {cities.map((city) => (
            <article className={styles.cityCard} key={city.code}>

              <div className={styles.cityContent}>
                <div className={styles.locationRow}>
                  <MapPin className={styles.locationIcon} size={17} />
                  <span className={styles.cityCode}>{city.code}</span>
                </div>

                <h3>{city.name}</h3>

                <p>{city.description}</p>
              </div>

              <div className={styles.cardBottom}>
                <span>CREWCONNECT SERVICE AREA</span>
                <ArrowUpRight size={19} />
              </div>

            </article>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerText}>
            <span className={styles.footerDot} />
            <p>
              NEED STAFF OUTSIDE THESE CITIES?
              <strong> LET'S DISCUSS YOUR LOCATION.</strong>
            </p>
          </div>

          <a href="/contact" className={styles.contactLink}>
            CHECK AVAILABILITY <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
