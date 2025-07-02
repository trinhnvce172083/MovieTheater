"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ConfigProvider, theme } from "antd";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem("admin-theme") as ThemeMode;
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setMode(savedTheme);
    }
  }, []);
  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    if (mounted) {
      localStorage.setItem("admin-theme", newMode);
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <ConfigProvider theme={{ algorithm: theme.defaultAlgorithm }}>
        <div>{children}</div>
      </ConfigProvider>
    );
  }

  const antdTheme = {
    algorithm: mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#1677ff",
      borderRadius: 6,
      ...(mode === "dark" && {
        colorBgContainer: "#141414",
        colorBgElevated: "#1f1f1f",
        colorBgLayout: "#000000",
        colorText: "#ffffff",
        colorTextSecondary: "#a6a6a6",
        colorBorder: "#303030",
      }),
    },
    components: {
      Layout: {
        siderBg: mode === "dark" ? "#001529" : "#ffffff",
        headerBg: mode === "dark" ? "#141414" : "#ffffff",
        bodyBg: mode === "dark" ? "#000000" : "#f5f5f5",
      },
      Menu: {
        itemBg: "transparent",
        itemSelectedBg: mode === "dark" ? "#1677ff" : "#e6f7ff",
        itemHoverBg: mode === "dark" ? "#1f1f1f" : "#f5f5f5",
        itemColor: mode === "dark" ? "#ffffff" : "#000000",
        itemSelectedColor: mode === "dark" ? "#ffffff" : "#1677ff",
      },
      Card: {
        colorBgContainer: mode === "dark" ? "#141414" : "#ffffff",
      },
      Table: {
        headerBg: mode === "dark" ? "#1f1f1f" : "#fafafa",
        rowHoverBg: mode === "dark" ? "#1f1f1f" : "#f8faff",
      },
      Button: {
        colorPrimary: "#1677ff",
        algorithm: true,
      },
    },
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, isDark: mode === "dark" }}>
      <ConfigProvider theme={antdTheme}>
        <div className={mode === "dark" ? "dark" : ""}>
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};
