"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#151a23] text-white px-4">
      <div className="bg-[#23283a] rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Thanh toán thành công!</h2>
        <p className="mb-4">Cảm ơn bạn đã thanh toán. Mã booking của bạn là:</p>
        <div className="text-2xl font-mono text-yellow-400 mb-6">{bookingId}</div>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => router.push("/")}>Về trang chủ</Button>
          {bookingId && (
            <Button variant="outline" onClick={() => router.push(`/member/tickets?bookingId=${bookingId}`)}>
              Xem vé
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 