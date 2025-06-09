"use client";

import React from "react";
import { MemberHeader } from "@/components/member";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user data - thực tế sẽ lấy từ context hoặc API
  const user = {
    name: "Alexa Rawles",
    email: "alexarawles@gmail.com",
    avatar: "/user-avatar.jpg", // placeholder
    points: 9999
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}
    >
      {/* Header */}
      <MemberHeader user={user} />

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
} 