import Link from "next/link";
import { redirect } from "next/navigation";
import { FiArrowLeft, FiLock } from "react-icons/fi";

import { getAdminSession } from "@/lib/admin/auth";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  const params = await searchParams;
  const requestedNext = Array.isArray(params.next) ? params.next[0] : params.next;
  const next =
    requestedNext && /^\/admin(?:\/|$)/.test(requestedNext)
      ? requestedNext
      : "/admin";

  return (
    <div className="admin-login">
      <section className="admin-login-panel">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <span className="admin-brand-mark">
              <FiLock aria-hidden="true" />
            </span>
            <span>
              <strong>CrewConnect admin</strong>
              <small className="admin-subtle admin-small">
                Authorised staff only
              </small>
            </span>
          </div>

          <h2>Sign in to the desk</h2>
          <p>
            Use the work email and password issued by a super admin. Sessions
            expire after 12 hours.
          </p>

          <LoginForm next={next} />

          <div className="admin-login-meta">
            <Link href="/" className="admin-link"> <FiArrowLeft aria-hidden="true" /> 
             Public site  
            
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
