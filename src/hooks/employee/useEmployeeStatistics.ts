import { useState, useCallback, useEffect } from "react";
import { message } from "antd";
import { EmployeeApiService } from "@/api/employee-api";
import type { EmployeeStatistics, ApiResponse } from "@/api/employee-api";

export const useEmployeeStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<EmployeeStatistics | null>(null);

  const handleApiResponse = useCallback((response: any, operation: string) => {
    if (response?.data?.success) {
      return response.data.data || response.data;
    } else if (response?.success) {
      return response.data || response;
    } else {
      throw new Error(`Invalid response structure for ${operation}`);
    }
  }, []);

  const handleError = useCallback((err: any, operation: string, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    
    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    console.error(`${operation} error:`, err);
  }, []);

  const fetchStatistics = useCallback(async (): Promise<EmployeeStatistics | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await EmployeeApiService.getEmployeeStatistics();
      const result = handleApiResponse(response, 'fetchStatistics');
      
      setStatistics(result);
      return result;
    } catch (err: any) {
      handleError(err, 'fetchStatistics', "Không thể tải thống kê");
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const getDailyStatistics = useCallback(async (date?: string): Promise<any> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await EmployeeApiService.getDailyStatistics(date);
      return handleApiResponse(response, 'getDailyStatistics');
    } catch (err: any) {
      handleError(err, 'getDailyStatistics', "Không thể tải thống kê hàng ngày");
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  // Auto-fetch statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    loading,
    error,
    statistics,
    fetchStatistics,
    getDailyStatistics,
  };
};