"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, message, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useConcession } from "@/hooks/booking/useConcession";
import ConcessionsList from "./ConcessionsList";
import OrderSummary from "./OrderSummary";

const { Title, Text } = Typography;

export default function CornChipPage() {
  const router = useRouter();
  const [displayConcessions, setDisplayConcessions] = useState([]);
  
  const {
    selectedConcessions,
    concessionsTotal,
    loading,
    fetchConcessions,
    addConcessionToBooking,
    updateConcessionQuantityInBooking,
  } = useConcession();

  const bookingData = useSelector((state: RootState) => state.booking);

  useEffect(() => {
    const loadConcessions = async () => {
      try {
        const concessionsData = await fetchConcessions();
        
        // Fallback data nếu API trả về empty
        if (!concessionsData || concessionsData.length === 0) {
          const fallbackConcessions = [
            {
              concessionId: 1,
              name: "Bắp rang bơ",
              description: "Bắp rang bơ truyền thống",
              price: 45000,
              imageUrl: "/images/concessions/popcorn-butter.jpg",
              category: "POPCORN"
            },
            {
              concessionId: 2,
              name: "Coca Cola",
              description: "Nước ngọt Coca Cola",
              price: 35000,
              imageUrl: "/images/concessions/coca-cola.jpg",
              category: "DRINKS"
            }
          ];
          setDisplayConcessions(fallbackConcessions);
        } else {
          setDisplayConcessions(concessionsData);
        }
      } catch (error) {
        message.error("Không thể tải đồ ăn");
      }
    };

    loadConcessions();
  }, [fetchConcessions]);

  const handleQuantityChange = (concessionId: number, delta: number) => {
    const currentQuantity = selectedConcessions.find(item => item.concessionId === concessionId)?.quantity || 0;
    const newQuantity = Math.max(0, currentQuantity + delta);
    
    if (newQuantity === 0) {
      // Remove from cart
      updateConcessionQuantityInBooking(concessionId, 0);
    } else if (currentQuantity === 0) {
      // Add to cart
      const concession = displayConcessions.find(c => c.concessionId === concessionId);
      if (concession) {
        addConcessionToBooking(concession, 1);
      }
    } else {
      // Update quantity
      updateConcessionQuantityInBooking(concessionId, newQuantity);
    }
  };

  const handleContinue = () => {
    if (selectedConcessions.length === 0) {
      message.warning("Vui lòng chọn ít nhất một món ăn hoặc bỏ qua");
      return;
    }
    router.push("/booking/confirm");
  };

  const handleBack = () => {
    router.push("/booking/seat-selection");
  };

  const handleSkip = () => {
    router.push("/booking/confirm");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-orange-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Title level={1} className="text-white mb-4">
            Chọn đồ ăn
          </Title>
          <Text className="text-gray-300 text-lg">
            Thưởng thức bữa tiệc hoàn hảo với đồ ăn ngon
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Concessions List */}
          <div className="lg:col-span-2">
            <Card className="bg-[#23283a] border-gray-700">
              <ConcessionsList
                concessions={displayConcessions}
                quantities={selectedConcessions.reduce((acc, item) => {
                  acc[item.concessionId] = item.quantity;
                  return acc;
                }, {})}
                onQuantityChange={handleQuantityChange}
                loading={loading}
                error={null}
              />
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button 
            size="large" 
            onClick={handleBack}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            Quay lại
          </Button>
          
          <div className="flex gap-4">
            <Button 
              size="large" 
              onClick={handleSkip}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Bỏ qua
            </Button>
            
            <Button 
              type="primary" 
              size="large" 
              onClick={handleContinue}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Tiếp tục
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 