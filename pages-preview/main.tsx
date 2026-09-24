import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
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

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);

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
    // the page purely client-side — no full reload, no dependency on the
    // GitHub Pages 404 fallback for a click that never has to leave the app.
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
      const href = link?.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;

      event.preventDefault();
      const [path, hash] = href.split("#");
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

  const Page = PAGES[normalizedPath(pathname)] ?? Home;
  return (
    <>
      <Page />
      <CookieBanner />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
