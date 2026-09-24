import type { Metadata } from "next";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Franklyn's Baby Supplies | Concept Preview",
  description: "A fresh shopping concept for baby essentials, repeat deliveries and flexible equipment hire.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Franklyn's Baby Supplies",
  url: "https://franklynsbabysupplies.co.uk/",
  logo: "https://franklynsbabysupplies.co.uk/favicon.svg",
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
