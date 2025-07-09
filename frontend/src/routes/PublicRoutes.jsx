import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../pages/User/Layout";
import HotelSearch from "../pages/User/HotelSearch";
import Home from "../pages/User/Home";
import HotelSearchResults from "../pages/User/HotelSearchResults";
import HotelDetails from "../pages/User/HotelDetails";
import HotelBooking from "../pages/User/HotelBooking";
import SearchResults from "../pages/User/SearchResults";
import TourDetails from "../pages/User/TourDetails";
import TicketSelection from "../components/TicketSelection";
import CityDetail from "../pages/User/CityDetail";
import { useSelector } from "react-redux";
import TourBooking from "../pages/User/TourBooking";
import TourCheckoutSuccess from "../components/TourCheckoutSuccess";
import TourList from "../pages/User/TourList";
import HotelCheckoutSuccess from "../components/HotelCheckoutSuccess";
import CheckoutStripeSuccess from "../components/CheckoutStripeSuccess";
import About from "../pages/User/About"
import Contact from "../pages/User/Contact";
import HotelCheckOutPayOSSuccess from "../components/HotelCheckOutPayOSSuccess";
import TourCheckOutPayOSSuccess from "../components/TourCheckOutPayOSSuccess";

const PublicRoutes = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <Routes>
            <Route
                element={
                    user?.role == "user" || user?.role == undefined ? (
                        <Layout />
                    ) : (
                        <Navigate to="/sign-in" />
                    )
                }
            >
                <Route index element={<Home />} />
                <Route
                    path="search"
                    element={<SearchResults></SearchResults>}
                ></Route>
                <Route path="hotels" element={<HotelSearch />} />
                <Route
                    path="tour/:_id"
                    element={<TourDetails></TourDetails>}
                ></Route>

                <Route
                    path="city/:cityId"
                    element={<CityDetail></CityDetail>}
                ></Route>
                <Route path="hotels/search" element={<HotelSearchResults />} />
                <Route path="hotels/:_id" element={<HotelDetails />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
            </Route>
            <Route
                path="tour/:_id/:_ticketId"
                element={<TicketSelection></TicketSelection>}
            ></Route>
            <Route
                path="tour/booking"
                element={<TourBooking></TourBooking>}
            ></Route>
            <Route
                path="tour"
                element={<TourList></TourList>}
            ></Route>
            <Route
                path="tour-checkout-success"
                element={<TourCheckoutSuccess />}
            ></Route>
            <Route
                path="hotel-checkout-success"
                element={< HotelCheckoutSuccess />}
            ></Route>
            <Route
                path="checkout-stripe-success"
                element={< CheckoutStripeSuccess />}
            ></Route>
            <Route path="hotels/:_id/pay" element={<HotelBooking />} />
            
            <Route
                path="hotel-checkout-payos-success"
                element={<HotelCheckOutPayOSSuccess/>}
            />
            <Route
                path="/tour-checkout-payos-success"
                element={<TourCheckOutPayOSSuccess/>}
            />

        </Routes>
    );
};

export default PublicRoutes;
