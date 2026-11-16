"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiFileText, FiPlus, FiSave, FiTrash2 } from "react-icons/fi";

type Requirement = {
  id: number;
  staffRole: string;
  workDate: string;
  quantity: number;
  shiftDuration: number;
};

type LineItem = {
  key: string;
  requirementRef: number | null;
  label: string;
  quantity: number;
  days: number;
  unitRate: number;
  note: string;
};

type Quotation = {
  status: string;
  taxPercent: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string;
  validUntil: string;
  lineItems: Array<{
    id: string;
    requirementRef: number | null;
    label: string;
    quantity: number;
    days: number;
    unitRate: number;
    note: string;
  }>;
} | null;

function buildLines(quotation: Quotation, requirements: Requirement[], defaultRate: number): LineItem[] {
  if (quotation?.lineItems.length) {
    return quotation.lineItems.map((item, index) => ({
      key: item.id || `line-${index}`,
      requirementRef: item.requirementRef,
      label: item.label,
      quantity: Number(item.quantity) || 1,
      days: Number(item.days) || 1,
      unitRate: Number(item.unitRate) || 0,
      note: item.note || "",
    }));
  }

  return requirements.map((requirement, index) => ({
    key: `draft-${requirement.id}-${index}`,
    requirementRef: requirement.id,
    label: `${requirement.staffRole} · ${requirement.workDate}`,
    quantity: Number(requirement.quantity) || 1,
    days: 1,
    unitRate: Math.round(defaultRate || 0),
    note: requirement.shiftDuration ? `${requirement.shiftDuration} hour shift` : "",
  }));
}

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function QuotationBuilder({
  bookingId,
  quotation,
  requirements,
  defaultRate,
  canManage,
}: {
  bookingId: string;
  quotation: Quotation;
  requirements: Requirement[];
  defaultRate: number;
  canManage: boolean;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<LineItem[]>(() =>
    buildLines(quotation, requirements, defaultRate),
  );
  const [status, setStatus] = useState(quotation?.status || "draft");
  const [taxPercent, setTaxPercent] = useState(String(quotation?.taxPercent ?? 18));
  const [notes, setNotes] = useState(quotation?.notes || "");
  const [validUntil, setValidUntil] = useState(quotation?.validUntil || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const subtotal = lines.reduce(
      (sum, line) =>
        sum +
        Math.max(0, line.quantity) *
          Math.max(0, line.days) *
          Math.max(0, line.unitRate),
      0,
    );
    const tax = Math.round(subtotal * (Math.max(0, Number(taxPercent) || 0) / 100));
    return { subtotal, tax, total: subtotal + tax };
  }, [lines, taxPercent]);

  const patchLine = (key: string, patch: Partial<LineItem>) => {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  };

  const addLine = () => {
    setLines((current) => [
      ...current,
      {
        key: `manual-${Date.now()}`,
        requirementRef: null,
        label: "",
        quantity: 1,
        days: 1,
        unitRate: Math.round(defaultRate || 0),
        note: "",
      },
    ]);
  };

  const removeLine = (key: string) => {
    setLines((current) => current.filter((line) => line.key !== key));
  };

  const save = async (nextStatus?: string) => {
    setError("");
    setMessage("");

    const cleanLines = lines.filter((line) => line.label.trim());
    if (!cleanLines.length) {
      setError("Add at least one line item with a label.");
      return;
    }

    const response = await fetch(`/api/admin/bookings/${bookingId}/quotation`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lineItems: cleanLines.map((line) => ({
          requirementRef: line.requirementRef,
          label: line.label,
          quantity: line.quantity,
          days: line.days,
          unitRate: line.unitRate,
          note: line.note,
        })),
        taxPercent: Number(taxPercent) || 0,
        notes,
        validUntil,
        status: nextStatus || status,
      }),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.message || "Could not save the quotation.");
      return;
    }

    if (nextStatus) setStatus(nextStatus);
    setMessage(`Quotation saved · ${money(Number(payload?.quotation?.total) || totals.total)}`);
    startTransition(() => router.refresh());
  };

  if (!canManage) {
    return (
      <div className="admin-card-body">
        {quotation ? (
          <>
            <div className="admin-quote-total">
              <span>
                {quotation.lineItems.length} line item
                {quotation.lineItems.length === 1 ? "" : "s"} ·{" "}
                {quotation.status}
              </span>
              <strong>{money(quotation.total)}</strong>
            </div>
            <div className="admin-table-wrap" style={{ marginTop: 12 }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Days</th>
                    <th>Rate</th>
                    <th className="is-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {quotation.lineItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.label}</td>
                      <td>{item.quantity}</td>
                      <td>{item.days}</td>
                      <td>{money(item.unitRate)}</td>
                      <td className="is-right">
                        {money(item.quantity * item.days * item.unitRate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="admin-form-note">
            No quotation has been prepared yet. Your role has read-only access.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-card-body admin-stack-sm">
      <div className="admin-quote-line" style={{ color: "var(--adm-subtle)" }}>
        <span className="admin-label">Line item</span>
        <span className="admin-label">Qty</span>
        <span className="admin-label">Days</span>
        <span className="admin-label">Unit rate</span>
        <span className="admin-label">Amount</span>
        <span />
      </div>

      {lines.map((line) => (
        <div className="admin-quote-line" key={line.key}>
          <input
            className="admin-input is-wide"
            aria-label="Line item label"
            value={line.label}
            onChange={(event) => patchLine(line.key, { label: event.target.value })}
            placeholder="Role · event date"
            maxLength={180}
            disabled={pending}
          />
          <input
            className="admin-input"
            aria-label="Quantity"
            type="number"
            min={1}
            value={line.quantity}
            onChange={(event) =>
              patchLine(line.key, { quantity: Number(event.target.value) || 1 })
            }
            disabled={pending}
          />
          <input
            className="admin-input"
            aria-label="Days"
            type="number"
            min={1}
            value={line.days}
            onChange={(event) =>
              patchLine(line.key, { days: Number(event.target.value) || 1 })
            }
            disabled={pending}
          />
          <input
            className="admin-input"
            aria-label="Unit rate"
            type="number"
            min={0}
            step="50"
            value={line.unitRate}
            onChange={(event) =>
              patchLine(line.key, { unitRate: Number(event.target.value) || 0 })
            }
            disabled={pending}
          />
          <span className="admin-mono admin-small is-end">
            {money(line.quantity * line.days * line.unitRate)}
          </span>
          <button
            type="button"
            className="admin-btn is-small is-ghost"
            aria-label="Remove line item"
            onClick={() => removeLine(line.key)}
            disabled={pending || lines.length === 1}
          >
            <FiTrash2 aria-hidden="true" />
          </button>
        </div>
      ))}

      <div className="admin-btn-row">
        <button type="button" className="admin-btn is-small" onClick={addLine}>
          <FiPlus aria-hidden="true" /> Add line item
        </button>
      </div>

      <div className="admin-form-grid is-three">
        <div className="admin-field">
          <label className="admin-label" htmlFor="quote-tax">
            Tax percent
          </label>
          <input
            id="quote-tax"
            className="admin-input"
            type="number"
            min={0}
            max={50}
            value={taxPercent}
            onChange={(event) => setTaxPercent(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="quote-valid">
            Valid until
          </label>
          <input
            id="quote-valid"
            className="admin-input"
            type="date"
            value={validUntil}
            onChange={(event) => setValidUntil(event.target.value)}
            disabled={pending}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="quote-status">
            Quotation status
          </label>
          <select
            id="quote-status"
            className="admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            disabled={pending}
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent to client</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="quote-notes">
          Quotation notes
        </label>
        <textarea
          id="quote-notes"
          className="admin-textarea"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Payment terms, inclusions, exclusions or client-specific notes."
          maxLength={2000}
          disabled={pending}
        />
      </div>

      <div className="admin-quote-total">
        <span className="admin-muted">
          Subtotal {money(totals.subtotal)} · Tax {money(totals.tax)}
        </span>
        <strong>{money(totals.total)}</strong>
      </div>

      {error ? <div className="admin-form-error">{error}</div> : null}
      {message ? <div className="admin-alert is-success">{message}</div> : null}

      <div className="admin-btn-row">
        <button
          type="button"
          className="admin-btn is-primary"
          onClick={() => save()}
          disabled={pending}
        >
          <FiSave aria-hidden="true" />
          {pending ? "Saving…" : "Save quotation"}
        </button>
        {status === "draft" ? (
          <button
            type="button"
            className="admin-btn"
            onClick={() => save("sent")}
            disabled={pending}
          >
            <FiFileText aria-hidden="true" /> Save & mark sent
          </button>
        ) : null}
      </div>
    </div>
  );
}
