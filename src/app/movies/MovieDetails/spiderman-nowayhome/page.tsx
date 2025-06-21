"use client";
import { Row } from "antd";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ShowtimePickerModal from "@/components/ShowtimePickerModal";

// //import { Typography, Card, Button, Tag, QRCode, Modal, Empty, Divider } from "antd";
// //import { CalendarOutlined, EnvironmentOutlined, ClockCircleOutlined, QrcodeOutlined } from "@ant-design/icons";
 


export default function MovieDetailsPage() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleContinue = (date: string, time: string) => {
    setShowModal(false);
    // Chuyển sang trang seat-selection, truyền params (có thể dùng query hoặc state)
    router.push(`/booking/seat-selection?movie=spiderman-nowayhome&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
  };

  return (
    <div className="min-h-screen bg-[#0D062D] text-white flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold mb-8">SPIDER-MAN: NO WAY HOME</h1>

      <div className="flex flex-col md:flex-row items-center justify-center bg-[#1E1B3A] p-6 rounded-xl shadow-xl max-w-7xl gap-10">
        {/* Poster bên trái */}
        <div className="relative">
          <img
            src="https://image.tmdb.org/t/p/original/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg"
            alt="Spider-Man Poster"
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
              After Quentin Beck frames Peter Parker for his murder and reveals that Peter is Spider-Man, the Department of Damage Control arrests Peter; his girlfriend, Michelle "MJ" Jones-Watson; his best friend, Ned Leeds; and his aunt, May Parker. Lawyer Matt Murdock gets Peter's charges dropped, but the group grapples with negative publicity. After Peter's, MJ's, and Ned's MIT applications are rejected, Peter goes to the New York Sanctum to ask Dr. Stephen Strange for help. Strange starts casting a spell that would make everyone forget Peter is Spider-Man, but it is corrupted when Peter repeatedly requests alterations to let his loved ones retain their memories.

            </p>
          </div>
          <p><strong>Genre:</strong> Action</p>
          <p><strong>Director:</strong> Jonathan Watts</p>
          <p><strong>Cast:</strong> Tom Holland, Zendaya, Benedict Cumberbatch</p>
          <p><strong>Time:</strong> 176 minutes</p>

          {/* Nút hành động */}
          <div className="mt-4 flex gap-4">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full font-medium"
              onClick={() => setShowModal(true)}
            >
              🎟 Buy Ticket
            </button>
          </div>
        </div>
      </div>
  
  
  <div className="mt-8 w-full flex justify-center">
        <iframe
          width="1280"
          height="720"
          src="https://www.youtube.com/embed/JfVOs4VSpmA"
          title="Avengers: Endgame Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="rounded-lg shadow-md"
        ></iframe>
      </div>
      <ShowtimePickerModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onContinue={handleContinue}
        movieTitle="SPIDER-MAN: NO WAY HOME"
      />
        </div>
);

}
//justify-center





























