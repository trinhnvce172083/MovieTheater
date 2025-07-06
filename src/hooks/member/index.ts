/**
 * Member Hooks
 * Custom React hooks for member API operations with loading states and error handling
 */

import { useState, useEffect, useCallback, useRef } from "react";
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

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;

    setState((prev) => {
      return { ...prev, loading: true, error: null };
    });

    try {
      const response = await fetchFn();

      if (!mountedRef.current) return;

      setState((prev) => {
        return {
          ...prev,
          data: response.data,
          loading: false,
          error: null,
          lastUpdated: Date.now(),
        };
      });
    } catch (error) {
      if (!mountedRef.current) return;

      const errorMessage =
        error instanceof MemberApiError
          ? error.message
          : "An unexpected error occurred";

      setState((prev) => {
        return {
          ...prev,
          loading: false,
          error: errorMessage,
        };
      });

      console.error("useAsyncData error:", error);
    }
  }, [fetchFn, ...dependencies]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    refetch: fetchData,
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
 * Hook for member profile management
 */
export function useMemberProfile() {
  const fetchProfile = useCallback(() => MemberApiService.getProfile(), []);
  const profileState = useAsyncData(fetchProfile, []);

  const updateMutation = useAsyncMutation(
    (request: ProfileUpdateRequest) => MemberApiService.updateProfile(request),
    () => {
      message.success("Profile updated successfully!");
      profileState.refetch();
    }
  );

  const passwordMutation = useAsyncMutation(
    (request: PasswordChangeRequest) =>
      MemberApiService.changePassword(request),
    () => {
      message.success("Password changed successfully!");
    }
  );

  return {
    profile: profileState.data,
    loading: profileState.loading,
    error: profileState.error,
    lastUpdated: profileState.lastUpdated,
    refetch: profileState.refetch,

    updateProfile: updateMutation.mutate,
    updatingProfile: updateMutation.loading,
    updateError: updateMutation.error,

    changePassword: passwordMutation.mutate,
    changingPassword: passwordMutation.loading,
    passwordError: passwordMutation.error,
  };
}

// ==================== BOOKING HOOKS ====================

/**
 * Hook for member bookings with pagination
 */
export function useMemberBookings(params: BookingListParams = {}) {
  const [state, setState] = useState<PaginatedState<MemberBooking>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
    hasMore: true,
    loadingMore: false,
  });

  const mountedRef = useRef(true);

  const loadBookings = useCallback(
    async (reset: boolean = false) => {
      if (!mountedRef.current) return;

      const currentPage = reset ? 0 : state.data?.page.number || 0;
      const loading = reset ? "loading" : "loadingMore";

      setState((prev) => ({
        ...prev,
        [loading]: true,
        error: null,
      }));

      try {
        const response = await MemberApiService.getBookings({
          ...params,
          page: currentPage,
        });

        if (!mountedRef.current) return;

        const newData = response.data;
        const hasMore = !newData.page.last;

        setState((prev) => ({
          data:
            reset || !prev.data
              ? newData
              : {
                  ...newData,
                  content: [...prev.data.content, ...newData.content],
                },
          loading: false,
          loadingMore: false,
          error: null,
          lastUpdated: Date.now(),
          hasMore,
        }));
      } catch (error) {
        if (!mountedRef.current) return;

        const errorMessage =
          error instanceof MemberApiError
            ? error.message
            : "Failed to load bookings";

        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: errorMessage,
        }));

        console.error("useMemberBookings error:", error);
      }
    },
    [params, state.data?.page.number]
  );

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loadingMore && !state.loading) {
      loadBookings(false);
    }
  }, [state.hasMore, state.loadingMore, state.loading, loadBookings]);

  const refresh = useCallback(() => {
    loadBookings(true);
  }, [loadBookings]);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    loadBookings(true);
  }, [paramsKey, loadBookings]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    bookings: state.data?.content || [],
    totalElements: state.data?.page.totalElements || 0,
    totalPages: state.data?.page.totalPages || 0,
    currentPage: state.data?.page.number || 0,
    loading: state.loading,
    loadingMore: state.loadingMore,
    error: state.error,
    hasMore: state.hasMore,
    lastUpdated: state.lastUpdated,
    loadMore,
    refresh,
  };
}

/**
 * Hook for booking history
 */
export function useBookingHistory(params: HistoryParams = {}) {
  return useMemberBookings({
    ...params,
    status: ["COMPLETED", "CANCELLED"],
  });
}

/**
 * Hook for active bookings
 */
export function useActiveBookings(params: BookingListParams = {}) {
  return useMemberBookings({
    ...params,
    status: ["CONFIRMED", "PAID"],
  });
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
