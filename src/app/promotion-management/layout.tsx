"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Tooltip } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  VideoCameraOutlined,
  GiftOutlined,
  CalendarOutlined,
  SettingOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";
import Image from "next/image";

const { Sider, Content } = Layout;

export default function PromotionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: ROUTES.ADMIN_DASHBOARD,
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: ROUTES.ADMIN_USERS,
      icon: <UserOutlined />,
      label: "Member management",
    },
    {
      key: ROUTES.ADMIN_MOVIES,
      icon: <VideoCameraOutlined />,
      label: "Movie management",
    },
    {
      key: "/admin/rooms",
      icon: <BankOutlined />,
      label: "Room management",
    },
    {
      key: "/admin/promotions",
      icon: <GiftOutlined />,
      label: "Promotion management",
    },
    {
      key: "/admin/bookings",
      icon: <CalendarOutlined />,
      label: "Booking management",
    },
  ];

  const handleToggleCollapse = () => {
    setIsAnimating(true);
    setCollapsed(!collapsed);

    // Reset animation state after transition completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Custom styles for smooth animations
  const siderStyle = {
    position: "fixed" as const,
    height: "100vh",
    left: 0,
    top: 0,
    bottom: 0,
    background: "linear-gradient(180deg, #233554 0%, #274690 100%)",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start" as const,
    transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
    zIndex: 100,
    boxShadow: collapsed
      ? '4px 0 12px rgba(0, 0, 0, 0.1)'
      : '8px 0 24px rgba(0, 0, 0, 0.12)',
  };

  const toggleButtonStyle = {
    position: 'absolute' as const,
    top: '20px',
    right: collapsed ? '-20px' : '-20px',
    zIndex: 101,
    transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
    transform: `translateX(${collapsed ? '0px' : '0px'}) scale(${isAnimating ? '0.95' : '1'})`,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    background: 'linear-gradient(135deg, #274690 0%, #1d3557 100%)',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  };

  const logoContainerStyle = {
    opacity: collapsed ? 0 : 1,
    transform: collapsed ? 'translateY(-10px) scale(0.9)' : 'translateY(0) scale(1)',
    transition: 'all 0.4s cubic-bezier(0.645, 0.045, 0.355, 1)',
    transitionDelay: collapsed ? '0ms' : '100ms',
  };

  const contentStyle = {
    marginLeft: collapsed ? 80 : 240,
    transition: 'margin-left 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
    minHeight: "100vh",
    background: "#f5f5f5",
  };

  return (
    <Layout>
      <Sider
        width={240}
        theme="light"
        className="shadow-lg"
        style={siderStyle}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        collapsedWidth={80}
      >
        {/* Enhanced Toggle Button */}
        <Tooltip
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          placement="right"
          mouseEnterDelay={0.5}
        >
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={handleToggleCollapse}
            style={toggleButtonStyle}
            className="hover:scale-105 active:scale-95"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `translateX(0px) scale(1.05)`;
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `translateX(0px) scale(1)`;
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          />
        </Tooltip>

        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          paddingTop: collapsed ? '80px' : '20px',
          transition: 'padding-top 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)'
        }}>
          {/* Logo Section with Enhanced Animation */}
          <div
            className="flex flex-col items-center py-8"
            style={logoContainerStyle}
          >
            <div style={{
              position: 'relative',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: 12,
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
            }}>
              <Image
                src="/Logo.png"
                alt="Lumiere Logo"
                width={80}
                height={80}
                style={{
                  borderRadius: "50%",
                  background: "#111",
                  transition: 'all 0.3s ease',
                }}
              />
            </div>
            <div style={{
              marginTop: 16,
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? 'translateY(10px)' : 'translateY(0)',
              transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
              transitionDelay: collapsed ? '0ms' : '150ms',
            }}>
              <h3 style={{
                color: '#fff',
                fontSize: '18px',
                fontWeight: '600',
                margin: 0,
                textAlign: 'center',
                letterSpacing: '0.5px',
              }}>
                Admin Panel
              </h3>
            </div>
          </div>

          {/* Divider with Animation */}
          <div
            className="mx-6 mb-4"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? 'scaleX(0)' : 'scaleX(1)',
              transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
              transitionDelay: collapsed ? '0ms' : '200ms',
            }}
          />

          {/* Enhanced Menu */}
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={({ key }) => router.push(key)}
            className="bg-transparent font-medium admin-sidebar-menu"
            style={{
              background: "transparent",
              color: "#fff",
              border: "none",
              flex: 1,
            }}
            inlineIndent={collapsed ? 0 : 24}
            theme="dark"
          />
        </div>

        {/* Enhanced Settings Icon */}
        <div style={{
          position: "absolute",
          bottom: 24,
          left: collapsed ? '50%' : '24px',
          transform: collapsed ? 'translateX(-50%)' : 'none',
          transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
        }}>
          <Tooltip title="Settings" placement={collapsed ? "right" : "top"}>
            <Button
              type="text"
              icon={<SettingOutlined />}
              style={{
                color: '#fff',
                fontSize: '20px',
                opacity: 0.85,
                border: 'none',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                width: collapsed ? '40px' : 'auto',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
              }}
              className="hover:bg-white/20 hover:scale-105"
            >
              {!collapsed && <span style={{ marginLeft: 8, fontSize: '14px' }}>Settings</span>}
            </Button>
          </Tooltip>
        </div>
      </Sider>

      <Layout style={contentStyle}>
        <Content
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            transition: 'all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)',
          }}
          className="m-6 p-6 rounded-xl shadow-sm"
        >
          <div className="w-full" style={{ maxWidth: "100%" }}>
            {children}
          </div>
        </Content>
      </Layout>

      {/* Custom CSS for additional enhancements */}
      <style jsx global>{`
        .admin-sidebar-menu .ant-menu-item {
          margin: 4px 8px !important;
          border-radius: 8px !important;
          transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1) !important;
          backdrop-filter: blur(10px);
        }

        .admin-sidebar-menu .ant-menu-item:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          transform: translateX(4px);
        }

        .admin-sidebar-menu .ant-menu-item-selected {
          background: rgba(255, 255, 255, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .admin-sidebar-menu .ant-menu-item .ant-menu-item-icon {
          transition: all 0.3s ease !important;
        }

        .admin-sidebar-menu .ant-menu-item:hover .ant-menu-item-icon {
          transform: scale(1.1);
        }
      `}</style>
    </Layout>
  );
}