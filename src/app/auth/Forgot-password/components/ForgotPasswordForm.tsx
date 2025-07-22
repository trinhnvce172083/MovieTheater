import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Spin } from "antd";
import { MailOutlined } from "@ant-design/icons";
import forgotPassword from "@/api/auth/Forgot_Password";
import { toast } from "react-toastify";

interface ForgotPasswordFormProps {
  onSuccess: (email: string) => void;
}

export default function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
      onSuccess(email);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
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
            className="pl-10 h-12 bg-gray-50! border-gray-300! focus:border-blue-500! focus:ring-blue-500! rounded-lg text-gray-950! placeholder-gray-400"
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
  );
}
