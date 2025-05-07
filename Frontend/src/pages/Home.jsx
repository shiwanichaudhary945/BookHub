import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/BookCard";
import BookDetailsModal from "../components/BookDetailsModal";

const Home = () => {
  const navigate = useNavigate();

  // Book states
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Modal states
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cart and Wishlist states
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Fetch books with pagination
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://localhost:7133/api/Book/BookPagination?page=${currentPage}&pageSize=12`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }

        const data = await response.json();
        setBooks(data.items || []);
        setTotalPages(data.totalPages || 1);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isSearching) {
      fetchBooks();
    }
  }, [currentPage, isSearching]);

  // Fetch cart on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          return; // Not logged in
        }

        const response = await fetch(
          "https://localhost:7133/api/Cart/GetCart",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await response.json();
        setCart(data.items || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, []);

  // Fetch wishlist on component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          return; // Not logged in
        }

        const response = await fetch(
          "https://localhost:7133/api/Wishlist/GetBookMarks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch wishlist");
        }

        const data = await response.json();
        setWishlist(data || []);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, []);

  // Add to cart function
  const handleAddToCart = async (bookId, quantity = 1) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        // Not logged in - redirect to login
        showNotification("Please login to add items to your cart", "warning");
        navigate("/login", { state: { returnUrl: "/" } });
        return;
      }

      const response = await fetch(
        "https://localhost:7133/api/Cart/AddInCart",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookId: bookId,
            quantity: quantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      // Update local cart state
      const bookToAdd =
        books.find((book) => book.id === bookId) ||
        searchResults.find((book) => book.id === bookId);

      if (bookToAdd) {
        const existingCartItem = cart.find((item) => item.bookId === bookId);

        if (existingCartItem) {
          setCart(
            cart.map((item) =>
              item.bookId === bookId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          );
        } else {
          setCart([
            ...cart,
            {
              bookId: bookId,
              book: bookToAdd,
              quantity: quantity,
            },
          ]);
        }
      }

      showNotification("Item added to cart successfully!", "success");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("Failed to add item to cart", "error");
    }
  };

  // Add to wishlist function
  const handleAddToWishlist = async (bookId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        // Not logged in - redirect to login
        showNotification(
          "Please login to add items to your wishlist",
          "warning"
        );
        navigate("/login", { state: { returnUrl: "/" } });
        return;
      }

      // Check if already in wishlist
      if (wishlist.some((item) => item.bookId === bookId)) {
        showNotification("This book is already in your wishlist", "info");
        return;
      }

      const response = await fetch(
        `https://localhost:7133/api/Wishlist/AddToBookMark/${bookId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add to wishlist");
      }

      // Update local wishlist state
      const bookToAdd =
        books.find((book) => book.id === bookId) ||
        searchResults.find((book) => book.id === bookId);

      if (bookToAdd) {
        setWishlist([
          ...wishlist,
          {
            bookId: bookId,
            book: bookToAdd,
          },
        ]);
      }

      showNotification("Item added to wishlist successfully!", "success");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      showNotification("Failed to add item to wishlist", "error");
    }
  };

  // Remove from wishlist function
  const handleRemoveFromWishlist = async (bookId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        return; // Not logged in
      }

      const response = await fetch(
        `https://localhost:7133/api/Wishlist/RemoveBookMark/${bookId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove from wishlist");
      }

      // Update local wishlist state
      setWishlist(wishlist.filter((item) => item.bookId !== bookId));

      showNotification("Item removed from wishlist", "success");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      showNotification("Failed to remove item from wishlist", "error");
    }
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      const response = await fetch(
        `https://localhost:7133/api/Book/SearchBooks?query=${encodeURIComponent(
          searchTerm
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to search books");
      }

      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      setError(error.message);
      console.error("Error searching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    setSearchResults([]);
  };

  // Modal functions
  const openBookDetails = (bookId) => {
    setSelectedBookId(bookId);
    setIsModalOpen(true);
  };

  const closeBookDetails = () => {
    setIsModalOpen(false);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Render pagination controls
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            currentPage === i
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-8">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &laquo;
        </button>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &lsaquo;
        </button>

        {pages}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &rsaquo;
        </button>
        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &raquo;
        </button>
      </div>
    );
  };

  // Check if a book is in wishlist
  const isInWishlist = (bookId) => {
    return wishlist.some((item) => item.bookId === bookId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded shadow-lg transition-opacity duration-300 ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : notification.type === "error"
              ? "bg-red-100 text-red-800 border-l-4 border-red-500"
              : notification.type === "warning"
              ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500"
              : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" && (
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {notification.type === "error" && (
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {notification.type === "warning" && (
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {notification.type === "info" && (
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 py-16 px-4 sm:px-6 lg:px-8 text-white text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to eBook</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Discover thousands of books across various genres. Start your reading
          journey today!
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mt-8">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for books by title, author, or genre..."
              className="w-full px-4 py-3 rounded-l-lg text-gray-800 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-indigo-800 px-6 py-3 rounded-r-lg hover:bg-indigo-700 transition duration-200"
            >
              Search
            </button>
          </form>
          {isSearching && (
            <button
              onClick={clearSearch}
              className="text-sm mt-2 text-white/80 hover:text-white underline"
            >
              Clear search and show all books
            </button>
          )}
        </div>
      </div>

      {/* Book List Section */}
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          {isSearching ? "Search Results" : "Featured Books"}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <>
            {isSearching && searchResults.length === 0 ? (
              <div className="text-center py-10">
                <h3 className="text-xl font-medium text-gray-700 mb-4">
                  No results found for "{searchTerm}"
                </h3>
                <p className="text-gray-500">
                  Try different keywords or browse our featured books
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {(isSearching ? searchResults : books).map((book) => (
                  <div key={book.id} className="relative group">
                    <div
                      className="h-full"
                      onClick={() => openBookDetails(book.id)}
                    >
                      <BookCard book={book} />
                    </div>

                    {/* Wishlist and Cart buttons */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {isInWishlist(book.id) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWishlist(book.id);
                          }}
                          className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors duration-200"
                          title="Remove from wishlist"
                        >
                          <svg
                            className="w-5 h-5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWishlist(book.id);
                          }}
                          className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors duration-200"
                          title="Add to wishlist"
                        >
                          <svg
                            className="w-5 h-5 text-gray-400 hover:text-red-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(book.id);
                        }}
                        className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors duration-200"
                        title="Add to cart"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400 hover:text-indigo-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isSearching && totalPages > 1 && renderPagination()}
          </>
        )}
      </div>

      {/* Book Details Modal */}
      <BookDetailsModal
        bookId={selectedBookId}
        isOpen={isModalOpen}
        onClose={closeBookDetails}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        isInWishlist={isInWishlist}
      />
    </div>
  );
};

export default Home;
