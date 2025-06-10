import React, { useState, useEffect } from 'react';
import {
    Button,
    Table,
    Space,
    Card,
    Input,
    Select,
    Modal,
    Form,
    Row,
    Col,
    Statistic,
    Tag,
    Avatar,
    Tooltip,
    Popconfirm,
    DatePicker,
    Switch,
    message,
    Dropdown,
    Badge
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    ExportOutlined,
    FilterOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    LockOutlined,
    UnlockOutlined,
    CheckCircleOutlined,
    StopOutlined,
    MailOutlined,
    KeyOutlined,
    DownloadOutlined,
    MoreOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RangePickerProps } from 'antd/es/date-picker';
import { userManagementAPI } from '../../services/api';
import './UserManagement.scss';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface User {
    accountId: number;
    username: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
    emailVerified: boolean;
    membershipLevel?: string;
    membershipPoints?: number;
    lastLogin?: string;
    createdAt: string;
    totalBookings: number;
    totalSpent: number;
    isAccountLocked: boolean;
}

interface UserStatistics {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    lockedAccounts: number;
    usersByRole: Record<string, number>;
    usersByMembershipLevel: Record<string, number>;
    newUsersThisMonth: number;
    newUsersThisWeek: number;
}

interface SearchFilters {
    keyword?: string;
    role?: string;
    isActive?: boolean;
    isVerified?: boolean;
    membershipLevel?: string;
    registrationDateFrom?: string;
    registrationDateTo?: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [statistics, setStatistics] = useState<UserStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });

    const [form] = Form.useForm();

    useEffect(() => {
        fetchUsers();
        fetchStatistics();
    }, [pagination.current, pagination.pageSize, searchFilters]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userManagementAPI.getAllUsers({
                page: pagination.current - 1,
                size: pagination.pageSize,
                ...searchFilters
            });
            setUsers(response.content);
            setPagination(prev => ({
                ...prev,
                total: response.totalElements
            }));
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Không thể tải danh sách người dùng';
            message.error(errorMessage);
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const stats = await userManagementAPI.getStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const handleSearch = (filters: SearchFilters) => {
        setSearchFilters(filters);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleCreateUser = () => {
        setEditingUser(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue({
            ...user,
            password: undefined // Don't prefill password
        });
        setModalVisible(true);
    };

    const handleSaveUser = async (values: any) => {
        try {
            if (editingUser) {
                await userManagementAPI.updateUser(editingUser.accountId, values);
                message.success('Cập nhật người dùng thành công');
            } else {
                await userManagementAPI.createUser(values);
                message.success('Tạo người dùng thành công');
            }
            setModalVisible(false);
            fetchUsers();
            fetchStatistics();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi lưu người dùng';
            const errorCode = error?.response?.data?.errorCode;

            // Hiển thị lỗi cụ thể dựa trên error code
            if (errorCode === 'USERNAME_ALREADY_EXISTS') {
                message.error('Username đã tồn tại');
            } else if (errorCode === 'EMAIL_ALREADY_EXISTS') {
                message.error('Email đã tồn tại');
            } else if (errorCode === 'VALIDATION_ERROR') {
                message.error(errorMessage);
            } else {
                message.error(errorMessage);
            }

            console.error('Error saving user:', error);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        try {
            await userManagementAPI.deleteUser(userId);
            message.success('Xóa người dùng thành công');
            fetchUsers();
            fetchStatistics();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng';
            message.error(errorMessage);
            console.error('Error deleting user:', error);
        }
    };

    const handleActivateUser = async (userId: number) => {
        try {
            await userManagementAPI.activateUser(userId);
            message.success('Kích hoạt người dùng thành công');
            fetchUsers();
        } catch (error) {
            message.error('Có lỗi xảy ra khi kích hoạt người dùng');
            console.error(error);
        }
    };

    const handleDeactivateUser = async (userId: number) => {
        try {
            await userManagementAPI.deactivateUser(userId);
            message.success('Vô hiệu hóa người dùng thành công');
            fetchUsers();
        } catch (error) {
            message.error('Có lỗi xảy ra khi vô hiệu hóa người dùng');
            console.error(error);
        }
    };

    const handleExportCSV = async () => {
        try {
            const csvData = await userManagementAPI.exportCSV(searchFilters);
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'users_export.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            message.success('Xuất CSV thành công');
        } catch (error) {
            message.error('Có lỗi xảy ra khi xuất CSV');
            console.error(error);
        }
    };

    const getRoleColor = (role: string) => {
        const colors = {
            ADMIN: 'red',
            EMPLOYEE: 'blue',
            MEMBER: 'green',
            CUSTOMER: 'default'
        };
        return colors[role as keyof typeof colors] || 'default';
    };

    const getMembershipColor = (level: string) => {
        const colors = {
            PLATINUM: 'purple',
            GOLD: 'gold',
            SILVER: 'default',
            BRONZE: 'orange'
        };
        return colors[level as keyof typeof colors] || 'default';
    };

    const userActions = (record: User) => [
        {
            key: 'edit',
            label: 'Chỉnh sửa',
            icon: <EditOutlined />,
            onClick: () => handleEditUser(record)
        },
        {
            key: 'activate',
            label: record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt',
            icon: record.isActive ? <StopOutlined /> : <CheckCircleOutlined />,
            onClick: () => record.isActive ? handleDeactivateUser(record.accountId) : handleActivateUser(record.accountId)
        },
        {
            key: 'delete',
            label: 'Xóa',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => Modal.confirm({
                title: 'Xác nhận xóa',
                content: `Bạn có chắc chắn muốn xóa người dùng ${record.username}?`,
                onOk: () => handleDeleteUser(record.accountId)
            })
        }
    ];

    const columns: ColumnsType<User> = [
        {
            title: 'Avatar',
            dataIndex: 'avatarUrl',
            key: 'avatar',
            width: 60,
            render: (_, record) => (
                <Avatar
                    size="small"
                    src={record.avatarUrl}
                    icon={<UserOutlined />}
                />
            )
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
            sorter: true,
            render: (text, record) => (
                <Space>
                    <span>{text}</span>
                    {record.isAccountLocked && <LockOutlined style={{ color: 'red' }} />}
                </Space>
            )
        },
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: true
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text, record) => (
                <Space>
                    <span>{text}</span>
                    {record.emailVerified && <CheckCircleOutlined style={{ color: 'green' }} />}
                </Space>
            )
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color={getRoleColor(role)}>{role}</Tag>
        },
        {
            title: 'Cấp độ',
            dataIndex: 'membershipLevel',
            key: 'membershipLevel',
            render: (level) => level ? <Tag color={getMembershipColor(level)}>{level}</Tag> : '-'
        },
        {
            title: 'Điểm',
            dataIndex: 'membershipPoints',
            key: 'membershipPoints',
            align: 'right',
            render: (points) => points?.toLocaleString() || '0'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive) => (
                <Badge
                    status={isActive ? 'success' : 'default'}
                    text={isActive ? 'Hoạt động' : 'Không hoạt động'}
                />
            )
        },
        {
            title: 'Đăng nhập cuối',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            render: (lastLogin) => lastLogin ? new Date(lastLogin).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'totalSpent',
            key: 'totalSpent',
            align: 'right',
            render: (amount) => `${amount?.toLocaleString() || 0} VNĐ`
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Dropdown menu={{ items: userActions(record) }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            )
        }
    ];

    return (
        <div className="user-management">
            {/* Statistics Cards */}
            {statistics && (
                <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tổng người dùng"
                                value={statistics.totalUsers}
                                prefix={<UserOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đang hoạt động"
                                value={statistics.activeUsers}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đã xác thực"
                                value={statistics.verifiedUsers}
                                prefix={<MailOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Bị khóa"
                                value={statistics.lockedAccounts}
                                prefix={<LockOutlined />}
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Search and Filter Section */}
            <Card style={{ marginBottom: 16 }}>
                <Row gutter={16} align="middle">
                    <Col span={8}>
                        <Search
                            placeholder="Tìm kiếm theo tên, email..."
                            allowClear
                            onSearch={(value) => handleSearch({ ...searchFilters, keyword: value })}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Vai trò"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(role) => handleSearch({ ...searchFilters, role })}
                        >
                            <Option value="ADMIN">Admin</Option>
                            <Option value="EMPLOYEE">Nhân viên</Option>
                            <Option value="MEMBER">Thành viên</Option>
                            <Option value="CUSTOMER">Khách hàng</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(isActive) => handleSearch({ ...searchFilters, isActive })}
                        >
                            <Option value={true}>Hoạt động</Option>
                            <Option value={false}>Không hoạt động</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Cấp độ"
                            allowClear
                            style={{ width: '100%' }}
                            onChange={(membershipLevel) => handleSearch({ ...searchFilters, membershipLevel })}
                        >
                            <Option value="PLATINUM">Platinum</Option>
                            <Option value="GOLD">Gold</Option>
                            <Option value="SILVER">Silver</Option>
                            <Option value="BRONZE">Bronze</Option>
                        </Select>
                    </Col>
                    <Col span={4}>
                        <Space>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateUser}>
                                Thêm mới
                            </Button>
                            <Button icon={<ExportOutlined />} onClick={handleExportCSV}>
                                Xuất CSV
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Users Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="accountId"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} người dùng`,
                        onChange: (page, pageSize) =>
                            setPagination(prev => ({ ...prev, current: page, pageSize: pageSize || 20 }))
                    }}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: setSelectedRowKeys,
                        selections: [
                            Table.SELECTION_ALL,
                            Table.SELECTION_INVERT,
                            Table.SELECTION_NONE,
                        ]
                    }}
                />
            </Card>

            {/* User Form Modal */}
            <Modal
                title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveUser}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="Tên đăng nhập"
                                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Họ tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                            >
                                <Select>
                                    <Option value="ADMIN">Admin</Option>
                                    <Option value="EMPLOYEE">Nhân viên</Option>
                                    <Option value="MEMBER">Thành viên</Option>
                                    <Option value="CUSTOMER">Khách hàng</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="membershipLevel"
                                label="Cấp độ thành viên"
                            >
                                <Select allowClear>
                                    <Option value="PLATINUM">Platinum</Option>
                                    <Option value="GOLD">Gold</Option>
                                    <Option value="SILVER">Silver</Option>
                                    <Option value="BRONZE">Bronze</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {!editingUser && (
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="password"
                                    label="Mật khẩu"
                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                                >
                                    <Input.Password />
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="isActive" label="Hoạt động" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="emailVerified" label="Email đã xác thực" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="acceptMarketing" label="Chấp nhận marketing" valuePropName="checked">
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="address" label="Địa chỉ">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Row justify="end" gutter={8}>
                        <Col>
                            <Button onClick={() => setModalVisible(false)}>
                                Hủy
                            </Button>
                        </Col>
                        <Col>
                            <Button type="primary" htmlType="submit">
                                {editingUser ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement; 