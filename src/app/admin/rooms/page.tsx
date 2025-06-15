"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  Download,
  Home,
  Settings,
  CheckCircle,
  Grid,
  X,
} from "lucide-react"
import { Button as AntdButton, Tooltip, Popconfirm, Space } from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from "@ant-design/icons";


const roomData = [
  {
    key: "1",
    id: "R001",
    name: "Premium Cinema Hall A",
    seats: 48,
    type: "Premium",
    status: "Active",
    layout: "6x8",
    features: ["Dolby Atmos", "Recliner Seats", "4K Projection"],
    lastMaintenance: "2024-05-15",
  },
  {
    key: "2",
    id: "R002",
    name: "Standard Cinema Hall B",
    seats: 40,
    type: "Standard",
    status: "Active",
    layout: "5x8",
    features: ["Surround Sound", "Standard Seats"],
    lastMaintenance: "2024-05-10",
  },
  {
    key: "3",
    id: "R003",
    name: "VIP Cinema Hall C",
    seats: 24,
    type: "VIP",
    status: "Maintenance",
    layout: "4x6",
    features: ["Premium Leather", "In-seat Service", "Private Lounge"],
    lastMaintenance: "2024-05-20",
  },
  {
    key: "4",
    id: "R004",
    name: "IMAX Cinema Hall D",
    seats: 65,
    type: "IMAX",
    status: "Active",
    layout: "8x8+1",
    features: ["IMAX Screen", "Enhanced Audio", "Stadium Seating"],
    lastMaintenance: "2024-05-12",
  },
]

const generateSeatMap = (seats: number) => {
  const rows = Math.ceil(Math.sqrt(seats))
  const cols = Math.ceil(seats / rows)
  return Array(rows)
    .fill(0)
    .map((_, row) =>
      Array(cols)
        .fill(0)
        .map((_, col) => {
          const seatNum = row * cols + col + 1
          if (seatNum > seats) return null
          return {
            seat: `${String.fromCharCode(65 + row)}${col + 1}`,
            status: Math.random() < 0.7 ? "available" : Math.random() < 0.5 ? "booked" : "blocked",
          }
        })
        .filter(Boolean),
    )
}

