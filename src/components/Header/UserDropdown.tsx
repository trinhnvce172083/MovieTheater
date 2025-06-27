"use client";

import React, { useState } from "react";
import { Dropdown, Avatar } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import { useRouter } from "next/navigation";
import { Logout_API } from "@/api/auth/Logout_API";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";

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
  const displayName =
    user.fullName || user.name || user.username || user.email || "User";

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
            label: "Logout",
            onClick: () => {
              Logout_API()
                .then(() => {
                  // Clear localStorage
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  localStorage.removeItem("userInfo");
                  localStorage.removeItem("isLoggedIn");

                  // Update Redux store
                  dispatch(logout());

                  // Redirect to home page
                  router.push(ROUTES.HOME);
                })
                .catch((error) => {
                  console.error("Logout failed:", error);
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
