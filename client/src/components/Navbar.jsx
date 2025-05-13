import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Heart,
  User,
  Book,
  Menu,
  X,
  Bell,
  LogOut,
  Package,
  Home,
  Library,
  Mail,
  ChevronDown,
} from "lucide-react";
import AnnouncementBanner from "./AnnouncemntBanner";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPath, setCurrentPath] = useState("/");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
  });

  const profileDropdownRef = useRef(null);

  // Check if user is logged in and get user data
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Fetch user data, cart and wishlist if logged in
    if (token) {
      fetchUserData(token);
      fetchCartAndWishlist(token);
    }

    // Set current path for active link highlighting
    setCurrentPath(window.location.pathname);

    // Add event listener to close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user data
  const fetchUserData = async (token) => {
    try {
      // Try to get from localStorage first
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData);
        setUserData({
          fullName: parsedData.fullName || "User",
          email: parsedData.email || "user@example.com",
        });
        return;
      }

      // If not in localStorage, fetch from API
      const response = await fetch(
        "https://localhost:7133/api/Account/GetUserInfo",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.isSuccess && data.data) {
          const userData = {
            fullName: data.data.fullName || "User",
            email: data.data.email || "user@example.com",
          };
          setUserData(userData);
          // Store in localStorage for future use
          localStorage.setItem("userData", JSON.stringify(userData));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Set default values if fetch fails
      setUserData({
        fullName: "User",
        email: "user@example.com",
      });
    }
  };

  // Fetch cart and wishlist data
  const fetchCartAndWishlist = async (token) => {
    try {
      // Fetch cart
      const cartResponse = await fetch(
        "https://localhost:7133/api/Cart/GetCart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        setCartItems(cartData.items || []);
      }

      // Fetch wishlist
      const wishlistResponse = await fetch(
        "https://localhost:7133/api/Wishlist/GetBookMarks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        setWishlistItems(wishlistData || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Toggle profile dropdown
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("userData");
    setIsLoggedIn(false);
    setShowProfileDropdown(false);
    window.location.href = "/login";
  };

  // Calculate total items in cart
  const cartItemCount = cartItems.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
        {/* Main navbar container */}
        <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-around h-16">
            {/* Logo and brand */}
            <div className="flex-shrink-0 flex items-center">
              <a href="/" className="flex items-center">
                <Book className="h-8 w-8 text-white" />
                <span className="text-white font-bold ml-2 text-xl">eBook</span>
              </a>
            </div>

            {/* Desktop navigation - increased spacing */}
            <div className="hidden md:block mx-8">
              <div className="flex items-center space-x-2">
                <a
                  href="/home"
                  className={`text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium ${
                    currentPath === "/home" ? "bg-indigo-700" : ""
                  }`}
                >
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </div>
                </a>
                <a
                  href="/books"
                  className={`text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium ${
                    currentPath.includes("/books") ||
                    currentPath.includes("/book/")
                      ? "bg-indigo-700"
                      : ""
                  }`}
                >
                  <div className="flex items-center">
                    <Library className="h-4 w-4 mr-2" />
                    Books
                  </div>
                </a>
                {isLoggedIn && (
                  <a
                    href="/orders"
                    className={`text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium ${
                      currentPath === "/orders" ? "bg-indigo-700" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Desktop user actions - increased spacing */}
            <div className="hidden md:flex items-center">
              <div className="flex items-center space-x-6">
                {isLoggedIn ? (
                  <>
                    {/* Wishlist icon */}
                    <a
                      href="/wishlist"
                      className="p-2 rounded-full text-gray-200 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white relative"
                    >
                      <Heart className="h-6 w-6" />
                      {wishlistItems.length > 0 && (
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {wishlistItems.length}
                        </span>
                      )}
                    </a>

                    {/* Cart icon */}
                    <a
                      href="/cart"
                      className="p-2 rounded-full text-gray-200 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white relative"
                    >
                      <ShoppingCart className="h-6 w-6" />
                      {cartItemCount > 0 && (
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartItemCount}
                        </span>
                      )}
                    </a>

                    {/* User profile with dropdown */}
                    <div className="relative" ref={profileDropdownRef}>
                      <button
                        onClick={toggleProfileDropdown}
                        className="flex items-center p-2 rounded-full text-gray-200 hover:text-white hover:bg-indigo-700 focus:outline-none"
                        title="User Profile"
                      >
                        <User className="h-6 w-6" />
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </button>

                      {/* Profile Dropdown */}
                      {showProfileDropdown && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-50">
                          <div className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {userData.fullName}
                            </p>
                            <p className="text-sm text-gray-500 truncate flex items-center">
                              <Mail className="h-3 w-3 mr-1" /> {userData.email}
                            </p>
                          </div>
                          <div className="py-1">
                            <a
                              href="/orders"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <div className="flex items-center">
                                <Package className="mr-3 h-4 w-4" /> My Orders
                              </div>
                            </a>
                            <a
                              href="/wishlist"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <div className="flex items-center">
                                <Heart className="mr-3 h-4 w-4" /> My Wishlist
                              </div>
                            </a>
                          </div>
                          <div className="py-1">
                            <button
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              <div className="flex items-center text-red-600">
                                <LogOut className="mr-3 h-4 w-4" /> Logout
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <a
                      href="/login"
                      className="text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Login
                    </a>
                    <a
                      href="/register"
                      className="bg-white text-indigo-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Register
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                {isOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden bg-indigo-800">
            <div className="px-2 pt-2 pb-3 space-y-2 sm:px-3">
              <a
                href="/home"
                className={`flex items-center text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium ${
                  currentPath === "/home" ? "bg-indigo-700" : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Home className="mr-3 h-5 w-5" /> Home
              </a>
              <a
                href="/books"
                className={`flex items-center text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium ${
                  currentPath.includes("/books") ||
                  currentPath.includes("/book/")
                    ? "bg-indigo-700"
                    : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Library className="mr-3 h-5 w-5" /> Books
              </a>
              {isLoggedIn && (
                <a
                  href="/orders"
                  className={`flex items-center text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium ${
                    currentPath === "/orders" ? "bg-indigo-700" : ""
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Package className="mr-3 h-5 w-5" /> My Orders
                </a>
              )}
            </div>

            {/* Mobile menu user actions */}
            <div className="pt-4 pb-3 border-t border-indigo-700">
              {isLoggedIn ? (
                <div className="px-2 space-y-2">
                  {/* User information in mobile menu */}
                  <div className="flex items-center px-5 mb-3">
                    <div className="flex-shrink-0">
                      <User className="h-10 w-10 text-white p-2 bg-indigo-600 rounded-full" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white mb-1">
                        {userData.fullName}
                      </div>
                      <div className="text-sm text-gray-300 flex items-center">
                        <Mail className="h-3 w-3 mr-1" /> {userData.email}
                      </div>
                    </div>
                  </div>

                  <a
                    href="/wishlist"
                    className="flex items-center text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <Heart className="mr-3 h-5 w-5" /> Wishlist
                    {wishlistItems.length > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistItems.length}
                      </span>
                    )}
                  </a>
                  <a
                    href="/cart"
                    className="flex items-center text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShoppingCart className="mr-3 h-5 w-5" /> Cart
                    {cartItemCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </a>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center text-white hover:bg-indigo-700 w-full text-left px-3 py-2 rounded-md text-base font-medium"
                  >
                    <LogOut className="mr-3 h-5 w-5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="px-5 flex flex-col space-y-2">
                  <a
                    href="/login"
                    className="flex justify-center text-white hover:bg-indigo-700 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </a>
                  <a
                    href="/register"
                    className="flex justify-center bg-white text-indigo-600 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Announcements banner */}
        <div className="bg-yellow-500 text-center ">
          <AnnouncementBanner />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
