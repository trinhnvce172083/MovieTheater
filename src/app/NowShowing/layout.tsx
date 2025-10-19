import React from "react";
import dynamic from "next/dynamic";

// Dynamic imports for Header and Footer
const Header = dynamic(() => import("@/components/Header/Header"), {
  loading: () => <div className="h-16 bg-gray-900 animate-pulse"></div>,
});

const Footer = dynamic(() => import("@/components/Footer"), {
  loading: () => <div className="h-32 bg-gray-900 animate-pulse"></div>,
});

export default function NowShowingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col min-h-screen">
      {/* Header section */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </header>

      {/* Main content area */}
      <main className="pt-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-orange-900 to-black flex-1">
        {children}
      </main>

      {/* Footer section */}
      <footer className="mt-auto">
        <Footer />
      </footer>
    </section>
  );
}
