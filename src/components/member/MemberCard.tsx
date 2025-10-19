"use client";

import React from "react";
import { Avatar, Typography } from "antd";
import { UserOutlined, StarFilled } from "@ant-design/icons";

interface MemberCardProps {
  name: string;
  email: string;
  avatar?: string;
  points: number;
  className?: string;
}

const MemberCard: React.FC<MemberCardProps> = ({
  name,
  email,
  avatar,
  points,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Avatar 
        size={80} 
        src={avatar || undefined}
        icon={<UserOutlined />}
        className="border-4 border-gray-100"
      />
      <div>
        <Typography.Title level={3} className="mb-1">
          {name}
        </Typography.Title>
        <Typography.Text type="secondary" className="block mb-2">
          {email}
        </Typography.Text>
        <div className="flex items-center gap-1">
          <StarFilled className="text-yellow-500" />
          <Typography.Text strong className="text-lg">
            {points} point
          </Typography.Text>
        </div>
      </div>
    </div>
  );
};

export default MemberCard; 