"use client";

import resetPassword from "@/api/auth/Reset_Password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EyeClosedIcon,
  EyeOpenIcon,
  LockClosedIcon,
} from "@radix-ui/react-icons";
import React, { useState } from "react";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    field: "newPassword" | "confirmPassword",
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword({
        token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      setSuccess("Password reset successful! You can now log in.");
      setFormData({ newPassword: "", confirmPassword: "" });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (
        typeof err === "object" &&
        err !== null &&
        apiErr.response &&
        typeof apiErr.response === "object" &&
        apiErr.response.data &&
        typeof apiErr.response.data === "object" &&
        apiErr.response.data.message
      ) {
        setError(apiErr.response.data.message as string);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-gray-700 font-medium">
          New Password
        </Label>
        <div className="relative">
          <LockClosedIcon className="text-gray-950! absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
            placeholder="Enter new password"
            className="pl-10 pr-10 text-gray-950! border-gray-300! focus:border-gray-500! focus:ring-gray-500! rounded-lg"
            disabled={isLoading}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500!"
            onClick={() => setShowNewPassword((v) => !v)}
          >
            {showNewPassword ? <EyeOpenIcon className="text-gray-500!" /> : <EyeClosedIcon className="text-gray-500!" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-gray-700! font-medium">
          Confirm Password
        </Label>
        <div className="relative">
          <LockClosedIcon className="text-gray-950! absolute left-3 top-1/2 transform -translate-y-1/2" />
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            placeholder="Confirm new password"
            className="pl-10 pr-10 text-gray-950! border-gray-300! focus:border-gray-500! focus:ring-gray-500! rounded-lg"
            disabled={isLoading}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500!"
            onClick={() => setShowConfirmPassword((v) => !v)}
          >
            {showConfirmPassword ? <EyeOpenIcon className="text-gray-500!" /> : <EyeClosedIcon className="text-gray-500!" />}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500! text-sm text-center">{error}</p>}
      {success && (
        <p className="text-green-500! text-sm text-center">{success}</p>
      )}

      <Button
        type="submit"
        className="w-full bg-gray-800! text-white! hover:bg-gray-900! transition-colors duration-200! rounded-lg py-3"
        disabled={isLoading}
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
