"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import ForgotPasswordSuccess from "./components/ForgotPasswordSuccess";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LockClosedIcon, ArrowLeftIcon } from "@radix-ui/react-icons";
import ROUTES from "@/constants/routes";

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSuccess = (email: string) => {
    setEmail(email);
    setIsSubmitted(true);
    setTimeout(() => {
      router.push(ROUTES.LOGIN);
    }, 3000);
  };

  const handleBackToLogin = () => {
    router.push(ROUTES.LOGIN);
  };

  if (isSubmitted) {
    return (
      <ForgotPasswordSuccess email={email} onBackToLogin={handleBackToLogin} />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-2 sm:p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        {/* Back to Login Link */}
        <Button
          variant="default"
          onClick={handleBackToLogin}
          className="mb-6 flex items-center whitespace-nowrap align-middle bg-blue-600 text-gray-50 hover:bg-yellow-500 p-2 h-auto font-normal"
        >
          <ArrowLeftIcon className="mr-2 w-4 h-4" />
          Back to Login
        </Button>

        <Card className="mt-4 w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm p-3 sm:p-6 md:p-8">
          <CardHeader className="text-center pb-4 sm:pb-8">
            <div className="mx-auto mb-4 w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <LockClosedIcon className="text-blue-600 w-8 h-8" />
            </div>
            <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </CardTitle>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed">
              No worries! Enter your email address and we&#39;ll send you a link
              to reset your password.
            </p>
          </CardHeader>

          <CardContent>
            <ForgotPasswordForm onSuccess={handleSuccess} />
            {/* Additional Help Section */}
            <div className="mt-4 sm:mt-8 pt-4 sm:pt-8 border-t border-gray-200!">
              <div className="text-center">
                <p className="text-sm text-gray-600! mb-3">
                  Remember your password?
                </p>
                <Button
                  variant="link"
                  onClick={handleBackToLogin}
                  className="text-gray-600! font-medium p-0 h-auto"
                >
                  Sign in instead
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-4 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Having trouble? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
