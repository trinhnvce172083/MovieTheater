"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ROUTES from "@/constants/routes";

export default function Redirect() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect after a short delay
    const redirectTimer = setTimeout(() => {
      router.push(ROUTES.HOME);
    }, 100);

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div>
      <h1>Redirecting...</h1>
      <p>If you are not redirected automatically, click the link below:</p>
      <Link href={ROUTES.HOME} style={{ textDecoration: "underline", color: "blue" }}>Go to Home</Link>
    </div>
  );
}
