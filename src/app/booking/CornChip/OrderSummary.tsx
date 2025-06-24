import React from 'react';
import Image from 'next/image';

export default function OrderSummary({ movieDetails, totalOrder }) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      {movieDetails.image && (
        <div className="mb-4 flex justify-center">
          <div className="w-full rounded-lg flex items-center justify-center overflow-hidden">
            <Image
              src={movieDetails.image}
              alt={movieDetails.title}
              width={400}
              height={600}
              style={{ width: '100%', height: 'auto', maxWidth: '100%', objectFit: 'cover', borderRadius: '0.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}
              priority
            />
          </div>
        </div>
      )}
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      <div className="mb-4">
        <div className="font-semibold">{movieDetails.title}</div>
        <div className="text-sm text-gray-400">{movieDetails.date}</div>
        <div className="text-sm text-gray-400">{movieDetails.details}</div>
      </div>
      <div className="flex justify-between items-center mt-6">
        <span className="font-semibold">Total:</span>
        <span className="text-lg font-bold text-yellow-400">{totalOrder.toLocaleString('vi-VN')} VND</span>
      </div>
      <button className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition">Thanh toán</button>
    </div>
  );
} 