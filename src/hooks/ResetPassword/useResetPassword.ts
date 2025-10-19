"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ResetPasswordFormData } from "@/types/ResetPassword/types";

export const useResetPassword = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    newPassword: "",
    confirmPassword: "",
    token,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof ResetPasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Client-side validation
    if (!formData.newPassword || !formData.confirmPassword) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    if (!formData.token) {
      setError("Invalid or missing reset token");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post("http://localhost:3000/api/reset-password", {
        token: formData.token,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess("Password reset successfully!");
      setFormData({ newPassword: "", confirmPassword: "", token });
    } catch (err) {
      const errorMessage =
        err instanceof AxiosError && err.response?.data?.message
          ? err.response.data.message
          : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, error, success, isLoading, handleChange, handleSubmit };
};