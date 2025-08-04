import { Role } from "@/constants/roles";
import ROUTES from "@/constants/routes";
import type { RootState } from "@/store";
import { message } from "antd";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function usePermission() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useSelector((state: RootState) => state.auth.token);
  const authState = useSelector((state: RootState) => state.auth);
  const userInfo = authState.userInfo;

  useEffect(() => {
    if (!accessToken) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    // ADMIN can access all routes
    if (userInfo?.Role === Role.ADMIN) {
      setLoading(false);
      return;
    }

    // MEMBER can access /member
    if (userInfo?.Role === Role.MEMBER && pathname.startsWith("/member")) {
      setLoading(false);
      return;
    }

    // Unauthorized access
    message.error("You do not have permission to access this page.");
    router.replace(ROUTES.ACCESS_DENIED);
  }, [accessToken, userInfo, pathname, router]);

  return { loading };
}
