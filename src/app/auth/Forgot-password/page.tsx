"use client";

import forgotPassword from "@/api/auth/Forgot_Password";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spin } from "antd";
import {
  MailOutlined,
  ArrowLeftOutlined,
  LockOutlined,
} from "@ant-design/icons";
import ROUTES from "@/constants/routes";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required.");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success("Password reset link sent to your email.");
      setIsSubmitted(true);
      // Optional: Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push(ROUTES.LOGIN);
      }, 3000);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
      ) {
        toast.error(String(error.response.data.message));
      } else {
        toast.error("Failed to send reset link.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push(ROUTES.LOGIN);
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <MailOutlined className="text-green-600 text-2xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              Check Your Email
            </CardTitle>
            <p className="text-gray-600 text-sm leading-relaxed">
              We&#39;ve sent a password reset link to
            </p>
            <p className="text-blue-600 font-medium text-sm">{email}</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                Click the link in your email to reset your password. If you
                don&#39;t see it, check your spam folder.
              </p>
            </div>
            <Button
              onClick={handleBackToLogin}
              variant="outline"
              className="w-full mt-4 border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeftOutlined className="mr-2" />
              Back to Login
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Redirecting to login in 3 seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        {/* Back to Login Link */}
        <Button
          variant="default"
          onClick={handleBackToLogin}
          className="mb-6 inline-block align-middle bg-blue-600 text-gray-50 hover:bg-yellow-500 p-2 h-auto font-normal"
        >
          <ArrowLeftOutlined className="mr-2" />
          Back to Login
        </Button>

        <Card className="mt-4 w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center">
              <LockOutlined className="text-blue-600 text-2xl" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </CardTitle>
            <p className="text-gray-600 text-sm leading-relaxed">
              No worries! Enter your email address and we&#39;ll send you a link
              to reset your password.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-12 border-gray-300! focus:border-blue-500! focus:ring-blue-500! rounded-lg text-gray-950! placeholder-gray-400"
                  />
                  <MailOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400!" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 focus:ring-4! focus:ring-blue-200! text-white! font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spin size="small" className="text-gray-400!" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <MailOutlined />
                    <span>Send Reset Link</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Additional Help Section */}
            <div className="mt-6 pt-6 border-t border-gray-200!">
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
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Having trouble? Contact our support team for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
