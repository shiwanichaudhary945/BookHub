import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    // Fetch user info
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(
          "https://localhost:7133/api/User/GetUserInfo",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Handle expired or invalid token
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(
          "https://localhost:7133/api/Announcements/GetLatest"
        );

        if (response.ok) {
          const data = await response.json();
          setAnnouncements(data || []);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleLogout = () => {
    // Clear tokens
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    // Redirect to home
    navigate("/");

    // Refresh page to clear any in-memory state
    window.location.reload();
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleAnnouncements = () => {
    setShowAnnouncements(!showAnnouncements);
  };

  // Navigation items based on user role
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      name: "Browse Books",
      path: "/books",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      ),
    },
    {
      name: "Cart",
      path: "/cart",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      ),
    },
    {
      name: "Wishlist",
      path: "/wishlist",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "My Orders",
      path: "/orders",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
            clipRule="evenodd"
          />
        </svg>
      ),
      requiredAuth: true,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd"
          />
        </svg>
      ),
      requiredAuth: true,
    },
  ];

  // Admin panel items (only visible to admins)
  const adminItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      ),
    },
    {
      name: "Manage Books",
      path: "/admin/books",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
          <path
            fillRule="evenodd"
            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
    },
    {
      name: "Staff Announcements",
      path: "/admin/announcements",
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className={`sidebar-container flex h-screen fixed transition-all duration-300 ease-in-out z-40 
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Sidebar */}
      <div
        className={`relative flex flex-col flex-grow min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          {isOpen ? (
            <h2 className="text-xl font-semibold text-indigo-600">
              eBook Admin
            </h2>
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
              e
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          >
            {isOpen ? (
              <svg
                className="w-6 h-6 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>

        {/* User profile */}
        {user && (
          <div
            className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${
              isOpen ? "justify-start" : "justify-center"
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                {user.fullName ? (
                  <span className="font-semibold text-indigo-700">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              {user.isAdmin && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 border-2 border-white"></div>
              )}
            </div>

            {isOpen && (
              <div className="ml-3 truncate">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {user.fullName || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-indigo-600 font-medium">
                  {user.isAdmin ? "Administrator" : "Customer"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex-grow overflow-y-auto">
          <nav className="mt-4 px-2 space-y-1">
            {/* Regular navigation items */}
            {navItems
              .filter(
                (item) => !item.requiredAuth || (item.requiredAuth && user)
              )
              .map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                    ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <span className="flex-shrink-0">{item.icon}</span>
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </NavLink>
              ))}

            {/* Admin section */}
            {user && user.isAdmin && (
              <>
                <div
                  className={`flex items-center px-3 py-2 mt-6 ${
                    isOpen ? "justify-start" : "justify-center"
                  }`}
                >
                  {isOpen ? (
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Admin Panel
                    </span>
                  ) : (
                    <div className="h-px w-8 bg-gray-300"></div>
                  )}
                </div>

                {adminItems.map((item, index) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                      ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }
                    `}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {isOpen && <span className="ml-3">{item.name}</span>}
                  </NavLink>
                ))}
              </>
            )}
          </nav>
        </div>

        {/* Announcements section */}
        <div className="mt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={toggleAnnouncements}
            className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition-colors duration-150 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
          >
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-indigo-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z"
                  clipRule="evenodd"
                />
              </svg>
              {isOpen && (
                <span className="ml-3">
                  Announcements{" "}
                  {announcements.length > 0 && `(${announcements.length})`}
                </span>
              )}
            </div>
            {isOpen && (
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  showAnnouncements ? "transform rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {isOpen && showAnnouncements && (
            <div className="px-4 py-2 space-y-3 max-h-60 overflow-y-auto">
              {announcements.length > 0 ? (
                announcements.map((announcement, index) => (
                  <div key={index} className="p-3 bg-indigo-50 rounded-md">
                    <h4 className="text-sm font-semibold text-indigo-700">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {announcement.content}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(announcement.date).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-medium text-indigo-600">
                        {announcement.author}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No announcements at this time.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:text-red-300 transition-colors duration-150 ${
              isOpen ? "justify-start" : "justify-center"
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5.707-5.707A1 1 0 009.586 2H3zm0 1h6v4a1 1 0 001 1h4v7H3V4z"
                clipRule="evenodd"
              />
              <path d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5.707-5.707A1 1 0 009.586 2H3z" />
            </svg>
            {isOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
