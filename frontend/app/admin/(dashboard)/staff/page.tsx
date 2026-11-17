import Link from "next/link";
import {
  FiBriefcase,
  FiCheckCircle,
  FiFilter,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

import { can, getAdminSession } from "@/lib/admin/auth";
import { getStaffFacets, listStaff, type StaffListFilters } from "@/lib/admin/staff";
import {
  STAFF_REVIEW_LABELS,
  STAFF_REVIEW_STATUSES,
} from "@/lib/admin/constants";
import { formatNumber, formatRelative } from "@/lib/admin/format";
import {
  CardHead,
  EmptyState,
  MetricCard,
  PageHeader,
  StatusPill,
} from "../../_components/ui";
import { initials } from "../../_components/status";

export const dynamic = "force-dynamic";

function readParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters: StaffListFilters = {
    q: readParam(params.q) || undefined,
    city: readParam(params.city) || undefined,
    skill: readParam(params.skill) || undefined,
    experience: readParam(params.experience) || undefined,
    availability: readParam(params.availability) || undefined,
    status: readParam(params.status) || undefined,
  };

  const [session, staff, facets] = await Promise.all([
    getAdminSession(),
    listStaff(filters),
    getStaffFacets(),
  ]);

  const pending = staff.filter((member) =>
    ["pending_review", "under_verification"].includes(member.status),
  ).length;
  const approved = staff.filter((member) => member.status === "approved").length;
  const activeAssignments = staff.reduce(
    (sum, member) => sum + member.activeAssignments,
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="People & work"
        title="Staff registrations"
        subtitle="Review candidate dossiers, approve crew, search by city, skill, experience and availability, then assign them to live events."
        actions={
          <>
            <span className="admin-topbar-chip">
              <i aria-hidden="true" /> {staff.length} profile
              {staff.length === 1 ? "" : "s"} in view
            </span>
            <Link href="/admin/matching" className="admin-btn">
              <FiUsers aria-hidden="true" /> Staff matching
            </Link>
          </>
        }
      />

      <section className="admin-grid admin-grid-4" style={{ marginBottom: 16 }}>
        <MetricCard
          icon={<FiUsers aria-hidden="true" />}
          label="Profiles in view"
          value={formatNumber(staff.length)}
          suffix="results"
          tone="blue"
          foot="Filtered staff registrations"
        />
        <MetricCard
          icon={<FiUserCheck aria-hidden="true" />}
          label="Waiting review"
          value={formatNumber(pending)}
          suffix="queue"
          tone="yellow"
          foot="Pending or under verification"
        />
        <MetricCard
          icon={<FiCheckCircle aria-hidden="true" />}
          label="Approved"
          value={formatNumber(approved)}
          suffix="ready"
          tone="green"
          foot="Eligible for assignment"
        />
        <MetricCard
          icon={<FiBriefcase aria-hidden="true" />}
          label="Active assignments"
          value={formatNumber(activeAssignments)}
          suffix="shifts"
          tone="accent"
          foot="Across the filtered profiles"
        />
      </section>

      <form className="admin-filter-bar" method="get" role="search">
        <div className="admin-filter-grid is-seven">
          <div className="admin-field is-wide">
            <label className="admin-label" htmlFor="q">
              Search staff
            </label>
            <div style={{ position: "relative" }}>
              <FiSearch
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 10,
                  top: 12,
                  color: "var(--adm-subtle)",
                  fontSize: 13,
                }}
              />
              <input
                id="q"
                name="q"
                defaultValue={filters.q || ""}
                className="admin-input"
                style={{ paddingLeft: 30 }}
                placeholder="Name, mobile, email, city or registration ID"
              />
            </div>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="city">
              City
            </label>
            <select
              id="city"
              name="city"
              className="admin-select"
              defaultValue={filters.city || "all"}
            >
              <option value="all">All cities</option>
              {facets.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="skill">
              Skill
            </label>
            <select
              id="skill"
              name="skill"
              className="admin-select"
              defaultValue={filters.skill || "all"}
            >
              <option value="all">All skills</option>
              {facets.skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="experience">
              Experience
            </label>
            <select
              id="experience"
              name="experience"
              className="admin-select"
              defaultValue={filters.experience || "all"}
            >
              <option value="all">Any experience</option>
              <option value="fresher">Fresher</option>
              <option value="experienced">Experienced</option>
              <option value="2plus">2+ years</option>
              <option value="5plus">5+ years</option>
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="availability">
              Availability
            </label>
            <select
              id="availability"
              name="availability"
              className="admin-select"
              defaultValue={filters.availability || "all"}
            >
              <option value="all">Any availability</option>
              <option value="available_now">Available now</option>
              <option value="available_week">Available this week</option>
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="status">
              Review status
            </label>
            <select
              id="status"
              name="status"
              className="admin-select"
              defaultValue={filters.status || "all"}
            >
              <option value="all">All statuses</option>
              {STAFF_REVIEW_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STAFF_REVIEW_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-filter-actions">
            <button type="submit" className="admin-btn is-primary">
              <FiFilter aria-hidden="true" /> Apply
            </button>
            <Link href="/admin/staff" className="admin-btn is-ghost">
              <FiRefreshCw aria-hidden="true" /> Reset
            </Link>
          </div>
        </div>
      </form>

      <section className="admin-card">
        <CardHead
          title="Candidate pool"
          subtitle="Newest registrations first. Availability is calculated against today's date."
          action={
            <span className="admin-count-chip">
              {staff.length} profile{staff.length === 1 ? "" : "s"}
            </span>
          }
        />
        {staff.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>City</th>
                  <th>Skills</th>
                  <th>Experience</th>
                  <th>Availability</th>
                  <th>Assignments</th>
                  <th>Status</th>
                  <th className="is-right">Open</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div
                        style={{ display: "flex", gap: 9, alignItems: "center" }}
                      >
                        <span className="admin-avatar">
                          {initials(member.fullName)}
                        </span>
                        <span>
                          <Link
                            href={`/admin/staff/${member.id}`}
                            className="admin-row-title"
                            style={{ textDecoration: "none" }}
                          >
                            {member.fullName}
                          </Link>
                          <span className="admin-row-sub">
                            <code>{member.id}</code> · {member.mobileNumber}
                          </span>
                          <span className="admin-row-sub">
                            {member.experienceLevel} ·{" "}
                            {formatRelative(member.createdAt)}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="admin-row-title">
                        <FiMapPin aria-hidden="true" /> {member.currentCity}
                      </span>
                      <span className="admin-row-sub">
                        {member.preferredCities.length
                          ? `Also ${member.preferredCities.slice(0, 2).join(", ")}`
                          : "No preferred cities"}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <div className="admin-inline-list">
                        {member.skills.slice(0, 3).map((skill) => (
                          <span className="admin-tag" key={skill}>
                            {skill}
                          </span>
                        ))}
                        {member.skills.length > 3 ? (
                          <span className="admin-tag">
                            +{member.skills.length - 3}
                          </span>
                        ) : null}
                        {!member.skills.length ? (
                          <span className="admin-subtle admin-small">
                            No skills listed
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="is-nowrap">
                      {member.yearsExperience
                        ? `${member.yearsExperience} yrs`
                        : member.experienceLevel}
                      <span className="admin-row-sub">
                        {member.shiftTypes.slice(0, 2).join(", ") || "Shift TBC"}
                      </span>
                    </td>
                    <td>
                      <span className="admin-muted">{member.availabilityLabel}</span>
                      <span className="admin-row-sub">
                        {member.willingToTravel ? "Willing to travel" : "Local only"}
                        {member.transportAvailable ? " · Has transport" : ""}
                      </span>
                    </td>
                    <td className="is-nowrap">
                      <span className="admin-row-title">
                        {member.activeAssignments} active
                      </span>
                      <span className="admin-row-sub">
                        {member.completedAssignments} completed
                      </span>
                    </td>
                    <td className="is-nowrap">
                      <StatusPill
                        status={member.status}
                        label={member.statusLabel}
                      />
                    </td>
                    <td className="is-right is-nowrap">
                      <Link
                        href={`/admin/staff/${member.id}`}
                        className="admin-btn is-small"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No staff match these filters"
            action={
              <Link href="/admin/staff" className="admin-btn">
                Clear filters
              </Link>
            }
          >
            Try a different city, skill or availability window. New
            registrations appear here automatically.
          </EmptyState>
        )}
      </section>

      {!can(session!, "staff.review") ? (
        <p className="admin-subtle admin-small" style={{ marginTop: 12 }}>
          Your role has read-only access to staff profiles.
        </p>
      ) : null}
    </>
  );
}
