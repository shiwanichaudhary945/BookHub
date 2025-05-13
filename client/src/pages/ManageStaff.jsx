import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import {
  UserPlus,
  Users,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Save,
  Filter,
  Loader2,
  UserX,
  MapPin,
} from "lucide-react";

const ManageStaff = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState("asc");

  const [editMode, setEditMode] = useState(false);
  const [newStaff, setNewStaff] = useState({
    userId: "",
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Listen for sidebar toggle events
  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarOpen(event.detail.isOpen);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle);

    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle);
    };
  }, []);

  // Fetch all staff data from API
  const fetchAllStaff = async () => {
    setIsLoading(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        "https://localhost:7133/api/User/GetAllStaff",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch staff data: ${response.status}`);
      }

      const data = await response.json();
      setStaff(data.data.$values);
      setFilteredStaff(data.data.$values);
    } catch (error) {
      console.error("Error fetching staff:", error);
      showNotification(`Error loading staff: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single staff member by ID
  const fetchStaffById = async (userId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7133/api/User/GetStaffById/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch staff member: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching staff member ${userId}:`, error);
      showNotification(
        `Error loading staff details: ${error.message}`,
        "error"
      );
      return null;
    }
  };

  // Update staff status
  const updateStaffStatus = async (userId, isActive) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7133/api/User/SetStaffStatus/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isActive: isActive,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update staff status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error(`Error updating staff status:`, error);
      showNotification(`Error updating status: ${error.message}`, "error");
      return false;
    }
  };

  // Update staff information
  const updateStaffInfo = async (staffData) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7133/api/User/UpdateStaff`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(staffData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to update staff: ${response.status}`
        );
      }

      return true;
    } catch (error) {
      console.error(`Error updating staff:`, error);
      showNotification(`Error updating staff: ${error.message}`, "error");
      return false;
    }
  };

  // Add new staff member
  const addNewStaff = async (staffData) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7133/api/User/StaffCreation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(staffData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to add staff: ${response.status}`
        );
      }

      return true;
    } catch (error) {
      console.error(`Error adding staff:`, error);
      showNotification(`Error adding staff: ${error.message}`, "error");
      return false;
    }
  };

  // Load staff data when component mounts
  useEffect(() => {
    fetchAllStaff();
  }, []);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!newStaff.fullName?.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!newStaff.phoneNumber?.trim()) {
      errors.phoneNumber = "Phone number is required";
    }

    if (!newStaff.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newStaff.email)) {
      errors.email = "Please enter a valid email address";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open form modal for adding
  const handleAddStaff = () => {
    setEditMode(false);
    setNewStaff({
      userId: "",
      fullName: "",
      phoneNumber: "",
      email: "",
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  // Open form modal for editing
  const handleEditStaff = async (staff) => {
    setIsLoading(true);
    try {
      // Get latest staff data from API
      const staffData = await fetchStaffById(staff.staffId);
      if (staffData) {
        setEditMode(true);
        setNewStaff({
          userId: staffData.staffId,
          fullName: staffData.fullName,
          phoneNumber: staffData.phoneNumber,
          email: staffData.email || "",
        });
        setFormErrors({});
        setIsFormModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching staff for edit:", error);
      showNotification("Failed to load staff details for editing", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (editMode) {
        // Update existing staff member via API
        const success = await updateStaffInfo({
          userId: newStaff.userId,
          fullName: newStaff.fullName,
          phoneNumber: newStaff.phoneNumber,
          email: newStaff.email,
        });

        if (success) {
          // Refresh staff list
          await fetchAllStaff();
          showNotification(
            `${newStaff.fullName} has been updated successfully`
          );
          setIsFormModalOpen(false);
        }
      } else {
        // Add new staff member
        const success = await addNewStaff({
          fullName: newStaff.fullName,
          phoneNumber: newStaff.phoneNumber,
          email: newStaff.email,
        });

        if (success) {
          // Refresh staff list
          await fetchAllStaff();
          showNotification(`${newStaff.fullName} has been added successfully`);
          setIsFormModalOpen(false);
        }
      }
    } catch (err) {
      showNotification(
        `Failed to ${editMode ? "update" : "add"} staff member: ${err.message}`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm delete staff member (deactivate)
  const confirmDeleteStaff = (member) => {
    setStaffToDelete(member);
    setIsDeleteModalOpen(true);
  };

  // Delete (deactivate) staff member
  const handleDeleteStaff = async () => {
    if (!staffToDelete) return;

    setIsLoading(true);
    try {
      // Call API to change status to inactive
      const success = await updateStaffStatus(staffToDelete.userId, false);

      if (success) {
        // Refresh staff list
        await fetchAllStaff();
        showNotification(`${staffToDelete.fullName} has been deactivated`);
        setIsDeleteModalOpen(false);
        setStaffToDelete(null);
      }
    } catch (error) {
      showNotification(`Failed to deactivate staff: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setFilteredStaff(staff);
    } else {
      const term = value.toLowerCase();
      const filtered = staff.filter(
        (member) =>
          member.fullName?.toLowerCase().includes(term) ||
          member.email?.toLowerCase().includes(term) ||
          member.phoneNumber?.toLowerCase().includes(term)
      );
      setFilteredStaff(filtered);
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    const newDirection =
      field === sortField && sortDirection === "asc" ? "desc" : "asc";

    setSortField(field);
    setSortDirection(newDirection);

    const sortedData = [...filteredStaff].sort((a, b) => {
      // Handle missing fields safely
      const valA = a[field] || "";
      const valB = b[field] || "";

      if (valA < valB) {
        return newDirection === "asc" ? -1 : 1;
      }
      if (valA > valB) {
        return newDirection === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredStaff(sortedData);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar from existing components */}
      <div className="fixed z-10">
        <Sidebar />
      </div>

      {/* Main content - With appropriate margin based on sidebar state */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        } overflow-auto`}
      >
        <div className="px-6 py-8">
          {/* Notification */}
          {notification && (
            <div
              className={`fixed top-6 right-6 p-4 rounded-lg shadow-lg max-w-md z-50 animate-fade-in-down ${
                notification.type === "error"
                  ? "bg-red-100 text-red-800 border-l-4 border-red-500"
                  : "bg-green-100 text-green-800 border-l-4 border-green-500"
              }`}
            >
              <div className="flex items-center">
                {notification.type === "success" ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2" />
                )}
                <p>{notification.message}</p>
                <button
                  onClick={() => setNotification(null)}
                  className="ml-auto text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Page Header with Search and Add Button on right side */}
          <div className="mb-8 bg-white rounded-xl shadow-sm p-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-7 h-7 text-indigo-600 mr-2" />
                Staff Management
              </h1>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                    placeholder="Search staff..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => {
                        setSearchTerm("");
                        setFilteredStaff(staff);
                      }}
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleAddStaff}
                  className="min-w-[130px] px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm flex items-center justify-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Staff
                </button>
              </div>
            </div>

            {/* Status display */}
            {searchTerm && filteredStaff.length !== staff.length && (
              <div className="mt-3 text-sm text-gray-600 flex items-center">
                <Filter className="w-4 h-4 mr-1.5 text-indigo-500" />
                <span>
                  Found{" "}
                  <span className="font-medium">{filteredStaff.length}</span> of{" "}
                  <span className="font-medium">{staff.length}</span> staff
                  members
                </span>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  Filtered results
                </span>
              </div>
            )}
          </div>

          {/* Staff Table with Modern Design */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            {isLoading && staff.length === 0 ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                  <p className="mt-4 text-gray-600 font-medium">
                    Loading staff data...
                  </p>
                </div>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchTerm
                    ? "No matching staff found"
                    : "No staff members yet"}
                </h3>
                <p className="text-center text-gray-500 max-w-md mb-6">
                  {searchTerm
                    ? `Try adjusting your search to find what you're looking for.`
                    : `Add staff members to help manage your business.`}
                </p>
                {searchTerm ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilteredStaff(staff);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear search
                  </button>
                ) : (
                  <button
                    onClick={handleAddStaff}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add First Staff Member
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer group"
                        onClick={() => handleSort("fullName")}
                      >
                        <div className="flex items-center">
                          <span>Full Name</span>
                          <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {sortField === "fullName" && (
                              <span className="text-indigo-600">
                                {sortDirection === "asc" ? " ↑" : " ↓"}
                              </span>
                            )}
                          </span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer group"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center">
                          <span>Email</span>
                          <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {sortField === "email" && (
                              <span className="text-indigo-600">
                                {sortDirection === "asc" ? " ↑" : " ↓"}
                              </span>
                            )}
                          </span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer group"
                        onClick={() => handleSort("phoneNumber")}
                      >
                        <div className="flex items-center">
                          <span>Phone Number</span>
                          <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {sortField === "phoneNumber" && (
                              <span className="text-indigo-600">
                                {sortDirection === "asc" ? " ↑" : " ↓"}
                              </span>
                            )}
                          </span>
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStaff?.length > 0 ? (
                      filteredStaff.map((member, index) => (
                        <tr
                          key={member.userId}
                          className={`group hover:bg-indigo-50 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-11 w-11 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                                {member.staffName
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("") || "?"}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                  {member.staffName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 flex items-center group-hover:text-indigo-700 transition-colors">
                              <Mail className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
                              {member.email || "No email"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700 flex items-center">
                              <Phone className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
                              {member.phoneNumber || "No phone"}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {member.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Inactive
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-3">
                              <button
                                className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-lg transition-colors"
                                title="Edit staff member"
                                onClick={() => handleEditStaff(member)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {member.isActive && (
                                <button
                                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-colors"
                                  title="Deactivate staff member"
                                  onClick={() => confirmDeleteStaff(member)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <UserX className="w-12 h-12 text-gray-300 mb-3" />
                            <h3 className="text-lg font-medium text-gray-700 mb-1">
                              No staff members found
                            </h3>
                            <p className="text-sm max-w-md mx-auto">
                              {filteredStaff?.length === 0
                                ? "There are currently no staff members in the system."
                                : "No staff members match your search criteria."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Staff Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                {editMode ? (
                  <>
                    <Edit2 className="w-5 h-5 mr-2" />
                    Edit Staff Member
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add New Staff Member
                  </>
                )}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6">
              <div className="space-y-6">
                {/* Full Name Field */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={newStaff.fullName}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 ${
                        formErrors.fullName
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                      } rounded-lg focus:outline-none focus:ring-4 transition-all duration-200`}
                      placeholder="Enter full name"
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-indigo-500" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={newStaff.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 ${
                        formErrors.email
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                      } rounded-lg focus:outline-none focus:ring-4 transition-all duration-200`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number Field */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-indigo-500" />
                    </div>
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={newStaff.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border-2 ${
                        formErrors.phoneNumber
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-200"
                      } rounded-lg focus:outline-none focus:ring-4 transition-all duration-200`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {formErrors.phoneNumber && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      {formErrors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-3 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      {editMode ? "Updating..." : "Adding..."}
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      {editMode ? "Update Staff" : "Add Staff"}
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete/Deactivate Confirmation Modal */}
      {isDeleteModalOpen && staffToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 py-6 px-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                Deactivate Staff Member
              </h3>
            </div>

            <div className="p-6">
              <p className="text-center text-gray-700 mb-6">
                Are you sure you want to deactivate{" "}
                <span className="font-semibold text-indigo-700">
                  {staffToDelete.fullName}
                </span>
                ? This will prevent them from accessing the system.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setStaffToDelete(null);
                  }}
                  className="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteStaff}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:from-red-700 hover:to-pink-700 shadow-md transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm font-medium"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Deactivate Staff Member"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageStaff;
