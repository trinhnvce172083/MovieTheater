"use client";

import React from "react";

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex items-center justify-center min-h-screen">
      {/* Main content area */}
      <main className="pt-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-orange-900 to-black flex-1">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        {children}
      </main>
    </section>
  );
}
