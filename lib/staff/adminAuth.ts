import type { NextRequest } from "next/server";
import type { AdminPermission } from "@/lib/admin/constants";
import { authorizeAdminRequest } from "@/lib/admin/auth";

/**
 * Compatibility helper for the pre-dashboard staff endpoints.
 *
 * It now accepts either the legacy `x-admin-key` / Bearer key or a signed-in
 * admin session. New routes should call `authorizeAdminRequest` directly so
 * they can request a specific permission.
 */
export async function authorizeAdmin(
  request: NextRequest | Request,
  permission: AdminPermission = "staff.view",
) {
  const auth = await authorizeAdminRequest(request, { permission });
  return auth.ok ? null : auth.response;
}
