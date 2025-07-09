import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../../services/authService';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Vui lòng nhập email');
            return;
        }
        
        setLoading(true);
        try {
            const response = await authService.forgotPassword(email);
            if (response.success) {
                let message = 'Mã xác thực đã được gửi đến email của bạn';
                
                // Show verification code in development mode
                if (response.data && response.data.verificationCode) {
                    message += `\n\nMã xác thực (Development): ${response.data.verificationCode}`;
                }
                
                toast.success(message);
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                toast.error(response.message || 'Không thể gửi mã xác thực');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi gửi mã xác thực');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-2 h-screen bg-cover bg-center" 
             style={{ backgroundImage: "url('/images/login/background.png')" }}>
            <div></div>
            <div className="items-center justify-center h-screen">
                <div className="bg-white w-[1/2] h-full justify-center rounded-lg shadow-xl p-8 mx-auto">
                    <h1 className="text-2xl font-bold text-center mb-2">Forgot Password</h1>
                    
                    <p className="text-center text-gray-600 mb-4">
                        Enter your email and we'll send you a link to reset your password
                    </p>
                    
                    <p className="text-center mb-6">
                        Remember your password? <Link to="/sign-in" className="text-[#27B5FC] hover:underline">Log in</Link>
                    </p>
                    
                    <form onSubmit={handleSubmit} className="w-2/3 mx-auto">
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập địa chỉ email của bạn"
                                required
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-[#27B5FC] text-white rounded-full hover:bg-[#27B5FC]/80 focus:outline-none focus:ring-2 focus:ring-gray-500 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Sending...' : 'Send verification code'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

