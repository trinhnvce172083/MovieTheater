"use client";

import React from "react";
import ROUTES from "@/constants/routes";
import { useParams } from "next/navigation";

const ResetPasswordForm = React.lazy(() => import("./ResetPasswordForm"));

const ResetPassword: React.FC = () => {
  const params = useParams<{ id: string }>();
  const token = params.id;

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-white shadow-lg rounded-lg p-4 sm:p-8 md:p-10 lg:p-12">
        <div className="flex flex-col items-center mb-6 sm:mb-10">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
            Reset Password
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm md:text-base mt-2">
            Enter your new password below
          </p>
        </div>
        <ResetPasswordForm token={token} />
        <div className="mt-4 sm:mt-8 text-center">
          <a
            href={ROUTES.LOGIN}
            className="text-gray-600 text-xs sm:text-sm hover:text-gray-800 transition-colors duration-200"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

export function ResetPasswordPage({ params }: { params: { id: string } }) {
  return <ResetPasswordForm token={params.id} />;
}
