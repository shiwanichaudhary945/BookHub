import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Heart,
  ShoppingBag,
  AlertCircle,
  Trash2,
  ShoppingCart,
  BookOpen,
  Search,
  BookOpenCheck,
  ArrowRight,
  ChevronRight,
  X,
  CheckCircle,
  Info,
  ArrowLeftRight,
  Bookmark,
  Grid,
  List,
  Filter,
} from "lucide-react";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [sortOption, setSortOption] = useState("date-desc"); // default sort by date added descending
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch wishlist items
  useEffect(() => {
    const fetchWishlistItems = async () => {
      try {
        setIsLoading(true);

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          setWishlistItems([]);
          setFilteredItems([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          "https://localhost:7133/api/Wishlist/GetBookMarks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            // Not an error, just an empty wishlist
            setWishlistItems([]);
            setFilteredItems([]);
          } else {
            throw new Error("Failed to fetch wishlist items");
          }
        } else {
          const result = await response.json();

          // Check if result has the expected structure
          if (result.isSuccess && Array.isArray(result.data.$values)) {
            setWishlistItems(result.data.$values);
            setFilteredItems(result.data.$values);
          } else {
            console.warn("Unexpected API response format:", result);
            setWishlistItems([]);
            setFilteredItems([]);
          }
        }
      } catch (err) {
        setError(err.message);
        showNotification("Error loading wishlist", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistItems();
  }, []);

  // Remove from wishlist
  const removeFromWishlist = async (bookId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please login to manage wishlist", "info");
        return;
      }

      setIsProcessing(true);

      const response = await fetch(
        `https://localhost:7133/api/Wishlist/RemoveBookMark/${bookId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove item from wishlist");
      }

      // Update local state
      const updatedItems = wishlistItems.filter(
        (item) => item.bookId !== bookId
      );
      setWishlistItems(updatedItems);
      setFilteredItems(
        searchTerm
          ? updatedItems.filter(
              (item) =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.bookTitle
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                item.bookAuthor
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase())
            )
          : updatedItems
      );

      showNotification("Item removed from wishlist", "success");
    } catch (err) {
      setError(err.message);
      showNotification("Error removing item", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add to cart
  const addToCart = async (bookId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please login to add items to cart", "info");
        return;
      }

      setIsProcessing(true);

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
            quantity: 1,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      showNotification("Item added to cart successfully", "success");
    } catch (err) {
      setError(err.message);
      showNotification("Error adding to cart", "error");
    } finally {
      setIsProcessing(false);
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

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (!term.trim()) {
      setFilteredItems(sortItems(wishlistItems, sortOption));
      return;
    }

    const filtered = wishlistItems.filter(
      (item) =>
        item.title?.toLowerCase().includes(term.toLowerCase()) ||
        item.author?.toLowerCase().includes(term.toLowerCase()) ||
        item.bookTitle?.toLowerCase().includes(term.toLowerCase()) ||
        item.bookAuthor?.toLowerCase().includes(term.toLowerCase())
    );

    setFilteredItems(sortItems(filtered, sortOption));
  };

  // Sort items function
  const sortItems = (items, option) => {
    if (!Array.isArray(items)) return [];

    const itemsCopy = [...items];

    switch (option) {
      case "price-asc":
        return itemsCopy.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-desc":
        return itemsCopy.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "title-asc":
        return itemsCopy.sort((a, b) => {
          const titleA = (a.bookTitle || a.title || "").toLowerCase();
          const titleB = (b.bookTitle || b.title || "").toLowerCase();
          return titleA.localeCompare(titleB);
        });
      case "title-desc":
        return itemsCopy.sort((a, b) => {
          const titleA = (a.bookTitle || a.title || "").toLowerCase();
          const titleB = (b.bookTitle || b.title || "").toLowerCase();
          return titleB.localeCompare(titleA);
        });
      case "date-desc":
      default:
        // Assuming most recently added is first, which is the default order
        return itemsCopy;
    }
  };

  // Handle sort change
  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);
    setFilteredItems(sortItems(filteredItems, option));
  };

  // Add all to cart
  const addAllToCart = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please login to add items to cart", "info");
        return;
      }

      setIsProcessing(true);

      // Process items sequentially to avoid overwhelming the server
      for (const item of filteredItems) {
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
              bookId: item.bookId,
              quantity: 1,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to add ${item.bookTitle || "item"} to cart`);
        }
      }

      showNotification(
        `${filteredItems.length} items added to cart successfully`,
        "success"
      );

      // Redirect to cart after adding all items
      setTimeout(() => {
        window.location.href = "/cart";
      }, 1500);
    } catch (err) {
      setError(err.message);
      showNotification("Error adding items to cart", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  // Get book title based on data structure
  const getBookTitle = (item) => item.bookTitle || item.title || "Unknown Book";

  // Get book author based on data structure
  const getBookAuthor = (item) =>
    item.bookAuthor || item.author || "Unknown Author";

  // Get book image based on data structure
  const getBookImage = (item) =>
    item.bookPhoto ||
    item.imageUrl ||
    "https://via.placeholder.com/150x200?text=No+Cover";

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
        {/* Top section with breadcrumbs */}
        <div className="mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <a href="/home" className="hover:text-blue-600 transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-700 font-medium">My Wishlist</span>
          </div>
        </div>

        {/* Header with title and action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-center">
            <div className="bg-red-50 p-2 rounded-full mr-3">
              <Heart className="text-red-500" size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">My Wishlist</h1>
              {!isLoading && !error && Array.isArray(wishlistItems) && (
                <p className="text-sm text-gray-500 mt-1">
                  {wishlistItems.length} saved{" "}
                  {wishlistItems.length === 1 ? "item" : "items"}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/home"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium transition-colors hover:bg-gray-50"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Books
            </a>

            <a
              href="/cart"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium transition-colors hover:bg-gray-50"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Cart
            </a>
          </div>
        </div>

        {/* Search and filters section (only shown when there are items) */}
        {!isLoading &&
          !error &&
          Array.isArray(filteredItems) &&
          filteredItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                {/* Search box */}
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search your wishlist..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilteredItems(sortItems(wishlistItems, sortOption));
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Sort and view options */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="relative flex-shrink-0 w-36 md:w-48">
                    <select
                      value={sortOption}
                      onChange={handleSortChange}
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg appearance-none bg-white"
                    >
                      <option value="date-desc">Recently Added</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="title-asc">Title: A to Z</option>
                      <option value="title-desc">Title: Z to A</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <Filter size={16} />
                    </div>
                  </div>

                  {/* View mode toggle */}
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded ${
                        viewMode === "grid"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      title="Grid view"
                    >
                      <Grid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded ${
                        viewMode === "list"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      title="List view"
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Main content area */}
        {isLoading ? (
          <div className="py-16 text-center bg-white rounded-xl shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-white rounded-xl shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-2">Error loading your wishlist</p>
            <p className="text-gray-600 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        ) : !Array.isArray(filteredItems) || filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm py-16 px-4">
            <div className="max-w-md mx-auto text-center">
              <div className="relative mb-8">
                {searchTerm && wishlistItems.length > 0 ? (
                  <div className="flex items-center justify-center w-24 h-24 mx-auto bg-yellow-50 rounded-full mb-4">
                    <Search className="h-10 w-10 text-yellow-500" />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-red-50 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Heart
                      className="h-10 w-10 text-red-400"
                      fill="currentColor"
                    />
                  </div>
                )}
                <Bookmark className="absolute bottom-0 right-1/2 translate-x-12 translate-y-1/3 h-10 w-10 text-blue-500 bg-white rounded-full p-2 shadow-md" />
              </div>

              <h2 className="text-2xl font-medium text-gray-800 mb-3">
                {searchTerm && wishlistItems.length > 0
                  ? "No matching items found"
                  : "Your wishlist is empty"}
              </h2>
              <p className="text-gray-600 mb-8">
                {searchTerm && wishlistItems.length > 0
                  ? `We couldn't find any items matching "${searchTerm}" in your wishlist.`
                  : "Save items to your wishlist by clicking the heart icon on books you're interested in reading later."}
              </p>

              <div className="space-y-3">
                {searchTerm && wishlistItems.length > 0 ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilteredItems(sortItems(wishlistItems, sortOption));
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View All Wishlist Items
                  </button>
                ) : (
                  <a
                    href="/home"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Explore Books
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Wishlist items display - Grid or List view */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              {viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div
                      key={item.bookId}
                      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:border-blue-200 flex flex-col h-full"
                    >
                      {/* Book Cover */}
                      <div className="relative pt-[60%] overflow-hidden bg-gray-100">
                        <img
                          src={getBookImage(item)}
                          alt={getBookTitle(item)}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/150x200?text=No+Cover";
                          }}
                        />
                        <div className="absolute top-0 right-0 p-2">
                          <button
                            onClick={() => removeFromWishlist(item.bookId)}
                            disabled={isProcessing}
                            className="p-1.5 bg-white bg-opacity-90 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                            title="Remove from wishlist"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Book Details */}
                      <div className="p-4 flex-grow flex flex-col">
                        <h3 className="text-lg font-medium text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {getBookTitle(item)}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          By {getBookAuthor(item)}
                        </p>

                        <div className="mt-auto">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-blue-600 font-medium text-lg">
                              ${(item.price || 0).toFixed(2)}
                            </p>
                            {(item.discountPercentage > 0 ||
                              item.discountPercent > 0) && (
                              <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                                {item.discountPercentage ||
                                  item.discountPercent ||
                                  0}
                                % OFF
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => addToCart(item.bookId)}
                            disabled={isProcessing}
                            className={`w-full py-2.5 px-4 rounded-lg flex items-center justify-center transition-colors ${
                              isProcessing
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {isProcessing ? (
                              <span className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </span>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <div
                      key={item.bookId}
                      className="py-4 first:pt-0 last:pb-0 group hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Book Cover */}
                        <div className="flex-shrink-0 w-20 h-28 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={getBookImage(item)}
                            alt={getBookTitle(item)}
                            className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/150x200?text=No+Cover";
                            }}
                          />
                        </div>

                        {/* Book Details */}
                        <div className="flex-grow">
                          <h3 className="text-lg font-medium text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                            {getBookTitle(item)}
                          </h3>
                          <p className="text-sm text-gray-600 mb-1">
                            By {getBookAuthor(item)}
                          </p>

                          <div className="flex items-center mb-2">
                            <p className="text-blue-600 font-medium">
                              ${(item.price || 0).toFixed(2)}
                            </p>
                            {(item.discountPercentage > 0 ||
                              item.discountPercent > 0) && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                                {item.discountPercentage ||
                                  item.discountPercent ||
                                  0}
                                % OFF
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => addToCart(item.bookId)}
                            disabled={isProcessing}
                            className={`py-2 px-4 rounded-lg flex items-center transition-colors ${
                              isProcessing
                                ? "bg-gray-300 cursor-not-allowed text-gray-600"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {isProcessing ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add to Cart
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => removeFromWishlist(item.bookId)}
                            disabled={isProcessing}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary and "Add All to Cart" section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-gray-600 text-center sm:text-left">
                  <p>
                    <span className="font-medium text-lg text-gray-800">
                      {filteredItems.length}
                    </span>{" "}
                    {filteredItems.length === 1 ? "book" : "books"} in your
                    wishlist
                    {searchTerm &&
                      wishlistItems.length !== filteredItems.length && (
                        <span className="text-sm text-gray-500">
                          {" "}
                          (filtered from {wishlistItems.length})
                        </span>
                      )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 flex items-center justify-center sm:justify-start">
                    <Info size={14} className="mr-1" />
                    Items in your wishlist are saved for later and won't be
                    reserved.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href="/cart"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1.5" />
                    View Cart
                  </a>

                  <button
                    onClick={addAllToCart}
                    disabled={isProcessing || filteredItems.length === 0}
                    className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                      isProcessing
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="mr-2 h-5 w-5" />
                        Add All to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Wishlist;