const StatCard = ({ title, value, icon: Icon, gradient, textColor }: { title: string, value: string, icon: React.ElementType, gradient: string, textColor: string }) => (
  <div className={`${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
      <div className="p-3 bg-white/20 rounded-lg">
        {Icon && <Icon size={24} />}
      </div>
    </div>
  </div>
)

const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant: string }) => {
  const variants: { [key: string]: string } = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800",
    orange: "bg-orange-100 text-orange-800",
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>
  )
}

const Modal = ({ isOpen, onClose, title, children, footer }: { isOpen: boolean, onClose: () => void, title: React.ReactNode, children: React.ReactNode, footer: React.ReactNode }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <hr className="border-gray-200 mb-6" />
          </div>

          <div className="px-6 pb-6">{children}</div>

          {footer && <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

const Button = ({ children, variant = "default", size = "md", icon, onClick, disabled = false, className = "" }: { children: React.ReactNode, variant: string, size: string, icon?: React.ReactNode, onClick?: () => void, disabled?: boolean, className?: string }) => {
  const variants: { [key: string]: string } = {
    default: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    primary: "bg-blue-600 text-white hover:bg-blue-700 border border-transparent",
    danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent",
    success: "bg-green-600 text-white hover:bg-green-700 border border-transparent",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 border border-transparent",
  }
  const sizes: { [key: string]: string } = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

type RoomType = typeof roomData[0];

export default function ProfessionalRoomManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isSeatModalVisible, setIsSeatModalVisible] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null)
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    seats: "",
    type: "",
    layout: "",
    features: [] as string[],
    status: "Active",
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedRoomForSchedule, setSelectedRoomForSchedule] = useState<RoomType | null>(null)

  const filteredData = useMemo(() => {
    return roomData.filter((room) => {
      const matchesSearch =
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === "all" || room.type === typeFilter
      const matchesStatus = statusFilter === "all" || room.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [searchTerm, typeFilter, statusFilter])

  const statistics = useMemo(() => {
    const totalRooms = roomData.length
    const totalSeats = roomData.reduce((sum, r) => sum + r.seats, 0)
    const activeRooms = roomData.filter((r) => r.status === "Active").length
    const avgSeats = Math.round(totalSeats / totalRooms)
    return { totalRooms, totalSeats, activeRooms, avgSeats }
  }, [])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredData.slice(startIndex, startIndex + pageSize)
  }, [filteredData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredData.length / pageSize)

  const handleShowSeatDetail = (room: RoomType) => {
    setSelectedRoom(room)
    setIsSeatModalVisible(true)
  }

  const handleEditRoom = (room: RoomType) => {
    setSelectedRoom(room)
    setFormData({
      name: room.name,
      id: room.id,
      seats: String(room.seats),
      type: room.type,
      layout: room.layout,
      features: room.features,
      status: room.status,
    })
    setIsEditModalVisible(true)
  }

  const handleAddRoom = () => {
    // Simulate adding room
    setIsAddModalVisible(false)
    setFormData({ name: "", id: "", seats: "", type: "", layout: "", features: [], status: "Active" })
  }

  const handleUpdateRoom = () => {
    // Simulate updating room
    setIsEditModalVisible(false)
    setFormData({ name: "", id: "", seats: "", type: "", layout: "", features: [], status: "Active" })
  }

  const handleDeleteRoom = (room: RoomType) => {
    if (confirm(`Are you sure you want to delete "${room.name}"?`)) {
      // Simulate deletion
      console.log(`Deleted room: ${room.name}`)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success">Active</Badge>
      case "Maintenance":
        return <Badge variant="warning">Maintenance</Badge>
      case "Inactive":
        return <Badge variant="danger">Inactive</Badge>
      default:
        return <Badge variant="default">Unknown</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Premium":
        return <Badge variant="purple">Premium</Badge>
      case "VIP":
        return <Badge variant="orange">VIP</Badge>
      case "IMAX":
        return <Badge variant="danger">IMAX</Badge>
      case "Standard":
        return <Badge variant="info">Standard</Badge>
      default:
        return <Badge variant="default">Standard</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Cinema Rooms Overview and below */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Enhanced Header */}
          <div className="px-8 py-6 bg-white border-b border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Cinema Rooms Overview</h2>
                <p className="text-gray-600 mt-1">Manage and monitor all your cinema facilities</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  icon={<Download size={16} />}
                  variant="default"
                  size="md"
                  onClick={() => {}}
                  disabled={false}
                  className=""
                >
                  Export
                </Button>
                <Button
                  variant="primary"
                  icon={<Plus size={16} />}
                  size="md"
                  onClick={() => setIsAddModalVisible(true)}
                  disabled={false}
                  className="text-white px-4 py-2"
                >
                  Add New Room
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by room name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12"
                >
                  <option value="all">All Types</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <Button
                  icon={<RotateCcw size={16} />}
                  variant="default"
                  size="md"
                  onClick={() => {
                    setSearchTerm("")
                    setTypeFilter("all")
                    setStatusFilter("all")
                  }}
                  disabled={false}
                  className="h-12"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Room ID</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Room Details</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Capacity</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Features</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedData.map((room) => (
                  <tr key={room.key} className="hover:bg-blue-50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="bg-blue-50 text-blue-700 font-mono text-sm font-semibold px-3 py-1 rounded-lg inline-block">
                        {room.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{room.name}</div>
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(room.type)}
                          {getStatusBadge(room.status)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Layout: {room.layout} • Last Maintenance: {room.lastMaintenance}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-2xl font-bold text-gray-900">{room.seats}</div>
                      <div className="text-xs text-gray-500">seats</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {room.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="default">
                            {feature}
                          </Badge>
                        ))}
                        {room.features.length > 2 && <Badge variant="info">+{room.features.length - 2} more</Badge>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Space size="small">
                        <Tooltip title="View">
                          <AntdButton
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleShowSeatDetail(room)}
                            className="bg-blue-600 hover:bg-blue-700 border-0 text-white"
                          >
                            View
                          </AntdButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <AntdButton
                            type="default"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => handleEditRoom(room)}
                            className="text-green-600 hover:bg-green-50"
                          />
                        </Tooltip>
                        <Tooltip title="Delete">
                          <Popconfirm
                            title="Delete Room"
                            description="Are you sure?"
                            onConfirm={() => handleDeleteRoom(room)}
                            okText="Delete"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                          >
                            <AntdButton
                              type="default"
                              icon={<DeleteOutlined />}
                              size="small"
                              className="text-red-600 hover:bg-red-50"
                            />
                          </Popconfirm>
                        </Tooltip>
                        <Tooltip title="Schedule">
                          <AntdButton
                            type="default"
                            icon={<SettingOutlined />}
                            size="small"
                            onClick={() => {
                              setSelectedRoomForSchedule(room)
                              setActiveTab("schedule")
                            }}
                            className="text-blue-600 hover:bg-blue-50"
                          />
                        </Tooltip>
                      </Space>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}
          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(currentPage * pageSize, filteredData.length)}</span> of{" "}
                <span className="font-semibold">{filteredData.length}</span> rooms
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  icon={null}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className=""
                >
                  Previous
                </Button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "primary" : "default"}
                      size="sm"
                      icon={null}
                      onClick={() => setCurrentPage(page)}
                      disabled={false}
                      className=""
                    >
                      {page}
                    </Button>
                  )
                })}

                <Button
                  variant="default"
                  size="sm"
                  icon={null}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className=""
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Room Modal */}
      <Modal
        isOpen={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="text-blue-600" size={20} />
            </div>
            <span className="text-lg font-bold">Add New Cinema Room</span>
          </div>
        }
        footer={
          <>
            <Button variant="default" size="md" icon={null} onClick={() => setIsAddModalVisible(false)} disabled={false} className="">Cancel</Button>
            <Button variant="primary" size="md" icon={null} onClick={handleAddRoom} disabled={false} className="">Create Room</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
              <input
                type="text"
                placeholder="e.g., Premium Cinema Hall A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room ID</label>
              <input
                type="text"
                placeholder="e.g., R005"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seat Capacity</label>
              <input
                type="number"
                placeholder="48"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
                <option value="IMAX">IMAX</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seat Layout</label>
              <input
                type="text"
                placeholder="6x8"
                value={formData.layout}
                onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        isOpen={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Edit className="text-orange-600" size={20} />
            </div>
            <span>Edit Room Details</span>
          </div>
        }
        footer={
          <>
            <Button variant="default" size="md" icon={null} onClick={() => setIsEditModalVisible(false)} disabled={false} className="">Cancel</Button>
            <Button variant="warning" size="md" icon={null} onClick={handleUpdateRoom} disabled={false} className="">Update Room</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room ID</label>
              <input
                type="text"
                value={formData.id}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Seat Capacity</label>
              <input
                type="number"
                value={formData.seats}
                onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Standard">Standard</option>
                <option value="Premium">Premium</option>
                <option value="VIP">VIP</option>
                <option value="IMAX">IMAX</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Enhanced Seat Detail Modal */}
      <Modal
        isOpen={isSeatModalVisible}
        onClose={() => setIsSeatModalVisible(false)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="text-green-600" size={20} />
            </div>
            <div>
              <div className="font-semibold">Seat Layout</div>
              <div className="text-sm font-normal text-gray-600">{selectedRoom?.name}</div>
            </div>
          </div>
        }
        footer={<></>}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {generateSeatMap(selectedRoom?.seats || 0).map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {row.map((seat, seatIndex) =>
                  seat ? (
                    <div
                      key={seatIndex}
                      className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-medium ${
                        seat.status === "available"
                          ? "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                          : seat.status === "booked"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {seat.seat}
                    </div>
                  ) : (
                    <div key={seatIndex} className="w-8 h-8"></div>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Room Schedule Modal */}
      <Modal
        isOpen={!!selectedRoomForSchedule}
        onClose={() => setSelectedRoomForSchedule(null)}
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Settings className="text-blue-600" size={20} />
            </div>
            <div>
              <div className="font-semibold">Room Schedule</div>
              <div className="text-sm font-normal text-gray-600">{selectedRoomForSchedule?.name}</div>
            </div>
          </div>
        }
        footer={<></>}
      >
        <div className="space-y-6">
          {selectedRoomForSchedule && (
            <div>Room schedule calendar goes here.</div>
            // If you want to use the real component, uncomment:
            // <RoomScheduleCalendar roomId={selectedRoomForSchedule.id} roomName={selectedRoomForSchedule.name} />
          )}
        </div>
      </Modal>
    </div>
  )
}
