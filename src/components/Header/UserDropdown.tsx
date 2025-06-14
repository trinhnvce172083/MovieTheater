"use client";
import React, { useState } from "react";
import { Dropdown, Avatar } from "antd";
import { SettingOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import Link from "next/link";
import ROUTES from "@/constants/routes";

type User = {
  name: string;
  avatar?: string | null;
};

export default function UserDropdown({ user }: { user: User }) {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      open={open}
      onOpenChange={() => setOpen((prev) => !prev)}
      menu={{
        items: [
          {
            key: "settings",
            icon: <SettingOutlined />,
            label: <Link href={ROUTES.ACCOUNT + "/settings"}>Settings</Link>,
          },
          {
            key: "profile",
            icon: <UserOutlined />,
            label: <Link href={ROUTES.ACCOUNT}>Profile</Link>,
          },
          { type: "divider" },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Logout",
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
        <span className="ml-2">{user.name}</span>
      </div>
    </Dropdown>
  );
}