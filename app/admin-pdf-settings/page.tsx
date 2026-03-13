"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminPdfSettingsPanel from "@/components/admin/AdminPdfSettingsPanel";

export default function AdminPdfSettingsPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,var(--color-bg-primary),var(--color-bg-secondary))] text-[color:var(--color-text-primary)]">
      <Navbar />
      <main className="px-6 py-10">
        <AdminPdfSettingsPanel />
      </main>
      <Footer />
    </div>
  );
}
