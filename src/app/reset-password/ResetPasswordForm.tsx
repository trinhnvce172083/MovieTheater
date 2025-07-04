"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LockOutlined } from "@ant-design/icons";
import { useResetPassword } from "@/hooks/ResetPassword/useResetPassword";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const { formData, error, success, isLoading, handleChange, handleSubmit } =
    useResetPassword();
  // Ensure the token is set in formData if not already
  if (formData.token !== token) {
    formData.token = token;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="new-password" className="text-gray-700 font-medium">
          New Password
        </Label>
        <div className="relative">
          <LockOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <Input
            id="new-password"
            type="password"
            value={formData.newPassword}
            onChange={(e) => handleChange("newPassword", e.target.value)}
            placeholder="Enter new password"
            className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="text-gray-700 font-medium">
          Confirm Password
        </Label>
        <div className="relative">
          <LockOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <Input
            id="confirm-password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            placeholder="Confirm new password"
            className="pl-10 border-gray-300 focus:border-gray-500 focus:ring-gray-500 rounded-lg"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      {success && (
        <p className="text-green-500 text-sm text-center">{success}</p>
      )}

      <Button
        type="submit"
        className="w-full bg-gray-800 text-white hover:bg-gray-900 transition-colors duration-200 rounded-lg py-3"
        disabled={isLoading}
      >
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
