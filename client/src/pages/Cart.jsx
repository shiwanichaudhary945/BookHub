import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Trash2,
  MinusCircle,
  PlusCircle,
  ShoppingBag,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  ChevronLeft,
  Tag,
  Truck,
  Info,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";

const BookCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setIsLoading(true);

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          setCartItems([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          "https://localhost:7133/api/Cart/GetCart",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch cart items");
        }

        const result = await response.json();
        console.log(result);
        // Check if result has the expected structure
        if (result.isSuccess && Array.isArray(result.data.$values)) {
          setCartItems(result.data.$values);
        } else {
          console.warn("Unexpected API response format:", result);
          setCartItems([]);
        }
      } catch (err) {
        setError(err.message);
        showNotification("Error loading cart", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // Update quantity
  const updateQuantity = async (bookId, newQuantity) => {
    try {
      if (newQuantity < 1) return;

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please login to update cart", "info");
        return;
      }

      const response = await fetch(
        "https://localhost:7133/api/Cart/AddInCart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookId: bookId,
            quantity: newQuantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      // Update local state
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.bookId === bookId ? { ...item, quantity: newQuantity } : item
        )
      );

      showNotification("Quantity updated", "success");
    } catch (err) {
      setError(err.message);
      showNotification("Error updating quantity", "error");
    }
  };

  // Remove item from cart
  const removeItem = async (bookId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please login to manage cart", "info");
        return;
      }

      const response = await fetch(
        "https://localhost:7133/api/Cart/RemoveCart",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.bookId !== bookId)
      );
      showNotification("Item removed from cart", "success");
    } catch (err) {
      setError(err.message);
      showNotification("Error removing item", "error");
    }
  };

  // Place order
  const placeOrder = async () => {
    try {
      setIsProcessingOrder(true);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please login to place an order", "info");
        setIsProcessingOrder(false);
        return;
      }

      // Prepare the order data
      const orderItems = cartItems.map((item) => ({
        bookId: item.bookId,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      const response = await fetch(
        "https://localhost:7133/api/Orders/CreateOrder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: orderItems,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const orderData = await response.json();

      // Clear cart after successful order
      setCartItems([]);

      // Show success notification
      showNotification(
        "Order placed successfully! Your claim code has been sent to your email.",
        "success"
      );

      // Redirect to orders page or show confirmation
      setTimeout(() => {
        window.location.href = "/orders";
      }, 3000);
    } catch (err) {
      setError(err.message);
      showNotification("Error placing order", "error");
    } finally {
      setIsProcessingOrder(false);
    }
  };

  // Show notification
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

  // Calculate total price - fixed to match the actual data structure
  const calculateTotalPrice = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return 0;
    }

    return cartItems.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 0),
      0
    );
  };

  // Calculate discount
  const calculateDiscount = () => {
    const totalPrice = calculateTotalPrice();

    // Apply 5% discount for orders with 5 or more books
    const totalQuantity = Array.isArray(cartItems)
      ? cartItems.reduce((total, item) => total + (item.quantity || 0), 0)
      : 0;

    if (totalQuantity >= 5) {
      return totalPrice * 0.05;
    }

    return 0;
  };

  // Final price after discount
  const finalPrice = calculateTotalPrice() - calculateDiscount();

  // Calculate total number of books in cart
  const totalBooks = cartItems.reduce(
    (total, item) => total + (item.quantity || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
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
        </div>
      )}

      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Back to shopping link */}
        <a
          href="/home"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Continue Shopping
        </a>

        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="mr-3" size={28} /> Your Shopping Cart
          </h1>
          {cartItems.length > 0 && (
            <div className="text-gray-600 bg-gray-200 px-3 py-1 rounded-full text-sm font-medium">
              {totalBooks} {totalBooks === 1 ? "item" : "items"}
            </div>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-8 lg:mb-0">
              {/* Cart content */}
              {isLoading ? (
                <div className="py-16 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading your cart...</p>
                </div>
              ) : error ? (
                <div className="py-16 text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-500 mb-2">Error loading your cart</p>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : !Array.isArray(cartItems) || cartItems.length === 0 ? (
                <div className="py-16 text-center">
                  <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-medium text-gray-700 mb-3">
                    Your cart is empty
                  </h2>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Looks like you haven't added any books to your cart yet.
                    Start exploring our collection!
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Browse Books
                  </a>
                </div>
              ) : (
                <>
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700">Cart Items</h3>
                  </div>

                  <ul className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li
                        key={item.bookId}
                        className="p-4 sm:p-6 hover:bg-gray-50"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          {/* Book Image and Info */}
                          <div className="flex-shrink-0 flex items-center mb-4 sm:mb-0">
                            <div className="h-24 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                              <img
                                src={
                                  item.imageUrl ||
                                  "https://via.placeholder.com/150x200?text=No+Cover"
                                }
                                alt={item.title || "Book cover"}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/150x200?text=No+Cover";
                                }}
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <h4 className="text-base sm:text-lg font-medium text-gray-900 line-clamp-2">
                                {item.title || "Unknown Book"}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                By {item.author || "Unknown Author"}
                              </p>
                              <p className="text-base font-medium text-gray-900 mt-2 sm:hidden">
                                ${(item.price || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Price, Quantity and Action Buttons on larger screens */}
                          <div className="sm:ml-auto flex flex-col sm:flex-row sm:items-center sm:space-x-8">
                            {/* Price */}
                            <div className="hidden sm:block">
                              <p className="text-base font-medium text-gray-900">
                                ${(item.price || 0).toFixed(2)}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center bg-gray-100 rounded-lg p-1 mt-3 sm:mt-0 w-max">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.bookId,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                                className="text-gray-500 hover:text-gray-700 p-1 transition-colors rounded-md hover:bg-gray-200"
                                aria-label="Decrease quantity"
                              >
                                <MinusCircle size={18} />
                              </button>
                              <span className="w-8 text-center font-medium text-gray-800">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.bookId, item.quantity + 1)
                                }
                                className="text-gray-500 hover:text-gray-700 p-1 transition-colors rounded-md hover:bg-gray-200"
                                aria-label="Increase quantity"
                              >
                                <PlusCircle size={18} />
                              </button>
                            </div>

                            {/* Total for this item */}
                            <div className="text-base font-medium text-gray-900 mt-3 sm:mt-0">
                              $
                              {(
                                (item.price || 0) * (item.quantity || 0)
                              ).toFixed(2)}
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeItem(item.bookId)}
                              className="text-red-500 hover:text-red-700 transition-colors mt-4 sm:mt-0 self-end sm:self-center"
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Order Summary Section */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1">
              <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 sticky top-8">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700">Order Summary</h3>
                </div>

                <div className="p-6">
                  {/* Subtotal */}
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ${calculateTotalPrice().toFixed(2)}
                    </span>
                  </div>

                  {/* Discount */}
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between mb-3 text-green-600">
                      <span className="flex items-center">
                        <Tag size={16} className="mr-1" />
                        <span>Discount (5% for 5+ books)</span>
                      </span>
                      <span>-${calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}

                  {/* Shipping - Free */}
                  <div className="flex justify-between mb-3 text-gray-600">
                    <span className="flex items-center">
                      <Truck size={16} className="mr-1" />
                      <span>Store Pickup</span>
                    </span>
                    <span>Free</span>
                  </div>

                  {/* Total Line */}
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-900 font-bold text-lg">
                        Total
                      </span>
                      <span className="text-gray-900 font-bold text-xl">
                        ${finalPrice.toFixed(2)}
                      </span>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={placeOrder}
                      disabled={isProcessingOrder}
                      className={`w-full ${
                        isProcessingOrder
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors`}
                    >
                      {isProcessingOrder ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2" size={20} />
                          Place Order
                        </>
                      )}
                    </button>

                    {/* Pickup Information */}
                    <div className="mt-4 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg flex items-start">
                      <Info
                        size={16}
                        className="mr-2 text-blue-500 flex-shrink-0 mt-0.5"
                      />
                      <span>
                        In-store pickup only. You'll receive a claim code via
                        email after checkout.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookCart;
