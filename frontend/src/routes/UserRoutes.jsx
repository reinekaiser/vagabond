import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProjectedRoute";

import Chat from "../pages/User/Chat";

import ProfileEdit from "../pages/User/ProfileEdit";
import MyBookings from "../pages/User/MyBookings";
import UserSidebarLayout from "../pages/User/UserSidebarLayout";
import MyReviews from "../pages/User/MyReviews";
import ChatBot from "../pages/User/ChatBot";


const UserRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute requiredRole="user" />}>
                <Route path="/profile" element={<div>User Profile</div>} />
                <Route path="/favorites" element={<div>Favorite Hotels</div>} />
                <Route path="/customer-support" element={<Chat/>}/>
                <Route path="/chatbot" element={<ChatBot />}></Route>

                <Route element={<UserSidebarLayout />}>
                    <Route path="my-bookings" element={<MyBookings />} />
                    <Route path="my-reviews" element={<MyReviews />} />
                    <Route path="profile/edit" element={<ProfileEdit />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default UserRoutes;
