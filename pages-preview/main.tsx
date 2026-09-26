import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { X } from "lucide-react";
import Home from "@/app/page";
import FaqPage from "@/app/faq/page";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import CookiesPage from "@/app/cookies/page";
import ReturnsPolicyPage from "@/app/returns-policy/page";
import SitemapPage from "@/app/sitemap/page";
import ForumPage from "@/app/forum/page";
import { CookieBanner } from "@/components/cookie-banner";
import "@/app/globals.css";

// This static preview has no server, so it can't route requests itself.
// GitHub Pages is configured to fall back unmatched paths to this same
// index.html (see the 404.html copy in the deploy workflow) for the case
// of a hard refresh, a direct URL, or a bookmark. Ordinary in-app link
// clicks are handled entirely client-side below, so they never depend on
// that server fallback at all.
const BASE = "/Franklyn-s-Baby-Supplies";
const PAGES: Record<string, () => JSX.Element> = {
  "/": Home,
  "/faq": FaqPage,
  "/privacy": PrivacyPage,
  "/terms": TermsPage,
  "/cookies": CookiesPage,
  "/returns-policy": ReturnsPolicyPage,
  "/sitemap": SitemapPage,
  "/forum": ForumPage,
};

function normalizedPath(pathname: string): string {
  let path = pathname;
  if (path.startsWith(BASE)) path = path.slice(BASE.length);
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path || "/";
}

const PREVIEW_MESSAGE = "Concept preview: this needs the live backend to work.";

// Paths that are only reachable via a real backend, which this static build
// doesn't have. There's no meaningful page to show for these, so link clicks
// to them are turned into the same preview toast instead of a confusing blank
// or fallen-back-to-homepage result.
const BACKEND_ONLY_PATHS = ["/admin"];

// Background writes that already fail silently by design (an optimistic
// heart-toggle, an autosaved basket, a vote, a logout that already cleared
// local state regardless) shouldn't also throw a toast on every occurrence:
// that would just be noise. Checkout already shows its own clear toast on
// failure. Everything else that mutates data (a deliberate "submit" click)
// is worth surfacing.
const SILENT_MUTATIONS: RegExp[] = [
  /^\/api\/account\/favourites/,
  /^\/api\/account\/basket$/,
  /^\/api\/account\/logout$/,
  /^\/api\/checkout$/,
  /^\/api\/feedback\/\d+\/vote$/,
];

function isToastworthyFailure(url: string, method: string): boolean {
  if (method === "GET" || method === "HEAD") return false;
  let pathname: string;
  try {
    pathname = new URL(url, window.location.origin).pathname;
  } catch {
    return false;
  }
  if (!pathname.includes("/api/")) return false;
  return !SILENT_MUTATIONS.some((pattern) => pattern.test(pathname));
}

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    // Every page/component here is shared with the real deployment, which is
    // served from a domain root, so their links are all root-relative
    // (href="/faq"). Under this preview's "/Franklyn-s-Baby-Supplies/"
    // subpath the same href would escape the site entirely if followed as a
    // normal navigation, so this rewrites it to a same-app URL and updates
    // the page purely client-side: no full reload, no dependency on the
    // GitHub Pages 404 fallback for a click that never has to leave the app.
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      const href = link?.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;

      const [path, hash] = href.split("#");
      if (BACKEND_ONLY_PATHS.includes(path)) {
        event.preventDefault();
        setToast(PREVIEW_MESSAGE);
        return;
      }

      if (!(normalizedPath(path) in PAGES)) {
        // Not one of this preview's SPA pages, e.g. the real /sitemap.xml
        // file linked from the sitemap page's body text. Let it actually
        // load rather than rendering it as a page, just with the base path
        // fixed up so it doesn't escape the site's subpath.
        event.preventDefault();
        window.location.href = BASE + href;
        return;
      }

      event.preventDefault();
      const nextUrl = BASE + path + (hash ? `#${hash}` : "");
      window.history.pushState({}, "", nextUrl);
      setPathname(BASE + path);
      if (hash) {
        setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 50);
      } else {
        window.scrollTo({ top: 0 });
      }
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    // This preview has no backend at all, so any real write (signing up,
    // posting to the forum, submitting a return) will fail here even though
    // it works on the real deployment. Surface that plainly instead of
    // leaving the request to fail invisibly or with a generic inline error.
    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
      const toastworthy = isToastworthyFailure(url, method);
      try {
        const response = await originalFetch(input, init);
        if (toastworthy && !response.ok) setToast(PREVIEW_MESSAGE);
        return response;
      } catch (error) {
        if (toastworthy) setToast(PREVIEW_MESSAGE);
        throw error;
      }
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const Page = PAGES[normalizedPath(pathname)] ?? Home;
  return (
    <>
      <Page />
      <CookieBanner />
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button onClick={() => setToast("")} aria-label="Dismiss notification">
            <X size={15} />
          </button>
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
