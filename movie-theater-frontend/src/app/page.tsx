export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎬 Movie Theater System
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Chào mừng đến với hệ thống quản lý rạp chiếu phim của chúng tôi! Tại đây, bạn có thể quản lý tài khoản, xem lịch sử giao dịch và đặt vé một cách dễ dàng.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Account Information</h3>
            <p className="text-gray-600">Quản lý thông tin tài khoản</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-black">
            <h3 className="text-lg font-semibold mb-2">History</h3>
            <p className="text-gray-600">Xem lịch sử giao dịch và hoạt động</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Booked Ticket</h3>
            <p className="text-gray-600">Quản lý vé đã đặt</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Managed Ticket</h3>
            <p className="text-gray-600">Quản lý vé cho admin</p>
          </div>
        </div>
      </div>
    </div>
  )
} 