"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useVerifyEmail } from "@/hooks/VerifyEmail/use-verify-email";
import {
  PendingVerification,
  SuccessVerification,
  ErrorVerification
} from "./components";

// Sử dụng type rõ ràng theo tài liệu Next.js mới
type Params = Promise<{ token: string }>;

export default function VerifyEmailPage(props: {
  params: Params
}) {  // Unwrap params sử dụng use() theo hướng dẫn mới
  const params = use(props.params);
  const token = params.token;
  const router = useRouter();
  const { verify } = useVerifyEmail();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  
  useEffect(() => {
    if (token) {
      verify(token)
        .then(() => {
          setStatus("success");
        })
        .catch((error) => {
          console.error("Email verification failed:", error);
          setStatus("error");
        });
    } else {
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  // Xử lý chuyển hướng
  const handleRedirect = () => {
    router.push("/auth/Login");  // Đường dẫn tường minh thay vì sử dụng ROUTES
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 w-full max-w-md mx-auto relative">
      {status === "pending" && <PendingVerification />}
      
      {status === "success" && (
        <SuccessVerification 
          onRedirect={handleRedirect}
          seconds={5}
        />
      )}
      
      {status === "error" && <ErrorVerification />}
    </div>
  );
}
