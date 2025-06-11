import React, { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface LoginLayoutProps {
  children: ReactNode;
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="login-layout relative min-h-screen w-full overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </header>

      {/* Main content */}
      <main className="min-h-screen pt-24 flex items-center justify-center">
        {children}
      </main>

      {/* Footer */}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
