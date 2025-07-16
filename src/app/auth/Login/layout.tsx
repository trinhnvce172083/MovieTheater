"use client";

import React from "react";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Handle the case where children might be an array
  const childrenArray = React.Children.toArray(children);
  
  return (
    <section key="login-layout-section" className="flex items-center justify-center min-h-screen">
      {/* Main content area */}
      <main key="login-layout-main" className="pt-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-orange-900 to-black flex-1">
        <meta key="viewport-meta" name="viewport" content="width=device-width, initial-scale=1" />
        <meta key="charset-meta" charSet="UTF-8" />
        <div key="login-content-wrapper">
          {childrenArray.map((child, index) => (
            <React.Fragment key={`login-child-${index}`}>
              {child}
            </React.Fragment>
          ))}
        </div>
      </main>
    </section>
  );
}
