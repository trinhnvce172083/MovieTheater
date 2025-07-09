// Booking hooks
export { useBooking } from './booking/useBooking';
export { useSeatSelection } from './booking/useSeatSelection';
export { useConcession } from './booking/useConcession';
export { usePromotion } from './booking/usePromotion';
export { usePayment } from './booking/usePayment';

// Existing hooks
export { useAuth } from './useAuth';
export { useLogin } from './Login/useLogin';
export { useResetPassword } from './ResetPassword/useResetPassword';
export { useVerifyEmail } from './VerifyEmail/use-verify-email';
export { useMovies } from './HomePage/useMovies';
export { useMovie } from './NowShowing/use-movie';
export { useMobile } from './use-mobile'; 

useEffect(() => {
  console.log("DEBUG scheduleId:", scheduleId, "roomId:", roomId);
}, [scheduleId, roomId]); 

const fetchSeatStatus = useCallback(async () => {
  console.log("GỌI fetchSeatStatus với scheduleId:", scheduleId, "roomId:", roomId);
  if (!scheduleId || !roomId) {
    console.warn("Không gọi API vì thiếu scheduleId hoặc roomId");
    return;
  }
  // ... phần còn lại
}, [scheduleId, roomId, ...]); 

useEffect(() => {
  const scheduleIdParam = searchParams.get("scheduleId");
  const roomIdParam = searchParams.get("roomId");
  if (scheduleIdParam && roomIdParam) {
    dispatch(initializeBooking({
      scheduleId: scheduleIdParam,
      roomId: roomIdParam,
    }));
  }
}, [searchParams, dispatch]); 

useEffect(() => {
  console.log("useEffect gọi fetchSeatStatus với:", scheduleId, roomId);
  if (scheduleId && roomId) {
    fetchSeatStatus();
  }
}, [scheduleId, roomId, fetchSeatStatus]); 

import { useSeatSelection } from "@/hooks/booking/useSeatSelection";
// ...
console.log("HOOK useSeatSelection mounted", scheduleId, roomId);
const { seats, loading, ... } = useSeatSelection(scheduleId, roomId); 

useEffect(() => {
  if (scheduleId && roomId) {
    fetchSeatStatus();
  }
}, [scheduleId, roomId, fetchSeatStatus]); 