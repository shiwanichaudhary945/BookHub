import React, { useState, useEffect } from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import {
  Book,
  BarChart2,
  Users,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  User,
} from "lucide-react";

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
    // Dispatch a custom event that the parent component can listen for
    window.dispatchEvent(
      new CustomEvent("sidebarToggle", { detail: { isOpen: !isOpen } })
    );
  };

  const toggleAnnouncements = () => {
    setShowAnnouncements(!showAnnouncements);
  };

  // Admin panel items
  const adminItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <BarChart2 className="w-5 h-5" />,
      exact: true, // Only match exact path
    },
    {
      name: "Manage Books",
      path: "/admin/book",
      icon: <Book className="w-5 h-5" />,
      // This will match both /admin/book and any sub-paths
    },
    {
      name: "Manage Staff",
      path: "/admin/staffs",
      icon: <Users className="w-5 h-5" />,
    },
  ];

  // Check if a path is active with more specific logic
  const isPathActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }

    // Special handling for "/admin/book" to ensure it's active for both exact match and sub-paths
    if (path === "/admin/book") {
      return (
        location.pathname === "/admin/book" ||
        location.pathname.startsWith("/admin/book/")
      );
    }

    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={`sidebar-container h-screen fixed transition-all duration-300 ease-in-out z-40 
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Sidebar */}
      <div
        className={`relative flex flex-col flex-grow h-full bg-white border-r border-gray-200 shadow-lg`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-5 bg-blue-600">
          {isOpen ? (
            <h2 className="text-xl font-semibold text-white flex items-center">
              <BookOpen className="w-7 h-7 mr-2" />
              eBook Admin
            </h2>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className={`p-1 rounded-md hover:bg-blue-700 focus:outline-none text-white ${
              !isOpen && "absolute -right-1 top-5"
            }`}
          >
            {isOpen ? (
              <ChevronLeft className="w-6 h-6" />
            ) : (
              <ChevronRight className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* User profile */}
        {user && (
          <div
            className={`flex items-center p-4 border-b border-gray-200 ${
              isOpen ? "justify-start" : "justify-center"
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                {user.fullName ? (
                  <span className="font-semibold text-blue-700">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-6 h-6 text-blue-600" />
                )}
              </div>
              {user.isAdmin && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 border-2 border-white"></div>
              )}
            </div>

            {isOpen && (
              <div className="ml-3 truncate">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {user.fullName || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <p className="text-xs text-blue-600 font-medium">
                  {user.isAdmin ? "Administrator" : "Customer"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex-grow overflow-y-auto py-6">
          <nav
            className={`px-3 space-y-3 ${
              !isOpen && "flex flex-col items-center"
            }`}
          >
            {adminItems.map((item) => {
              const active = isPathActive(item.path, item.exact);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center ${
                      isOpen ? "px-3" : "px-0"
                    } py-2.5 rounded-lg text-sm font-medium transition-all duration-200 
                    ${!isOpen && "w-12 h-12 justify-center"} ${
                    !isOpen ? "mx-auto mb-4" : "mb-1"
                  }
                    ${
                      active
                        ? isOpen
                          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                          : "bg-blue-50 text-blue-600 rounded-xl"
                        : "text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                    }
                  `}
                >
                  <span
                    className={`flex-shrink-0 ${
                      active ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {isOpen && <span className="ml-3">{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full ${
              isOpen ? "px-3" : "px-0"
            } py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 ${
              isOpen ? "justify-start" : "justify-center"
            }`}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
