import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import authService from "../../services/authService";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        newPassword: "",
        confirmPassword: "",
    });

    // Lấy email từ query params
    const email = new URLSearchParams(location.search).get("email");

    useEffect(() => {
        if (!email) {
            toast.error("Email không hợp lệ");
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const handleCodeChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d$/.test(value)) return;
        if (value.length > 1) return; // Only allow single digit

        const newCode = formData.code.split("");
        newCode[index] = value;

        // Fill empty positions with empty string
        while (newCode.length < 6) {
            newCode.push("");
        }

        const updatedCode = newCode.join("").substring(0, 6);
        setFormData((prev) => ({
            ...prev,
            code: updatedCode,
        }));

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`code-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleCodeKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === "Backspace" && !formData.code[index] && index > 0) {
            const prevInput = document.getElementById(`code-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name !== "code") {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error("Email không hợp lệ");
            return;
        }

        if (formData.code.length !== 6) {
            toast.error("Mã xác thực phải có 6 số");
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setLoading(true);
        try {
            const response = await authService.resetPassword(
                email,
                formData.code,
                formData.newPassword
            );
            if (response.success) {
                toast.success("Đặt lại mật khẩu thành công!");
                navigate("/sign-in");
            } else {
                toast.error(response.message || "Đặt lại mật khẩu thất bại");
            }
        } catch (error) {
            toast.error(error.message || "Đặt lại mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="grid grid-cols-2 h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/images/login/background.png')" }}
        >
            <div></div>
            <div className="items-center justify-center h-screen">
                <div className="bg-white rounded-lg shadow-xl w-[1/2] h-full p-8 mx-auto">
                    <h1 className="text-2xl font-bold text-center mb-2">
                        Đặt lại mật khẩu
                    </h1>

                    <p className="text-center mb-6 text-gray-600">
                        Nhập mã xác thực 6 số đã được gửi đến email của bạn
                    </p>

                    <form onSubmit={handleSubmit} className="w-2/3 mx-auto">
                        <div className="mb-6">
                            <label
                                htmlFor="code"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Mã xác thực
                            </label>
                            <div className="flex gap-2 justify-between mb-2">
                                {[...Array(6)].map((_, index) => (
                                    <input
                                        key={index}
                                        id={`code-${index}`}
                                        type="text"
                                        maxLength="1"
                                        value={formData.code[index] || ""}
                                        className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl"
                                        onChange={(e) =>
                                            handleCodeChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            handleCodeKeyDown(index, e)
                                        }
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="newPassword"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Mật khẩu mới
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tối thiểu 6 ký tự"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập lại mật khẩu mới"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-[#27B5FC] text-white rounded-full hover:bg-[#27B5FC]/80 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                        </button>

                        <div className="mt-4 text-center">
                            <Link
                                to="/sign-in"
                                className="text-[#27B5FC] hover:underline"
                            >
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
