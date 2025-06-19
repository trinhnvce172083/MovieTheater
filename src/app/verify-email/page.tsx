"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useVerifyEmail } from "@/hooks/VerifyEmail/use-verify-email";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { verify } = useVerifyEmail();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

  useEffect(() => {
    if (token) {
      verify(token)
        .then(() => setStatus("success"))
        .catch(() => setStatus("error"));
    } else {
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {status === "pending" && <p>Đang xác thực email...</p>}
      {status === "success" && <p>Xác thực email thành công!</p>}
      {status === "error" && <p>Xác thực thất bại. Vui lòng thử lại.</p>}
    </div>
  );
}