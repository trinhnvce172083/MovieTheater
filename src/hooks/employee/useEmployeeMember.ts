import { useState, useCallback } from "react";
import { message } from "antd";
import { EmployeeApiService } from "@/api/employee-api";
import type { 
  MemberInfo, 
  MemberSearchRequest, 
  PaginatedResponse,
  ApiResponse 
} from "@/api/employee-api";

export const useEmployeeMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberInfo | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 10,
  });

  const handleApiResponse = useCallback((response: any, operation: string) => {
    if (response?.data?.success) {
      return response.data.data || response.data;
    } else if (response?.success) {
      return response.data || response;
    } else {
      throw new Error(`Invalid response structure for ${operation}`);
    }
  }, []);

  const handleError = useCallback((err: any, operation: string, defaultMessage: string, shouldThrow: boolean = true) => {
    let errorMessage = defaultMessage;
    
    if (err?.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    message.error(errorMessage);
    
    if (shouldThrow) {
      throw new Error(errorMessage);
    }
  }, []);

  const searchMembers = useCallback(async (searchRequest: MemberSearchRequest): Promise<PaginatedResponse<MemberInfo>> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await EmployeeApiService.searchMembers(searchRequest);
      const result = handleApiResponse(response, 'searchMembers');
      
      setMembers(result.content);
      setPagination({
        total: result.totalElements,
        current: result.number + 1,
        pageSize: result.size,
      });
      
      return result;
    } catch (err: any) {
      handleError(err, 'searchMembers', "Không thể tìm kiếm thành viên", false);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true,
      };
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const getMemberById = useCallback(async (memberId: number): Promise<MemberInfo | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await EmployeeApiService.getMemberById(memberId);
      const result = handleApiResponse(response, 'getMemberById');
      
      setSelectedMember(result);
      return result;
    } catch (err: any) {
      handleError(err, 'getMemberById', "Không thể tải thông tin thành viên", false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const getMemberByPhone = useCallback(async (phoneNumber: string): Promise<MemberInfo | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await EmployeeApiService.getMemberByPhone(phoneNumber);
      const result = handleApiResponse(response, 'getMemberByPhone');
      
      setSelectedMember(result);
      message.success("Tìm thấy thành viên!");
      return result;
    } catch (err: any) {
      handleError(err, 'getMemberByPhone', "Không tìm thấy thành viên với số điện thoại này", false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleApiResponse, handleError]);

  const clearSelectedMember = useCallback(() => {
    setSelectedMember(null);
  }, []);

  return {
    loading,
    error,
    members,
    selectedMember,
    pagination,
    searchMembers,
    getMemberById,
    getMemberByPhone,
    clearSelectedMember,
  };
};