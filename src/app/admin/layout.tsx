"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Tooltip, Drawer } from "antd";
import {
  UserOutlined,
  VideoCameraOutlined,
  GiftOutlined,
  CalendarOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ShoppingOutlined,
  ScheduleOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import ROUTES from "@/constants/routes";
import Image from "next/image";
import AdminHeader from "./AdminHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const { Sider, Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  // Listen for mobile menu toggle event
  useEffect(() => {
    const handleMobileMenuToggle = () => {
      if (isMobile) {
        setMobileDrawerOpen(!mobileDrawerOpen);
      }
    };

    window.addEventListener('toggleMobileMenu', handleMobileMenuToggle);
    return () => {
      window.removeEventListener('toggleMobileMenu', handleMobileMenuToggle);
    };
  }, [isMobile, mobileDrawerOpen]);

  const menuItems = [
    {
      key: ROUTES.ADMIN_DASHBOARD,
      icon: <BarChartOutlined />,
      label: "Dashboard",
    },
    {
      key: ROUTES.ADMIN_MEMBERS,
      icon: <UserOutlined />,
      label: "Members",
    },
    {
      key: ROUTES.ADMIN_MOVIES,
      icon: <VideoCameraOutlined />,
      label: "Movies",
    },
    {
      key: ROUTES.ADMIN_SCHEDULES,
      icon: <ScheduleOutlined />,
      label: "Schedules",
    },
    {
      key: ROUTES.ADMIN_ROOMS,
      icon: <BankOutlined />,
      label: "Rooms",
    },
    {
      key: ROUTES.ADMIN_PROMOTIONS,
      icon: <GiftOutlined />,
      label: "Promotions",
    },
    {
      key: ROUTES.ADMIN_BOOKINGS,
      icon: <CalendarOutlined />,
      label: "Bookings",
    },
    {
      key: ROUTES.ADMIN_CONCESSIONS,
      icon: <ShoppingOutlined />,
      label: "Concessions",
    },
  ];

  const handleToggleCollapse = () => {
    if (isMobile) {
      setMobileDrawerOpen(!mobileDrawerOpen);
    } else {
      setIsAnimating(true);
      setCollapsed(!collapsed);
      
      // Reset animation state after transition completes
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };
  // Enhanced styles with modern gradient and glass effect
  const siderStyle = {
    position: "fixed" as const,
    height: "100vh",
    left: 0,
    top: 0,
    bottom: 0,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    backgroundSize: "200% 200%",
    animation: "gradientShift 8s ease infinite",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "flex-start" as const,
    transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
    zIndex: 100,
    boxShadow: collapsed 
      ? '8px 0 32px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255,255,255,0.1)' 
      : '16px 0 64px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(255,255,255,0.1)',
    backdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    paddingRight: '10px',
  };  const toggleButtonStyle = {
    position: 'absolute' as const,
    top: '24px',
    right: collapsed ? '-22px' : '-22px',
    zIndex: 101,
    transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
    transform: `translateX(${collapsed ? '0px' : '0px'}) scale(${isAnimating ? '0.9' : '1'})`,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.3)',
    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
  };
  const logoContainerStyle = {
    opacity: collapsed ? 0 : 1,
    transform: collapsed ? 'translateY(-20px) scale(0.8)' : 'translateY(0) scale(1)',
    transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
    transitionDelay: collapsed ? '0ms' : '150ms',
  };
  const contentStyle = {
    marginLeft: isMobile ? 0 : (collapsed ? 80 : 240),
    transition: 'margin-left 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    backgroundAttachment: "fixed",
  };

  return (
    <Layout>
      {/* Desktop Sidebar */}
      {!isMobile && (
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
            size="large"            icon={collapsed ? <MenuUnfoldOutlined style={{ color: '#ffffff' }} /> : <MenuFoldOutlined style={{ color: '#ffffff' }} />}
            onClick={handleToggleCollapse}style={toggleButtonStyle}
            className="hover:scale-110 active:scale-95"            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `translateX(0px) scale(1.1)`;
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.4)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #333333 0%, #4a4a4a 100%)';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `translateX(0px) scale(1)`;
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255,255,255,0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';
              e.currentTarget.style.color = '#ffffff';
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          />
        </Tooltip>        <div style={{ 
          flex: 1, 
          display: "flex", 
          flexDirection: "column",
          paddingTop: collapsed ? '90px' : '28px',
          transition: 'padding-top 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
        }}>
          {/* Logo Section with Enhanced Glass Effect */}
          <div 
            className="flex flex-col items-center py-8"
            style={logoContainerStyle}
          >
            <div style={{
              position: 'relative',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
              padding: 16,
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.4s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            }}>
              <Image 
                src="/Logo.png" 
                alt="Lumiere Logo" 
                width={88} 
                height={88} 
                style={{ 
                  borderRadius: "50%", 
                  background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
                  transition: 'all 0.4s ease',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                }} 
              />
            </div>
            <div style={{
              marginTop: 20,
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? 'translateY(15px)' : 'translateY(0)',
              transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
              transitionDelay: collapsed ? '0ms' : '200ms',
            }}>
              <h3 style={{
                color: '#fff',
                fontSize: '16px',
                fontWeight: '600',
                margin: 0,
                textAlign: 'center',
                letterSpacing: '0.5px',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Admin Panel
              </h3>
              <p style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12px',
                fontWeight: '400',
                margin: '4px 0 0 0',
                textAlign: 'center',
                letterSpacing: '0.3px',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
              }}>
                Management Console
              </p>
            </div>
          </div>          
          {/* Enhanced Animated Divider */}
          <div 
            className="mx-6 mb-6" 
            style={{
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), rgba(255,255,255,0.3), rgba(255,255,255,0.6), transparent)',
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? 'scaleX(0)' : 'scaleX(1)',
              transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
              transitionDelay: collapsed ? '0ms' : '300ms',
              borderRadius: '2px',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
            }}
          />

          {/* Enhanced Menu */}
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="bg-transparent font-medium admin-sidebar-menu"
            style={{ 
              background: "transparent", 
              color: "#fff", 
              border: "none",
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: collapsed ? 'center' : 'flex-start',
              alignItems: collapsed ? 'center' : 'stretch',
              height: '100%',
              minHeight: 0,
            }}
            inlineIndent={collapsed ? 0 : 24}
            theme="dark"
          />
        </div>
      </Sider>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          title={
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Image 
                  src="/Logo.png" 
                  alt="Lumiere Logo" 
                  width={24} 
                  height={24}
                  style={{ borderRadius: "50%" }}
                />
              </div>
              <span className="text-lg font-semibold text-gray-800">Admin Panel</span>
            </div>
          }
          placement="left"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
          width={280}
          styles={{
            body: {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              padding: 0,
            },
            header: {
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            }
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            className="bg-transparent font-medium admin-sidebar-menu"
            style={{ 
              background: "transparent", 
              color: "#fff", 
              border: "none",
              height: "100%",
            }}
            theme="dark"
          />
        </Drawer>
      )}

      <Layout style={contentStyle}>
        {/* Admin Header at the top of the content */}
        <AdminHeader />        <Content
          style={{
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(20px)",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
          }}
          className={`${isMobile ? 'm-2 p-4' : 'm-8 p-8'} rounded-2xl`}
        >
          <div className="w-full" style={{ maxWidth: "100%" }}>
            {children}
          </div>
        </Content>
      </Layout>      {/* Enhanced Custom CSS with modern animations and effects */}
      <style jsx global>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes slideInLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .admin-sidebar-menu .ant-menu-item {
          margin: 6px 8px !important;
          border-radius: 12px !important;
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
          backdrop-filter: blur(20px);
          font-size: 14px !important;
          height: 44px !important;
          line-height: 44px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          animation: slideInLeft 0.5s ease-out !important;
          position: relative !important;
          overflow: hidden !important;
          transform-origin: left center !important;
        }

        .admin-sidebar-menu .ant-menu-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .admin-sidebar-menu .ant-menu-item:hover::before {
          left: 100%;
        }
        
        .admin-sidebar-menu .ant-menu-item .ant-menu-title-content {
          font-weight: 500 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          font-size: 14px !important;
          letter-spacing: 0.3px !important;
        }        
        .admin-sidebar-menu .ant-menu-item:hover {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          transform: translateX(2px) !important;
        }        
        .admin-sidebar-menu .ant-menu-item-selected {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 100%) !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4) !important;
          transform: translateX(2px) !important;
        }        
        .admin-sidebar-menu .ant-menu-item-selected::after {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 70%;
          background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%);
          border-radius: 0 2px 2px 0;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
        }
        
        .admin-sidebar-menu .ant-menu-item .ant-menu-item-icon {
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
          font-size: 20px !important;
          margin-right: 16px !important;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .admin-sidebar-menu .ant-menu-item:hover .ant-menu-item-icon {
          transform: scale(1.1) rotate(-2deg) !important;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .admin-sidebar-menu .ant-menu-item-selected .ant-menu-item-icon {
          transform: scale(1.1) !important;
          animation: pulse 2s infinite;
        }

        /* Enhanced collapsed state styles */
        .admin-sidebar-menu .ant-menu-item.ant-menu-item-only-child {
          padding-left: 24px !important;
        }

        .ant-layout-sider-collapsed .admin-sidebar-menu .ant-menu-item {
          text-align: center !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          justify-content: center !important;
          margin: 8px 12px !important;
          width: 48px !important;
          margin-left: auto !important;
          margin-right: auto !important;
          transform-origin: center center !important;
        }

        .ant-layout-sider-collapsed .admin-sidebar-menu .ant-menu-item:hover {
          transform: scale(1.05) !important;
        }

        .ant-layout-sider-collapsed .admin-sidebar-menu .ant-menu-item-selected {
          transform: scale(1.05) !important;
        }

        .ant-layout-sider-collapsed .admin-sidebar-menu .ant-menu-item .ant-menu-item-icon {
          margin-right: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100%;
        }

        .ant-layout-sider-collapsed .admin-sidebar-menu .ant-menu-title-content {
          display: none !important;
        }

        /* Custom scrollbar for sidebar */
        .admin-sidebar-menu::-webkit-scrollbar {
          width: 4px;
        }

        .admin-sidebar-menu::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
        }

        .admin-sidebar-menu::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .admin-sidebar-menu::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Enhanced glass effect for content */
        .ant-layout-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
          border-radius: inherit;
          pointer-events: none;
        }
      `}</style>
    </Layout>
  );
}