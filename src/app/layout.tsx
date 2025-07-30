"use client";

import { Inter } from "next/font/google";
import "../styles/globals.css";
import "../styles/animations.css";
import '@ant-design/v5-patch-for-react-19';
import "react-toastify/dist/ReactToastify.css";
import {ThemeProvider} from "@/components/providers/ThemeProvider";
import { GlobalAccountBannedProvider } from "@/components/providers/GlobalAccountBannedProvider";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store";
import { ToastContainer } from 'react-toastify';
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
      >
        {/* <BackTop duration={100} visibilityHeight={50} /> */}
        <Provider key="redux-provider" store={store}>
          <PersistGate key="persist-gate" loading={null} persistor={persistor}>
            <AntdRegistry key="antd-registry">
            <ThemeProvider 
              key="theme-provider"
              attribute="class" 
              defaultTheme="system" 
              enableSystem
              disableTransitionOnChange
            >
              <GlobalAccountBannedProvider key="global-banned-provider">
                <ClientLayoutWrapper key="client-layout-wrapper">{children}</ClientLayoutWrapper>
              </GlobalAccountBannedProvider>
            </ThemeProvider>
            </AntdRegistry>
          </PersistGate>
        </Provider>
        <ToastContainer key="toast-container" />
        <Toaster key="sonner-toaster" position="top-right" />
      </body>
    </html>
  );
}