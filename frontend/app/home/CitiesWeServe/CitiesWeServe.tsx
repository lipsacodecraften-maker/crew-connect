
import styles from "./CitiesWeServe.module.css";
import { MapPin, ArrowUpRight } from "lucide-react";



const cities = [
  {
    code: "AMD",
    name: "Ahmedabad",
    region: "GUJARAT · WEST INDIA",
    description:
      "Professional staffing support for weddings, corporate events, exhibitions, and live experiences.",
    number: "01",
  },
  {
    code: "JAI",
    name: "Jaipur",
    region: "RAJASTHAN · NORTH INDIA",
    description:
      "Reliable event crew for destination weddings, cultural festivals, corporate events, and celebrations.",
    number: "02",
  },
  {
    code: "MUM",
    name: "Mumbai",
    region: "MAHARASHTRA · WEST INDIA",
    description:
      "Organized manpower support for exhibitions, concerts, corporate functions, and large gatherings.",
    number: "03",
  },
  {
    code: "DEL",
    name: "New Delhi",
    region: "DELHI · NORTH INDIA",
    description:
      "Professional event staffing for conferences, exhibitions, weddings, and premium corporate events.",
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
              OUR NETWORK.
              <br />
              <span>YOUR CITY.</span>
            </h2>
          </div>

          <p className={styles.intro}>
            "From metropolitan hubs to emerging event destinations, CrewConnect is building a reliable event staffing network across India."
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

          <a href="/contact-us" className={styles.contactLink}>
            CHECK AVAILABILITY <ArrowUpRight size={17} />
          </a>
        </div>
      </div>
    </section>
  );
}
