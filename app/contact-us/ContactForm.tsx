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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = "Enter your full name.";
  }

  const digits = values.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    errors.phone = "Enter a valid phone number with 10–15 digits.";
  }

  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address, or leave this blank.";
  }

  if (!values.enquiry) {
    errors.enquiry = "Choose what your enquiry is about.";
  }

  if (values.message.trim().length < 10) {
    errors.message = "Tell us a little more — at least 10 characters.";
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

    const href = `${CONTACT.whatsappHref}?text=${encodeURIComponent(buildMessage(values))}`;

    setStatus({ href });
    window.open(href, "_blank", "noopener,noreferrer");
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
            onChange={(event) => update("name", event.target.value)}
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
            inputMode="tel"
            autoComplete="tel"
            className={styles.input}
            placeholder="+91 98765 43210"
            required
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
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
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
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
            Your message <span className={styles.required}>*</span>
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
          Send via WhatsApp
          <ArrowUpRight size={18} aria-hidden="true" />
        </button>

        <a className={styles.callInstead} href={CONTACT.phoneHref}>
          <MessageCircle size={15} aria-hidden="true" />
          Prefer to talk? Call {CONTACT.phoneDisplay}
        </a>
      </div>

      <p className={styles.formNote}>
        This opens WhatsApp with your message pre-filled. Nothing is sent until you press send in WhatsApp.
      </p>

      {status ? (
        <div className={styles.formStatus} role="status">
          <span className={styles.statusIcon} aria-hidden="true">
            <Check size={16} />
          </span>
          <div>
            <strong>WhatsApp opened in a new tab.</strong>
            <p>
              Press send there to reach the desk. If the tab did not open,{" "}
              <a href={status.href} target="_blank" rel="noopener noreferrer">
                open the chat manually
              </a>
              .
            </p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
