import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { contentSecurityPolicy } from "./src/lib/csp.mjs";

const CSP_KEY =
  process.env.CSP_REPORT_ONLY === "1"
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";
const CSP_VALUE = contentSecurityPolicy();

function applyCSP(res: NextResponse) {
  res.headers.set(CSP_KEY, CSP_VALUE);
  return res;
}

// Sets CSP on HTML pages. Also keeps the auth session fresh on gated
// areas (admin panel + dedup review console).
export async function middleware(req: NextRequest) {
  const isGated =
    req.nextUrl.pathname.startsWith("/admin") ||
    req.nextUrl.pathname.startsWith("/deduplicar");

  if (!isGated) {
    return applyCSP(NextResponse.next({ request: req }));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let res = applyCSP(NextResponse.next({ request: req }));
  if (!url || !key) return res;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => req.cookies.set(name, value));
        res = applyCSP(NextResponse.next({ request: req }));
        toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  await supabase.auth.getUser();
  return res;
}

export const config = {
  // HTML pages only — skip static assets, API routes, images, and manifests.
  matcher: ["/((?!_next/static|_next/image|api/|.*\\.(?:ico|webmanifest|xml|txt|png|jpg|jpeg|svg|webp|js|css|woff2?)).*)"],
};
