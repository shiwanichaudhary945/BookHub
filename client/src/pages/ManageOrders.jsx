import React, { useState, useEffect } from "react";
import {
  Package,
  Settings,
  LogOut,
  Menu,
  Home,
  Users,
  ShoppingBag,
  ChevronRight,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Sliders,
  Clock,
  Calendar,
  DollarSign,
  Filter,
  X,
  Loader2,
  MapPin,
  Ticket,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pendingOrders, setPendingOrders] = useState("");
  const [completedOrders, setCompletedOrders] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [orderDetailsModalOpen, setOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processingOrder, setProcessingOrder] = useState(null);
  const [claimCodeInput, setClaimCodeInput] = useState("");
  const navigate = useNavigate();

  // Sidebar menu items
  const menuItems = [
    {
      name: "Orders",
      icon: <Package className="w-5 h-5" />,
      path: "/orders",
      active: true,
    },
  ];

  // Fetch orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(
        "https://localhost:7133/api/Orders/GetAllOrders",
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // For debugging

      console.log(response);

      // Extract orders from response - adjust based on actual API response structure
      const allOrders = data.data?.$values || data.$values || data || [];

      // Separate pending and completed orders if needed
      const pendingOrders = allOrders.filter(
        (order) => order.status === "Pending"
      );
      const completedOrders = allOrders.filter(
        (order) => order.status === "Completed"
      );

      // Store separately if needed
      setPendingOrders(pendingOrders);
      setCompletedOrders(completedOrders);

      // Set combined orders
      setOrders(allOrders);
      setFilteredOrders(allOrders);

      // Show success notification
      if (allOrders.length > 0) {
        showNotification(
          `Successfully loaded ${allOrders.length} orders`,
          "success"
        );
      } else {
        showNotification("No orders found", "info");
      }
    } catch (err) {
      setError(`Error loading orders: ${err.message}`);
      showNotification(`Failed to load orders: ${err.message}`, "error");
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Process order by claim code
  // const processOrderByClaimCode = async (claimCode) => {
  //   if (!claimCode || claimCode.trim() === "") {
  //     showNotification("Please enter a valid claim code", "warning");
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);

  //     const token =
  //       localStorage.getItem("token") || sessionStorage.getItem("token");
  //     const response = await fetch(
  //       "https://localhost:7133/api/Orders/CompleteOrderByClaimCode",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: token ? `Bearer ${token}` : "",
  //         },
  //         body: JSON.stringify({
  //           claimCode,
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       throw new Error(
  //         `Error ${response.status}: ${errorText || "Failed to process order"}`
  //       );
  //     }

  //     const result = await response.json();

  //     // Find the processed order in our current orders list
  //     const processedOrderId = result.data?.orderId || null;

  //     // Optimistically update local state
  //     setOrders((prevOrders) =>
  //       prevOrders.map((order) =>
  //         order.id === processedOrderId
  //           ? { ...order, status: "Completed" }
  //           : order
  //       )
  //     );

  //     setFilteredOrders((prevOrders) =>
  //       prevOrders.map((order) =>
  //         order.id === processedOrderId
  //           ? { ...order, status: "Completed" }
  //           : order
  //       )
  //     );

  //     // If selected order is open in modal, update that too
  //     if (selectedOrder && selectedOrder.id === processedOrderId) {
  //       setSelectedOrder({
  //         ...selectedOrder,
  //         status: "Completed",
  //       });
  //     }

  //     showNotification(
  //       `Order with claim code "${claimCode}" has been processed successfully`,
  //       "success"
  //     );
  //     setClaimCodeInput("");
  //   } catch (err) {
  //     console.error("Claim code processing error:", err);
  //     showNotification(`Failed to process claim code: ${err.message}`, "error");
  //   } finally {
  //     setIsLoading(false);
  //     setProcessingOrder(null);
  //   }
  // };
const processOrderByClaimCode = async (claimCode) => {
  if (!claimCode || claimCode.trim() === "") {
    showNotification("Please enter a valid claim code", "warning");
    return;
  }

  try {
    setIsLoading(true);

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(
      "https://localhost:7133/api/Orders/CompleteOrderByClaimCode",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          claimCode,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      // Customize the error message for 404 responses
      if (response.status === 404) {
        throw new Error("Invalid claim code");
      }
      // For other errors, use the API message or a generic one
      throw new Error(errorData.message || "Failed to process order");
    }

    const result = await response.json();

    // Find the processed order in our current orders list
    const processedOrderId = result.data?.orderId || null;

    // Optimistically update local state
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === processedOrderId
          ? { ...order, status: "Completed" }
          : order
      )
    );

    setFilteredOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === processedOrderId
          ? { ...order, status: "Completed" }
          : order
      )
    );

    // If selected order is open in modal, update that too
    if (selectedOrder && selectedOrder.id === processedOrderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: "Completed",
      });
    }

    showNotification(
      `Order with claim code "${claimCode}" has been processed successfully`,
      "success"
    );
    setClaimCodeInput("");
  } catch (err) {
    console.error("Claim code processing error:", err);
    showNotification(err.message, "error");
  } finally {
    setIsLoading(false);
    setProcessingOrder(null);
  }
};
  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setIsLoading(true);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        "https://localhost:7133/api/Orders/UpdateOrderStatus",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            orderId,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error ${response.status}: ${
            errorText || "Failed to update order status"
          }`
        );
      }

      // Optimistically update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      setFilteredOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      // If selected order is open in modal, update that too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({
          ...selectedOrder,
          status: newStatus,
        });
      }

      showNotification(
        `Order #${orderId} status updated to ${newStatus}`,
        "success"
      );
    } catch (err) {
      console.error("Status update error:", err);
      showNotification(
        `Failed to update order status: ${err.message}`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterOrders(value, statusFilter);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    filterOrders(searchTerm, status);
  };

  // Filter orders based on search term and status
  const filterOrders = (search, status) => {
    let filtered = [...orders];

    // Apply search filter
    if (search.trim() !== "") {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          (order.orderNumber &&
            order.orderNumber.toLowerCase().includes(term)) ||
          (order.customer && order.customer.toLowerCase().includes(term)) ||
          (order.email && order.email.toLowerCase().includes(term)) ||
          (order.claimCode && order.claimCode.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (status !== "All") {
      filtered = filtered.filter((order) => order.status === status);
    }

    setFilteredOrders(filtered);
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsModalOpen(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "Processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4 mr-1.5" />;
      case "Processing":
        return <RefreshCw className="w-4 h-4 mr-1.5" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 mr-1.5" />;
      default:
        return <Clock className="w-4 h-4 mr-1.5" />;
    }
  };

  // Sample data for demonstration when API fails
  const getSampleOrders = () => {
    return [
      {
        id: "sample1",
        orderNumber: "ORD-2025-001",
        customer: "Jane Doe",
        email: "jane.doe@example.com",
        date: new Date().toISOString(),
        total: 125.99,
        status: "Processing",
        claimCode: "JANE2025XYZ",
        shippingAddress: "123 Main St, Anytown, ST 12345",
        items: [
          {
            id: "item1",
            name: "Book: The Great Adventure",
            quantity: 2,
            price: 29.99,
          },
          {
            id: "item2",
            name: "Book: Coding Basics",
            quantity: 1,
            price: 65.99,
          },
        ],
      },
      {
        id: "sample2",
        orderNumber: "ORD-2025-002",
        customer: "John Smith",
        email: "john.smith@example.com",
        date: new Date().toISOString(),
        total: 45.5,
        status: "Completed",
        claimCode: "JOHN2025ABC",
        shippingAddress: "456 Oak Ave, Somewhere, ST 54321",
        items: [
          {
            id: "item3",
            name: "Book: Mystery Novel",
            quantity: 1,
            price: 19.99,
          },
          { id: "item4", name: "Bookmark Set", quantity: 1, price: 9.99 },
          { id: "item5", name: "Reading Light", quantity: 1, price: 15.5 },
        ],
      },
      {
        id: "sample3",
        orderNumber: "ORD-2025-003",
        customer: "Robert Johnson",
        email: "robert.j@example.com",
        date: new Date().toISOString(),
        total: 89.95,
        status: "Processing",
        claimCode: "ROBERT123DEF",
        shippingAddress: "789 Pine Blvd, Othertown, ST 67890",
        items: [
          {
            id: "item6",
            name: "Book: History of Computing",
            quantity: 1,
            price: 89.95,
          },
        ],
      },
    ];
  };

  // Handle fallback to sample data
  const useSampleData = () => {
    const sampleData = getSampleOrders();
    setOrders(sampleData);
    setFilteredOrders(sampleData);
    showNotification("Using sample data for demonstration", "info");
    setIsLoading(false);
    setError(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Custom Sidebar */}
      <div
        className={`fixed h-full bg-gradient-to-b from-indigo-800 to-indigo-900 shadow-xl transition-all duration-300 z-20 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-indigo-700">
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? "justify-center w-full" : ""
            }`}
          >
            <Package className="h-8 w-8 text-white" />
            {!isSidebarCollapsed && (
              <span className="ml-3 text-xl font-semibold text-white">
                eBook
              </span>
            )}
          </div>
          {!isSidebarCollapsed && (
            <button
              onClick={() => setIsSidebarCollapsed(true)}
              className="p-1 rounded-md hover:bg-indigo-700 text-indigo-300 hover:text-white transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {isSidebarCollapsed && (
          <button
            onClick={() => setIsSidebarCollapsed(false)}
            className="w-full flex justify-center py-2 hover:bg-indigo-700 text-indigo-300 hover:text-white transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}

        <div className="py-4">
          <nav>
            <ul>
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-4 py-3 mb-1
                      ${isSidebarCollapsed ? "justify-center" : ""}
                      ${
                        item.active
                          ? "bg-indigo-700 text-white font-medium"
                          : "text-indigo-200 hover:bg-indigo-700 hover:text-white"
                      }
                      transition-colors
                    `}
                  >
                    {item.icon}
                    {!isSidebarCollapsed && (
                      <span className="ml-3">{item.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="absolute bottom-0 w-full border-t border-indigo-700 py-4">
          <button
            onClick={() => {
              // Handle logout
              localStorage.removeItem("token");
              sessionStorage.removeItem("token");
              navigate("/login");
            }}
            className={`
              flex items-center px-4 py-2 text-indigo-200 hover:bg-indigo-700 hover:text-white w-full
              ${isSidebarCollapsed ? "justify-center" : ""}
              transition-colors
            `}
          >
            <LogOut className="h-5 w-5" />
            {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 transition-all duration-300 overflow-auto ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <div className="px-6 py-8">
          {/* Notification */}
          {notification && (
            <div
              className={`fixed top-6 right-6 p-4 rounded-lg shadow-lg max-w-md z-50 animate-fade-in-down ${
                notification.type === "error"
                  ? "bg-red-100 text-red-800 border-l-4 border-red-500"
                  : notification.type === "warning"
                  ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500"
                  : notification.type === "info"
                  ? "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
                  : "bg-green-100 text-green-800 border-l-4 border-green-500"
              }`}
            >
              <div className="flex items-center">
                {notification.type === "success" ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : notification.type === "warning" ? (
                  <AlertCircle className="w-5 h-5 mr-2 text-yellow-500" />
                ) : notification.type === "info" ? (
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
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

          {/* Page Header with Search and Filters */}
          <div className="mb-8 bg-white rounded-xl shadow-sm p-5">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Package className="w-7 h-7 text-indigo-600 mr-2" />
                Order Management
              </h1>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-grow w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm"
                    placeholder="Search by order #, customer, email or claim code..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => {
                        setSearchTerm("");
                        filterOrders("", statusFilter);
                      }}
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors shadow-sm text-gray-700 bg-white"
                  >
                    <option value="All">All Orders</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Process by Claim Code section */}
            <div className="mt-5 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <h3 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center">
                <Ticket className="w-4 h-4 mr-1.5" />
                Process Order by Claim Code
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={claimCodeInput}
                    onChange={(e) => setClaimCodeInput(e.target.value)}
                    placeholder="Enter member claim code..."
                    className="w-full px-4 py-2.5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={() => processOrderByClaimCode(claimCodeInput)}
                  disabled={isLoading || !claimCodeInput.trim()}
                  className={`px-4 py-2.5 rounded-lg font-medium text-white ${
                    isLoading || !claimCodeInput.trim()
                      ? "bg-indigo-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  } transition-colors shadow-sm flex items-center justify-center`}
                >
                  {isLoading && processingOrder ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Process Order
                </button>
              </div>
            </div>

            {/* Filter status display */}
            {(searchTerm || statusFilter !== "All") && (
              <div className="mt-3 text-sm text-gray-600 flex items-center">
                <Filter className="w-4 h-4 mr-1.5 text-indigo-500" />
                <span>
                  Found{" "}
                  <span className="font-medium">{filteredOrders.length}</span>{" "}
                  of <span className="font-medium">{orders.length}</span> orders
                </span>
                {statusFilter !== "All" && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Status: {statusFilter}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                  <p className="mt-4 text-gray-600 font-medium">
                    Loading orders...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Error Loading Orders
                </h3>
                <p className="text-center text-gray-500 max-w-md mb-6">
                  {error}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={fetchOrders}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                  </button>
                  <button
                    onClick={useSampleData}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Use Sample Data
                  </button>
                </div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                  <Package className="h-10 w-10 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {searchTerm || statusFilter !== "All"
                    ? "No matching orders found"
                    : "No orders yet"}
                </h3>
                <p className="text-center text-gray-500 max-w-md mb-6">
                  {searchTerm || statusFilter !== "All"
                    ? `Try adjusting your search or filters to find what you're looking for.`
                    : `Orders will appear here when customers make purchases.`}
                </p>
                {searchTerm || statusFilter !== "All" ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("All");
                      setFilteredOrders(orders);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear filters
                  </button>
                ) : (
                  <button
                    onClick={useSampleData}
                    className="px-4 py-2.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors shadow-sm flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Load Sample Data
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
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      >
                        Order Number
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      >
                        Customer
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      >
                        Claim Code
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                      >
                        Total
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
                    {filteredOrders.map((order, index) => (
                      <tr
                        key={order.id || index}
                        className={`group hover:bg-indigo-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {order.orderNumber || `Order-${index + 1}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.fullName || "Customer Name"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.email || "email@example.com"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-indigo-600 flex items-center">
                            <Ticket className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
                            {order.claimCode || "No claim code"}
                          </div>
                          {order.claimCode && order.status !== "Completed" && (
                            <button
                              onClick={() =>
                                processOrderByClaimCode(order.claimCode)
                              }
                              className="mt-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded transition-colors"
                            >
                              Process
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Calendar className="w-4 h-4 text-indigo-400 mr-2 flex-shrink-0" />
                            {formatDate(order.orderDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <DollarSign className="w-4 h-4 text-green-500 mr-1 flex-shrink-0" />
                            {order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm ${getStatusBadgeClass(
                              order.status || "Processing"
                            )}`}
                          >
                            {getStatusIcon(order.status || "Processing")}
                            {order.status || "Processing"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            {order.status !== "Completed" && (
                              <button
                                onClick={() => {
                                  setProcessingOrder(order.id);
                                  processOrderByClaimCode(order.claimCode);
                                }}
                                className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                                disabled={!order.claimCode || isLoading}
                              >
                                {isLoading && processingOrder === order.id ? (
                                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4 mr-1.5" />
                                )}
                                Process
                              </button>
                            )}
                            <button
                              onClick={() => viewOrderDetails(order)}
                              className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm"
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {orderDetailsModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Order #{selectedOrder.orderNumber || "Unknown"} Details
              </h3>
              <button
                onClick={() => {
                  setOrderDetailsModalOpen(false);
                  setSelectedOrder(null);
                }}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
              <div className="p-6">
                {/* Claim Code Section - Highlighted */}
                <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="text-sm font-semibold text-indigo-800 mb-2 flex items-center">
                    <Ticket className="w-4 h-4 mr-1.5" />
                    Member Claim Code
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-mono font-bold text-indigo-700 bg-white px-3 py-1.5 rounded border border-indigo-200">
                      {selectedOrder.claimCode || "No claim code available"}
                    </div>

                    {selectedOrder.status !== "Completed" &&
                      selectedOrder.claimCode && (
                        <button
                          onClick={() => {
                            processOrderByClaimCode(selectedOrder.claimCode);
                            setOrderDetailsModalOpen(false);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Process Order
                        </button>
                      )}
                  </div>
                </div>

                {/* Order Status Badge */}
                <div className="mb-6 flex justify-between items-center">
                  <div
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm ${getStatusBadgeClass(
                      selectedOrder.status || "Processing"
                    )}`}
                  >
                    {getStatusIcon(selectedOrder.status || "Processing")}
                    {selectedOrder.status || "Processing"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Order Date: {formatDate(selectedOrder.orderDate)}
                  </div>
                </div>

                {/* Customer Information and Shipping */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-1.5 text-indigo-500" />
                      Customer Information
                    </h4>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Name:</span>{" "}
                      {selectedOrder.fullName || "Not available"}
                    </p>
                    <p className="text-sm mb-1">
                      <span className="font-medium">Email:</span>{" "}
                      {selectedOrder.email || "Not available"}
                    </p>
                  </div>
{/* 
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1.5 text-indigo-500" />
                      Shipping Address
                    </h4>
                    <p className="text-sm">
                      {selectedOrder.shippingAddress ||
                        "Shipping address not available"}
                    </p>
                  </div> */}
                </div>

                {/* Order Items */}
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <ShoppingBag className="w-4 h-4 mr-1.5 text-indigo-500" />
                  Order Items
                </h4>
                <div className="border rounded-lg overflow-hidden mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Item
                        </th>
                          <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Book Name
                        </th>
                          <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                        Author Name       </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder?.orderItems?.$values &&
                      selectedOrder?.orderItems?.$values?.length > 0 ? (
                        selectedOrder.orderItems?.$values.map((item, index) => (
                          <tr key={item.id || index}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.id || `Item #${index + 1}`}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {item.bookTitle || 1}
                              </div>
                            </td>
                             <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {item.bookAuthor || 1}
                              </div>
                            </td>
                             <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {item.quantity || 1}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                ${(item.unitPrice || 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="text-sm font-medium text-gray-900">
                                $
                                {(
                                  (item.unitPrice || 0) * (item.quantity || 1)
                                ).toFixed(2)}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-4 py-4 text-center text-sm text-gray-500"
                          >
                            No items available for this order
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-3 text-sm font-medium text-gray-700 text-right"
                        >
                          Order Total:
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="text-sm font-bold text-indigo-700">
                            ${(selectedOrder.totalAmount || 0).toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-8">
                  <button
                    type="button"
                    onClick={() => {
                      setOrderDetailsModalOpen(false);
                      setSelectedOrder(null);
                    }}
                    className="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                  >
                    Close
                  </button>

                  {selectedOrder.status !== "Completed" &&
                  selectedOrder.claimCode ? (
                    <button
                      onClick={() => {
                        processOrderByClaimCode(selectedOrder.claimCode);
                        setOrderDetailsModalOpen(false);
                      }}
                      className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Process with Claim Code
                    </button>
                  ) : (
                    <select
                      value={selectedOrder.status || "Processing"}
                      onChange={(e) => {
                        updateOrderStatus(selectedOrder.id, e.target.value);
                      }}
                      className="px-4 py-2.5 border-2 border-indigo-500 rounded-lg text-sm font-medium text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <option value="Processing">Mark as Processing</option>
                      <option value="Completed">Mark as Completed</option>
                      <option value="Cancelled">Mark as Cancelled</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
