"use client";

import ROUTES from "@/constants/routes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoadingOutlined } from "@ant-design/icons";

const LoginFooter = () => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  const handleNavigation = async (route: string, type: string) => {
    setIsNavigating(type);
    try {
      await router.push(route);
    } finally {
      setIsNavigating(null);
    }
  };

  return (
    <footer className="border-t border-border/40 pt-6 mt-8">
      <div className="flex flex-col items-center gap-4">
        {/* Sign up section */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-50!">Don&apos;t have an account?</span>
          <Button
            variant="link"
            size="sm"
            onClick={() => handleNavigation(ROUTES.REGISTER, "signup")}
            disabled={isNavigating !== null}
            className="h-auto p-1 font-medium text-blue-500! hover:text-blue-600! disabled:opacity-50"
            aria-label="Navigate to sign up page"
          >
            {isNavigating === "signup" ? (
              <span className="flex items-center gap-2">
                <LoadingOutlined className="h-3 w-3 animate-spin" />
                Loading...
              </span>
            ) : (
              <>Sign up</>
            )}
          </Button>
        </div>

        {/* Forgot password section */}
        <div className="text-sm">
          <span className="text-gray-50!">Forgot your password?</span>
          <Button
            variant="link"
            size="sm"
            onClick={() => handleNavigation(ROUTES.FORGOT_PASSWORD, "forgot")}
            disabled={isNavigating !== null}
            className="h-auto p-1 font-medium text-blue-500! hover:text-blue-600! disabled:opacity-50"
            aria-label="Navigate to forgot password page"
          >
            {isNavigating === "forgot" ? (
              <span className="flex items-center gap-2">
                <LoadingOutlined className="h-3 w-3 animate-spin" />
                Loading...
              </span>
            ) : (
              <>Forgot Password?</>
            )}
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default LoginFooter;
