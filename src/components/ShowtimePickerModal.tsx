import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import dayjs, { type Dayjs } from 'dayjs';
import { ScheduleApiService } from "@/api/schedule-api";
import type { Schedule } from "@/types/schedule";
import { Ring } from '@uiball/loaders';

// Helper to generate next 7 days
const generateDates = () => {
  const today = dayjs();
  const currentDayOfWeek = today.day(); // 0 = CN, 1 = T2, ..., 6 = T7
  const dates = [];
  // Thêm 7 ngày tiếp theo vào mảng
  for (let i = 0; i < 7; i++) {
    dates.push(dayjs().add(i, 'day'));
  }
  // Sắp xếp lại ngày theo thứ tự mong muốn
  return dates.sort((a, b) => {
    const dayOfWeekA = a.day();
    const dayOfWeekB = b.day();
    // Hàm chuyển đổi thứ tự ưu tiên
    const getPriority = (day: number) => {
      // Nếu là ngày hiện tại, ưu tiên cao nhất
      if (day === currentDayOfWeek) return -1;
      
      // Nếu ngày nhỏ hơn ngày hiện tại (thứ 2, 3 nếu hôm nay là thứ 4)
      // thì đẩy xuống cuối
      if (day < currentDayOfWeek) return day + 7;
      
      // Các ngày còn lại giữ nguyên thứ tự
      return day;
    };
    
    return getPriority(dayOfWeekA) - getPriority(dayOfWeekB);
  });
};

interface ShowtimePickerModalProps {
  open: boolean;
  onClose: () => void;
  onContinue: (schedule: Schedule) => void;
  movieTitle?: string;
  movieId: string | number;
}

const ShowtimePickerModal: React.FC<ShowtimePickerModalProps> = ({
  open,
  onClose,
  onContinue,
  movieTitle,
  movieId
}) => {
  const [dates] = useState(generateDates());
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dates[0]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !movieId) return;

    const fetchSchedules = async () => {
      setLoading(true);
      setError(null);
      setSchedules([]);
      setSelectedTime(null);
      setSelectedScheduleId(null);

      try {
        const dateStr = selectedDate.format('YYYY-MM-DD');
        console.log(`Fetching schedules for movieId: ${movieId}, date: ${dateStr}`);
        const response = await ScheduleApiService.getSchedulesForMovie(movieId, dateStr);
        console.log("API Response:", response);

        if (response.success) {
          setSchedules(response.data);
        } else {
          setError(response.message || 'Failed to load schedules.');
        }
      } catch (error) {
        console.error("Failed to fetch schedules:", error);
        setError('An error occurred while fetching schedules.');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [selectedDate, movieId, open]);

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    const time = schedule.displayTime;
    if (!acc[time]) {
      acc[time] = [];
    }
    acc[time].push(schedule);
    return acc;
  }, {} as Record<string, Schedule[]>);


  if (!open) return null;

  const handleContinue = () => {
    const selectedSchedule = schedules.find(s => s.scheduleId === selectedScheduleId);
    if (selectedSchedule) {
      onContinue(selectedSchedule);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl mx-auto rounded-3xl shadow-2xl bg-gradient-to-br from-[#7F56D9] via-[#6241C5] to-[#1E1B3A] p-12 animate-fadeIn">
        <button
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition"
          onClick={onClose}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold text-white text-center mb-2 tracking-wide">{movieTitle || 'Chọn suất chiếu'}</h2>
        <p className="text-white text-center mb-8 text-lg">Please select desired date and screen.</p>

        {/* 1. Days */}
        <div className="flex justify-center flex-wrap gap-3 mb-8">
          {dates.map((date) => (
            <button
              key={date.toString()}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform flex flex-col items-center
                ${
                  selectedDate.isSame(date, 'day')
                    ? "bg-white/20 text-white ring-2 ring-purple-300 border border-purple-400 scale-105"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              onClick={() => setSelectedDate(date)}
            >
              <span className="text-sm">{date.format('ddd')}</span>
              <span className="font-bold text-lg">{date.format('DD')}</span>
            </button>
          ))}
        </div>
        
        {/* 2. Content Area */}
        <div className="min-h-[250px] bg-black/10 p-4 rounded-xl">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Ring size={40} color="#FFFFFF" />
            </div>
          ) : error ? (
            <div className="text-center text-red-300 bg-red-500/20 p-4 rounded-lg">
              <p className="font-bold">Oops! Something went wrong.</p>
              <p>{error}</p>
            </div>
          ) : schedules.length > 0 ? (
            <div className="space-y-5">
              {/* Time Selection */}
              <div>
                <h3 className="font-semibold text-lg text-purple-200 mb-3">Select time slot</h3>
                <div className="flex flex-wrap gap-3">
                  {Object.keys(groupedSchedules).map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTime(time);
                        setSelectedScheduleId(null);
                      }}
                      className={`px-4 py-2 rounded-lg font-bold transition-all duration-200
                        ${
                          selectedTime === time
                            ? "bg-purple-400 text-black ring-2 ring-purple-200"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Room Selection (conditional) */}
              {selectedTime && (
                <div className="border-t border-white/10 pt-5 animate-fadeIn">
                  <h3 className="font-semibold text-lg text-yellow-200 mb-3">Room type</h3>
                  <div className="flex flex-wrap gap-3">
                    {groupedSchedules[selectedTime].map((schedule) => (
                      <button
                        key={schedule.scheduleId}
                        onClick={() => setSelectedScheduleId(schedule.scheduleId)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex flex-col text-center
                          ${
                            selectedScheduleId === schedule.scheduleId
                              ? "bg-yellow-400 text-black ring-2 ring-yellow-200"
                              : "bg-white/10 text-white hover:bg-white/20"
                          }`}
                      >
                        <span>{schedule.roomType}</span>
                        <span className="text-xs font-normal opacity-80">{schedule.cinemaRoomName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-yellow-300 bg-yellow-500/20 p-4 rounded-lg">
                <p>There are no showtimes available for the selected date.</p>
              </div>
            </div>
          )}
        </div>

        {/* Continue */}
        <div className="flex justify-end mt-8">
          <button
            className={`px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg transition-all duration-150 text-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={!selectedScheduleId}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowtimePickerModal;
