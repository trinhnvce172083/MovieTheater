"use client";

import React, { useState } from "react";
import { Dropdown, Avatar } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import ROUTES from "@/constants/routes";
import { useRouter } from "next/navigation";
import { Logout_API } from "@/api/auth/Logout_API";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";

// Accept userName as a string
export default function UserDropdown({ userName }: { userName: string | null }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  return (
    <Dropdown
      open={open}
      onOpenChange={() => setOpen((prev) => !prev)}
      menu={{
        items: [
          {
            key: "profile",
            icon: <UserOutlined />,
            label: "Profile",
            onClick: () => {
              router.push(ROUTES.MEMBER_DASHBOARD);
            },
          },
          { type: "divider" },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
            onClick: () => {
              Logout_API()
                .then(() => {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  localStorage.removeItem("userInfo");
                  localStorage.removeItem("isLoggedIn");
                  dispatch(logout());
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
          size={40}
          style={{ backgroundColor: "#87d068" }}
          icon={<UserOutlined />}
        />
        <span className="ml-2">{userName || "User"}</span>
      </div>
    </Dropdown>
  );
}