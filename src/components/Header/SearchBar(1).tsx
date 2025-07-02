"use client";
import React, { useState } from "react";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";

export default function SearchBar() {
  const [showSearch, setShowSearch] = useState(false);
  const handleSearchClick = () => setShowSearch((prev) => !prev);

  return (
    <div className="flex items-center space-x-3">
      <div className="relative">
        {showSearch && (
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search film name..."
              className="w-80 h-12 pl-12 pr-4 rounded-2xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm !text-black placeholder-gray-400 shadow-lg hover:shadow-xl focus:outline-none focus:ring-0 focus:border-blue-500 focus:bg-white transition-all duration-300 ease-in-out"
              autoFocus
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/10 to-purple-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none -z-10 blur-sm" />
          </div>
        )}
      </div>
      <button
        className="text-white hover:text-red-500 transition-colors ml-2"
        onClick={handleSearchClick}
        aria-label={showSearch ? "Close search" : "Open search"}
      >
        {showSearch ? (
          <CloseOutlined style={{ fontSize: "18px" }} />
        ) : (
          <SearchOutlined style={{ fontSize: "18px" }} />
        )}
      </button>
    </div>
  );
}