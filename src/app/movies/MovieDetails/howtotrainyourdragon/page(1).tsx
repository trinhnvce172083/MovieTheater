"use client";
import { Row } from "antd";
import React from "react";

// //import { Typography, Card, Button, Tag, QRCode, Modal, Empty, Divider } from "antd";
// //import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, QrcodeOutlined } from "@ant-design/icons";
 


export default function MovieDetailsPage() {
  return (
    <div className="min-h-screen bg-[#0D062D] text-white flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold mb-8">HOW TO TRAIN YOUR DRAGON</h1>

      <div className="flex flex-col md:flex-row items-center justify-center bg-[#1E1B3A] p-6 rounded-xl shadow-xl max-w-7xl gap-10">
        {/* Poster bên trái */}
        <div className="relative">
          <img
            src="https://www.bhdstar.vn/wp-content/uploads/2025/06/referenceSchemeHeadOfficeallowPlaceHoldertrueheight700ldapp-7.jpg"
            alt="Dragon Poster"
            className="w-[280px] rounded-lg shadow-md"
          />
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
            RECOMMENDED
          </span>
        </div>

        {/* Chi tiết bên phải */}
        <div className="flex-1 space-y-6">
          <div>
            <p className="font-bold text-2xl">CONTENT</p>
            <p className="text-sm max-w-xl tẽt  text-gray-300">
              When an ancient threat threatens both the Vikings and dragons on the island of Berk, the friendship between Hiccup, a creative Viking, and Toothless, a Night Fury dragon, becomes the key to both species building a new future together.

            </p>
          </div>
          <p><strong>Genre:</strong> Fantasy</p>
          <p><strong>Director:</strong> Dean DeBlois</p>
          <p><strong>Cast:</strong> Mason Thames, Nico Parker</p>
          <p><strong>Time:</strong> 126 minutes</p>

          {/* Nút hành động */}
          <div className="mt-4 flex gap-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full font-medium">
              🎟 Buy Ticket
            </button>
          </div>
        </div>
      </div>
  
  
  <div className="mt-8 w-full flex justify-center">
        <iframe
          width="1280"
          height="720"
          src="https://www.youtube.com/embed/22w7z_lT6YM"
          title="How To Train Your Dragon Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg shadow-md"
        ></iframe>
      </div>
        </div>
);

}
//justify-center





























