import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../../services/authService";
import { toast } from "react-toastify";

const SignUp = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: "",
    });
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // TODO: Implement Google signup with backend
            console.log("Google Sign Up Success:", credentialResponse);
            toast.success("Đăng ký với Google thành công!");
            navigate("/sign-in");
        } catch (error) {
            toast.error("Đăng ký với Google thất bại");
        }
    };

    const handleGoogleError = () => {
        toast.error("Đăng ký với Google thất bại");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        // Validate password length
        if (formData.password.length < 6) {
            toast.error("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Email không hợp lệ");
            return;
        }

        setLoading(true);
        try {
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registerData } = formData;

            // Explicitly set role to 'user'
            registerData.role = "user";

            const response = await authService.register(registerData);

            if (response && response.success) {
                toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
                // Delay navigation slightly to allow toast to be seen
                setTimeout(() => {
                    navigate("/sign-in");
                }, 1500);
            } else {
                toast.error(response?.message || "Đăng ký thất bại");
            }
        } catch (error) {
            console.error("Registration error details:", error);

            // Handle specific error types
            if (error.response) {
                // Server responded with an error status
                const errorMessage =
                    error.response.data?.message || "Đăng ký thất bại";
                toast.error(errorMessage);

                if (error.response.status === 404) {
                    console.error(
                        "API endpoint not found. Check server routes."
                    );
                    toast.error(
                        "Lỗi kết nối với máy chủ. Vui lòng thử lại sau."
                    );
                }
            } else if (error.request) {
                // Request was made but no response received
                console.error("No response received from server");
                toast.error(
                    "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
                );
            } else {
                // Error setting up the request
                toast.error("Đã xảy ra lỗi khi gửi yêu cầu đăng ký.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="grid grid-cols-2 min-h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/images/login/background.png')" }}
        >
            <div></div>
            <div className="w-full items-center justify-center">
                <div className="bg-white w-[1/2] h-full justify-center rounded-lg shadow-xl p-8 mx-auto">
                    <h1 className="text-2xl font-bold text-center mb-2">
                        Sign up
                    </h1>

                    <p className="text-center mb-6">
                        Already have an account?{" "}
                        <Link
                            to="/sign-in"
                            className="text-[#27B5FC] hover:underline"
                        >
                            Log in
                        </Link>
                    </p>

                    {/* <div className="w-2/3 mx-auto mb-6 flex justify-center">
                        <div style={{ width: "320px" }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                size="large"
                                width="100%"
                                text="signup_with"
                                shape="pill"
                                logo_alignment="center"
                            />
                        </div>
                    </div>

                    <div className="flex w-2/3 mx-auto items-center mb-6">
                        <div className="flex-grow h-px bg-gray-300"></div>
                        <div className="mx-4 text-gray-500">OR</div>
                        <div className="flex-grow h-px bg-gray-300"></div>
                    </div> */}

                    <form onSubmit={handleSubmit} className="w-2/3 mx-auto">
                        <div className="mb-4">
                            <label
                                htmlFor="firstName"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                First Name
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="lastName"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Your email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Create password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 flex items-center"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="mr-1" />
                                    ) : (
                                        <FaEye className="mr-1" />
                                    )}
                                    <span>Hide</span>
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Confirm password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 flex items-center"
                                >
                                    {showPassword ? (
                                        <FaEyeSlash className="mr-1" />
                                    ) : (
                                        <FaEye className="mr-1" />
                                    )}
                                    <span>Hide</span>
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    required
                                />
                                <label
                                    htmlFor="terms"
                                    className="ml-2 block text-sm text-gray-700"
                                >
                                    I agree to the{" "}
                                    <Link
                                        to="/terms"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link
                                        to="/privacy"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Privacy Policy
                                    </Link>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-[#27B5FC] text-white rounded-full hover:bg-[#27B5FC]/80 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
