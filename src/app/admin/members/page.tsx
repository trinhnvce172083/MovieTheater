"use client";

import React, { useState } from 'react';
import { Card, Table, Button, Typography, Alert, Pagination, message } from 'antd';
import { PlusOutlined, UserOutlined, BugOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

// Local imports
import { useMemberManagement } from './hooks/useMemberManagement';
import { 
  MemberStatisticsCard, 
  MemberFilters, 
  MemberFormModal,
  LockUserModal,
  UnlockUserModal,
  DebugPanel,
  createMemberColumns 
} from './components';
import { MemberData, MemberCreateRequest } from './types';

const { Title, Text } = Typography;

export default function AdminMemberManagement() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberData | null>(null);
  
  // Modal states for lock/unlock
  const [lockModalVisible, setLockModalVisible] = useState(false);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [showDebug, setShowDebug] = useState(false);

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
    deleteMember,
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

  const handleDelete = (record: MemberData) => {
    deleteMember(record.id, record.name);
  };

  const handleViewDetail = (record: MemberData) => {
    router.push(`/admin/members/MemberDetail?id=${record.id}`);
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
    console.log('Lock button clicked for user:', record);
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
    console.log('Lock confirm called with data:', lockData);
    console.log('Selected member:', selectedMember);
    
    if (selectedMember) {
      const success = await lockUserAccount(selectedMember.id, lockData.lockHours, lockData.reason, lockData.sendNotificationEmail);
      if (success) {
        setLockModalVisible(false);
        setSelectedMember(null);
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
    handleDelete,
    handleLock,
    handleUnlock,
    handleActivate,
    handleDeactivate
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        
        {/* Debug Panel - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <DebugPanel visible={showDebug} />
        )}

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
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <div className="flex items-center gap-3">
              <UserOutlined className="text-orange-600" />
              <div>
                <strong>Authentication Notice</strong>
                <p className="text-sm text-gray-600 mb-0">
                  You are not logged in. Displaying sample data for demonstration.
                  <a href="/auth/Login" className="text-blue-600 ml-1">Log in here</a> to access real data.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Statistics Cards */}
        <MemberStatisticsCard statistics={statistics} />

        {/* Main Content Card */}
        <Card
          className="shadow-sm border-0"
          styles={{ body: { padding: 0 } }}
          style={{ borderRadius: 16 }}
        >
          {/* Header Section */}
          <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div>
              <Title level={2} className="m-0 text-gray-900 text-xl xl:text-2xl">
                Member Management
              </Title>
              <Text type="secondary" className="text-sm xl:text-base">
                Manage and organize your cinema&apos;s member list
              </Text>
            </div>
            <div className="flex items-center gap-3">
              {process.env.NODE_ENV === 'development' && (
                <Button
                  type="text"
                  icon={<BugOutlined />}
                  onClick={() => setShowDebug(!showDebug)}
                  title="Toggle Debug Panel"
                />
              )}
              {isUsingApiData && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="middle"
                  className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm text-xs xl:text-sm h-10 px-4"
                  onClick={() => setIsModalVisible(true)}
                  title="Add new member"
                >
                  Add New Member
                </Button>
              )}
            </div>
          </div>

          {/* Filters Section */}
          <MemberFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />

          {/* Table Section */}
          <div className="bg-white">
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
            
            {/* Pagination */}
            <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Text type="secondary" className="text-sm">
                Showing {Math.max(1, (pagination.currentPage - 1) * pagination.pageSize + 1)} to{" "}
                {Math.min(pagination.currentPage * pagination.pageSize, filteredData.length)} of{" "}
                {filteredData.length} members
              </Text>
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
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Add/Edit Member Modal - Only show when API is available */}
      {isUsingApiData && (
        <MemberFormModal
          visible={isModalVisible}
          editingMember={editingMember}
          onSubmit={handleModalSubmit}
          onCancel={handleModalCancel}
          loading={loading}
        />
      )}

      {/* Lock User Modal - Only show when API is available */}
      {isUsingApiData && (
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
      )}

      {/* Unlock User Modal - Only show when API is available */}
      {isUsingApiData && (
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
      )}
    </div>
  );
}
