"use client";

import React from 'react';

export default function RegisterLayout({children}: {children: React.ReactNode}) {
  return (
    <section className="flex flex-col min-h-screen" suppressHydrationWarning>
      {/* Main content area */}
      <main className="pt-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-orange-900 to-black flex-1">
        {children}
      </main>
    </section>
  );
}