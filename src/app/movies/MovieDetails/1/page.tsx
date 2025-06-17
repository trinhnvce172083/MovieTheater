"use client";
//import { Row } from "antd";
import React from "react";
import Link from "next/link";
import ROUTES from "@/constants/routes";
import Image from "next/image";

export default function MovieDetailsPage() {
  return (
    <div className="min-h-screen bg-[#0D062D] text-white flex flex-col items-center p-10">
      <h1 className="text-3xl font-bold mb-8">DORAEMON: NOBITA&apos;S ART WORLD TALES</h1>

      <div className="flex flex-col md:flex-row items-center justify-center bg-[#1E1B3A] p-6 rounded-xl shadow-xl max-w-7xl gap-10">
        {/* Poster bên trái */}
        <div className="relative">
          <Image
            src="https://res.cloudinary.com/dltuc4zjz/image/upload/v1749560503/Doraemon_Nobita_Art_World_Tales_t405ur.jpg"
            alt="Doraemon Poster"
            width={280}
            height={420}
            className="w-[280px] h-[420px] rounded-lg shadow-md"
            ></Image>
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
            RECOMMENDED
          </span>
        </div>

        {/* Chi tiết bên phải */}
        <div className="flex-1 space-y-6">
          <div>
            <p className="font-bold text-2xl">CONTENT</p>
            <p className="text-sm max-w-xl tẽt  text-gray-300">
              The magnificent world of medieval Europe is depicted in paintings. Doraemon and his friends jump into the &quot;world of paintings&quot; with Claire and her friends Milo and Chai as they embark on a wonderful adventure.

            </p>
          </div>
          <p><strong>Genre:</strong> Family</p>
          <p><strong>Director:</strong> Yukiyo Teramoto</p>
          <p><strong>Cast:</strong> Megumi Ohara, Wasabi Mizuta</p>
          <p><strong>Time:</strong> 105 minutes</p>

          {/* Nút hành động */}
          <div className="mt-4 flex gap-4">
            {/* <button className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full font-medium">
              <Link href={ROUTES.BOOKING_SELECT_SEAT}>
                🎟 Buy Ticket
              </Link>
            </button> */}
          </div>
        </div>
      </div>
      {/* Video Trailer */}
  <div className="mt-8 w-full flex justify-center">
        <iframe
          width="1280"
          height="720"
          src="https://www.youtube.com/embed/Qs-yOanuK9c"
          title="Doraemon: Nobita's Art World Tales Trailer"
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





























