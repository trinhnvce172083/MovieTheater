"use client";

import { Loader2, Film, Download } from "lucide-react";

export function LoadingStateApi() {
  return (
    <div className="space-y-8">
      {/* Loading Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
          <h2 className="text-2xl font-bold text-white">Loading Movies from API</h2>
        </div>
        <p className="text-orange-200">
          Fetching the latest movie data from our backend server...
        </p>
        
        {/* Progress Indicator */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full animate-pulse" 
                 style={{ width: '70%' }}></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Connecting to API...</span>
            <span>70%</span>
          </div>
        </div>
      </div>

      {/* Loading Steps */}
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-orange-500/20">
        <h3 className="text-orange-300 font-semibold mb-4 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Loading Process
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">✓ Connected to API server</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-orange-400 text-sm">⏳ Fetching movie data...</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-400 text-sm">⏸ Processing filters</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-400 text-sm">⏸ Rendering components</span>
          </div>
        </div>
      </div>

      {/* Skeleton Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-900/80 border border-orange-500/20 rounded-lg overflow-hidden animate-pulse"
          >
            {/* Skeleton Image */}
            <div className="h-64 bg-gradient-to-br from-gray-700 to-gray-800 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <Film className="h-12 w-12 text-gray-600 animate-pulse" />
              </div>
              
              {/* Skeleton Badges */}
              <div className="absolute top-2 left-2 w-16 h-6 bg-gray-700 rounded"></div>
              <div className="absolute top-2 right-2 w-8 h-6 bg-gray-700 rounded"></div>
              <div className="absolute bottom-2 left-2 w-12 h-6 bg-gray-700 rounded-full"></div>
            </div>
            
            {/* Skeleton Content */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              
              {/* Genres */}
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-gray-700 rounded"></div>
                <div className="h-5 w-20 bg-gray-700 rounded"></div>
              </div>
              
              {/* Details */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
              
              {/* Price and Button */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <div className="h-6 w-16 bg-gray-700 rounded"></div>
                <div className="h-8 w-20 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Tips */}
      <div className="text-center">
        <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-orange-500/20 inline-block">
          <p className="text-orange-300 text-sm font-medium mb-2">💡 Did you know?</p>
          <p className="text-gray-300 text-sm max-w-md">
            Our API loads fresh movie data in real-time, ensuring you always see the latest 
            showtimes and availability.
          </p>
        </div>
      </div>
    </div>
  );
} 