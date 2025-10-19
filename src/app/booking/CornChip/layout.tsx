"use client";
import Footer from "@/components/Footer";
import React from "react";

export default function CornChipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Footer />
    </> 
  );
} 