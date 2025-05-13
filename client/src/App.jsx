import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import OtpVerification from "./pages/OtpVerification";
import AdminBookManagement from "./pages/AdminBook";
import AdminDashboard from "./pages/AdminDashboard";
import Announcement from "./pages/Announcement";
import SingleBookPage from "./pages/SingleBook";
import Orders from "./pages/Orders";
import BookCart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import ManageStaff from "./pages/ManageStaff";
import ManageOrders from "./pages/ManageOrders";
import Books from "./pages/Books";
import Review from "./pages/Review";
// import ManageStaff from "./pages/ManageStaff";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otpVerification" element={<OtpVerification />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cart" element={<BookCart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/books" element={<Books />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/review" element={<Review />} />
        <Route path="/admin/book" element={<AdminBookManagement />} />
        <Route path="/admin/staffs" element={<ManageStaff />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/books/:id" element={<SingleBookPage />} />
        <Route path="/staff" element={<ManageOrders />} />
        {/* <Route path="/admin/staffs" element={<ManageStaff />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
