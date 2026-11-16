
import Link from "next/link";
import {
  ArrowUpRight,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock3,
} from "lucide-react";
import styles from "./ContactSupport.module.css";

// Replace this with your actual WhatsApp number.
// Use country code + number, without + or spaces.
const WHATSAPP_NUMBER = "91XXXXXXXXXX";

const contactOptions = [
  {
    number: "01",
    icon: Phone,
    title: "STAFFING ENQUIRIES",
    description:
      "Planning an event? Talk to our team about your staffing requirements.",
    action: "REQUEST STAFF",
    href: "/contact",
  },
  {
    number: "02",
    icon: MessageCircle,
    title: "WHATSAPP SUPPORT",
    description:
      "Connect with our team directly for enquiries and assistance.",
    action: "CHAT ON WHATSAPP",
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    external: true,
  },
  {
    number: "03",
    icon: Mail,
    title: "GENERAL ENQUIRIES",
    description:
      "Have a question about CrewConnect? Send us your enquiry.",
    action: "CONTACT OUR TEAM",
    href: "/contact",
  },
];

export default function ContactSupport() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            {/* <span className={styles.eyebrow}>
              11 // CONTACT & SUPPORT
            </span> */}

            <h2 className={styles.heading}>
              LET'S TALK
              <br />
              ABOUT YOUR <span>EVENT.</span>
            </h2>
          </div>

          <p className={styles.intro}>
            Whether you need professional event staff or want to join our
            crew, we're here to help. Reach out to CrewConnect and let's
            get started.
          </p>
        </div>

        <div className={styles.contactGrid}>
          {contactOptions.map((item) => {
            const Icon = item.icon;

            return (
              <article className={styles.contactCard} key={item.number}>
                {/* <div className={styles.cardTop}> */}
                {/* <span className={styles.cardNumber}>{item.number}</span> */}
                {/* </div> */}

                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>
                    <span>{item.title}</span>
                    <Icon className={styles.cardIcon} size={25} />
                  </h3>

                  <p>{item.description}</p>
                </div>

                <div className={styles.cardBottom}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.cardAction}
                    >
                      {item.action}
                      <ArrowUpRight size={17} />
                    </a>
                  ) : (
                    <Link href={item.href} className={styles.cardAction}>
                      {item.action}
                      <ArrowUpRight size={17} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.bottomPanel}>
          <div className={styles.bottomInfo}>
            <div className={styles.bottomIcon}>
              <MapPin size={22} />
            </div>

            <div>
              <span className={styles.bottomLabel}>OUR SERVICE NETWORK</span>
              <p>Ahmedabad · Gandhinagar · Vadodara · Surat</p>
            </div>
          </div>

          <div className={styles.bottomInfo}>
            <div className={styles.bottomIcon}>
              <Clock3 size={22} />
            </div>

            <div>
              <span className={styles.bottomLabel}>ENQUIRY SUPPORT</span>
              <p>Contact our team to discuss availability</p>
            </div>
          </div>

          <Link href="/contact" className={styles.mainButton}>
            GET IN TOUCH
            <ArrowUpRight size={19} />
          </Link>
        </div>

        <div className={styles.footerLine}>
          <span>CREWCONNECT</span>
          <span>YOUR EVENT. OUR PEOPLE. ONE TEAM.</span>
        </div>
      </div>
    </section>
  );
}
