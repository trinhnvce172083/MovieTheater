'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface ResetPasswordData {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export default function ResetPasswordPage() {
    const [formData, setFormData] = useState<ResetPasswordData>({
        token: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
    const [validToken, setValidToken] = useState<boolean | null>(null);

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setFormData(prev => ({ ...prev, token }));
            setValidToken(true);
        } else {
            setValidToken(false);
            setMessage({ type: 'error', text: 'Token reset password không hợp lệ hoặc bị thiếu.' });
        }
    }, [searchParams]);

    const validatePassword = (password: string): boolean => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.newPassword || !formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin.' });
            return;
        }

        if (!validatePassword(formData.newPassword)) {
            setMessage({
                type: 'error',
                text: 'Mật khẩu phải chứa ít nhất 8 ký tự bao gồm: 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt (@$!%*?&).'
            });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8080/cinema/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: formData.token,
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setMessage({ type: 'success', text: 'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập với mật khẩu mới.' });

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'
                });
            }
        } catch (error) {
            console.error('Reset password error:', error);
            setMessage({
                type: 'error',
                text: 'Có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (validToken === false) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 text-red-500 mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-red-600 mb-2">Token Không Hợp Lệ</h2>
                        <p className="text-gray-600 mb-4">
                            Link reset password không hợp lệ hoặc đã hết hạn.
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Vui lòng yêu cầu gửi lại email reset password từ trang đăng nhập.
                        </p>
                        <a href="/login" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            ← Quay về Đăng nhập
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
                <div className="text-center mb-6">
                    <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        🔒
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Đặt Lại Mật Khẩu</h2>
                    <p className="text-gray-600">Nhập mật khẩu mới cho tài khoản của bạn</p>
                </div>

                {message.text && (
                    <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center">
                            <span className="mr-2">{message.type === 'success' ? '✅' : '❌'}</span>
                            <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                {message.text}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu mới
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="Nhập mật khẩu mới"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Mật khẩu phải chứa ít nhất 8 ký tự bao gồm: chữ thường, chữ hoa, số và ký tự đặc biệt
                        </p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Xác nhận mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Nhập lại mật khẩu mới"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Đang xử lý...
                            </div>
                        ) : (
                            'Đặt Lại Mật Khẩu'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                        ← Quay về đăng nhập
                    </a>
                </div>
            </div>
        </div>
    );
} 