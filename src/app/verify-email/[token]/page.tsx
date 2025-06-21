"use client";

import { useEffect, useState } from "react";
import { useVerifyEmail } from "@/hooks/VerifyEmail/use-verify-email";

export default function VerifyEmailPage({
  params
}: {
  params: { token: string }
}) {
  const token = params.token;
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
