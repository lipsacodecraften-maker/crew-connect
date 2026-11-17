"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";

import { EXPERIENCE_REQUIREMENTS } from "@/lib/jobs/config";

type BookingOption = {
  id: string;
  eventName: string;
  eventCity: string;
  eventStartDate: string;
  requirements: Array<{
    id: number;
    staffRole: string;
    quantity: number;
    filled: number;
    remaining: number;
  }>;
};

export default function JobCreateForm({
  bookings,
}: {
  bookings: BookingOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [requirementRef, setRequirementRef] = useState("");
  const [eventType, setEventType] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [city, setCity] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dutyStartTime, setDutyStartTime] = useState("");
  const [dutyEndTime, setDutyEndTime] = useState("");
  const [openings, setOpenings] = useState("1");
  const [paymentMin, setPaymentMin] = useState("");
  const [paymentMax, setPaymentMax] = useState("");
  const [experienceRequired, setExperienceRequired] = useState("Any");
  const [summary, setSummary] = useState("");
  const [publish, setPublish] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === bookingId) || null,
    [bookings, bookingId],
  );

  const selectBooking = (value: string) => {
    setBookingId(value);
    setRequirementRef("");
    const booking = bookings.find((item) => item.id === value);
    if (booking) {
      setCity(booking.eventCity);
      setEventDate(booking.eventStartDate);
    }
  };

  const selectRequirement = (value: string) => {
    setRequirementRef(value);
    const requirement = selectedBooking?.requirements.find(
      (item) => String(item.id) === value,
    );
    if (requirement) {
      setJobRole(requirement.staffRole);
      setOpenings(String(Math.max(1, requirement.remaining)));
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setPending(true);

    const response = await fetch("/api/admin/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        jobRole,
        city,
        eventDate,
        endDate,
        dutyStartTime,
        dutyEndTime,
        openings: Number(openings),
        paymentMin: paymentMin ? Number(paymentMin) : null,
        paymentMax: paymentMax ? Number(paymentMax) : null,
        experienceRequired,
        summary,
        status: publish ? "open" : "draft",
        bookingRef: bookingId,
        requirementRef: requirementRef ? Number(requirementRef) : null,
      }),
    });
    const payload = await response.json().catch(() => null);
    setPending(false);

    if (!response.ok) {
      const firstError = payload?.errors
        ? Object.values(payload.errors)[0]
        : null;
      setError(
        (firstError as string) || payload?.message || "Could not create the listing.",
      );
      return;
    }

    router.push(`/admin/jobs/${payload.listing.id}`);
    router.refresh();
  };

  if (!open) {
    return (
      <div className="admin-card-body">
        <div className="admin-btn-row">
          <button
            type="button"
            className="admin-btn is-primary"
            onClick={() => setOpen(true)}
          >
            <FiPlus aria-hidden="true" /> New job listing
          </button>
          <span className="admin-small admin-subtle">
            Create a draft now and publish when the event is approved.
          </span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="admin-card-body admin-stack-sm">
      <div className="admin-form-grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-booking">
            Link to booking (optional)
          </label>
          <select
            id="job-booking"
            className="admin-select"
            value={bookingId}
            onChange={(event) => selectBooking(event.target.value)}
            disabled={pending}
          >
            <option value="">Standalone listing</option>
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.eventName} · {booking.eventCity} ·{" "}
                {booking.eventStartDate}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-requirement">
            Staffing requirement
          </label>
          <select
            id="job-requirement"
            className="admin-select"
            value={requirementRef}
            onChange={(event) => selectRequirement(event.target.value)}
            disabled={!selectedBooking || pending}
          >
            <option value="">
              {selectedBooking ? "No specific requirement" : "Choose a booking first"}
            </option>
            {selectedBooking?.requirements.map((requirement) => (
              <option key={requirement.id} value={requirement.id}>
                {requirement.staffRole} · {requirement.remaining} open
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-form-grid">
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-event-type">
            Event type
          </label>
          <input
            id="job-event-type"
            className="admin-input"
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
            placeholder="Wedding, exhibition, corporate…"
            required
            minLength={2}
            maxLength={80}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-role">
            Job role
          </label>
          <input
            id="job-role"
            className="admin-input"
            value={jobRole}
            onChange={(event) => setJobRole(event.target.value)}
            placeholder="Event helper, bouncer, supervisor…"
            required
            minLength={2}
            maxLength={80}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-city">
            City
          </label>
          <input
            id="job-city"
            className="admin-input"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
            minLength={2}
            maxLength={60}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-date">
            Event date
          </label>
          <input
            id="job-date"
            type="date"
            className="admin-input"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
            required
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-end-date">
            End date (optional)
          </label>
          <input
            id="job-end-date"
            type="date"
            className="admin-input"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-openings">
            Openings
          </label>
          <input
            id="job-openings"
            type="number"
            min={1}
            max={500}
            className="admin-input"
            value={openings}
            onChange={(event) => setOpenings(event.target.value)}
            required
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-start">
            Duty start
          </label>
          <input
            id="job-start"
            type="time"
            className="admin-input"
            value={dutyStartTime}
            onChange={(event) => setDutyStartTime(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-end">
            Duty end
          </label>
          <input
            id="job-end"
            type="time"
            className="admin-input"
            value={dutyEndTime}
            onChange={(event) => setDutyEndTime(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-pay-min">
            Payment min (₹)
          </label>
          <input
            id="job-pay-min"
            type="number"
            min={0}
            step={50}
            className="admin-input"
            value={paymentMin}
            onChange={(event) => setPaymentMin(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-pay-max">
            Payment max (₹)
          </label>
          <input
            id="job-pay-max"
            type="number"
            min={0}
            step={50}
            className="admin-input"
            value={paymentMax}
            onChange={(event) => setPaymentMax(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-experience">
            Experience required
          </label>
          <select
            id="job-experience"
            className="admin-select"
            value={experienceRequired}
            onChange={(event) => setExperienceRequired(event.target.value)}
            disabled={pending}
          >
            {EXPERIENCE_REQUIREMENTS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="job-status">
            Visibility
          </label>
          <label className="admin-check" htmlFor="job-status">
            <input
              id="job-status"
              type="checkbox"
              checked={publish}
              onChange={(event) => setPublish(event.target.checked)}
              disabled={pending}
            />
            Publish immediately to the public board
          </label>
        </div>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="job-summary">
          Role summary
        </label>
        <textarea
          id="job-summary"
          className="admin-textarea"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          maxLength={600}
          placeholder="Shift expectations, uniform, reporting point and anything crew should know."
          disabled={pending}
        />
      </div>

      {error ? <div className="admin-form-error">{error}</div> : null}

      <div className="admin-btn-row">
        <button type="submit" className="admin-btn is-primary" disabled={pending}>
          <FiPlus aria-hidden="true" />
          {pending ? "Creating…" : publish ? "Create & publish" : "Create draft"}
        </button>
        <button
          type="button"
          className="admin-btn is-ghost"
          onClick={() => setOpen(false)}
          disabled={pending}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
