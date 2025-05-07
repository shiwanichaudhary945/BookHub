import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import OtpVerification from "./pages/OtpVerification";
import BookManagement from "./pages/AdminBook";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otpVerification" element={<OtpVerification />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin/book" element={<BookManagement />} />
      </Routes>
    </Router>
  );
}

export default App;
