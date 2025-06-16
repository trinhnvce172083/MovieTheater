"use client";

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { StyleProvider } from '@ant-design/cssinjs';
import { ConfigProvider } from 'antd';
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Provider } from "react-redux";
import { store } from "@/store";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { Provider } from "react-redux";
import store from "@/store";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <BackTop duration={100} visibilityHeight={50} /> */}
        <Provider store={store}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AntdRegistry>
              <StyleProvider hashPriority="high">
                <ConfigProvider>
                  <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
                </ConfigProvider>
              </StyleProvider>
            </AntdRegistry>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
