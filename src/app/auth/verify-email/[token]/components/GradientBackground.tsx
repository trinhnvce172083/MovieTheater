"use client";

import React from "react";

export const GradientBackground: React.FC = () => {
  return (
    <>      {/* Background đen thuần túy */}
      <div className="absolute inset-0 bg-black z-[-1]"></div>
      
      {/* Decorative circles với màu tối hơn */}
      <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-gray-800 opacity-30 blur-2xl"></div>
      <div className="absolute bottom-10 left-10 w-24 h-24 rounded-full bg-gray-900 opacity-30 blur-xl" style={{animationDelay: '1s'}}></div>
    </>
  );
};
