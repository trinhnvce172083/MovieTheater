"use client";

// app/member/layout.tsx
import { useState } from "react";
import MemberHeader from "@/components/member/MemberHeader";
import Header from "@/components/Header/Header";
import { Button } from "antd";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-[#d2e7f5]">
      <header className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </header>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <Button
          type="primary"
          icon={sidebarOpen ? <CloseOutlined /> : <MenuOutlined />}
          onClick={toggleSidebar}
          size="large"
          className="shadow-lg"
        />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static top-0 left-0 h-screen z-40
        w-[280px] bg-[#d2e7f5]
        transform transition-transform duration-300 ease-in-out
        overflow-y-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <MemberHeader onClose={() => setSidebarOpen(false)} />
      </aside>

      {/* Nội dung chính */}
      <main className="flex-1 p-4 lg:p-6 bg-white" style={{ paddingTop: 120, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
