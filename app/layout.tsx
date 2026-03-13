import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "JMDLR — Open Access Multidisciplinary Legal Research Journal",
    template: "%s | JMDLR",
  },
  description:
    "JMDLR is an open-access, peer-reviewed journal publishing multidisciplinary legal research across policy, technology, economics, and social justice.",
  keywords: [
    "open access journal",
    "legal research",
    "multidisciplinary law",
    "peer-reviewed",
    "law and policy",
    "IJCLSI",
    "JMDLR",
    "academic publishing",
    "research papers",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    siteName: "JMDLR",
    title: "JMDLR — Open Access Multidisciplinary Legal Research Journal",
    description:
      "Open-access, peer-reviewed legal scholarship connecting law with other disciplines.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JMDLR — Open Access Multidisciplinary Legal Research Journal",
    description:
      "Open-access, peer-reviewed legal scholarship connecting law with other disciplines.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
