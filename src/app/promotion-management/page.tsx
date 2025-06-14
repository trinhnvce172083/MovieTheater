"use client";

import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Promotion {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discount: string;
  status: "Active" | "Expired";
}

const initialPromotions: Promotion[] = [
  {
    id: "PR001",
    name: "New Year Sale",
    description: "Special holiday promotion",
    startDate: "Nov 6, 2018",
    endDate: "Nov 30, 2018",
    discount: "5.000₫",
    status: "Expired",
  },
  {
    id: "PR002",
    name: "Super Sale",
    description: "End of year mega discount",
    startDate: "Nov 7, 2018",
    endDate: "Dec 7, 2018",
    discount: "50.000₫",
    status: "Active",
  },
  {
    id: "PR003",
    name: "Flash Sale",
    description: "Limited time offer",
    startDate: "Nov 6, 2018",
    endDate: "Nov 7, 2018",
    discount: "50.000₫",
    status: "Expired",
  },
  {
    id: "PR004",
    name: "VIP Sale",
    description: "Exclusive discount for VIP members",
    startDate: "Nov 17, 2018",
    endDate: "Nov 30, 2018",
    discount: "50.000₫",
    status: "Active",
  },
];

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formPromo, setFormPromo] = useState<Omit<Promotion, "id">>({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    discount: "",
    status: "Active",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;
  const totalPages = Math.ceil(promotions.length / itemsPerPage);
  const paginatedPromotions = promotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeletePromotion = (id: string) => {
    if (confirm("Are you sure you want to delete this promotion?")) {
      setPromotions(promotions.filter((p) => p.id !== id));
    }
  };

  const handleEditPromotion = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormPromo({ ...promo });
    setIsModalOpen(true);
  };

  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setFormPromo({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      discount: "",
      status: "Active",
    });
    setIsModalOpen(true);
  };

  const handleSavePromotion = () => {
    if (editingPromotion) {
      setPromotions((prev) =>
        prev.map((p) => (p.id === editingPromotion.id ? { ...editingPromotion, ...formPromo } : p))
      );
    } else {
      setPromotions((prev) => [
        ...prev,
        {
          id: `PR${Math.floor(Math.random() * 1000)}`,
          ...formPromo,
        },
      ]);
    }

    setIsModalOpen(false);
    setEditingPromotion(null);
    setFormPromo({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      discount: "",
      status: "Active",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-2 h-10 bg-blue-600 rounded-lg" />
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Promotion Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-2xl font-semibold">{promotions.length}</p>
          <p className="text-gray-500 text-sm">Total Promotions</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-2xl font-semibold">
            {promotions.filter((p) => p.status === "Active").length}
          </p>
          <p className="text-gray-500 text-sm">Active</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-2xl font-semibold">
            {promotions.reduce((sum, p) => sum + parseInt(p.discount.replace(/\D/g, "") || "0"), 0).toLocaleString("vi-VN")}₫
          </p>
          <p className="text-gray-500 text-sm">Total Value</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleAddPromotion}
        >
          + Add Promotion
        </button>
        <input
          type="text"
          placeholder="Search promotions..."
          className="border px-3 py-2 rounded w-full max-w-xs"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border bg-white rounded">
          <thead className="bg-gray-100 text-left">
            <tr>
              {['ID', 'Campaign Name', 'Start Date', 'End Date', 'Discount', 'Status', 'Actions'].map((header) => (
                <th key={header} className="border px-4 py-2 whitespace-nowrap">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedPromotions.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 align-top">{promo.id}</td>
                <td className="border px-4 py-2 align-top">
                  <div className="font-medium">{promo.name}</div>
                  <div className="text-gray-500 text-xs">{promo.description}</div>
                </td>
                <td className="border px-4 py-2 align-top">{promo.startDate}</td>
                <td className="border px-4 py-2 align-top">{promo.endDate}</td>
                <td className="border px-4 py-2 align-top text-green-600 font-semibold">{promo.discount}</td>
                <td className="border px-4 py-2 align-top">
                  <span className={`text-xs px-2 py-1 rounded-full ${promo.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {promo.status}
                  </span>
                </td>
                <td className="border px-4 py-2 align-top">
                  <div className="flex gap-2">
                    <button className="p-2 text-white bg-blue-500 hover:bg-blue-600 rounded" onClick={() => handleEditPromotion(promo)}>
                      <FaEdit size={12} />
                    </button>
                    <button className="p-2 text-white bg-red-500 hover:bg-red-600 rounded" onClick={() => handleDeletePromotion(promo.id)}>
                      <FaTrash size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        <button className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>Previous</button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            className={`px-4 py-1 rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}>Next</button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-96 space-y-3">
            <h2 className="text-lg font-semibold">{editingPromotion ? "Edit Promotion" : "Add Promotion"}</h2>
            {["name", "description", "startDate", "endDate", "discount"].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="border rounded px-3 py-2 w-full"
                value={(formPromo as any)[field]}
                onChange={(e) => setFormPromo({ ...formPromo, [field]: e.target.value })}
              />
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => { setIsModalOpen(false); setEditingPromotion(null); }}>Cancel</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleSavePromotion}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
