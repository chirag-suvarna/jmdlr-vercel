import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Formatting Settings",
  robots: { index: false, follow: false },
};

export default function AdminPdfSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
