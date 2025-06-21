"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVerifyEmail } from "@/hooks/VerifyEmail/use-verify-email";
import ROUTES from "@/constants/routes";

// Sử dụng type rõ ràng theo tài liệu Next.js mới
type Params = Promise<{ token: string }>;

export default function VerifyEmailPage(props: {
  params: Params
}) {
  // Unwrap params sử dụng use() theo hướng dẫn mới
  const params = use(props.params);
  const token = params.token;
  const router = useRouter();
  const { verify } = useVerifyEmail();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (token) {
      verify(token)
        .then(() => {
          setStatus("success");
          // Bắt đầu đếm ngược khi xác thực thành công
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                router.push(ROUTES.LOGIN);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(timer);
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

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 max-w-md mx-auto">
      {status === "pending" && (
        <div className="text-center p-8 bg-gray-50 rounded-lg shadow-md w-full animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin"></div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Đang xác thực email</h2>
          <p className="text-gray-500">Vui lòng đợi trong giây lát...</p>
        </div>
      )}
      
      {status === "success" && (
        <div className="text-center p-8 bg-green-50 border border-green-200 rounded-lg shadow-md w-full animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Xác thực email thành công!</h2>
          <p className="text-green-600 mb-4">Tài khoản của bạn đã được kích hoạt.</p>
          <p className="text-gray-600 mb-2">
            Đang chuyển đến trang đăng nhập trong <span className="font-bold">{countdown}</span> giây...
          </p>
          <Link href={ROUTES.LOGIN} className="text-blue-500 hover:text-blue-700 font-medium">
            Đăng nhập ngay →
          </Link>
        </div>
      )}
      
      {status === "error" && (
        <div className="text-center p-8 bg-red-50 border border-red-200 rounded-lg shadow-md w-full">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Xác thực thất bại</h2>
          <p className="text-red-600 mb-4">
            Liên kết xác thực không hợp lệ hoặc đã hết hạn.
          </p>
          <div className="flex flex-col space-y-2">
            <Link 
              href={ROUTES.LOGIN} 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Đăng nhập
            </Link>
            <Link 
              href="/" 
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
