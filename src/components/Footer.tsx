//Footer

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  PhoneOutlined,
  MailOutlined,
  FacebookOutlined,
  YoutubeOutlined,
  InstagramOutlined,
} from "@ant-design/icons";
//import ROUTES from "@/constants/routes";

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6 md:px-12">
      <div className="container mx-auto">
        {/* Top Section - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* First Column - ABOUT */}
          <div>
            <h3 className="text-lg uppercase font-semibold mb-6">About</h3>
            <div className="flex flex-col space-y-3">
              <Link href="/about-us" className="text-sm hover:text-gray-300">
                About Us
              </Link>
              <Link href="/terms" className="text-sm hover:text-gray-300">
                Terms of Use
              </Link>
              <Link href="/rules" className="text-sm hover:text-gray-300">
                Operating Rules
              </Link>
              <Link href="/privacy" className="text-sm hover:text-gray-300">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Second Column - CINEMA */}
          <div>
            <h3 className="text-lg uppercase font-semibold mb-6">Cinema</h3>
            <div className="flex flex-col space-y-3">
              <Link href="/movies" className="text-sm hover:text-gray-300">
                Movie Genres
              </Link>
              <Link href="/reviews" className="text-sm hover:text-gray-300">
                Movie Reviews
              </Link>
              <Link href="/blog" className="text-sm hover:text-gray-300">
                Cinema Blog
              </Link>
              <Link href="/new-movies" className="text-sm hover:text-gray-300">
                Monthly Picks
              </Link>
              <Link href="/imax" className="text-sm hover:text-gray-300">
                IMAX Films
              </Link>
            </div>
          </div>

          {/* Third Column - SUPPORT */}
          <div>
            <h3 className="text-lg uppercase font-semibold mb-6">Support</h3>
            <div className="flex flex-col space-y-3">
              <Link href="/feedback" className="text-sm hover:text-gray-300">
                Feedback
              </Link>
              <Link href="/services" className="text-sm hover:text-gray-300">
                Sale & Services
              </Link>
              <Link href="/gift-cards" className="text-sm hover:text-gray-300">
                Theaters / Prices
              </Link>
              <Link href="/careers" className="text-sm hover:text-gray-300">
                Careers
              </Link>
              <Link href="/faq" className="text-sm hover:text-gray-300">
                FAQ
              </Link>
            </div>
          </div>

          {/* Fourth Column - Logo and Social Media */}
          <div className="flex flex-col items-center">
            <Image
              src="/Logo.png"
              alt="Cinema Logo"
              width={120}
              height={80}
              className="w-auto h-12 mb-6"
            />
            <div className="flex space-x-4 mb-6">
              <Link href="https://facebook.com" target="_blank" className="hover:opacity-80">
                <FacebookOutlined style={{ fontSize: '24px' }} />
              </Link>
              <Link href="https://youtube.com" target="_blank" className="hover:opacity-80">
                <YoutubeOutlined style={{ fontSize: '24px' }} />
              </Link>
              <Link href="https://instagram.com" target="_blank" className="hover:opacity-80">
                <InstagramOutlined style={{ fontSize: '24px' }} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section - Company Info (optional) */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/6 mb-6 md:mb-0">
              <Image
                src="/Logo.png"
                alt="Cinema Logo"
                width={120}
                height={80}
                className="w-auto h-12"
              />
            </div>
            <div className="md:w-5/6 text-sm">
              <h3 className="text-base uppercase font-semibold mb-3">Thien Ngan Film Joint Stock Company</h3>
              <p className="mb-2">F-Town 1 Building, Lot T2, D1 Street, Saigon Hi-Tech Park, Tan Phu Ward, Thu Duc City, Ho Chi Minh City, Vietnam</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2" /> 028.39.333.303
                </div>
                <div className="flex items-center">
                  <PhoneOutlined className="mr-2" /> 19002224 (9:00 - 22:00)
                </div>
                <div className="flex items-center">
                  <MailOutlined className="mr-2" /> support@galaxystudio.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
