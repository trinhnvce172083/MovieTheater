"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Avatar, Badge } from "antd";
import { UserOutlined, HistoryOutlined, FileTextOutlined, SettingOutlined, BellOutlined, SettingFilled } from "@ant-design/icons";

interface MemberHeaderProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
    points: number;
  };
}

const MEMBER_TABS = [
  { 
    key: 'account', 
    label: 'Account Information', 
    icon: <UserOutlined />,
    path: '/member'
  },
  { 
    key: 'history', 
    label: 'History', 
    icon: <HistoryOutlined />,
    path: '/member/history'
  },
  { 
    key: 'booked', 
    label: 'Booked ticket', 
    icon: <FileTextOutlined />,
    path: '/member/bookings'
  },
  { 
    key: 'managed', 
    label: 'Managed ticket', 
    icon: <SettingOutlined />,
    path: '/member/tickets'
  },
];

const MemberHeader: React.FC<MemberHeaderProps> = ({ user }) => {
  const pathname = usePathname();

  return (
    <div className="bg-white/10 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/Logo.png"
                alt="Logo"
                width={60}
                height={60}
                className="w-12 h-12"
              />
            </Link>
          </div>

          {/* Navigation tabs */}
          <div className="hidden md:flex gap-2">
            {MEMBER_TABS.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.key}
                  href={tab.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-gray-800 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {tab.icon}
                  <span className="hidden lg:inline">{tab.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <div className="text-white font-semibold text-sm">{user.name}</div>
              <div className="text-white/80 text-xs">{user.email}</div>
            </div>
            
            <Avatar 
              size={40} 
              src={user.avatar}
              icon={<UserOutlined />}
              className="border-2 border-white/30"
            />
            
            <div className="flex items-center gap-3">
              <Badge count={5} size="small">
                <BellOutlined className="text-white text-xl hover:text-white/80 cursor-pointer transition-colors" />
              </Badge>
              <SettingFilled className="text-white text-xl cursor-pointer hover:text-white/80 transition-colors" />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-4">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {MEMBER_TABS.map((tab) => {
              const isActive = pathname === tab.path;
              return (
                <Link
                  key={tab.key}
                  href={tab.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white text-gray-800 shadow-lg"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  {tab.icon}
                  <span className="text-xs">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberHeader; 