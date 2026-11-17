import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { getSidebarCounts } from "@/lib/admin/overview";
import AdminShell from "../_components/AdminShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const counts = await getSidebarCounts();

  return (
    <AdminShell session={session} counts={counts}>
      {children}
    </AdminShell>
  );
}
