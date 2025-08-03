"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  UserOutlined,
  ShoppingCartOutlined,
  ScanOutlined,
  TeamOutlined,
  HistoryOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useMemberProfile } from "@/hooks/member";

interface EmployeeHeaderProps {
  onClose?: () => void;
}

const EMPLOYEE_TABS = [
  {
    key: "account",
    label: "Thông tin tài khoản",
    icon: <UserOutlined />,
    path: "/employee",
  },
  {
    key: "ticket-selling",
    label: "Bán vé",
    icon: <ShoppingCartOutlined />,
    path: "/employee/ticket-selling",
  },
  {
    key: "booking-management",
    label: "Quản lý đặt vé",
    icon: <HistoryOutlined />,
    path: "/employee/booking-management",
  },
  {
    key: "customer-checkin",
    label: "Check-in khách hàng",
    icon: <ScanOutlined />,
    path: "/employee/checkin",
  },
  {
    key: "member-search",
    label: "Tìm kiếm thành viên",
    icon: <TeamOutlined />,
    path: "/employee/members",
  },
  {
    key: "settings",
    label: "Cài đặt",
    icon: <SettingOutlined />,
    path: "/employee/settings",
  },
];

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({ onClose }) => {
  const pathname = usePathname();
  const { profile } = useMemberProfile();

  const handleTabClick = () => {
    // Đóng mobile menu khi click vào tab
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed lg:static top-0 min-h-screen flex flex-col justify-between p-6 lg:p-10">
      {/* User Info (avatar, username, email từ API) */}
      <div>
        <div className="pt-16 lg:pt-24 flex flex-col items-center mb-6">
          {/* Avatar, Name, Email */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center mb-2 text-white text-2xl lg:text-3xl">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="avatar"
                  className="w-16 h-16 lg:w-20 lg:h-20 rounded-full object-cover"
                />
              ) : (
                <span>👔</span>
              )}
            </div>
            <p className="font-bold text-base lg:text-lg text-center">
              {profile?.fullName || profile?.username || ""}
            </p>
            <p className="text-gray-600 text-xs text-center">
              {profile?.email || ""}
            </p>
            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs mt-1">
              Nhân viên
            </div>
          </div>

          {/* Menu */}
          <div className="flex flex-col gap-y-3 lg:gap-y-4 mb-6 w-full">
            {EMPLOYEE_TABS.map((tab) => (
              <Link href={tab.path} key={tab.key} onClick={handleTabClick}>
                <button
                  className={`w-full text-left flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-2 rounded-full transition text-sm lg:text-base ${
                    pathname === tab.path
                      ? "bg-white shadow-md border-l-4 border-blue-500"
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                >
                  <span className="text-gray-800">{tab.icon}</span>
                  <span className="text-gray-800">{tab.label}</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHeader;