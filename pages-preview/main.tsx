import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "@/app/page";
import FaqPage from "@/app/faq/page";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import CookiesPage from "@/app/cookies/page";
import ReturnsPolicyPage from "@/app/returns-policy/page";
import SitemapPage from "@/app/sitemap/page";
import { CookieBanner } from "@/components/cookie-banner";
import "@/app/globals.css";

// This static preview has no server, so it can't route requests itself.
// GitHub Pages is configured to fall back unmatched paths to this same
// index.html (see the 404.html copy in the deploy workflow); once that
// loads, this picks the right page from the URL the browser actually has.
const BASE = "/Franklyn-s-Baby-Supplies";
const PAGES: Record<string, () => JSX.Element> = {
  "/": Home,
  "/faq": FaqPage,
  "/privacy": PrivacyPage,
  "/terms": TermsPage,
  "/cookies": CookiesPage,
  "/returns-policy": ReturnsPolicyPage,
  "/sitemap": SitemapPage,
};

function currentPage() {
  let path = window.location.pathname;
  if (path.startsWith(BASE)) path = path.slice(BASE.length);
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return PAGES[path || "/"] ?? Home;
}

// Every page/component here is shared with the real deployment, which is
// served from a domain root, so their links are all root-relative
// (href="/faq"). Under this preview's "/Franklyn-s-Baby-Supplies/" subpath
// those same links would escape the site entirely, so rewrite the
// navigation at click time instead of touching the shared hrefs.
document.addEventListener("click", (event) => {
  const link = (event.target as HTMLElement)?.closest?.("a[href]") as HTMLAnchorElement | null;
  const href = link?.getAttribute("href") || "";
  if (!href.startsWith("/") || href.startsWith(BASE) || href.startsWith("//")) return;
  event.preventDefault();
  window.location.href = BASE + href;
});

const Page = currentPage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
    <CookieBanner />
  </StrictMode>,
);
