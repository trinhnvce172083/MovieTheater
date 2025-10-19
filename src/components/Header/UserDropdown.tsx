"use client";

import React, { useState } from "react";
import { Dropdown, Avatar } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import ROUTES from "@/constants/routes";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";
import { useLogout } from "@/hooks/useAuth";

// Accept userName as a string
export default function UserDropdown({ userName }: { userName: string | null }) {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { logout: performLogout } = useLogout();

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
            onClick: async () => {
              try {
                // Sử dụng hook useLogout để xử lý logout an toàn
                await performLogout((message) => {
                  console.log(message); // Có thể thay bằng notification
                });
                
                // Dispatch Redux action để update state
                dispatch(logout());
                
              } catch (error) {
                console.error("Unexpected logout error:", error);
                
                // Fallback: force reload trang
                if (typeof window !== "undefined") {
                  window.location.href = "/auth/Login";
                }
              }
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