"use client";

import React from "react";
import ResetPasswordForm from "./ResetPasswordForm";
import ROUTES from "@/constants/routes";

const ResetPassword: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Reset Password
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter your new password below
          </p>
        </div>
        <ResetPasswordForm token="" />
        <div className="mt-6 text-center">
          <a
            href={ROUTES.LOGIN}
            className="text-gray-600 text-sm hover:text-gray-800 transition-colors duration-200"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
