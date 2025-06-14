"use client";

import React, { useState } from "react";
import { Card, Row, Col, Statistic } from "antd";
const bookings = [
  {
    id: "BK001",
    memberId: "MB001",
    identityCard: "123456789",
    phone: "0912345678",
    customer: "Nguyễn Văn A",
    movie: "Avengers: Endgame",
    time: "2025-06-13 19:00",
    seat: "C5, C6",
    status: "Successful",
  },
  {
    id: "BK002",
    memberId: "MB002",
    identityCard: "987654321",
    phone: "0987654321",
    customer: "Trần Thị B",
    movie: "Inception",
    time: "2025-06-14 20:00",
    seat: "A1",
    status: "Get Ticket",
  },
  {
    id: "BK003",
    memberId: "MB003",
    identityCard: "112233445",
    phone: "0911223344",
    customer: "Phạm Văn C",
    movie: "Interstellar",
    time: "2025-06-15 18:00",
    seat: "B3",
    status: "Get Ticket",
  },
  {
    id: "BK004",
    memberId: "MB004",
    identityCard: "556677889",
    phone: "0933445566",
    customer: "Lê Thị D",
    movie: "Titanic",
    time: "2025-06-16 21:00",
    seat: "D1, D2",
    status: "Successful",
  },
  {
    id: "BK005",
    memberId: "MB005",
    identityCard: "998877665",
    phone: "0966778899",
    customer: "Ngô Văn E",
    movie: "Matrix",
    time: "2025-06-17 17:00",
    seat: "E3",
    status: "Get Ticket",
  },
  {
    id: "BK006",
    memberId: "MB006",
    identityCard: "334455667",
    phone: "0988997766",
    customer: "Trịnh Thị F",
    movie: "Avatar",
    time: "2025-06-18 20:30",
    seat: "F2, F3",
    status: "Successful",
  },
  {
    id: "BK007",
    memberId: "MB007",
    identityCard: "776655443",
    phone: "0900887766",
    customer: "Đỗ Văn G",
    movie: "Joker",
    time: "2025-06-19 19:30",
    seat: "G5",
    status: "Get Ticket",
  },
];

export default function BookingManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterKey, setFilterKey] = useState("customer");
  const [filterValue, setFilterValue] = useState("");

  const itemsPerPage = 5;

  const filteredBookings = bookings
    .filter((b) =>
      b[filterKey].toLowerCase().includes(filterValue.toLowerCase())
    )
    .sort((a, b) => a[filterKey].localeCompare(b[filterKey]));

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-10 bg-blue-600 rounded-lg" />
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-800 drop-shadow-sm">
          Booking Management
        </h1>
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4">
     <select
       value={filterKey}
       onChange={(e) => setFilterKey(e.target.value)}
       className="border rounded px-3 py-2 w-[180px] appearance-none bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
     >
       <option value="customer">Customer</option>
       <option value="memberId">Member ID</option>
       <option value="identityCard">Identity Card</option>
       <option value="phone">Phone</option>

     </select>
      </div>

      {/* Table */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">No</th>
            <th className="border px-3 py-2">Booking ID</th>
            <th className="border px-3 py-2">Member ID</th>
            <th className="border px-3 py-2">Identity Card</th>
            <th className="border px-3 py-2">Phone Number</th>
            <th className="border px-3 py-2">Customer</th>
            <th className="border px-3 py-2">Movie</th>
            <th className="border px-3 py-2">Time</th>
            <th className="border px-3 py-2">Seat</th>
            <th className="border px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentBookings.map((b, i) => (
            <tr key={b.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{startIndex + i + 1}</td>
              <td className="border px-3 py-2">{b.id}</td>
              <td className="border px-3 py-2">{b.memberId}</td>
              <td className="border px-3 py-2">{b.identityCard}</td>
              <td className="border px-3 py-2">{b.phone}</td>
              <td className="border px-3 py-2">{b.customer}</td>
              <td className="border px-3 py-2">{b.movie}</td>
              <td className="border px-3 py-2">{b.time}</td>
              <td className="border px-3 py-2">{b.seat}</td>
              <td className="border px-3 py-2">
                {b.status === "Successful" ? (
                  <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-sky-400 rounded-full">
                    {b.status}
                  </span>
                ) : (
                  <button className="inline-block px-3 py-1 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-full">
                    {b.status}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-100 text-gray-400" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-100 text-gray-400" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
