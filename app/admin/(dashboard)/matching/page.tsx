import Link from "next/link";
import { FiArrowLeft, FiTarget, FiUsers } from "react-icons/fi";

import { can, getAdminSession } from "@/lib/admin/auth";
import {
  listMatchingBookings,
  recommendStaff,
} from "@/lib/admin/matching";
import { EmptyState, PageHeader } from "../../_components/ui";
import MatchingExplorer from "./MatchingExplorer";

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function MatchingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const bookingId = readParam(params.bookingId);
  const requirementRef = Number(readParam(params.requirementRef));

  const [session, bookings] = await Promise.all([
    getAdminSession(),
    listMatchingBookings(),
  ]);

  if (!can(session!, "matching.view")) {
    return (
      <section className="admin-card">
        <EmptyState title="You do not have access to staff matching">
          Ask a super admin to review your role permissions.
        </EmptyState>
      </section>
    );
  }

  const initialResult = bookingId
    ? await recommendStaff({
        bookingId,
        requirementRef:
          Number.isFinite(requirementRef) && requirementRef > 0
            ? requirementRef
            : undefined,
      })
    : null;

  return (
    <>
      <PageHeader
        eyebrow="People & work"
        title="Staff matching"
        subtitle="Rank approved crew against an event requirement by role, city, date, shift, experience and availability. Duplicate assignments and shift clashes are blocked before they reach the database."
        actions={
          <>
            <Link href="/admin/staff" className="admin-btn is-ghost">
              <FiUsers aria-hidden="true" /> Staff directory
            </Link>
            <Link href="/admin/bookings" className="admin-btn">
              <FiArrowLeft aria-hidden="true" /> Requests
            </Link>
          </>
        }
      />

      {!bookings.length ? (
        <section className="admin-card">
          <EmptyState title="No live events with staffing requirements">
            Matching works on requests that are not cancelled or completed and
            have at least one staffing requirement.
          </EmptyState>
        </section>
      ) : (
        <MatchingExplorer
          bookings={bookings}
          initialBookingId={bookingId}
          initialRequirementRef={
            Number.isFinite(requirementRef) && requirementRef > 0
              ? String(requirementRef)
              : ""
          }
          initialResult={
            initialResult?.ok
              ? {
                  ok: true,
                  selected: initialResult.selected ?? null,
                  query: {
                    ...initialResult.query,
                    shiftEnd: initialResult.query.shiftEnd || "",
                  },
                  candidates: initialResult.candidates,
                  summary: initialResult.summary,
                }
              : null
          }
          canAssign={can(session!, "assignments.manage")}
        />
      )}

      {initialResult && !initialResult.ok ? (
        <section className="admin-card">
          <div className="admin-card-body">
            <div className="admin-form-error">
              <FiTarget aria-hidden="true" /> {initialResult.message}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
