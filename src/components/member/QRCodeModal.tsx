"use client";

import React from "react";
import { Modal, Typography, QRCode } from "antd";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketCode: string;
  movieTitle: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  ticketCode,
  movieTitle
}) => {
  return (
    <Modal
      title="Ticket QR Code"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      centered
      width={400}
    >
      <div className="text-center p-6">
        <Typography.Title level={4} className="mb-4">
          {movieTitle}
        </Typography.Title>
        <QRCode
          value={`TICKET:${ticketCode}`}
          size={200}
          className="text-center mb-4"
        />
        <Typography.Text type="secondary" className="block mb-2">
          Ticket Code: {ticketCode}
        </Typography.Text>
        <Typography.Text type="secondary" className="block">
          Show this QR code at the cinema entrance
        </Typography.Text>
      </div>
    </Modal>
  );
};

export default QRCodeModal; 