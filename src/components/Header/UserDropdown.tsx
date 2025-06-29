"use client";

import React, { useState } from "react";
import { Dropdown, Avatar } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { useRouter } from "next/navigation";
import { Logout_API } from "@/api/auth/Logout_API";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { clearAuthCookies } from "@/utils/authCookies";

type User = {
  name?: string;
  fullName?: string;
  username?: string;
  email?: string;
  avatar?: string | null;
  [key: string]: unknown;
};

export default function UserDropdown({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  // Ưu tiên hiển thị fullName, sau đó đến name, username, email
  const displayName = user.fullName || user.name || user.username || user.email || "User";

  return (
    <Dropdown
      open={open}
      onOpenChange={() => setOpen((prev) => !prev)}
      menu={{
        items: [
          {
            key: "profile",
            icon: <UserOutlined />,
            label: <Link href={ROUTES.MEMBER_DASHBOARD}>Profile</Link>,
          },
          { type: "divider" },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",            onClick: () => {
              Logout_API()
                .then(() => {
                  // Comprehensive cleanup of all authentication data
                  
                  // Clear all localStorage auth data
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("userInfo");
                  
                  // Clear sessionStorage auth data
                  sessionStorage.removeItem("accessToken");
                  
                  // Clear all auth cookies
                  clearAuthCookies();
                  
                  // Update Redux store
                  dispatch(logout());
                  
                  // Redirect to home page
                  router.push(ROUTES.HOME);
                })
                .catch((error) => {
                  console.error("Logout API failed:", error);
                  // Still perform cleanup even if API fails
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("authToken");
                  localStorage.removeItem("userInfo");
                  sessionStorage.removeItem("accessToken");
                  clearAuthCookies();
                  dispatch(logout());
                  router.push(ROUTES.HOME);
                });
            },
          },
        ],
      }}
      trigger={["click"]}
      placement="bottomRight"
      arrow
    >
      <div className="flex items-center cursor-pointer">
        <Avatar
          src={user.avatar || undefined}
          size={40}
          style={{ backgroundColor: "#87d068" }}
          icon={!user.avatar && <UserOutlined />}
        />
        <span className="ml-2">{displayName}</span>
      </div>
    </Dropdown>
  );
}