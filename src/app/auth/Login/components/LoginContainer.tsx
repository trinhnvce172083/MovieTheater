"use client";

import { Login_API } from "@/api/auth/Login_API";
import { Card } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import ROUTES from "@/constants/routes";
import { decodeJwt } from "@/hooks/decodeJwt";
import { login } from "@/store/slices/authSlice";
import { LoginFormValues } from "@/types/Login/LoginFormValues";
import { Form, Typography } from "antd";
import { useRouter } from "next/navigation";
import React, { useState, useCallback, memo } from "react";
import { useDispatch } from "react-redux";
import LoginFooter from "./LoginFooter";
import LoginForm from "./LoginForm";

// Memoize the LoginContainer to prevent unnecessary re-renders
const LoginContainer = memo(function LoginContainer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useDispatch();

  // Use useCallback to memoize the function and prevent re-renders
  const handleFinish = useCallback(
    async (values: LoginFormValues) => {
      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const data = await Login_API({
          username: values.username,
          password: values.password,
          rememberMe: values.rememberMe || false,
        });

        const accessToken = data?.data?.accessToken;
        if (accessToken) {
          const userInfo = decodeJwt(accessToken);
          const refreshToken = data?.data?.refreshToken;
          const issuedAtMs = Date.now();
          const expiresAtMs = userInfo?.exp ? Number(userInfo.exp) * 1000 : 0;
          const expiryTimeInMinutes = Math.floor(
            (expiresAtMs - Date.now()) / 60000
          );
          const latestRefreshTime = new Date(expiresAtMs);
          const userInfoObj = {
            accountId: userInfo?.accountId || "",
            userName: userInfo?.sub || "",
            Role: userInfo?.role || "MEMBER",
            issuedAt: new Date(issuedAtMs).toLocaleString(),
            expiryTimeInMinutes: expiryTimeInMinutes.toString(),
            latestRefreshTime: latestRefreshTime.toLocaleString(),
          };

          // Store tokens and user info
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("userInfo", JSON.stringify(userInfoObj));
          localStorage.setItem("isLoggedIn", "true");

          // Update Redux store
          dispatch(login({ token: accessToken }));

          // Navigate based on role
          if (userInfoObj?.Role === "ADMIN") {
            router.push(ROUTES.ADMIN_DASHBOARD);
          } else if (userInfo?.role === "MEMBER") {
            router.push(ROUTES.HOME);
          } else {
            setError(
              new Error(
                "You do not have permission to access this application. Please contact your administrator."
              )
            );
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error);
        } else {
          setError(
            new Error(
              "Connection error. Please check your internet connection."
            )
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [router, dispatch]
  );

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen h-screen flex items-center justify-center p-1 sm:p-2 md:p-4 lg:p-8 xl:p-12">
        <Card
          className="w-full gap-0 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-md shadow-lg p-1 sm:p-2 md:p-4 rounded-lg sm:rounded-xl"
          style={{ background: "#F8F6F3", backdropFilter: "blur(8px)" }}
        >
          <Typography.Title
            level={2}
            className="text-center mb-2 sm:mb-4 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold"
            style={{ color: "#3C2414" }}
          >
            Log In
          </Typography.Title>
          <LoginForm
            loading={loading}
            onFinish={handleFinish}
            form={form}
            error={error}
          />
          <div className="mt-1 sm:mt-2">
            <LoginFooter />
          </div>
        </Card>
      </div>
    </>
  );
});

export default LoginContainer;
