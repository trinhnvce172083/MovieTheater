export default function HistoryPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        History
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Xem lịch sử giao dịch và hoạt động của bạn
                    </p>

                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            Chưa có lịch sử
                        </h3>
                        <p className="text-gray-500">
                            Lịch sử giao dịch của bạn sẽ xuất hiện ở đây
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
} 