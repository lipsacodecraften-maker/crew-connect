"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { CONTACT, ENQUIRY_CITIES, ENQUIRY_TYPES } from "./contactDetails";
import styles from "./ContactUs.module.css";

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  enquiry: "Hire manpower",
  city: "",
  eventDate: "",
  message: "",
};

type FormValues = typeof EMPTY_FORM;
type FormErrors = Partial<Record<keyof FormValues, string>>;

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  // Full name: only alphabets and spaces
  const namePattern = /^[A-Za-z ]+$/;

  if (!values.name.trim()) {
    errors.name = "Full name is required.";
  } else if (values.name.trim().length < 2) {
    errors.name = "Name must contain at least 2 characters.";
  } else if (!namePattern.test(values.name.trim())) {
    errors.name = "Name can contain only letters and spaces.";
  }

  // Mobile: exactly 10 digits
  const phonePattern = /^[0-9]{10}$/;

  if (!values.phone.trim()) {
    errors.phone = "Mobile number is required.";
  } else if (!phonePattern.test(values.phone)) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }

  // Email validation
  const email = values.email.trim();

  if (email && /\s/.test(email)) {
    errors.email = "Email cannot contain spaces.";
  } else if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}
function buildMessage(values: FormValues) {
  const lines = [
    "New enquiry from the CrewConnect contact page",
    "",
    `Name: ${values.name.trim()}`,
    `Phone: ${values.phone.trim()}`,
  ];

  if (values.email.trim()) lines.push(`Email: ${values.email.trim()}`);
  lines.push(`Enquiry: ${values.enquiry}`);
  if (values.city) lines.push(`City: ${values.city}`);
  if (values.eventDate) lines.push(`Date: ${values.eventDate}`);
  lines.push("", values.message.trim());

  return lines.join("\n");
}

export default function ContactForm() {
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<{ href: string } | null>(null);
  const [today, setToday] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => (previous[key] ? { ...previous, [key]: "" } : previous));
    setStatus(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0] as keyof FormValues | undefined;
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${String(firstInvalid)}"]`)?.focus();
      return;
    }

    setStatus({ href: "" });
    window.alert("Message sent successfully.");
  };

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label="Contact enquiry form"
      noValidate
    >
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="contact-name">
            Full name <span className={styles.required}>*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            className={styles.input}
            placeholder="Your name"
            required
            value={values.name}
            maxLength={60}
            onChange={(event) => {
              const value = event.target.value;

              if (/^[A-Za-z ]*$/.test(value)) {
                update("name", value);
              }
            }}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
          />
          {errors.name ? (
            <p id="contact-name-error" className={styles.fieldError} role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="contact-phone">
            Phone / WhatsApp <span className={styles.required}>*</span>
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            className={styles.input}
            placeholder="9876543210"
            required
            value={values.phone}
            maxLength={10}
            onChange={(event) => {
              const value = event.target.value;

              if (/^[0-9]*$/.test(value) && value.length <= 10) {
                update("phone", value);
              }
            }}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contact-phone-error" : undefined}
          />
          {errors.phone ? (
            <p id="contact-phone-error" className={styles.fieldError} role="alert">
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="contact-email">
            Email <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            className={styles.input}
            placeholder="you@company.com"
            maxLength={100}
            value={values.email}
            onChange={(event) => {
              const value = event.target.value;

              if (!/\s/.test(value)) {
                update("email", value);
              }
            }}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
          />
          {errors.email ? (
            <p id="contact-email-error" className={styles.fieldError} role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="contact-enquiry">
            Enquiry about <span className={styles.required}>*</span>
          </label>
          <select
            id="contact-enquiry"
            name="enquiry"
            className={styles.select}
            value={values.enquiry}
            onChange={(event) => update("enquiry", event.target.value)}
          >
            {ENQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="contact-city">
            Event city <span className={styles.optional}>(optional)</span>
          </label>
          <select
            id="contact-city"
            name="city"
            className={styles.select}
            value={values.city}
            onChange={(event) => update("city", event.target.value)}
          >
            <option value="">Select a city</option>
            {ENQUIRY_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="contact-date">
            Event date <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id="contact-date"
            name="eventDate"
            type="date"
            min={today}
            className={styles.input}
            value={values.eventDate}
            onChange={(event) => update("eventDate", event.target.value)}
          />
        </div>

        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.fieldLabel} htmlFor="contact-message">
            Your message <span className={styles.required}></span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            rows={5}
            maxLength={1200}
            className={styles.textarea}
            placeholder="Event type, crew size, shift timing — share whatever you know so far."
            required
            value={values.message}
            onChange={(event) => update("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
          />
          {errors.message ? (
            <p id="contact-message-error" className={styles.fieldError} role="alert">
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.formFooter}>
        <button type="submit" className={styles.submitButton}>
          Send Message
          <ArrowUpRight size={18} aria-hidden="true" />
        </button>

        <a className={styles.callInstead} href={CONTACT.phoneHref}>
          <MessageCircle size={15} aria-hidden="true" />
          Prefer to talk? Call {CONTACT.phoneDisplay}
        </a>
      </div>

      {/* <p className={styles.formNote}>
        This opens WhatsApp with your message pre-filled. Nothing is sent until you press send in WhatsApp.
      </p>

      {status ? (
        <div className={styles.formStatus} role="status">
          <span className={styles.statusIcon} aria-hidden="true">
            <Check size={16} />
          </span>
          <div>
            <strong>Message sent successfully.</strong>
            <p>Your enquiry has been submitted. Our team will get back to you shortly.</p>
          </div>
        </div>
      ) : null} */}
    </form>
  );
}
