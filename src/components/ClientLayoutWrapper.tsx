"use client";

import { usePathname } from "next/navigation";
import BackTop from "antd/es/float-button/BackTop";
import AuthInitializer from "./providers/AuthInitializer";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      <AuthInitializer key="auth-initializer" />
      <main key="main-content">{children}</main>
      <BackTop key="back-top" duration={200} visibilityHeight={50} />
    </>
  );
}