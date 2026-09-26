import type { Metadata } from "next";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const SITE_URL = "https://franklynsbabysupplies.co.uk";
const TITLE = "Franklyn's Baby Supplies | Concept Preview";
const DESCRIPTION =
  "A fresh shopping concept for baby essentials, repeat deliveries and flexible equipment hire.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Franklyn's Baby Supplies",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Franklyn's Baby Supplies" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Franklyn's Baby Supplies",
  url: "https://franklynsbabysupplies.co.uk/",
  logo: "https://franklynsbabysupplies.co.uk/android-chrome-512x512.png",
  contactPoint: {
    "@type": "ContactPoint",
    email: "hello@franklynsbabysupplies.co.uk",
    contactType: "customer service",
    areaServed: "GB",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <CookieBanner />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  );
}
