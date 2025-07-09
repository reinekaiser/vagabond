import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProjectedRoute";
import AdminLayout from "../pages/Admin/AdminLayout";
import Dashboard from "../pages/Admin/Dashboard";
import ManageTours from "../pages/Admin/ManageTours";
import CreateTour from "../pages/Admin/CreateTour";
import ManageHotels from "../pages/Admin/ManageHotels";
import CreateHotel from "../pages/Admin/CreateHotel";
import Profile from "../pages/Admin/Profile";
import CreateCity from "../pages/Admin/CreateCity";
import ManageCity from "../pages/Admin/ManageCity";
import HotelDetails from "../pages/Admin/HotelDetails";
import TourDetailsAdmin from "../pages/Admin/TourDetailsAdmin";
import UpdateHotel from "../pages/Admin/UpdateHotel";
import AdminChat from '../pages/Admin/AdminChat'
import TourBooking from "../pages/Admin/TourBooking";
import HotelBooking from "../pages/Admin/HotelBooking";

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute requireAdmin={true} />}>
                <Route element={<AdminLayout />}>
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="/chat" element={<AdminChat/>} />
                    <Route path="manage-tours">
                        <Route index element={<ManageTours />} />
                        <Route path="create-tour" element={<CreateTour />} />
                        <Route
                            path="tour-detail/:_id"
                            element={<TourDetailsAdmin />}
                        />
                    </Route>

                    <Route path="manage-hotels">
                        <Route index element={<ManageHotels />} />
                        <Route path="create-hotel" element={<CreateHotel />} />
                        <Route
                            path="hotel-detail/:_id"
                            element={<HotelDetails />}
                        />
                        <Route
                            path="update-hotel/:_id"
                            element={<UpdateHotel />}
                        />
                    </Route>

                    <Route path="manage-city" element={<ManageCity />} />
                    <Route path="create-city" element={<CreateCity />} />

                    <Route path="booking/tour" element={<TourBooking/>} />
                    <Route path="booking/hotel" element={<HotelBooking/>} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AdminRoutes;