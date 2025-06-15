"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import BackTop from "antd/es/float-button/BackTop";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return (
      <>
        <main>{children}</main>
        <BackTop duration={200} visibilityHeight={50} />
      </>
    );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </header>
      <main className="min-h-screen pt-24">{children}</main>
      <BackTop duration={200} visibilityHeight={50} />
      <footer className="mt-8">
        <Footer />
      </footer>
    </>
  );
} 