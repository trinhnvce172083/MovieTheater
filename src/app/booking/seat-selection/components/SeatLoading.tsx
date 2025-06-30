import React from "react";

const SeatLoading: React.FC = () => (
  <div className="py-8">
    <div className="container mx-auto px-4 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-lg">Loading seat information...</p>
      </div>
    </div>
  </div>
);

export default SeatLoading;
