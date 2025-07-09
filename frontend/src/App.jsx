import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/User/SignIn";
import SignUp from "./pages/User/SignUp";
import ForgotPassword from "./pages/User/ForgotPassword";
import ResetPassword from "./pages/User/ResetPassword";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicRoutes from "./routes/PublicRoutes";
import { useDispatch, useSelector } from "react-redux";
import { setOnlineUsers } from "./redux/features/authSlice";
import { connectSocket, disconnectSocket } from "./Utils/socket";
import ScrollToTop from "./components/ScrollToTop";

function App() {

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    console.log("User in App:", user);

    useEffect(() => {
        if (user?._id) {
            const socket = connectSocket(user._id, user.role);
            socket.on("connect", () => {
                console.log("Connected with ID:", socket.id);
            });
            socket.on("getOnlineUsers", (users) => {
                dispatch(setOnlineUsers(users));
                console.log("Online users", users);
            });
        }
        return () => {
            disconnectSocket();
        };
    }, [user?._id]);

    return (
        <>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>
                    <Route path="/" element={<PublicRoutes></PublicRoutes>} />
                    <Route path="/sign-in" element={<SignIn />} />
                    <Route path="/sign-up" element={<SignUp />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/admin/*" element={<AdminRoutes />} />
                    <Route path="/user/*" element={<UserRoutes />} />
                    <Route path="*" element={<PublicRoutes />} />
                </Routes>
            </BrowserRouter>
            <ToastContainer autoClose={2000}/>
        </>
    );
}

export default App;
