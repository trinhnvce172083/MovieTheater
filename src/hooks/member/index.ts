/**
 * Member Hooks
 * Custom React hooks for member API operations with loading states and error handling
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { message } from "antd";
import { MemberApiService } from "@/api/member";
import type {
  MemberBooking,
  BookingListParams,
  HistoryParams,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  BookingCancelRequest,
  BookingCheckInRequest,
  PaginatedResponse,
  BookingStatus,
  MemberProfile,
} from "@/types/member";
import { MemberApiError } from "@/types/member";

// ==================== HOOK TYPES ====================

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

interface PaginatedState<T> extends AsyncState<PaginatedResponse<T>> {
  hasMore: boolean;
  loadingMore: boolean;
}

interface MutationState {
  loading: boolean;
  error: string | null;
}

// ==================== UTILITY HOOKS ====================

/**
 * Generic async data fetching hook
 */
function useAsyncData<T>(
  fetchFn: () => Promise<{ success: boolean; data: T }>,
  dependencies: unknown[] = [],
  immediate: boolean = true
): AsyncState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
    lastUpdated: null,
  });

  const mountedRef = useRef(true);
  const isLoadingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current || isLoadingRef.current) {
      console.log("⏸️ Skipping fetchData - already loading or unmounted");
      return;
    }

    isLoadingRef.current = true;
    console.log("🚀 Starting fetchData...");
    
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      console.log("📞 Calling fetchFn...");
      const response = await fetchFn();
      console.log("📦 fetchFn response:", response);
      
      if (!mountedRef.current) {
        console.log("⚠️ Component unmounted, skipping state update");
        return;
      }

      console.log("📝 Setting state with data:", response.data);
      setState({
        data: response.data,
        loading: false,
        error: null,
        lastUpdated: null, // Remove Date.now() to prevent hydration mismatch
      });
      console.log("✅ State updated successfully");
    } catch (error: any) {
      console.error("❌ Error in fetchData:", error);
      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "An error occurred",
      }));
    } finally {
      isLoadingRef.current = false;
    }
  }, []); // Remove fetchFn dependency to avoid infinite loop

  useEffect(() => {
    if (immediate) {
      console.log("🎯 useEffect triggered for initial fetch");
      fetchData();
    }
    
    return () => {
      console.log("🧹 Cleanup - setting mounted to false");
      mountedRef.current = false;
    };
  }, [immediate, ...dependencies]); // Include dependencies to refetch when they change

  const refetch = useCallback(async () => {
    console.log("🔄 Manual refetch triggered");
    await fetchData();
  }, []); // Remove fetchData dependency

  return {
    ...state,
    refetch,
  };
}

/**
 * Generic async mutation hook
 */
function useAsyncMutation<T, P = unknown>(
  mutateFn: (params: P) => Promise<{ success: boolean; data: T }>,
  onSuccess?: (data: T) => void,
  onError?: (error: string) => void
): MutationState & { mutate: (params: P) => Promise<void> } {
  const [state, setState] = useState<MutationState>({
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (params: P) => {
      setState({ loading: true, error: null });

      try {
        const response = await mutateFn(params);

        setState({ loading: false, error: null });

        if (onSuccess) {
          onSuccess(response.data);
        }
      } catch (error) {
        const errorMessage =
          error instanceof MemberApiError
            ? error.message
            : "An unexpected error occurred";

        setState({ loading: false, error: errorMessage });

        if (onError) {
          onError(errorMessage);
        } else {
          message.error(errorMessage);
        }

        console.error("useAsyncMutation error:", error);
      }
    },
    [mutateFn, onSuccess, onError]
  );

  return {
    ...state,
    mutate,
  };
}

// ==================== PROFILE HOOKS ====================

/**
 * Simplified hook for member profile management with global sync
 */
export function useMemberProfile() {
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    console.log("🚀 Loading profile...");
    setLoading(true);
    setError(null);

    try {
      const response = await MemberApiService.getProfile(false); // No cache
      console.log("📦 Profile response:", response);
      setProfile(response.data);
      console.log("✅ Profile loaded successfully");
      
      // Broadcast profile update to all components (client-side only)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent("member-profile-updated", {
          detail: response.data
        }));
      }
    } catch (err: any) {
      console.error("❌ Failed to load profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (request: ProfileUpdateRequest) => {
    try {
      const response = await MemberApiService.updateProfile(request);
      // Refresh profile data from server after successful update
      await loadProfile();
      // Show success message
      const { message } = await import('antd');
      message.success("Profile updated successfully!");
      return response;
    } catch (err: any) {
      const { message } = await import('antd');
      message.error("Failed to update profile");
      throw err;
    }
  }, [loadProfile]);

  const changePassword = useCallback(async (request: PasswordChangeRequest) => {
    try {
      const response = await MemberApiService.changePassword(request);
      const { message } = await import('antd');
      message.success("Password changed successfully!");
      return response;
    } catch (err: any) {
      const { message } = await import('antd');
      message.error("Failed to change password");
      throw err;
    }
  }, []);

  const refetch = useCallback(() => {
    loadProfile();
  }, [loadProfile]);

  // Listen for global profile updates
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleProfileUpdate = (event: CustomEvent) => {
      console.log("📡 Received global profile update:", event.detail);
      setProfile(event.detail);
    };

    window.addEventListener("member-profile-updated", handleProfileUpdate as EventListener);
    
    return () => {
      window.removeEventListener("member-profile-updated", handleProfileUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    loadProfile();
  }, []); // Remove loadProfile dependency to avoid infinite loop

  return {
    profile,
    loading,
    error,
    lastUpdated: null, // Remove Date.now() to prevent hydration mismatch
    refetch,

    updateProfile,
    updatingProfile: false, // Simplified
    updateError: null,

    changePassword,
    changingPassword: false, // Simplified
    passwordError: null,
  };
}

