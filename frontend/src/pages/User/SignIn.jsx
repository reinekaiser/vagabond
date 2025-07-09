import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaEye, FaEyeSlash } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import { Environment } from "../../../environments/environments";
import authService from "../../services/authService";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../../redux/features/authSlice";

const facebookAppId = Environment.FACEBOOK_APP_ID;

const SignIn = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const { user } = useSelector((state) => state.auth);
    useEffect(() => {
        if (user) {
            if (user.role === "admin") {
                navigate("/admin/profile");
            } else {
                navigate("/");
            }
        }
    }, [user, navigate]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await authService.login(email, password);
            dispatch(setCredentials(result.data.user));
            console.log("Login result:", result);

            if (result.success) {
                toast.success(result.message);

                // Get user role from token and redirect accordingly
                const role = authService.getUserRole();
                console.log("User role:", role);

                if (role === "admin") {
                    navigate("/admin/profile");
                } else if (role === "user") {
                    navigate("/");
                } else {
                    // Default fallback if role cannot be determined
                    console.warn(
                        "User role not found in token, defaulting to user home"
                    );
                    navigate("/");
                }
            } else {
                toast.error(result.message || "Đăng nhập thất bại");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Có lỗi xảy ra khi đăng nhập");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // TODO: Implement Google login with backend
            console.log("Google Login Success:", credentialResponse);
            toast.success("Đăng nhập với Google thành công!");

            // Default to user role for social logins until backend supports role determination
            navigate("/user/home");
        } catch (error) {
            toast.error("Đăng nhập với Google thất bại");
        }
    };

    const handleGoogleError = () => {
        toast.error("Đăng nhập với Google thất bại");
    };

    return (
        <div
            className="grid grid-cols-2 min-h-screen bg-cover bg-center"
            style={{ backgroundImage: "url('/images/login/background.png')" }}
        >
            <div></div>
            <div className="items-center justify-center">
                <div className="bg-white rounded-lg shadow-xl w-[1/2] h-full relative p-8 mx-auto">
                    <h1 className="text-2xl font-bold text-center mb-2">
                        Log in
                    </h1>

                    <p className="text-center mb-6">
                        Don't have an account?{" "}
                        <Link
                            to="/sign-up"
                            className="text-[#27B5FC] hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>

                    {/* <div className="w-2/3 mx-auto mb-6 flex justify-center">
                        <div style={{ width: "320px" }}>
                            {" "}
                            {/* Fixed width container */}
                            {/* <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                size="large"
                                text="signin_with"
                                shape="pill"
                                logo_alignment="center"
                            /> */}
                        {/* </div>
                    </div>

                    <div className="flex w-2/3 mx-auto items-center mb-6">
                        <div className="flex-grow h-px bg-gray-300"></div>
                        <div className="mx-4 text-gray-500">OR</div>
                        <div className="flex-grow h-px bg-gray-300"></div>
                    </div> */} 

                    <form onSubmit={handleSubmit} className="w-2/3 mx-auto">
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Your password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
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

                        <div className="text-right mb-6">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-gray-600 hover:underline"
                            >
                                Forgot your password
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-[#27B5FC] text-white rounded-full hover:bg-[#27B5FC]/80 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                        >
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
