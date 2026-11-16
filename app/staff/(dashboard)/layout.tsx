import { redirect } from "next/navigation";
import { getStaffSession } from "@/lib/staff/auth";
import StaffShell from "./StaffShell";

export const dynamic = "force-dynamic";

export default async function StaffDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getStaffSession();
  if (!session) redirect("/staff/login");

  return <StaffShell name={session.fullName}>{children}</StaffShell>;
}
