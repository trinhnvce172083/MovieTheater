"use client";

import ROUTES from "@/constants/routes";
import { useRouter } from "next/navigation";
import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { LoadingOutlined } from "@ant-design/icons";

const LoginFooter = memo(function LoginFooter() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState<string | null>(null);

  const handleNavigation = useCallback(
    async (route: string, type: string) => {
      setIsNavigating(type);
      try {
        await router.push(route);
      } finally {
        setIsNavigating(null);
      }
    },
    [router]
  );

  const footerSections = [
    {
      key: "signup-section",
      text: "Don't have an account?",
      buttonText: "Sign up",
      route: ROUTES.REGISTER,
      type: "signup",
    },
    {
      key: "forgot-section",
      text: "Forgot your password?",
      buttonText: "Forgot Password?",
      route: ROUTES.FORGOT_PASSWORD,
      type: "forgot",
    },
  ];

  return (
    <footer>
      <div className="flex flex-col items-center space-y-1 sm:space-y-2">
        {footerSections.map((section) => (
          <div
            key={section.key}
            className="flex flex-col sm:flex-row items-center sm:gap-2 text-xs sm:text-sm text-center"
          >
            <span className="text-gray-950!">{section.text}</span>
            <Button
              variant="link"
              size="sm"
              onClick={() => handleNavigation(section.route, section.type)}
              disabled={isNavigating !== null}
              className="h-auto p-0.5 sm:p-1 font-medium text-blue-500! hover:text-blue-600! disabled:opacity-50 text-xs sm:text-sm"
              aria-label={`Navigate to ${section.buttonText.toLowerCase()} page`}
            >
              {isNavigating === section.type ? (
                <span className="flex items-center gap-2">
                  <LoadingOutlined className="h-3 w-3 animate-spin" />
                  Loading...
                </span>
              ) : (
                <>{section.buttonText}</>
              )}
            </Button>
          </div>
        ))}
      </div>
    </footer>
  );
});

export default LoginFooter;
