import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { CONTACT, SERVICE_HUBS } from "./contactDetails";
import styles from "./ContactUs.module.css";

export const metadata: Metadata = {
  title: "Contact Us | CrewConnect",
  description:
    "Talk to the CrewConnect desk about hiring event manpower, joining the crew, open jobs or an existing booking across Gujarat.",
};

const QUICK_ROUTES = [
  { label: "Hire manpower", description: "Build a crew for your event", href: "/hire-manpower" },
  { label: "Join as staff", description: "Register as event crew", href: "/join-as-staff" },
  { label: "Track a booking", description: "Check your request status", href: "/hire-manpower/track" },
] as const;

const FAQS = [
  {
    question: "How quickly will I hear back?",
    answer:
      "WhatsApp is the fastest route to the desk. Share your event date, city and crew size, and the team will reply with availability and next steps. For a formal quote, submit the full booking brief through Hire Manpower — it creates a tracking ID you can check at any time.",
  },
  {
    question: "Do you staff events outside Gujarat?",
    answer:
      "Regular coverage is focused on Ahmedabad, Gandhinagar, Vadodara and Surat. For events elsewhere, message the desk with your dates, city and crew size and we will confirm whether we can support it.",
  },
  {
    question: "I want to work at events. Where do I start?",
    answer:
      "Create a staff profile on Join as Staff. Once you have your Staff Registration ID, you can apply for open shifts on Available Jobs using that ID and the WhatsApp number you registered with.",
  },
  {
    question: "Can I check the status of an existing booking?",
    answer:
      "Yes. Use Track a booking with your booking ID and the email address used at submission, or open the secure tracking link sent with your booking confirmation.",
  },
] as const;

export default function ContactUsPage() {
  return (
    <main id="main" className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Contact // CrewConnect desk
          </p>

          <div className={styles.heroGrid}>
            <h1 className={styles.heroTitle}>
              Let&apos;s talk
              <br />
              about your <span className={styles.heroAccent}>event.</span>
            </h1>

            <div className={styles.heroAside}>
              <p className={styles.heroText}>
                Hiring a crew, looking for shifts, or checking an existing
                booking — reach the right desk and we will point you in the
                right direction.
              </p>

              <div className={styles.heroActions}>
                <a className={styles.primaryButton} href={CONTACT.phoneHref}>
                  Call the desk
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>

                <a
                  className={styles.ghostButton}
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp us
                  <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>

          <div className={styles.channelStrip}>
            <a className={styles.channel} href={CONTACT.phoneHref}>
              <span className={styles.channelIcon} aria-hidden="true">
                <Phone size={19} />
              </span>
              <span className={styles.channelBody}>
                <span className={styles.channelLabel}>Call the desk</span>
                <span className={styles.channelValue}>{CONTACT.phoneDisplay}</span>
                <span className={styles.channelNote}>{CONTACT.deskHours}</span>
              </span>
            </a>

            <a
              className={styles.channel}
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={styles.channelIcon} aria-hidden="true">
                <MessageCircle size={19} />
              </span>
              <span className={styles.channelBody}>
                <span className={styles.channelLabel}>WhatsApp</span>
                <span className={styles.channelValue}>{CONTACT.phoneDisplay}</span>
                <span className={styles.channelNote}>Fastest for short questions</span>
              </span>
            </a>

            <div className={styles.channel}>
              <span className={styles.channelIcon} aria-hidden="true">
                <MapPin size={19} />
              </span>
              <span className={styles.channelBody}>
                <span className={styles.channelLabel}>Service area</span>
                <span className={styles.channelValue}>{CONTACT.serviceLine}</span>
                <span className={styles.channelNote}>{CONTACT.location}</span>
              </span>
            </div>

            <div className={styles.channel}>
              <span className={styles.channelIcon} aria-hidden="true">
                <Clock3 size={19} />
              </span>
              <span className={styles.channelBody}>
                <span className={styles.channelLabel}>Desk hours</span>
                <span className={styles.channelValue}>{CONTACT.deskHours}</span>
                <span className={styles.channelNote}>Enquiries answered in order received</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.contactSection}>
        <div className={styles.sectionInner}>
          <div className={styles.formColumn}>
            <p className={styles.sectionLabel}>01 // Send a brief</p>
            <h2 className={styles.sectionTitle}>Tell us what you need.</h2>
            <p className={styles.sectionIntro}>
              A few details help the desk answer properly the first time. Fill
              this in and send it straight to WhatsApp — or call if it is easier.
            </p>

            <ContactForm />
          </div>

          <aside className={styles.detailsColumn}>
            <div className={styles.detailsPanel}>
              <p className={styles.sectionLabel}>02 // Desk details</p>
              <h2 className={styles.detailsTitle}>Reach the right desk.</h2>

              <ul className={styles.detailList}>
                <li className={styles.detailItem}>
                  <span className={styles.detailIcon} aria-hidden="true">
                    <Phone size={18} />
                  </span>
                  <div>
                    <span className={styles.detailLabel}>Client & crew desk</span>
                    <a className={styles.detailLink} href={CONTACT.phoneHref}>
                      {CONTACT.phoneDisplay}
                    </a>
                    <p className={styles.detailNote}>{CONTACT.deskHours}</p>
                  </div>
                </li>

                <li className={styles.detailItem}>
                  <span className={styles.detailIcon} aria-hidden="true">
                    <MessageCircle size={18} />
                  </span>
                  <div>
                    <span className={styles.detailLabel}>WhatsApp</span>
                    <a
                      className={styles.detailLink}
                      href={CONTACT.whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Start a chat
                      <ArrowUpRight size={14} aria-hidden="true" />
                    </a>
                    <p className={styles.detailNote}>
                      Short questions, availability checks and follow-ups.
                    </p>
                  </div>
                </li>

                <li className={styles.detailItem}>
                  <span className={styles.detailIcon} aria-hidden="true">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <span className={styles.detailLabel}>Where we work</span>
                    <p className={styles.detailStrong}>{CONTACT.serviceLine}</p>
                    <p className={styles.detailNote}>
                      Based in {CONTACT.location}. Other cities on request.
                    </p>
                  </div>
                </li>
              </ul>

              <div className={styles.quickRoutes}>
                <span className={styles.quickRoutesTitle}>Quick routes</span>
                {QUICK_ROUTES.map((route) => (
                  <Link className={styles.routeLink} href={route.href} key={route.href}>
                    <span>
                      <strong>{route.label}</strong>
                      <small>{route.description}</small>
                    </span>
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
