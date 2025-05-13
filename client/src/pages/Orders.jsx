import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ShoppingBag,
  AlertCircle,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Info,
  Package,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  MessageSquare,
  X,
  Tag,
} from "lucide-react";

const Orders = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("date-desc");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [reviewableBooks, setReviewableBooks] = useState([]);

  // Fetch orders data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          setOrders([]);
          setIsLoading(false);
          return;
        }

        // Single endpoint to fetch all orders
        const response = await fetch(
          "https://localhost:7133/api/Orders/GetOrderById",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Check the data structure based on the screenshot
        if (data.isSuccess && data.data && data.data.$values) {
          // From your screenshot, the status is directly in the data.$values array items
          console.log("Orders from API:", data.data.$values);

          // Map the data to our order objects with the correct status
          const processedOrders = data.data.$values.map((item) => {
            // Log each item to see its structure
            console.log(`Processing order item:`, item);

            return {
              ...item,
              // Ensure we use the status directly from the API
              status: item.status,
            };
          });

          // Sort by date (newest first)
          processedOrders.sort(
            (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
          );

          console.log("Final processed orders:", processedOrders);
          setOrders(processedOrders);

          // Find books eligible for review
          await checkReviewableBooks(processedOrders);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        console.error("Error in fetchOrders:", err);
        setError(err.message);
        showNotification("Error loading orders", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Simplified review checking function - just checks if order is completed
  const checkReviewableBooks = async (allOrders) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const reviewableItems = [];

      // Only check completed orders
      const completedOrders = allOrders.filter(
        (order) => order.status === "Completed"
      );

      console.log("Completed orders count:", completedOrders.length);

      // Process each completed order
      for (const order of completedOrders) {
        // Get order items (handle both direct array and $values format)
        const items = order.orderItems?.$values || order.orderItems || [];

        if (!Array.isArray(items)) {
          console.warn("Order items is not an array for order", order.orderId);
          continue;
        }

        // For each book in the order
        for (const item of items) {
          try {
            // Simple check - just send the book ID to the API
            const response = await fetch(
              `https://localhost:7133/api/Review/CheckEligibilityForReview/${item.bookId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "*/*",
                },
              }
            );

            // If response is OK (status 200), add book to reviewable items
            if (response.ok) {
              // Add to reviewable items, regardless of response body details

              console.log(item);
              reviewableItems.push({
                orderId: order.orderId,
                orderDate: order.orderDate,
                bookId: item.bookId,
                bookTitle: item.title || item.bookTitle || "Unknown Book",
                bookAuthor: item.author || item.bookAuthor || "Unknown Author",
                imageUrl: item.imageUrl || item.photo || null,
              });
            }
          } catch (error) {
            console.error(
              `Error checking eligibility for book ${item.bookId}:`,
              error
            );
          }
        }
      }

      console.log("Reviewable items found:", reviewableItems.length);
      setReviewableBooks(reviewableItems);
    } catch (error) {
      console.error("Error checking reviewable books:", error);
    }
  };

  // Show notification toast
  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type,
    });

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({
        show: false,
        message: "",
        type: "",
      });
    }, 3000);
  };

  // Event handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterOption(e.target.value);
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const goToReviewPage = (bookId) => {
    sessionStorage.setItem("reviewBookId", bookId);
    window.location.href = "/review";
  };

  // Filter and sort orders based on active tab, search term, and filter option
  const getFilteredOrders = () => {
    let filtered = [...orders];

    console.log("Getting filtered orders. Total orders:", filtered.length);
    console.log("Active tab:", activeTab);

    // Print all available statuses in the orders array
    const allStatuses = [...new Set(filtered.map((order) => order.status))];
    console.log("All available statuses in orders:", allStatuses);

    // Filter by tab
    if (activeTab !== "all") {
      console.log(`Filtering by status "${activeTab}"`);

      filtered = filtered.filter((order) => {
        // Normalize both strings for comparison (case-insensitive)
        const orderStatus = (order.status || "").toLowerCase();
        const tabStatus = activeTab.toLowerCase();

        const match = orderStatus === tabStatus;
        console.log(
          `Order ${order.orderId} status "${order.status}" matches "${activeTab}"? ${match}`
        );

        return match;
      });
    }

    console.log("After tab filtering, orders count:", filtered.length);

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.orderId.toString().includes(searchTerm) ||
          order.claimCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log("After search filtering, orders count:", filtered.length);
    }

    // Sort orders
    switch (filterOption) {
      case "date-asc":
        filtered.sort((a, b) => new Date(a.orderDate) - new Date(b.orderDate));
        break;
      case "date-desc":
        filtered.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        break;
      case "price-asc":
        filtered.sort((a, b) => (a.totalAmount || 0) - (b.totalAmount || 0));
        break;
      case "price-desc":
        filtered.sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0));
        break;
      default:
        break;
    }

    console.log("Final filtered orders:", filtered);
    return filtered;
  };

  // Helper functions
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    console.log("getStatusBadge called with status:", status);

    // Ensure we have a string and it's capitalized properly for consistency
    let formattedStatus = "Unknown";

    if (status) {
      // Convert to string in case it's not already
      const statusStr = String(status);
      // Normalize status string: capitalize first letter, rest lowercase
      formattedStatus =
        statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase();
    }

    console.log("Formatted status:", formattedStatus);

    // Check against the normalized status strings
    if (formattedStatus === "Pending") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </span>
      );
    } else if (formattedStatus === "Completed") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    } else if (formattedStatus === "Cancelled") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Cancelled
        </span>
      );
    }

    // Fallback for unknown status
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Info className="w-3 h-3 mr-1" />
        {formattedStatus}
      </span>
    );
  };

  // Simplified function - always show review button for completed orders
  const isBookReviewable = (bookId) => {
    return true;
  };

  // Get filtered orders and add debugging
  console.log("Before filtering - all orders:", orders);
  const filteredOrders = getFilteredOrders();
  console.log("After filtering - filtered orders:", filteredOrders);

  // Cancel an order
  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          showNotification("Please login to cancel order", "info");
          return;
        }

        console.log(`Cancelling order ${orderId}`);

        const response = await fetch(
          `https://localhost:7133/api/Orders/CancelOrder/${orderId}`,
          {
            method: "PUT",
            headers: {
              Accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to cancel order");
        }

        const result = await response.json();
        console.log("Cancel order API response:", result);

        // Update order status locally
        setOrders((prevOrders) => {
          const updatedOrders = prevOrders.map((o) =>
            o.orderId === orderId
              ? { ...o, status: "Cancelled", orderStatus: "Cancelled" }
              : o
          );
          console.log("Updated orders after cancellation:", updatedOrders);
          return updatedOrders;
        });

        showNotification("Order cancelled successfully", "success");
        setExpandedOrderId(null);
      } catch (err) {
        console.error("Error cancelling order:", err);
        showNotification("Error cancelling order: " + err.message, "error");
      }
    }
  };

  // Get order email notification
  const getOrderNotification = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please login to view details", "info");
        return;
      }

      const response = await fetch(
        "https://localhost:7133/api/Orders/GetOrderNotification",
        {
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get order details");
      }

      showNotification("Order details sent to your email", "success");
    } catch (err) {
      showNotification("Error getting order details: " + err.message, "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-xl transition-all duration-300 transform ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : notification.type === "error"
              ? "bg-red-100 text-red-800 border-l-4 border-red-500"
              : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
          } flex items-center`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="mr-2 h-5 w-5" />
          ) : notification.type === "error" ? (
            <AlertCircle className="mr-2 h-5 w-5" />
          ) : (
            <Info className="mr-2 h-5 w-5" />
          )}
          <p>{notification.message}</p>
          <button
            onClick={() => setNotification({ ...notification, show: false })}
            className="ml-3 text-gray-500 hover:text-gray-700"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Breadcrumbs */}
        <div className="mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <a href="/home" className="hover:text-blue-600 transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-700 font-medium">My Orders</span>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex items-center mb-8">
          <div className="bg-purple-50 p-2 rounded-full mr-3">
            <ShoppingBag className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all your book orders
            </p>
          </div>
        </div>

        {/* Tabs and filters section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                  activeTab === "all"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setActiveTab("Pending")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center ${
                  activeTab === "Pending"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Clock className="w-4 h-4 mr-1.5" />
                Pending
              </button>
              <button
                onClick={() => setActiveTab("Completed")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center ${
                  activeTab === "Completed"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Completed
              </button>
              <button
                onClick={() => setActiveTab("Cancelled")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition flex items-center ${
                  activeTab === "Cancelled"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Cancelled
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search box */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search by order ID or claim code..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Filter dropdown */}
              <div className="relative w-full sm:w-48">
                <select
                  value={filterOption}
                  onChange={handleFilterChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg appearance-none bg-white"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="price-desc">Highest Amount</option>
                  <option value="price-asc">Lowest Amount</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <Filter size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviewable Books Section (if any) */}
        {reviewableBooks.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-blue-800 flex items-center mb-1">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Books Waiting for Your Review
                </h2>
                <p className="text-sm text-blue-600">
                  Share your thoughts on these books you've recently purchased
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviewableBooks.slice(0, 3).map((book) => (
                <div
                  key={`${book.orderId}-${book.bookId}`}
                  className="bg-white rounded-lg p-4 shadow-sm flex items-center gap-3 border border-blue-100"
                >
                  <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={
                        book.imageUrl ||
                        "https://via.placeholder.com/96x128?text=Book"
                      }
                      alt={book.bookTitle}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/96x128?text=Book";
                      }}
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="text-sm font-medium text-gray-800 truncate">
                      {book.bookTitle}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {book.bookAuthor}
                    </p>
                    <button
                      onClick={() => goToReviewPage(book.bookId)}
                      className="mt-2 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors flex items-center"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Write Review
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {reviewableBooks.length > 3 && (
              <div className="mt-3 text-center">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  + {reviewableBooks.length - 3} more books to review
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main content area */}
        {isLoading ? (
          <div className="py-16 text-center bg-white rounded-xl shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-white rounded-xl shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-2">Error loading your orders</p>
            <p className="text-gray-600 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm py-16 px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <Package className="h-10 w-10 text-gray-400" />
              </div>

              <h2 className="text-xl font-medium text-gray-800 mb-3">
                {searchTerm
                  ? "No orders match your search"
                  : activeTab !== "all"
                  ? `No ${activeTab} orders found`
                  : "You haven't placed any orders yet"}
              </h2>

              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try a different search term or clear your filters"
                  : "When you place orders, you'll see them listed here for easy tracking."}
              </p>

              <div className="space-y-3">
                {searchTerm || activeTab !== "all" ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setActiveTab("all");
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <a
                    href="/home"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Books
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Orders List */}
            {filteredOrders.map((order) => (
              <div
                key={order.orderId}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                {/* Order Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-500">
                        ORDER #
                      </h3>
                      <span className="font-mono text-base font-medium text-gray-800">
                        {order.orderId}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 gap-2 sm:gap-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                        {formatDate(order.orderDate)}
                      </div>

                      {order.claimCode && (
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 mr-1.5 text-gray-400" />
                          Claim Code:{" "}
                          <span className="font-mono font-medium ml-1">
                            {order.claimCode}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 px-3 py-1.5 rounded-lg">
                      <span className="text-sm font-medium text-gray-800">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleOrderDetails(order.orderId)}
                      className={`text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-md hover:bg-blue-50 ${
                        expandedOrderId === order.orderId ? "bg-blue-50" : ""
                      }`}
                      aria-expanded={expandedOrderId === order.orderId}
                      aria-label="Toggle order details"
                    >
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          expandedOrderId === order.orderId
                            ? "transform rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Order Details (expandable) */}
                {expandedOrderId === order.orderId && (
                  <div className="p-4 sm:p-6">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-3">
                        ORDER ITEMS
                      </h4>
                      <div className="divide-y divide-gray-200">
                        {order.orderItems?.$values &&
                        Array.isArray(order.orderItems.$values) ? (
                          order.orderItems.$values.map((item, index) => (
                            <div
                              key={index}
                              className="py-3 first:pt-0 last:pb-0 grid grid-cols-1 sm:grid-cols-12 gap-3"
                            >
                              {/* Book image */}
                              <div className="sm:col-span-1 flex justify-center">
                                <div className="w-12 h-16 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                  <img
                                    src={
                                      item.photo ||
                                      "https://via.placeholder.com/96x128?text=Book"
                                    }
                                    alt={(item.title || "Book") + " cover"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.src =
                                        "https://via.placeholder.com/96x128?text=Book";
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Book details */}
                              <div className="sm:col-span-7">
                                <h5 className="font-medium text-gray-900">
                                  {item.bookTitle || "Unknown Book"}
                                </h5>
                                <p className="text-sm text-gray-600">
                                  By {item.bookAuthor || "Unknown Author"}
                                </p>
                              </div>

                              {/* Quantity and price */}
                              <div className="sm:col-span-2 text-gray-600 text-sm flex items-center sm:justify-center">
                                <span className="mr-1">Qty:</span>
                                <span className="font-medium">
                                  {item.quantity || 1}
                                </span>
                              </div>

                              <div className="sm:col-span-2 text-right flex items-center sm:justify-end space-x-2">
                                <span className="font-medium text-gray-900">
                                  $
                                  {(
                                    (item.unitPrice || 0) * (item.quantity || 1)
                                  ).toFixed(2)}
                                </span>

                                {/* Simplified review button logic */}
                                {order.status === "Completed" && (
                                  <button
                                    onClick={() => goToReviewPage(item.bookId)}
                                    className="flex items-center justify-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium hover:bg-yellow-200 transition-colors"
                                  >
                                    <Star className="w-3 h-3 mr-1" />
                                    Review
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">
                            No item details available
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">
                          ${((order.totalAmount || 0) * 0.95).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Tax (5%)</span>
                        <span className="text-gray-900">
                          ${((order.totalAmount || 0) * 0.05).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between text-base font-medium mt-3 pt-3 border-t border-gray-200">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">
                          ${(order.totalAmount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom info section */}
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start">
                        <Info className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-600">
                          {order.status === "Pending" ? (
                            <p>
                              Your order is pending. Please visit our store with
                              your
                              <span className="font-medium"> claim code </span>
                              to pick up your books.
                            </p>
                          ) : (
                            <p>
                              Order completed. Thank you for shopping with us!
                              {reviewableBooks.some(
                                (book) => book.orderId === order.orderId
                              ) && (
                                <span className="block mt-1 text-blue-600">
                                  Don't forget to leave a review for your
                                  purchase!
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      {order.status === "Pending" && (
                        <button
                          onClick={() => handleCancelOrder(order.orderId)}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                          Cancel Order
                        </button>
                      )}

                      <button
                        onClick={getOrderNotification}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Get Email Receipt
                      </button>

                      {order.status === "Completed" && (
                        <button
                          onClick={() => {
                            // Find the first book in this order
                            const firstBook = order.orderItems?.$values?.[0];
                            if (firstBook && firstBook.bookId) {
                              goToReviewPage(firstBook.bookId);
                            }
                          }}
                          className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 flex items-center"
                        >
                          <Star className="w-4 h-4 mr-1.5" />
                          Write a Review
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Orders;
