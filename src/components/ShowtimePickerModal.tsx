import React, { useState } from "react";
import { Modal, DatePicker, Button, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";

const SHOWTIMES = [
  "9:30", "10:00", "11:00", "11:20", "13:21", "14:54", "15:06", "17:29", "21:54"
];

interface ShowtimePickerModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: (date: string, time: string) => void;
  movieTitle: string;
}

const ShowtimePickerModal: React.FC<ShowtimePickerModalProps> = ({ open, onClose, onContinue, movieTitle }) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      onContinue(selectedDate.format("DD/MM/YYYY"), selectedTime);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      styles={{ body: { background: "linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)", borderRadius: 16 } }}
    >
      <Typography.Title level={4} style={{ color: "#fff", textAlign: "center" }}>BOOKING DATE</Typography.Title>
      <Typography.Text style={{ color: "#fff", display: "block", textAlign: "center", marginBottom: 16 }}>
        Please choose the day you want to booking.
      </Typography.Text>
      <div style={{ marginBottom: 24 }}>
        <span style={{ color: "#fff", fontWeight: 500 }}>DATE</span>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          format="DD/MM/YYYY"
          style={{ width: "100%", marginTop: 8 }}
        />
      </div>
      <div style={{ marginBottom: 24 }}>
        <span style={{ color: "#fff", fontWeight: 500 }}>TIME</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
          {SHOWTIMES.map((time) => (
            <Button
              key={time}
              type={selectedTime === time ? "primary" : "default"}
              style={{ minWidth: 80, borderRadius: 20, fontWeight: 600 }}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </Button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          disabled={!selectedDate || !selectedTime}
          onClick={handleContinue}
        >
          Continue
        </Button>
      </div>
    </Modal>
  );
};

export default ShowtimePickerModal; 