
"use client";

import { useState } from "react";
import { Plus, Minus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import styles from "./FAQ.module.css";

const faqs = [
  {
    question: "What types of events does CrewConnect provide staff for?",
    answer:
      "CrewConnect supports weddings, corporate events, exhibitions, conferences, concerts, festivals, and other live experiences. We help organizers find suitable staff based on their event requirements.",
  },
  {
    question: "Which cities do you currently serve?",
    answer:
      "Our primary service locations include Ahmedabad, Gandhinagar, Vadodara, and Surat. For events in other Gujarat locations, contact our team to check staffing availability.",
  },
  {
    question: "What types of staffing roles can I request?",
    answer:
      "You can enquire about hospitality staff, guest management teams, registration assistants, event coordinators, setup and logistics crew, security personnel, and production or AV support.",
  },
  {
    question: "How far in advance should I book event staff?",
    answer:
      "We recommend contacting us as early as possible so we can understand your requirements, check availability, and plan the deployment. Last-minute requests can also be discussed, subject to availability.",
  },
  {
    question: "Can I request a specific number of staff members?",
    answer:
      "Yes. Share your expected guest count, event schedule, venue, and required roles. Our team can discuss a staffing plan based on your needs and available resources.",
  },
  {
    question: "How can I register as an event staff applicant?",
    answer:
      "Visit our Hire Staff page and submit the registration form with your contact details, preferred city, experience, and roles of interest. Our team can review your profile and contact you about suitable opportunities.",
  },
  {
    question: "Is prior experience required to join CrewConnect?",
    answer:
      "Experience requirements depend on the role. Some assignments may be suitable for newcomers, while specialized positions may require relevant experience or skills.",
  },
  {
    question: "How does the staffing verification process work?",
    answer:
      "Our verification process may include reviewing applicant information, identity details, experience, and role-specific suitability before considering an applicant for assignments.",
  },
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleFAQ = (index) => {
    setActiveIndex((current) => (current === index ? null : index));
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              <span className={styles.dot}></span>
              KNOW BEFORE YOU BOOK
            </span>

            <h2 className={styles.heading}>
              GOT QUESTIONS?
              <br />
              WE HAVE <span>ANSWERS.</span>
            </h2>
          </div>

          <p className={styles.intro}>
            Everything you need to know about event staffing, joining our
            crew, and working with CrewConnect. Can't find your answer?
            Get in touch with our team.
          </p>
        </div>

        <div className={styles.faqLayout}>
          <div className={styles.faqSide}>
            <span className={styles.sideNumber}>Frequently Asked Questions</span>

            <h3>
              CLARITY
              <br />
              BEFORE
              <br />
              <span>EXECUTION.</span>
            </h3>

            <p>
              Have a specific requirement? Our team is ready to help you
              understand the next step.
            </p>

            <Link href="/contact" className={styles.contactButton}>
              ASK YOUR QUESTION
              <ArrowUpRight size={18} />
            </Link>
          </div>

          <div className={styles.faqList}>
            {faqs.map((faq, index) => {
              const isOpen = activeIndex === index;

              return (
                <div
                  className={`${styles.faqItem} ${
                    isOpen ? styles.active : ""
                  }`}
                  key={faq.question}
                >
                  <button
                    type="button"
                    className={styles.question}
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.questionNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className={styles.questionText}>
                      {faq.question}
                    </span>

                    <span className={styles.toggleIcon}>
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className={styles.answer}>
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* <div className={styles.bottomLine}>
          <span>CREWCONNECT // YOUR QUESTIONS MATTER</span>
          <span>GUJARAT, INDIA</span>
        </div> */}
      </div>
    </section>
  );
}
