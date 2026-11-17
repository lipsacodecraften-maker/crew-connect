"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/**
 * The public site and the admin dashboard share a root layout, but the admin
 * area must not show the marketing header/footer. This small client boundary
 * keeps the existing public pages untouched.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isStaff = pathname?.startsWith("/staff");
  const hideChrome = isAdmin || isStaff;

  return (
    <>
      {hideChrome ? null : <SiteHeader />}
      {children}
      {/* {hideChrome ? null : <SiteFooter />} */}
    </>
  );
}
