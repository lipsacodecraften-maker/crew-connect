import { Suspense } from "react";
import type { Metadata } from "next";
import TrackClient from "./TrackClient";
import "../hire-manpower.css";

export const metadata: Metadata = {
  title: "Track your request | CrewConnect",
  description:
    "Track the live status, staffing plan and updates for your CrewConnect manpower booking request.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackBookingPage() {
  return (
    <Suspense
      fallback={
        <main className="mp-page">
          <div className="mp-container mp-track-shell">
            <div className="mp-track-loading" role="status">
              <span aria-hidden="true" />
              Loading request tracking…
            </div>
          </div>
        </main>
      }
    >
      <TrackClient />
    </Suspense>
  );
}
