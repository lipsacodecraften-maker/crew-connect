import type { Metadata } from "next";
import HireManpowerClient from "./HireManpowerClient";
import "./hire-manpower.css";

export const metadata: Metadata = {
  title: "Hire Manpower | CrewConnect",
  description:
    "Build a multi-role event staffing request, review the full brief and track your booking with CrewConnect.",
};

export default function HireManpowerPage() {
  return <HireManpowerClient />;
}
