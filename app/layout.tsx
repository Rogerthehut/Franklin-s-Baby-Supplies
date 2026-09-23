import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Franklyn's Baby Supplies | Concept Preview",
  description: "A fresh shopping concept for baby essentials, repeat deliveries and flexible equipment hire.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
