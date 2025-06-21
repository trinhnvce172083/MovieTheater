"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyEmailRedirectPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      // Redirect to dynamic route
      router.replace(`/verify-email/${token}`);
    } else {
      // If no token, show error on dynamic route
      router.replace('/verify-email/invalid');
    }
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <p>Đang chuyển hướng...</p>
    </div>
  );
}