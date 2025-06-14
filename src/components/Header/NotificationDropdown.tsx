"use client";
import React, { useState } from "react";
import { Dropdown} from "antd";
import { BellOutlined } from "@ant-design/icons";

export default function NotificationDropdown() {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "1",
            label: "No new notifications",
          },
          // Add more notifications here if needed
        ],
      }}
      open={notifOpen}
      onOpenChange={() => setNotifOpen((prev) => !prev)}
      trigger={["click"]}
      placement="bottomRight"
      arrow
    >
      <BellOutlined className="text-xl cursor-pointer hover:text-blue-500" />
    </Dropdown>
  );
}