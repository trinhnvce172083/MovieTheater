"use client";

import React from "react";
import { Result } from "antd";
import { CheckCircleOutlined, WarningOutlined, LoadingOutlined } from "@ant-design/icons";
import { VerificationCard } from "./VerificationCard";
import { ActionButton } from "./ActionButton";
import { CountdownTimer } from "./CountdownTimer";
import ROUTES from "@/constants/routes";

// Component cho trạng thái đang chờ xác thực
export const PendingVerification: React.FC = () => {  return (
    <VerificationCard type="pending">
      <Result
        icon={<LoadingOutlined style={{ fontSize: 56, color: '#1677ff' }} spin />}
        title={<span className="text-xl font-semibold mt-4 text-gray-800">Đang xác thực email</span>}
        subTitle={<span className="text-gray-600">Vui lòng đợi trong giây lát...</span>}
      />
    </VerificationCard>
  );
};

// Component cho trạng thái xác thực thành công
interface SuccessVerificationProps {
  onRedirect: () => void;
  seconds?: number;
}

export const SuccessVerification: React.FC<SuccessVerificationProps> = ({ 
  onRedirect,
  seconds = 5 
}) => {
  return (
    <VerificationCard type="success">
      <Result
        status="success"
        icon={<CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a' }} className="animate-scaleIn" />}
        title={<span className="text-xl font-semibold text-gray-800">Xác thực email thành công!</span>}
        subTitle={
          <div className="space-y-3 mt-3">
            <p className="text-gray-700">Tài khoản của bạn đã được kích hoạt thành công.</p>
            <p className="text-gray-600">
              Đang chuyển đến trang đăng nhập trong <CountdownTimer seconds={seconds} onComplete={onRedirect} /> giây...
            </p>
          </div>
        }
        extra={[
          <ActionButton 
            key="login"
            href={ROUTES.LOGIN}
            variant="secondary"
            className="mt-2"
          >
            Đăng nhập ngay
          </ActionButton>
        ]}
      />
    </VerificationCard>
  );
};

// Component cho trạng thái xác thực thất bại
export const ErrorVerification: React.FC = () => {
  return (
    <VerificationCard type="error">
      <Result
        status="error"
        icon={<WarningOutlined style={{ fontSize: 56, color: '#ff4d4f' }} className="animate-scaleIn" />}
        title={<span className="text-xl font-semibold text-gray-800">Xác thực thất bại</span>}
        subTitle={<span className="text-gray-700 mt-2">Liên kết xác thực không hợp lệ hoặc đã hết hạn.</span>}
        extra={[
          <ActionButton 
            key="login"
            href={ROUTES.LOGIN}
            variant="primary"
            fullWidth
            className="mb-3"
          >
            Đăng nhập
          </ActionButton>,
          <ActionButton
            key="home"
            href={ROUTES.HOME}
            variant="outline"
            fullWidth
          >
            Về trang chủ
          </ActionButton>
        ]}
      />
    </VerificationCard>
  );
};
