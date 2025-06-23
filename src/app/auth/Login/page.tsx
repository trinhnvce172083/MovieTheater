"use client";
import React, { useState } from "react";
import { Typography, message, Form } from "antd";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import ROUTES from "@/constants/routes";
import { Login_API } from "@/api/auth/Login_API";
import { useDispatch } from "react-redux";
import { login } from "@/store/slices/authSlice";
import { decodeJwt } from "@/hooks/decodeJwt";
import { LoginFormValues } from "@/types/Login/LoginFormValues";
import LoginForm from "./components/LoginForm";
import LoginFooter from "./components/LoginFooter";
import { setAuthCookies } from "@/utils/authCookies";

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  
  // Get return URL from query parameter
  const returnUrl = searchParams.get('returnUrl');

  const onFinish = async (values: LoginFormValues) => {
    try {
      setLoading(true);
      const data = await Login_API({
        username: values.username,
        password: values.password,
        rememberMe: values.rememberMe || false,
      });
      const accessToken = data?.data?.accessToken;
      const refreshToken = data?.data?.refreshToken;
      if (accessToken) {
        const userInfo = decodeJwt(accessToken);
        const userRole = userInfo?.role || 'customer';
        
        // Store refresh token in localStorage for client-side access
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        
        // Set cookies for middleware-based route protection
        setAuthCookies(accessToken, userRole);
        
        // Update Redux store
        dispatch(login({ token: accessToken }));

        // Redirect based on returnUrl or user role
        if (returnUrl) {
          // Decode the returnUrl and navigate to it
          router.push(decodeURIComponent(returnUrl));
        } else {
          // Default redirects based on role
          if (userInfo?.role === "ADMIN") {
            router.push(ROUTES.ADMIN_DASHBOARD);
          } else if (userInfo?.role === "STAFF") {
            router.push(ROUTES.ADMIN_DASHBOARD); // Or staff dashboard if available
          } else {
            // Default for members or any other role
            router.push(ROUTES.HOME);
          }
        }
      } else {
        message.error(data?.message || "Login failed");
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
        {returnUrl && (
          <div className="mb-4 p-2 bg-orange-50 dark:bg-orange-950/30 rounded text-sm text-orange-800 dark:text-orange-300">
            You need to login to access the requested page
          </div>
        )}
        <LoginForm loading={loading} onFinish={onFinish} form={form} />
        <LoginFooter />
      </Card>
    </div>
  );
};

export default LoginPage;
