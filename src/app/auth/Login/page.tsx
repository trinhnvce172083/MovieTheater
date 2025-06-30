"use client";
import { Login_API } from "@/api/auth/Login_API";
import { Card } from "@/components/ui/card";
import ROUTES from "@/constants/routes";
import { decodeJwt } from "@/hooks/decodeJwt";
import { cn } from "@/lib/utils";
import { login } from "@/store/slices/authSlice";
import { LoginFormValues } from "@/types/Login/LoginFormValues";
import { Form, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import LoginFooter from "./components/LoginFooter";
import LoginForm from "./components/LoginForm";

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useDispatch();

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
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
        const expiryTimeInMinutes = Math.floor((expiresAtMs - Date.now()) / 60000);
        const latestRefreshTime = new Date(expiresAtMs);
        const userInfoObj = {
          accountId: userInfo?.accountId || "",
          userName: userInfo?.sub || "",
          Role: userInfo?.role || "MEMBER",
          issuedAt: new Date(issuedAtMs).toLocaleString(),
          expiryTimeInMinutes: expiryTimeInMinutes.toString(),
          latestRefreshTime: latestRefreshTime.toLocaleString(),
        };

        // Store refresh token in localStorage for client-side access
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        // Store user information in localStorage
        localStorage.setItem("userInfo", JSON.stringify(userInfoObj));

        // Set a flag for logged-in status
        localStorage.setItem("isLoggedIn", "true");

        // Update Redux store
        dispatch(login({ token: accessToken }));

        if (userInfoObj?.Role === "ADMIN") {
          router.push(ROUTES.ADMIN_DASHBOARD);
        } else if (userInfo?.role === "MEMBER") {
          router.push(ROUTES.HOME);
        } else {
          message.error(
            "You do not have permission to access this application. Please contact your administrator."
          );
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error(
          "Connection error. Please check your internet connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center p-18">
      <Card
        className={cn(
          "w-full max-w-md shadow-lg p-8 bg-white/60 backdrop-blur-sm"
        )}
      >
        <Typography.Title level={2} className="text-center mb-6">
          Login
        </Typography.Title>
        <LoginForm loading={loading} onFinish={onFinish} form={form} />
        <LoginFooter />
      </Card>
    </div>
  );
};

export default LoginPage;
