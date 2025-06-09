"use client";

import React, { useState } from "react";

interface Snack {
  id: number;
  name: string;
  detail?: string;
  price: number;
  soldOut?: boolean;
}

const snacks: Snack[] = [
  { id: 1, name: "Combo Bae", detail: "1 Coke 32oz + 1 Bắp 2Ngăn 64OZ Phô Mai+Caramel", price: 119000 },
  { id: 2, name: "Poca Chips 54gr", price: 28000, soldOut: true },
  { id: 3, name: "Poca Wavy 54gr", price: 28000 },
  { id: 4, name: "Fanta 32oz", price: 37000 },
  { id: 5, name: "Coke Zero 32oz", price: 37000, soldOut: true },
  { id: 6, name: "Coke 32oz", price: 37000 },
  { id: 7, name: "Teppy Orange Juice 327ml", price: 28000 },
  { id: 8, name: "Combo C6 Bear", detail: "2 Coke 32oz+1Bắp 2 Ngăn 64OZ Cheese + Caramel", price: 129000 },
  { id: 9, name: "Dasani Spring Water 500/510ml", price: 20000 },
  { id: 10, name: "Sprite 32oz", price: 37000 },
  { id: 11, name: "Nutiboost 297ml", price: 28000 },
  { id: 12, name: "Lay's Steak Potato Chips 100g", price: 59000 },
];

export default function OrderSnacksPage() {
  const [quantities, setQuantities] = useState<number[]>(Array(snacks.length).fill(0));

  const handleQuantityChange = (index: number, change: number) => {
    const newQuantities = [...quantities];
    newQuantities[index] = Math.max(0, newQuantities[index] + change);
    setQuantities(newQuantities);
  };

  const total = snacks.reduce((sum, item, index) => {
    if (item.soldOut) return sum;
    return sum + item.price * quantities[index];
  }, 0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0e0d20] to-black text-white">
      <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Snacks List */}
        <section className="lg:col-span-2 bg-black bg-opacity-40 rounded-lg p-6">
          <div className="grid grid-cols-12 border-b border-gray-700 pb-2 font-semibold text-sm text-gray-300 uppercase">
            <div className="col-span-6">Combo</div>
            <div className="col-span-3 text-center">Price</div>
            <div className="col-span-3 text-center">Quantity</div>
          </div>
          {snacks.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 items-center border-b border-gray-800 py-4">
              {/* Combo Name + Detail */}
              <div className="col-span-6">
                <div className="text-white font-medium">{item.name}</div>
                {item.detail && <div className="text-sm text-gray-400">{item.detail}</div>}
              </div>

              {/* Price */}
              <div className="col-span-3 text-center text-gray-200">
                {item.price.toLocaleString()} VND
              </div>

              {/* Quantity or Sold */}
              <div className="col-span-3 flex justify-center">
                {item.soldOut ? (
                  <button
                    disabled
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded opacity-70 cursor-not-allowed"
                  >
                    Sold
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600"
                      onClick={() => handleQuantityChange(index, -1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      -
                    </button>
                    <span className="w-5 text-center" aria-live="polite">
                      {quantities[index]}
                    </span>
                    <button
                      className="w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600"
                      onClick={() => handleQuantityChange(index, 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Order Summary */}
        <aside className="bg-black bg-opacity-40 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">SPIDER-MAN: NO WAY HOME</h2>
          <p className="text-sm text-gray-400 mb-1">DATE: 10:00 28/05/2025</p>
          <p className="text-sm text-gray-400 mb-1">Screening room 02 - Seat H18</p>
          <hr className="my-4 border-gray-700" />
          <p className="text-md text-white mb-1 font-medium">Total Order</p>
          <p className="text-xl font-bold text-purple-400 mb-4" aria-live="polite">
            {total.toLocaleString()} VND
          </p>
          <div className="flex space-x-2">
            <button className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white">←</button>
            <button className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold">
              Continue
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
