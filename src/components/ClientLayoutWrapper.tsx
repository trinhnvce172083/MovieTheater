"use client";

import { usePathname } from "next/navigation";
import BackTop from "antd/es/float-button/BackTop";
import AuthInitializer from "./providers/AuthInitializer";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      <AuthInitializer />
      <main>{children}</main>
      <BackTop duration={200} visibilityHeight={50} />
    </>
  );
}