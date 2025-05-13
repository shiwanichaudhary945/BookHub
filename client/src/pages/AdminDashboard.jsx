import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  Book,
  BarChart2,
  Users,
  Bell,
  ShoppingCart,
  AlertTriangle,
  Trash2,
  Edit,
  Plus,
  Calendar,
  Clock,
  ChevronDown,
  Menu,
  X,
  RefreshCw,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalStaff: 0,
    totalPublicUsers: 0,
  });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
    announcementDateTime: new Date().toISOString(),
    announcementEndDateTime: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    ).toISOString(),
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Listen for sidebar toggle event
  useEffect(() => {
    const handleSidebarToggleEvent = (event) => {
      setSidebarCollapsed(!event.detail.isOpen);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggleEvent);

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggleEvent);
    };
  }, [sidebarCollapsed]);

  // Handle sidebar toggle callback
  const handleSidebarToggle = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  // Handle mobile menu toggle
  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar);
  };

  // Close mobile sidebar when screen gets larger
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchAnnouncements(), fetchStats()]);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        "https://localhost:7133/api/Announcement/active-announcements"
      );

      if (!response.ok) {
        if (response.status === 404) {
          // No announcements found
          setAnnouncements([]);
        } else {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      } else {
        const data = await response.json();
        console.log(data);
        setAnnouncements(data.data.$values || []);
      }
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError("Failed to load announcements. Please try again later.");
      throw err;
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      // Replace with actual API call
      const response = await fetch(
        "https://localhost:7133/api/Admin/DashboardStats"
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(
        data || {
          totalBooks: 0,
          totalOrders: 0,
          totalStaff: 0,
          totalPublicUsers: 0,
        }
      );
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      // Fallback to zeros instead of random data
      setStats({
        totalBooks: 0,
        totalOrders: 0,
        totalStaff: 0,
        totalPublicUsers: 0,
      });
      throw err;
    }
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    setRefreshing(true);
    setError(null);
    try {
      await Promise.all([fetchAnnouncements(), fetchStats()]);
    } catch (err) {
      console.error("Failed to refresh dashboard data:", err);
      setError("Failed to refresh dashboard data. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const now = new Date();
    const startDate = new Date(newAnnouncement.announcementDateTime);
    const endDate = new Date(newAnnouncement.announcementEndDateTime);

    if (!newAnnouncement.title.trim()) {
      errors.title = "Title is required";
    }

    if (!newAnnouncement.description.trim()) {
      errors.description = "Description is required";
    }

    if (endDate <= startDate) {
      errors.date = "End date must be after start date";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new announcement
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = editingAnnouncementId
        ? `https://localhost:7133/api/Announcement/UpdateAnnouncement/${editingAnnouncementId}`
        : "https://localhost:7133/api/Announcement/SetAnnouncement";

      const method = editingAnnouncementId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAnnouncement),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Refresh announcements list
      await fetchAnnouncements();

      // Reset form
      setNewAnnouncement({
        title: "",
        description: "",
        announcementDateTime: new Date().toISOString(),
        announcementEndDateTime: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
      setShowAddForm(false);
      setEditingAnnouncementId(null);
      setFormErrors({});
    } catch (err) {
      console.error("Failed to save announcement:", err);
      setError(
        `Failed to ${
          editingAnnouncementId ? "update" : "add"
        } announcement. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit announcement
  const handleEditAnnouncement = (announcement) => {
    setNewAnnouncement({
      title: announcement.title,
      description: announcement.description,
      announcementDateTime: announcement.announcementDateTime,
      announcementEndDateTime: announcement.announcementEndDateTime,
      id: announcement.id,
    });
    setEditingAnnouncementId(announcement.id);
    setShowAddForm(true);
    setFormErrors({});
  };

  // Delete announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7133/api/Announcement/DeleteAnnouncement/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Update the announcements list
      await fetchAnnouncements();
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      setError("Failed to delete announcement. Please try again.");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Calculate status for announcement
  const getAnnouncementStatus = (announcement) => {
    const now = new Date();
    const startDate = new Date(announcement.announcementDateTime);
    const endDate = new Date(announcement.announcementEndDateTime);

    if (now < startDate) {
      return { label: "Scheduled", color: "bg-amber-100 text-amber-800" };
    } else if (now > endDate) {
      return { label: "Expired", color: "bg-gray-100 text-gray-800" };
    } else {
      return { label: "Active", color: "bg-emerald-100 text-emerald-800" };
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-40 md:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden ${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full bg-white shadow-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800">eBook Admin</h2>
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
          <Sidebar onToggleCollapse={handleSidebarToggle} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar onToggleCollapse={handleSidebarToggle} />
      </div>

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        {/* Top navbar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center">
              <button
                onClick={toggleMobileSidebar}
                className="p-2 mr-2 rounded-md hover:bg-gray-100 focus:outline-none md:hidden"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-bold text-gray-800 md:hidden">
                Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={refreshDashboard}
                disabled={refreshing}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-medium shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                <span>A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 mt-1">Welcome back, Admin</p>
            </div>

            {/* Quick action buttons */}
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <button
                onClick={() => navigate("/admin/book")}
                className="hidden md:flex items-center px-4 py-2.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 shadow-sm transition"
              >
                <Book className="w-4 h-4 mr-2" />
                Manage Books
              </button>
              <button
                onClick={() => navigate("/admin/book")}
                className="flex items-center px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Book
              </button>
            </div>
          </div>

          {/* Display error message if any */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start mb-6 border border-red-200">
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    refreshDashboard();
                  }}
                  className="text-sm text-red-700 underline hover:text-red-900 mt-2 focus:outline-none"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">
                Loading dashboard data...
              </p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition hover:shadow-md hover:translate-y-[-2px]">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-50 text-blue-600 ring-4 ring-blue-50">
                      <Book className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500 font-medium">
                        Total Books
                      </p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold text-gray-800">
                          {stats.totalBooks.toLocaleString()}
                        </p>
                        <span className="ml-2 text-xs font-medium text-green-600 bg-green-50 py-0.5 px-1.5 rounded-full">
                          +12%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition hover:shadow-md hover:translate-y-[-2px]">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-50 text-green-600 ring-4 ring-green-50">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500 font-medium">
                        Total Orders
                      </p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold text-gray-800">
                          {stats.totalOrders.toLocaleString()}
                        </p>
                        <span className="ml-2 text-xs font-medium text-green-600 bg-green-50 py-0.5 px-1.5 rounded-full">
                          +8%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition hover:shadow-md hover:translate-y-[-2px]">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-purple-50 text-purple-600 ring-4 ring-purple-50">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500 font-medium">
                        Total Staff
                      </p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold text-gray-800">
                          {stats.totalStaff.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 transition hover:shadow-md hover:translate-y-[-2px]">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-50 text-amber-600 ring-4 ring-amber-50">
                      <BarChart2 className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500 font-medium">
                        Public Users
                      </p>
                      <div className="flex items-baseline">
                        <p className="text-2xl font-bold text-gray-800">
                          {stats.totalPublicUsers.toLocaleString()}
                        </p>
                        <span className="ml-2 text-xs font-medium text-green-600 bg-green-50 py-0.5 px-1.5 rounded-full">
                          +24%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Announcements Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
                <div className="p-5 border-b flex flex-wrap md:flex-nowrap justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Announcements
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Manage system-wide notifications and alerts
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddForm(!showAddForm);
                      if (!showAddForm) {
                        setEditingAnnouncementId(null);
                        setNewAnnouncement({
                          title: "",
                          description: "",
                          announcementDateTime: new Date().toISOString(),
                          announcementEndDateTime: new Date(
                            Date.now() + 7 * 24 * 60 * 60 * 1000
                          ).toISOString(),
                        });
                        setFormErrors({});
                      }
                    }}
                    className="mt-3 md:mt-0 w-full md:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium text-sm shadow-sm"
                  >
                    {showAddForm ? (
                      <>
                        <X className="w-4 h-4 inline mr-1.5" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 inline mr-1.5" />
                        Create Announcement
                      </>
                    )}
                  </button>
                </div>

                {/* Add/Edit Announcement Form */}
                {showAddForm && (
                  <div className="p-6 border-b bg-blue-50">
                    <div className="max-w-3xl mx-auto">
                      <h3 className="text-lg font-bold mb-4 text-gray-800">
                        {editingAnnouncementId
                          ? "Edit Announcement"
                          : "Create New Announcement"}
                      </h3>
                      <form
                        onSubmit={handleAddAnnouncement}
                        className="space-y-5"
                      >
                        <div>
                          <label
                            className="block text-gray-700 text-sm font-medium mb-2"
                            htmlFor="title"
                          >
                            Title
                          </label>
                          <input
                            id="title"
                            type="text"
                            value={newAnnouncement.title}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                title: e.target.value,
                              })
                            }
                            className={`shadow-sm appearance-none border ${
                              formErrors.title
                                ? "border-red-500 ring-1 ring-red-500"
                                : "border-gray-300"
                            } rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Enter announcement title"
                          />
                          {formErrors.title && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.title}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            className="block text-gray-700 text-sm font-medium mb-2"
                            htmlFor="description"
                          >
                            Description
                          </label>
                          <textarea
                            id="description"
                            value={newAnnouncement.description}
                            onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                description: e.target.value,
                              })
                            }
                            className={`shadow-sm appearance-none border ${
                              formErrors.description
                                ? "border-red-500 ring-1 ring-red-500"
                                : "border-gray-300"
                            } rounded-lg w-full py-2.5 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            rows="4"
                            placeholder="Enter announcement details"
                          ></textarea>
                          {formErrors.description && (
                            <p className="text-red-500 text-sm mt-1">
                              {formErrors.description}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label
                              className="block text-gray-700 text-sm font-medium mb-2"
                              htmlFor="startDate"
                            >
                              Start Date and Time
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                              <div className="bg-gray-100 px-3 py-2.5 border-r border-gray-300">
                                <Calendar className="w-5 h-5 text-gray-500" />
                              </div>
                              <input
                                id="startDate"
                                type="datetime-local"
                                value={newAnnouncement.announcementDateTime.slice(
                                  0,
                                  16
                                )}
                                onChange={(e) =>
                                  setNewAnnouncement({
                                    ...newAnnouncement,
                                    announcementDateTime: new Date(
                                      e.target.value
                                    ).toISOString(),
                                  })
                                }
                                className="w-full py-2.5 px-4 text-gray-700 focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label
                              className="block text-gray-700 text-sm font-medium mb-2"
                              htmlFor="endDate"
                            >
                              End Date and Time
                            </label>
                            <div className="flex items-center border border-gray-300 rounded-lg shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                              <div className="bg-gray-100 px-3 py-2.5 border-r border-gray-300">
                                <Clock className="w-5 h-5 text-gray-500" />
                              </div>
                              <input
                                id="endDate"
                                type="datetime-local"
                                value={newAnnouncement.announcementEndDateTime.slice(
                                  0,
                                  16
                                )}
                                onChange={(e) =>
                                  setNewAnnouncement({
                                    ...newAnnouncement,
                                    announcementEndDateTime: new Date(
                                      e.target.value
                                    ).toISOString(),
                                  })
                                }
                                className="w-full py-2.5 px-4 text-gray-700 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {formErrors.date && (
                          <div>
                            <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                              <AlertTriangle className="w-4 h-4 inline mr-1.5" />
                              {formErrors.date}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="mr-3 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 shadow-sm font-medium text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                          >
                            {isSubmitting ? (
                              <span className="flex items-center">
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Saving...
                              </span>
                            ) : (
                              <span>
                                {editingAnnouncementId
                                  ? "Update Announcement"
                                  : "Create Announcement"}
                              </span>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Announcements List */}
                <div className="p-6">
                  {announcements.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                      <Bell className="w-16 h-16 mx-auto text-gray-300" />
                      <p className="mt-3 text-gray-600 font-medium">
                        No active announcements found
                      </p>
                      <p className="text-gray-500 text-sm max-w-md mx-auto mt-2">
                        Announcements will be displayed to all users in the
                        system. Create one to notify everyone about important
                        updates.
                      </p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="mt-5 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm font-medium text-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first announcement
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {announcements.map((announcement) => {
                        const status = getAnnouncementStatus(announcement);
                        return (
                          <div
                            key={announcement.id}
                            className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition bg-white"
                          >
                            <div className="flex flex-wrap md:flex-nowrap justify-between items-start">
                              <div className="w-full md:w-3/4 pr-4">
                                <div className="flex items-center flex-wrap">
                                  <h3 className="font-bold text-lg text-gray-800">
                                    {announcement.title}
                                  </h3>
                                  <span
                                    className={`ml-3 px-2.5 py-1 text-xs rounded-full ${status.color} font-medium`}
                                  >
                                    {status.label}
                                  </span>
                                </div>
                                <p className="text-gray-600 mt-2 text-sm leading-relaxed">
                                  {announcement.description}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-2 border-t border-gray-100 pt-3">
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                                From:{" "}
                                <span className="font-medium ml-1 text-gray-600">
                                  {formatDate(
                                    announcement.announcemnetDateTime
                                  )}
                                </span>
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                                To:{" "}
                                <span className="font-medium ml-1 text-gray-600">
                                  {formatDate(
                                    announcement.announcementEndDateTime
                                  )}
                                </span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 mt-10 pt-4 text-center text-gray-500 text-sm">
            <p>© 2025 eBook Admin Dashboard. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
