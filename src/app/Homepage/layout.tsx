import React, { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface HomepageLayoutProps {
  children: ReactNode;
}

const HomepageLayout: React.FC<HomepageLayoutProps> = ({ children }) => {
  return (
    <div className="homepage-layout">
      <body>
        <header className="fixed top-0 left-0 right-0 z-50">
          <Header />
        </header>
        <main>{children}</main>
        <footer>
          <Footer />
        </footer>
      </body>
    </div>
  );
};

export default HomepageLayout;
