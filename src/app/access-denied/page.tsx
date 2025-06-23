"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { roleNames, Role } from "@/casl/roles";
import ROUTES from "@/constants/routes";

export default function AccessDenied() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const roleName = user?.role ? roleNames[user.role as Role] || 'User' : 'Guest';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold">Quyền truy cập bị từ chối</h2>
          <p className="mt-2 text-sm text-gray-400">
            Bạn không có quyền truy cập vào trang này.
          </p>
          
          {isLoggedIn && (
            <div className="mt-4 p-3 bg-orange-950/30 rounded-lg">
              <p className="text-sm">
                Bạn đang đăng nhập với vai trò <span className="font-semibold text-orange-400">{roleName}</span>, 
                nhưng không có đủ quyền để truy cập trang này.
              </p>
            </div>
          )}
          
          {!isLoggedIn && (
            <div className="mt-4 p-3 bg-orange-950/30 rounded-lg">
              <p className="text-sm">
                Bạn cần đăng nhập với tài khoản có quyền truy cập phù hợp.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          <Button 
            onClick={() => router.back()} 
            variant="outline"
            className="border-orange-500/30 hover:border-orange-500/50"
          >
            Quay lại trang trước
          </Button>
          
          <Link href={ROUTES.HOME} className="inline-block">
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              Về trang chủ
            </Button>
          </Link>
          
          {isLoggedIn ? (
            <div className="flex flex-col space-y-2">
              <p className="text-sm text-gray-400">Bạn muốn đăng nhập với tài khoản khác?</p>
              <Link href="/api/auth/Logout" className="inline-block">
                <Button variant="link" className="w-full text-orange-400 hover:text-orange-300">
                  Đăng xuất và đăng nhập lại
                </Button>
              </Link>
            </div>
          ) : (
            <Link href={ROUTES.LOGIN} className="inline-block">
              <Button variant="link" className="w-full text-orange-400 hover:text-orange-300">
                Đăng nhập ngay
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
