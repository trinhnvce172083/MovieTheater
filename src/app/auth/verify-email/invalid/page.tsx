"use client";

export default function InvalidTokenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">Xác thực thất bại</h2>
        <p className="text-red-600 mb-4">
          Token xác thực không hợp lệ hoặc đã hết hạn.
        </p>
        <p className="text-gray-600">
          Vui lòng kiểm tra lại email hoặc liên hệ với bộ phận hỗ trợ nếu bạn cần giúp đỡ.
        </p>
      </div>
    </div>
  );
}
