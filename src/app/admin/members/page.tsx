"use client";

import React, { useState } from 'react';
import { Card, Table, Button, Typography, Alert, Pagination, message, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

// Local imports
import { useMemberManagement } from './hooks/useMemberManagement';
import {
  MemberStatisticsCard,
  MemberFilters,
  MemberFormModal,
  LockUserModal,
  UnlockUserModal,
  createMemberColumns
} from './components';
import { MemberData, MemberCreateRequest } from './types';
import { useIsMobile } from "@/hooks/use-mobile";

const { Text } = Typography;

export default function AdminMemberManagement() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);

  // Modal states for lock/unlock
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);

  // Use custom hook for all member management logic
  const {
    // Data
    paginatedData,
    filteredData,
    statistics,
    currentUser,

    // State
    loading,
    showAuthWarning,
    isUsingApiData,
    filters,
    pagination,

    // Actions
    setFilters,
    setPagination,
    createMember,
    updateMember,
    lockUserAccount,
    unlockUserAccount,
    activateUserAccount,
    deactivateUserAccount,
  } = useMemberManagement();

  // Event handlers
  const handleEdit = (record: MemberData) => {
    setEditingMember(record);
    setIsModalVisible(true);
  };

  const handleViewDetail = (record: MemberData) => {
    router.push(`/admin/members/MemberDetail?id=${record.id}`);
  };

  // Handle filter changes with pagination reset
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    // Reset pagination to page 1 when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleModalSubmit = async (memberData: MemberCreateRequest) => {
    try {
      let success = false;
      if (editingMember) {
        success = await updateMember(editingMember.id, memberData);
      } else {
        success = await createMember(memberData);
      }

      if (success) {
        setIsModalVisible(false);
        setEditingMember(null);
      }
    } catch {
      message.error('Please check all required fields and try again.');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMember(null);
  };

  // Lock/Unlock/Activate/Deactivate handlers
  const handleLock = (record: MemberData) => {
    setSelectedMember(record);
    setLockModalVisible(true);
  };

  const handleUnlock = async (record: MemberData) => {
    await unlockUserAccount(record.id);
  };

  const handleActivate = async (record: MemberData) => {
    await activateUserAccount(record.id);
  };

  const handleDeactivate = async (record: MemberData) => {
    await deactivateUserAccount(record.id);
  };

  const handleLockConfirm = async (lockData: { reason: string; lockHours: number; sendNotificationEmail: boolean; notes?: string }) => {
    if (selectedMember) {
      const success = await lockUserAccount(selectedMember.id, lockData.lockHours, lockData.reason, lockData.sendNotificationEmail);
      if (success) {
        setLockModalVisible(false);
        setSelectedMember(null);
        
        // If we just locked the current user, trigger banned notification
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.id === parseInt(selectedMember.id)) {
          const windowWithCallback = window as typeof window & { __triggerAccountBannedCheck?: (error: unknown) => void };
          if (windowWithCallback.__triggerAccountBannedCheck) {
            // Simulate account locked error
            const mockError = {
              response: {
                status: 403,
                data: {
                  message: lockData.reason || "Tài khoản đã bị khóa",
                  errorCode: "ACCOUNT_LOCKED",
                  code: 1105
                }
              }
            };
            windowWithCallback.__triggerAccountBannedCheck(mockError);
          }
        }
      }
    }
  };

  const handleUnlockConfirm = async () => {
    if (selectedMember) {
      const success = await unlockUserAccount(selectedMember.id);
      if (success) {
        setUnlockModalVisible(false);
        setSelectedMember(null);
      }
    }
  };

  // Table columns configuration
  const columns = createMemberColumns(
    currentUser,
    isUsingApiData,
    pagination.currentPage,
    pagination.pageSize,
    handleViewDetail,
    handleEdit,
    handleLock,
    handleUnlock,
    handleActivate,
    handleDeactivate
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Demo Data Warning */}
        {!isUsingApiData && (
          <Alert
            message="Demo Mode - Using Sample Data"
            description="You are viewing sample data. Connect to the backend server to enable full CRUD operations."
            type="warning"
            showIcon
            className="mb-6"
            closable
          />
        )}

        {/* Authentication Warning */}
        {showAuthWarning && (
          <Alert
            message="Authentication Notice"
            description="You are not logged in. Displaying sample data for demonstration. Log in to access real data."
            type="warning"
            showIcon
            className="mb-6"
            action={
              <Button size="small" type="link" href="/auth/Login">
                Login
              </Button>
            }
          />
        )}

        {/* Statistics Cards */}
        <MemberStatisticsCard statistics={statistics} loading={loading} />

        {/* Main Content Card */}
        <Card
          className="shadow-sm border-0"
          styles={{ body: { padding: 0 } }}
          style={{ borderRadius: 16 }}
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <h1 className="m-0 text-gray-900 text-xl xl:text-2xl font-semibold">
                Member Management
              </h1>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema&apos;s member list
              </Text>
              {!isUsingApiData && (
                <Text className="text-orange-600 text-sm">⚠️ Currently using offline data</Text>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="middle"
                className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                onClick={() => setIsModalVisible(true)}
                disabled={!isUsingApiData}
                title={!isUsingApiData ? "Create/Edit functions require backend connection" : "Add new member"}
              >
                Add New Member
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <MemberFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Table Section */}
          <div className="bg-white">
            <Spin spinning={loading}>
              <Table
                dataSource={paginatedData}
                columns={columns}
                pagination={false}
                scroll={{ x: 950 }}
                rowClassName="hover:bg-gray-50 transition-colors"
                className="professional-table"
                size="small"
                loading={loading}
                rowKey="key"
              />
            </Spin>
            
            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Text type="secondary" className="text-sm">
                    Showing{" "}
                    <span className="font-medium text-gray-900">
                      {Math.max(1, (pagination.currentPage - 1) * pagination.pageSize + 1)}
                    </span>
                    {" "}to{" "}
                    <span className="font-medium text-gray-900">
                      {Math.min(pagination.currentPage * pagination.pageSize, filteredData.length)}
                    </span>
                    {" "}of{" "}
                    <span className="font-medium text-gray-900">
                      {filteredData.length}
                    </span>
                    {" "}members
                  </Text>
                </div>
                <Pagination
                  current={pagination.currentPage}
                  pageSize={pagination.pageSize}
                  total={filteredData.length}
                  onChange={(page, size) => {
                    setPagination({ 
                      currentPage: page, 
                      pageSize: size || pagination.pageSize 
                    });
                  }}
                  showSizeChanger
                  showQuickJumper={false}
                  pageSizeOptions={["5", "10", "20", "50"]}
                  size="default"
                  className="flex-shrink-0"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Member Modal */}
      <MemberFormModal
        visible={isModalVisible}
        editingMember={editingMember}
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        loading={loading}
      />

      {/* Lock User Modal */}
      <LockUserModal
        visible={lockModalVisible}
        user={selectedMember ? {
          id: parseInt(selectedMember.id),
          name: selectedMember.name,
          email: selectedMember.email
        } : null}
        onConfirm={handleLockConfirm}
        onCancel={() => {
          setLockModalVisible(false);
          setSelectedMember(null);
        }}
      />

      {/* Unlock User Modal */}
      <UnlockUserModal
        visible={unlockModalVisible}
        user={selectedMember ? {
          id: parseInt(selectedMember.id),
          name: selectedMember.name,
          email: selectedMember.email,
          accountLockedUntil: selectedMember.accountLockedUntil
        } : null}
        onConfirm={handleUnlockConfirm}
        onCancel={() => {
          setUnlockModalVisible(false);
          setSelectedMember(null);
        }}
        loading={loading}
      />
    </div>
  );
}
