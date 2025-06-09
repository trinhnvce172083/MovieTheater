import React, { ReactNode } from "react";

interface HomepageLayoutProps {
  children: ReactNode;
}

const HomepageLayout: React.FC<HomepageLayoutProps> = ({ children }) => {
  return (
    <div className="homepage-layout">
      <main>{children}</main>
    </div>
  );
};

export default HomepageLayout;