/**
 * Simplified hook for member bookings
 */
export function useMemberBookings(params: BookingListParams = {}) {
  const [bookings, setBookings] = useState<MemberBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    console.log("🚀 Loading bookings...");
    setLoading(true);
    setError(null);

    try {
      const response = await MemberApiService.getBookings({
        page: 0,
        size: 10,
        sortBy: "bookingDate", 
        sortDirection: "DESC",
      });

      console.log("📦 Bookings response:", response);
      setBookings(response.data.content || []);
      console.log("✅ Bookings loaded successfully");
    } catch (err: any) {
      console.error("❌ Failed to load bookings:", err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    loadBookings();
  }, []); // Remove loadBookings dependency to avoid infinite loop

  return {
    bookings,
    loading,
    error,
    refresh,
    totalElements: bookings.length,
    totalPages: 1,
    currentPage: 0,
    loadingMore: false,
    hasMore: false,
    lastUpdated: Date.now(),
    loadMore: () => {},
  };
}

/**
 * Hook for booking history
 */
export function useBookingHistory(params: HistoryParams = {}) {
  const memoizedParams = useMemo(() => ({
    ...params,
    status: ["COMPLETED", "CANCELLED"] as BookingStatus[],
  }), [
    params.page,
    params.size,
    params.status,
    params.startDate,
    params.endDate,
    params.sortBy,
    params.sortDirection,
    params.movieTitle,
    params.cinemaRoom
  ]);
  
  return useMemberBookings(memoizedParams);
}

/**
 * Hook for active bookings
 */
export function useActiveBookings(params: BookingListParams = {}) {
  const memoizedParams = useMemo(() => ({
    ...params,
    status: ["CONFIRMED", "PAID"] as BookingStatus[],
  }), [
    params.page,
    params.size,
    params.status,
    params.startDate,
    params.endDate,
    params.sortBy,
    params.sortDirection
  ]);
  
  return useMemberBookings(memoizedParams);
}

/**
 * Hook for booking details
 */
export function useBookingDetails(bookingId: string | null) {
  const bookingState = useAsyncData(
    () =>
      bookingId
        ? MemberApiService.getBookingDetails(bookingId)
        : Promise.reject("No booking ID"),
    [bookingId],
    !!bookingId
  );

  return {
    booking: bookingState.data,
    loading: bookingState.loading,
    error: bookingState.error,
    refetch: bookingState.refetch,
  };
}

/**
 * Hook for booking actions (cancel, check-in)
 */
export function useBookingActions(onSuccess?: () => void) {
  const cancelMutation = useAsyncMutation(
    (request: BookingCancelRequest) => MemberApiService.cancelBooking(request),
    () => {
      message.success("Booking cancelled successfully!");
      onSuccess?.();
    }
  );

  const checkInMutation = useAsyncMutation(
    (request: BookingCheckInRequest) =>
      MemberApiService.checkInBooking(request),
    () => {
      message.success("Check-in successful!");
      onSuccess?.();
    }
  );

  return {
    cancelBooking: cancelMutation.mutate,
    cancelling: cancelMutation.loading,
    cancelError: cancelMutation.error,

    checkInBooking: checkInMutation.mutate,
    checkingIn: checkInMutation.loading,
    checkInError: checkInMutation.error,
  };
}

// ==================== LOYALTY HOOKS ====================

/**
 * Hook for loyalty transactions
 */
export function useLoyaltyTransactions(page: number = 0, size: number = 10) {
  return useAsyncData(
    () => MemberApiService.getLoyaltyTransactions(page, size),
    [page, size]
  );
}

/**
 * Hook for membership benefits
 */
export function useMembershipBenefits() {
  return useAsyncData(() => MemberApiService.getMembershipBenefits(), []);
}

/**
 * Hook for member statistics
 */
export function useMemberStatistics() {
  return useAsyncData(() => MemberApiService.getStatistics(), []);
}

// ==================== COMBINED HOOKS ====================

/**
 * Hook that combines profile and statistics
 */
export function useMemberDashboard() {
  const profile = useMemberProfile();
  const statistics = useMemberStatistics();
  const benefits = useMembershipBenefits();

  return {
    profile: profile.profile,
    statistics: statistics.data,
    benefits: benefits.data,
    loading: profile.loading || statistics.loading || benefits.loading,
    error: profile.error || statistics.error || benefits.error,
    refetchAll: () => {
      profile.refetch();
      statistics.refetch();
      benefits.refetch();
    },
  };
}

/**
 * Hook for refreshing all member data
 */
export function useMemberDataRefresh() {
  const clearCache = useCallback(() => {
    MemberApiService.clearCache();
  }, []);

  const refreshAll = useCallback(() => {
    clearCache();
    // Trigger re-fetch of all components using member data
    window.dispatchEvent(new CustomEvent("member-data-refresh"));
  }, [clearCache]);

  return {
    clearCache,
    refreshAll,
  };
}
