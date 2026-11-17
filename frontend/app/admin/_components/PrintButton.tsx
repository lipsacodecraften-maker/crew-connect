"use client";

import { FiPrinter } from "react-icons/fi";

export default function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      className="admin-btn admin-no-print"
      onClick={() => window.print()}
    >
      <FiPrinter aria-hidden="true" />
      {label}
    </button>
  );
}
