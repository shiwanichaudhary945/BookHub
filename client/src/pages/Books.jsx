import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Heart,
  ShoppingCart,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Book,
  RefreshCw,
  XCircle,
  ArrowUp,
  Loader,
  Bookmark,
  Tag,
  DollarSign,
  Menu,
  User,
  BookText,
  Languages,
  ListFilter,
  FileQuestion,
} from "lucide-react";

const Books = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [noResults, setNoResults] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    pageSize: 12,
    totalItems: 0,
  });
  const [initialLoad, setInitialLoad] = useState(true);

  // Extract initial filters from URL query params
  const getInitialFiltersFromURL = () => {
    const params = new URLSearchParams(location.search);
    return {
      genre: params.get("genre") || "",
      author: params.get("author") || "",
      publisher: params.get("publisher") || "",
      format: params.get("format") || "",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      language: params.get("language") || "",
      onSale: params.get("onSale") === "true",
      inLibrary: params.get("inLibrary") === "true",
      inStock: params.get("inStock") === "true",
    };
  };

  const [filters, setFilters] = useState(getInitialFiltersFromURL());
  const [searchQuery, setSearchQuery] = useState(
    new URLSearchParams(location.search).get("search") || ""
  );
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sortBy, setSortBy] = useState(
    new URLSearchParams(location.search).get("sortBy") || "newest"
  );
  const [sortOrder, setSortOrder] = useState(
    new URLSearchParams(location.search).get("sortOrder") || "desc"
  );
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [scrollToTopVisible, setScrollToTopVisible] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState({});
  const [isTogglingWishlist, setIsTogglingWishlist] = useState({});
  const [filterCount, setFilterCount] = useState(0);
  const [activeFilters, setActiveFilters] = useState([]);

  // Update URL with current filters and search
  useEffect(() => {
    const queryParams = new URLSearchParams();

    if (searchQuery) queryParams.set("search", searchQuery);
    if (filters.genre) queryParams.set("genre", filters.genre);
    if (filters.author) queryParams.set("author", filters.author);
    if (filters.publisher) queryParams.set("publisher", filters.publisher);
    if (filters.format) queryParams.set("format", filters.format);
    if (filters.minPrice) queryParams.set("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.set("maxPrice", filters.maxPrice);
    if (filters.language) queryParams.set("language", filters.language);
    if (filters.onSale) queryParams.set("onSale", "true");
    if (filters.inLibrary) queryParams.set("inLibrary", "true");
    if (filters.inStock) queryParams.set("inStock", "true");
    if (sortBy !== "newest") queryParams.set("sortBy", sortBy);
    if (sortOrder !== "desc") queryParams.set("sortOrder", sortOrder);
    if (pagination.currentPage > 1)
      queryParams.set("page", pagination.currentPage.toString());

    const newURL = `${location.pathname}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    window.history.replaceState({}, "", newURL);

    // Count active filters
    let count = 0;
    let active = [];

    if (filters.genre) {
      count++;
      active.push({ name: "Genre", value: filters.genre });
    }
    if (filters.author) {
      count++;
      active.push({ name: "Author", value: filters.author });
    }
    if (filters.publisher) {
      count++;
      active.push({ name: "Publisher", value: filters.publisher });
    }
    if (filters.format) {
      count++;
      active.push({ name: "Format", value: filters.format });
    }
    if (filters.language) {
      count++;
      active.push({ name: "Language", value: filters.language });
    }
    if (filters.minPrice || filters.maxPrice) {
      count++;
      active.push({
        name: "Price",
        value: `${filters.minPrice ? `$${filters.minPrice}` : "$0"} - ${
          filters.maxPrice ? `$${filters.maxPrice}` : "∞"
        }`,
      });
    }
    if (filters.onSale) {
      count++;
      active.push({ name: "On Sale", value: "Yes" });
    }
    if (filters.inLibrary) {
      count++;
      active.push({ name: "In Library", value: "Yes" });
    }
    if (filters.inStock) {
      count++;
      active.push({ name: "In Stock", value: "Yes" });
    }
    if (searchQuery) {
      count++;
      active.push({ name: "Search", value: searchQuery });
    }

    setFilterCount(count);
    setActiveFilters(active);
  }, [
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    pagination.currentPage,
    location.pathname,
  ]);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      fetchCartAndWishlist(token);
    }

    // Reset noResults state properly on component mount
    if (initialLoad) {
      setNoResults(false);
      setInitialLoad(false);
    }

    // Detect page from URL
    const urlParams = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(urlParams.get("page")) || 1;

    if (pageFromUrl !== pagination.currentPage) {
      setPagination((prev) => ({ ...prev, currentPage: pageFromUrl }));
    } else {
      // This will always fetch books, and we've made sure noResults is properly initialized
      fetchBooks(pageFromUrl, pagination.pageSize);
    }

    // Add scroll event listener for the scroll-to-top button
    const handleScroll = () => {
      setScrollToTopVisible(window.pageYOffset > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.search]); // Make sure this effect only runs when the URL changes

  // Refetch when page changes
  useEffect(() => {
    fetchBooks(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage, pagination.pageSize]);

  // Fetch Books with pagination and filters
  const fetchBooks = async (page, pageSize) => {
    try {
      setIsLoading(true);
      setError(null);
      setNoResults(false); // Reset noResults state at the start of fetching

      // Build query string with pagination and filters
      let queryParams = new URLSearchParams({
        page,
        pageSize,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.genre && { genre: filters.genre }),
        ...(filters.author && { author: filters.author }),
        ...(filters.publisher && { publisher: filters.publisher }),
        ...(filters.format && { format: filters.format }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.language && { language: filters.language }),
        ...(filters.onSale && { onSale: true }),
        ...(filters.inLibrary && { inLibrary: true }),
        ...(filters.inStock && { inStock: true }),
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      // Use the correct endpoint as shown in the screenshot
      const response = await fetch(
        `https://localhost:7133/api/Book/SearchBooks?${queryParams.toString()}`,
        {
          headers: {
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        // Check if the error is because of server issues or just no results
        if (response.status === 404) {
          setNoResults(true);
          setBooks([]);
          setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }));
          return;
        }
        throw new Error(`Failed to fetch books (Status: ${response.status})`);
      }

      const data = await response.json();

      if (!data.isSuccess) {
        setNoResults(true);
        setBooks([]);
        setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }));
        return;
      }

      try {
        let hasBooks = false;

        // Handle different response formats - the API might return data in different structures
        if (data.isSuccess && data.data && Array.isArray(data.data.$values)) {
          // Format 1: Direct array in $values
          const bookList = data.data.$values;
          setBooks(bookList);
          hasBooks = bookList.length > 0;

          // If pagination info is available in response
          if (data.data.currentPage && data.data.totalPages) {
            setPagination({
              currentPage: data.data.currentPage,
              totalPages: data.data.totalPages,
              pageSize: data.data.pageSize || pagination.pageSize,
              totalItems: data.data.totalItems || bookList.length,
            });
          }
        } else if (
          data.isSuccess &&
          data.data &&
          data.data.items &&
          Array.isArray(data.data.items.$values)
        ) {
          // Format 2: Items object with $values array
          const bookList = data.data.items.$values;
          setBooks(bookList);
          hasBooks = bookList.length > 0;

          setPagination({
            currentPage: data.data.currentPage,
            totalPages: data.data.totalPages,
            pageSize: data.data.pageSize,
            totalItems: data.data.totalItems,
          });
        } else if (data.isSuccess && Array.isArray(data.data)) {
          // Format 3: Direct array in data
          const bookList = data.data;
          setBooks(bookList);
          hasBooks = bookList.length > 0;

          // If there's no pagination info, we assume it's all in one page
          setPagination({
            currentPage: 1,
            totalPages: 1,
            pageSize: bookList.length,
            totalItems: bookList.length,
          });
        } else {
          // No books found - this is a valid state, not an error
          setNoResults(true);
          setBooks([]);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            pageSize: pagination.pageSize,
            totalItems: 0,
          });
        }

        // Set noResults based on whether books were found
        setNoResults(!hasBooks);
      } catch (parseError) {
        console.error("Error parsing book data:", parseError);
        setNoResults(true);
        setBooks([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      // Only show error notification for real errors, not just "no results"
      if (!err.message.includes("404")) {
        showNotification(`Error loading books: ${err.message}`, "error");
      }
    } finally {
      setIsLoading(false);
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
            Accept: "*/*",
          },
        }
      );

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        if (cartData.isSuccess && Array.isArray(cartData.data.$values)) {
          setCartItems(cartData.data.$values);
        }
      }

      // Fetch wishlist
      const wishlistResponse = await fetch(
        "https://localhost:7133/api/Wishlist/GetBookMarks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
        }
      );

      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        if (
          wishlistData.isSuccess &&
          Array.isArray(wishlistData.data.$values)
        ) {
          setWishlistItems(
            wishlistData.data.$values.map((item) => item.bookId)
          );
        }
      }
    } catch (error) {
      console.error("Error fetching cart/wishlist data:", error);
    }
  };

  // Add to cart handler
  const addToCart = async (book) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please login to add items to cart", "info");
        setTimeout(() => {
          navigate("/login", { state: { from: "/books" } });
        }, 2000);
        return;
      }

      // Set loading state for this specific book
      setIsAddingToCart((prev) => ({ ...prev, [book.bookId]: true }));

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
            bookId: book.bookId,
            quantity: 1,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      // Update local state
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (item) => item.bookId === book.bookId
        );
        if (existingItem) {
          return prevItems.map((item) =>
            item.bookId === book.bookId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return [...prevItems, { ...book, quantity: 1 }];
        }
      });

      showNotification(`"${book.title}" added to cart`, "success");
    } catch (err) {
      console.error(err);
      showNotification("Error adding to cart", "error");
    } finally {
      // Clear loading state
      setIsAddingToCart((prev) => ({ ...prev, [book.bookId]: false }));
    }
  };

  // Toggle wishlist handler
  const toggleWishlist = async (bookId, title) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please login to manage wishlist", "info");
        setTimeout(() => {
          navigate("/login", { state: { from: "/books" } });
        }, 2000);
        return;
      }

      // Set loading state for this specific wishlist action
      setIsTogglingWishlist((prev) => ({ ...prev, [bookId]: true }));

      const isInWishlist = wishlistItems.includes(bookId);

      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(
          `https://localhost:7133/api/Wishlist/RemoveBookMark/${bookId}`,
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
          throw new Error("Failed to remove from wishlist");
        }

        setWishlistItems((prev) => prev.filter((id) => id !== bookId));
        showNotification(`"${title}" removed from wishlist`, "info");
      } else {
        // Add to wishlist
        const response = await fetch(
          `https://localhost:7133/api/Wishlist/AddToBookMark/${bookId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ bookId }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to add to wishlist");
        }

        setWishlistItems((prev) => [...prev, bookId]);
        showNotification(`"${title}" added to wishlist`, "success");
      }
    } catch (err) {
      console.error(err);
      showNotification("Error updating wishlist", "error");
    } finally {
      // Clear loading state
      setIsTogglingWishlist((prev) => ({ ...prev, [bookId]: false }));
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo(0, 0);
  };

  // Handle filter toggle
  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Apply filters
  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchBooks(1, pagination.pageSize);
    if (window.innerWidth < 768) {
      setIsFilterOpen(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      genre: "",
      author: "",
      publisher: "",
      format: "",
      minPrice: "",
      maxPrice: "",
      language: "",
      onSale: false,
      inLibrary: false,
      inStock: false,
    });
    setSearchQuery("");
    setSortBy("newest");
    setSortOrder("desc");
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setNoResults(false);
    setTimeout(() => {
      fetchBooks(1, pagination.pageSize);
    }, 0);
  };

  // Remove single filter
  const removeFilter = (filterName) => {
    if (filterName === "Search") {
      setSearchQuery("");
    } else if (filterName === "Price") {
      setFilters((prev) => ({ ...prev, minPrice: "", maxPrice: "" }));
    } else if (filterName === "On Sale") {
      setFilters((prev) => ({ ...prev, onSale: false }));
    } else if (filterName === "In Library") {
      setFilters((prev) => ({ ...prev, inLibrary: false }));
    } else if (filterName === "In Stock") {
      setFilters((prev) => ({ ...prev, inStock: false }));
    } else {
      setFilters((prev) => ({ ...prev, [filterName.toLowerCase()]: "" }));
    }

    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setTimeout(() => {
      fetchBooks(1, pagination.pageSize);
    }, 0);
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchBooks(1, pagination.pageSize);
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

  // Handle scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Is book in cart
  const isBookInCart = (bookId) => {
    return cartItems.some((item) => item.bookId === bookId);
  };

  // Is book in wishlist
  const isBookInWishlist = (bookId) => {
    return wishlistItems.includes(bookId);
  };

  // Calculate discount price
  const calculateDiscountPrice = (price, discountPercentage) => {
    if (!discountPercentage) return price;
    return price - (price * discountPercentage) / 100;
  };

  // Check if a discount is active
  const isDiscountActive = (book) => {
    if (!book.onSale || !book.discountPercentage) return false;

    const now = new Date();
    const startDate = book.discountStartDate
      ? new Date(book.discountStartDate)
      : null;
    const endDate = book.discountEndDate
      ? new Date(book.discountEndDate)
      : null;

    if (startDate && endDate) {
      return now >= startDate && now <= endDate;
    }

    return true; // If no dates are specified but onSale is true
  };

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
            <AlertCircle className="mr-2 h-5 w-5" />
          )}
          <p>{notification.message}</p>
        </div>
      )}

      {/* Scroll to top button */}
      {scrollToTopVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} />
        </button>
      )}

      <div className="flex-grow container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <BookText className="mr-3" size={32} /> Browse Books
          </h1>
          <p className="text-gray-600 mt-2">
            Discover our collection of books across various genres and formats
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filter sidebar - hidden on mobile by default */}
          <div
            className={`md:w-72 flex-shrink-0 transition-all duration-300 ${
              isFilterOpen ? "block" : "hidden md:block"
            }`}
          >
            <div className="bg-white rounded-xl shadow-md p-5 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <ListFilter className="mr-2 h-5 w-5 text-indigo-600" /> Filter
                  Books
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center font-medium"
                >
                  <RefreshCw className="mr-1 h-4 w-4" /> Reset All
                </button>
              </div>

              {/* Genre Filter */}
              <div className="mb-5">
                <label
                  htmlFor="genre"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <Bookmark className="mr-2 h-4 w-4 text-indigo-500" /> Genre
                </label>
                <select
                  id="genre"
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={filters.genre}
                  onChange={(e) =>
                    setFilters({ ...filters, genre: e.target.value })
                  }
                >
                  <option value="">All Genres</option>
                  <option value="Fiction">Fiction</option>
                  <option value="Non-Fiction">Non-Fiction</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Romance">Romance</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Biography">Biography</option>
                  <option value="History">History</option>
                  <option value="Children">Children</option>
                  <option value="Science">Science</option>
                  <option value="Self-Help">Self-Help</option>
                </select>
              </div>

              {/* Author Filter */}
              <div className="mb-5">
                <label
                  htmlFor="author"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <User className="mr-2 h-4 w-4 text-indigo-500" /> Author
                </label>
                <input
                  type="text"
                  id="author"
                  placeholder="Author name"
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.author}
                  onChange={(e) =>
                    setFilters({ ...filters, author: e.target.value })
                  }
                />
              </div>

              {/* Publisher Filter */}
              <div className="mb-5">
                <label
                  htmlFor="publisher"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <Book className="mr-2 h-4 w-4 text-indigo-500" /> Publisher
                </label>
                <input
                  type="text"
                  id="publisher"
                  placeholder="Publisher name"
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={filters.publisher}
                  onChange={(e) =>
                    setFilters({ ...filters, publisher: e.target.value })
                  }
                />
              </div>

              {/* Format Filter */}
              <div className="mb-5">
                <label
                  htmlFor="format"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <BookText className="mr-2 h-4 w-4 text-indigo-500" /> Format
                </label>
                <select
                  id="format"
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={filters.format}
                  onChange={(e) =>
                    setFilters({ ...filters, format: e.target.value })
                  }
                >
                  <option value="">All Formats</option>
                  <option value="Hardcover">Hardcover</option>
                  <option value="Paperback">Paperback</option>
                  <option value="E-Book">E-Book</option>
                  <option value="Audiobook">Audiobook</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign className="mr-2 h-4 w-4 text-indigo-500" /> Price
                  Range
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Min"
                      className="w-full p-2.5 pl-7 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: e.target.value })
                      }
                    />
                  </div>
                  <span className="text-gray-500">-</span>
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Max"
                      className="w-full p-2.5 pl-7 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Language Filter */}
              <div className="mb-5">
                <label
                  htmlFor="language"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
                >
                  <Languages className="mr-2 h-4 w-4 text-indigo-500" />{" "}
                  Language
                </label>
                <select
                  id="language"
                  className="w-full p-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={filters.language}
                  onChange={(e) =>
                    setFilters({ ...filters, language: e.target.value })
                  }
                >
                  <option value="">All Languages</option>
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Russian">Russian</option>
                  <option value="Italian">Italian</option>
                </select>
              </div>

              {/* Checkboxes for additional filters */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <input
                    id="onSale"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={filters.onSale}
                    onChange={(e) =>
                      setFilters({ ...filters, onSale: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="onSale"
                    className="ml-2 block text-sm text-gray-700 flex items-center"
                  >
                    <Tag className="mr-1.5 h-3.5 w-3.5 text-red-500" /> On Sale
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="inLibrary"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={filters.inLibrary}
                    onChange={(e) =>
                      setFilters({ ...filters, inLibrary: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="inLibrary"
                    className="ml-2 block text-sm text-gray-700 flex items-center"
                  >
                    <BookOpen className="mr-1.5 h-3.5 w-3.5 text-blue-500" />{" "}
                    Available in Library
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="inStock"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={filters.inStock}
                    onChange={(e) =>
                      setFilters({ ...filters, inStock: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="inStock"
                    className="ml-2 block text-sm text-gray-700 flex items-center"
                  >
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-green-500" />{" "}
                    In Stock
                  </label>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={applyFilters}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm flex justify-center items-center"
              >
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & Sort Bar */}
            <div className="bg-white rounded-xl shadow-md p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Search Form */}
                <form
                  onSubmit={handleSearch}
                  className="flex flex-1 items-center"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search by title, author, or ISBN..."
                      className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    type="submit"
                    className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg shadow-sm"
                  >
                    <Search size={20} />
                  </button>
                </form>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={toggleFilters}
                  className="md:hidden flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm"
                >
                  <Filter className="mr-2 h-5 w-5" />
                  {isFilterOpen ? "Hide Filters" : "Show Filters"}
                </button>

                {/* Sort Controls */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <label
                      htmlFor="sortBy"
                      className="text-sm font-medium text-gray-700 mr-2 whitespace-nowrap hidden sm:inline"
                    >
                      Sort by:
                    </label>
                    <div className="relative inline-block">
                      <select
                        id="sortBy"
                        className="appearance-none pl-3 pr-8 py-2.5 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          setPagination((prev) => ({
                            ...prev,
                            currentPage: 1,
                          }));
                          setTimeout(
                            () => fetchBooks(1, pagination.pageSize),
                            0
                          );
                        }}
                      >
                        <option value="newest">Date Added</option>
                        <option value="price">Price</option>
                        <option value="title">Title</option>
                        <option value="author">Author</option>
                        <option value="publicationDate">
                          Publication Date
                        </option>
                      </select>
                      <ChevronDown className="absolute right-3 top-3 h-4 w-4 pointer-events-none text-gray-500" />
                    </div>
                  </div>

                  <div className="relative inline-block">
                    <select
                      id="sortOrder"
                      className="appearance-none pl-3 pr-8 py-2.5 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      value={sortOrder}
                      onChange={(e) => {
                        setSortOrder(e.target.value);
                        setPagination((prev) => ({ ...prev, currentPage: 1 }));
                        setTimeout(() => fetchBooks(1, pagination.pageSize), 0);
                      }}
                    >
                      <option value="asc">Ascending</option>
                      <option value="desc">Descending</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 pointer-events-none text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {filterCount > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 mr-1">
                    Active filters:
                  </span>
                  {activeFilters.map((filter, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center bg-indigo-50 text-indigo-800 rounded-full px-3 py-1 text-sm"
                    >
                      <span className="font-medium mr-1">{filter.name}:</span>{" "}
                      {filter.value}
                      <button
                        onClick={() => removeFilter(filter.name)}
                        className="ml-1.5 text-indigo-600 hover:text-indigo-800"
                        aria-label={`Remove ${filter.name} filter`}
                      >
                        <XCircle size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={resetFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800 ml-auto flex items-center font-medium"
                  >
                    <RefreshCw className="mr-1 h-3.5 w-3.5" /> Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Results Info */}
            {!isLoading && !error && !noResults && books.length > 0 && (
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-medium">
                    {pagination.totalItems === 0
                      ? 0
                      : (pagination.currentPage - 1) * pagination.pageSize + 1}
                    -
                    {Math.min(
                      pagination.currentPage * pagination.pageSize,
                      pagination.totalItems
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{pagination.totalItems}</span>{" "}
                  books
                </p>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="bg-white rounded-xl shadow-md p-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading books...</p>
              </div>
            )}

            {/* Error State - Only for real errors, not "no results" */}
            {error && !isLoading && !noResults && (
              <div className="bg-white rounded-xl shadow-md py-16 px-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 mb-2 font-medium text-lg">
                  Error loading books
                </p>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() =>
                    fetchBooks(pagination.currentPage, pagination.pageSize)
                  }
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No Results */}
            {(noResults || (!isLoading && !error && books.length === 0)) && (
              <div className="bg-white rounded-xl shadow-md py-16 px-8 text-center">
                <FileQuestion className="h-16 w-16 text-indigo-300 mx-auto mb-4" />
                <h2 className="text-2xl font-medium text-gray-700 mb-3">
                  No books found
                </h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                  {filterCount > 0
                    ? "We couldn't find any books that match your filters. Try adjusting your search criteria or removing some filters."
                    : "There are no books available at the moment. Please check back later."}
                </p>
                {filterCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm inline-flex items-center"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" /> Reset All Filters
                  </button>
                )}
              </div>
            )}

            {/* Books Grid */}
            {!isLoading && !error && !noResults && books.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                  <div
                    key={book.bookId}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-200"
                  >
                    <div className="relative h-64 overflow-hidden bg-gray-100">
                      {/* Book Cover */}
                      <img
                        src={
                          book.bookPhoto ||
                          "https://via.placeholder.com/400x600?text=No+Cover"
                        }
                        alt={book.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => navigate(`/books/${book.bookId}`)}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x600?text=No+Cover";
                        }}
                      />

                      {/* Wishlist Icon */}
                      <button
                        onClick={() => toggleWishlist(book.bookId, book.title)}
                        disabled={isTogglingWishlist[book.bookId]}
                        className={`absolute top-2 right-2 p-2 rounded-full ${
                          isTogglingWishlist[book.bookId]
                            ? "bg-gray-200 text-gray-400"
                            : isBookInWishlist(book.bookId)
                            ? "bg-red-100 text-red-500"
                            : "bg-white text-gray-400 hover:text-red-500"
                        } transition-colors shadow-sm`}
                        title={
                          isBookInWishlist(book.bookId)
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        {isTogglingWishlist[book.bookId] ? (
                          <Loader size={20} className="animate-spin" />
                        ) : (
                          <Heart
                            size={20}
                            fill={
                              isBookInWishlist(book.bookId)
                                ? "currentColor"
                                : "none"
                            }
                          />
                        )}
                      </button>

                      {/* Discount Badge */}
                      {isDiscountActive(book) && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          {book.discountPercentage}% OFF
                        </div>
                      )}

                      {/* Library Badge */}
                      {book.isAvailableInLibrary && (
                        <div className="absolute bottom-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center">
                          <BookOpen size={14} className="mr-1" /> Library
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {/* Title and Author */}
                      <h3
                        className="font-bold text-gray-800 text-lg mb-1 line-clamp-2 hover:text-indigo-600 cursor-pointer transition-colors"
                        onClick={() => navigate(`/book/${book.bookId}`)}
                      >
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                        {book.author}
                      </p>

                      {/* Price with discount if applicable */}
                      <div className="flex items-baseline mb-4">
                        {isDiscountActive(book) ? (
                          <>
                            <span className="text-xl font-bold text-gray-800">
                              $
                              {calculateDiscountPrice(
                                book.price,
                                book.discountPercentage
                              ).toFixed(2)}
                            </span>
                            <span className="ml-2 text-sm text-gray-500 line-through">
                              ${book.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-gray-800">
                            ${book.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/books/${book.bookId}`)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => addToCart(book)}
                          disabled={
                            book.stock <= 0 || isAddingToCart[book.bookId]
                          }
                          className={`flex-1 ${
                            book.stock <= 0
                              ? "bg-gray-300 cursor-not-allowed"
                              : isAddingToCart[book.bookId]
                              ? "bg-indigo-400"
                              : isBookInCart(book.bookId)
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          } text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center shadow-sm`}
                        >
                          {book.stock <= 0 ? (
                            "Out of Stock"
                          ) : isAddingToCart[book.bookId] ? (
                            <>
                              <Loader size={16} className="mr-1 animate-spin" />{" "}
                              Adding...
                            </>
                          ) : isBookInCart(book.bookId) ? (
                            <>
                              <CheckCircle size={16} className="mr-1" /> In Cart
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={16} className="mr-1" /> Add to
                              Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination - Only show when we have results and more than one page */}
            {!isLoading &&
              !error &&
              !noResults &&
              books.length > 0 &&
              pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center p-1.5">
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={pagination.currentPage === 1}
                      className={`px-3 py-2 rounded-lg ${
                        pagination.currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      } transition-colors`}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    {/* Page Numbers */}
                    {(() => {
                      const pages = [];
                      let startPage, endPage;

                      if (pagination.totalPages <= 5) {
                        // Less than 5 pages, show all
                        startPage = 1;
                        endPage = pagination.totalPages;
                      } else if (pagination.currentPage <= 3) {
                        // Near the start
                        startPage = 1;
                        endPage = 5;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        // Near the end
                        startPage = pagination.totalPages - 4;
                        endPage = pagination.totalPages;
                      } else {
                        // Somewhere in the middle
                        startPage = pagination.currentPage - 2;
                        endPage = pagination.currentPage + 2;
                      }

                      // Ensure startPage is never less than 1
                      startPage = Math.max(1, startPage);
                      // Ensure endPage is never greater than totalPages
                      endPage = Math.min(pagination.totalPages, endPage);

                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`h-10 w-10 mx-0.5 rounded-lg ${
                              pagination.currentPage === i
                                ? "bg-indigo-600 text-white"
                                : "text-gray-700 hover:bg-gray-100"
                            } transition-colors`}
                          >
                            {i}
                          </button>
                        );
                      }

                      return pages;
                    })()}

                    {/* Next Page Button */}
                    <button
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      className={`px-3 py-2 rounded-lg ${
                        pagination.currentPage === pagination.totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-100"
                      } transition-colors`}
                      aria-label="Next page"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Books;
