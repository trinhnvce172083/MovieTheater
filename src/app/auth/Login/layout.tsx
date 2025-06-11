import React, { ReactNode } from "react";

interface LoginLayoutProps {
  children: ReactNode;
}

const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
  return (
    <div className="login-layout relative min-h-screen w-full overflow-hidden">
      {/* Background video container - positioned absolutely to cover entire viewport */}
      <div className="background-video absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          className="object-cover w-full h-full"
          playsInline
        >
          <source src="/Login_background.mp4" type="video/mp4" />
        </video>
      </div>
      
      {/* Content container */}
      <div className="relative z-20 min-h-screen w-full">
        {children}
      </div>
    </div>
  );
};

export default LoginLayout;
