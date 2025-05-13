import React, { useState, useEffect, useRef } from "react";
import {
  BookOpenIcon,
  HeartIcon,
  ShoppingCartIcon,
  TabletIcon,
  XIcon,
  StarIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

// Custom Button component
const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  ...props
}) => {
  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  // Variant styles
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-white text-blue-600 hover:bg-gray-100",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  // Size styles
  const sizeStyles = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant] || ""} ${
    sizeStyles[size] || ""
  } ${className}`;

  return (
    <button className={combinedClassName} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

// Book card component
const BookCard = ({ book, onViewDetails }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
      <div className="relative h-64 bg-gray-100">
        {book.bookPhoto ? (
          <img
            src={book.bookPhoto}
            alt={book.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/api/placeholder/200/300";
            }}
          />
        ) : (
          <img
            src="/api/placeholder/200/300"
            alt="Book cover placeholder"
            className="w-full h-full object-cover"
          />
        )}
        {book.onSale && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold">
            {book.discountPercentage}% OFF
          </div>
        )}

        {/* Quick action buttons */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 flex justify-end space-x-1 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              showLoginNotification(
                "Please log in to add items to your wishlist"
              );
            }}
            className="p-1.5 bg-white rounded-full text-gray-800 hover:text-red-600"
            title="Add to wishlist"
          >
            <HeartIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              showLoginNotification("Please log in to add items to your cart");
            }}
            className="p-1.5 bg-white rounded-full text-gray-800 hover:text-blue-600"
            title="Add to cart"
          >
            <ShoppingCartIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 truncate">
          {book.title}
        </h3>
        <p className="text-gray-600 text-sm mb-2">{book.author}</p>
        <div className="flex justify-between items-center">
          <div>
            {book.onSale ? (
              <div className="flex items-center space-x-2">
                <span className="text-red-600 font-bold">
                  $
                  {(
                    book.price -
                    (book.price * book.discountPercentage) / 100
                  ).toFixed(2)}
                </span>
                <span className="text-gray-500 line-through text-sm">
                  ${book.price?.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="font-bold">${book.price?.toFixed(2)}</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(book)}
          >
            View
          </Button>
        </div>
      </div>
    </div>
  );
};

// Book details modal component
const BookDetailsModal = ({ book, onClose }) => {
  if (!book) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{book.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="w-full aspect-[2/3] bg-gray-200 rounded-md overflow-hidden">
                {book.bookPhoto ? (
                  <img
                    src={book.bookPhoto}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/api/placeholder/300/450";
                    }}
                  />
                ) : (
                  <img
                    src="/api/placeholder/300/450"
                    alt="Book cover placeholder"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="mt-4 flex flex-col space-y-2">
                {book.onSale ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl text-red-600 font-bold">
                      $
                      {(
                        book.price -
                        (book.price * book.discountPercentage) / 100
                      ).toFixed(2)}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ${book.price?.toFixed(2)}
                    </span>
                    <span className="bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                      {book.discountPercentage}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold">
                    ${book.price?.toFixed(2)}
                  </span>
                )}
                <div className="flex space-x-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Status: </span>
                    {book.stock > 0 ? (
                      <span className="text-green-600">
                        In Stock ({book.stock} available)
                      </span>
                    ) : (
                      <span className="text-red-600">Out of Stock</span>
                    )}
                  </div>
                </div>
                {book.isAvailableInLibrary && (
                  <div className="text-sm text-green-600">
                    Also available in physical library
                  </div>
                )}
                <div className="pt-2 flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 flex-1"
                    onClick={() =>
                      showLoginNotification(
                        "Please log in to add items to your wishlist"
                      )
                    }
                  >
                    <HeartIcon className="w-5 h-5" />
                    <span>Add to Wishlist</span>
                  </Button>
                  <Button
                    variant="primary"
                    className="flex items-center justify-center space-x-2 flex-1"
                    onClick={() =>
                      showLoginNotification(
                        "Please log in to add items to your cart"
                      )
                    }
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </Button>
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">About this Book</h3>
                  <p className="text-gray-700">
                    {book.description || "No description available."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <span className="text-gray-600 text-sm">Author:</span>
                    <p className="font-medium">{book.author}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Publisher:</span>
                    <p className="font-medium">{book.publisher}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">ISBN:</span>
                    <p className="font-medium">{book.isbn}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">
                      Publication Date:
                    </span>
                    <p className="font-medium">
                      {book.publicationDate &&
                        new Date(book.publicationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Genre:</span>
                    <p className="font-medium">{book.genre}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Language:</span>
                    <p className="font-medium">{book.language}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Format:</span>
                    <p className="font-medium">{book.format}</p>
                  </div>
                  {book.exclusiveEdition && (
                    <div>
                      <span className="text-gray-600 text-sm">Edition:</span>
                      <p className="font-medium">{book.exclusiveEdition}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Banner Announcements component
const BannerAnnouncement = ({ message }) => {
  return (
    <div className="bg-blue-600 text-white py-2 px-4 text-center">
      <p className="text-sm md:text-base">{message}</p>
    </div>
  );
};

// Search component
const SearchComponent = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search by title, author, ISBN..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Button
        type="submit"
        className="absolute right-0 top-0 rounded-l-none h-full"
      >
        Search
      </Button>
    </form>
  );
};

// Category tabs with animation
const CategoryTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "all", label: "All Books" },
    { id: "bestsellers", label: "Bestsellers" },
    { id: "new-releases", label: "New Releases" },
    { id: "deals", label: "Deals" },
  ];

  return (
    <div className="border-b border-gray-200">
      <div className="container mx-auto px-4 overflow-x-auto">
        <div className="flex space-x-4 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300 ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton
const SkeletonBookCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-64 bg-gray-200 animate-pulse"></div>
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-2/3"></div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
          <div className="h-8 bg-gray-200 rounded animate-pulse w-24"></div>
        </div>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = ({ title, description, buttonText, buttonLink }) => (
  <div className="text-center py-12 bg-gray-50 rounded-xl">
    <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">{description}</p>
    {buttonText && (
      <a
        href={buttonLink}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {buttonText} <ArrowRight className="ml-2 h-4 w-4" />
      </a>
    )}
  </div>
);

// Global notification function
let showToastGlobal = () => {};
const showLoginNotification = (message) => {
  showToastGlobal(message, "info");
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
};

// Main component
const Landing = () => {
  // State for books data
  const [books, setBooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for hero slideshow
  const [currentSlide, setCurrentSlide] = useState(0);

  // State for modal
  const [selectedBook, setSelectedBook] = useState(null);

  // State for active tab
  const [activeTab, setActiveTab] = useState("all");

  // State for notifications
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "", // success, error, info
  });

  // Hero slideshow content with optimized images
  const heroSlides = [
    {
      title: "Discover Your Next Favorite Book",
      text: "Browse our vast collection of bestsellers, new releases, and classics.",
      image:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
      cta: "Browse Collection",
    },
    {
      title: "Special Deals Every Week",
      text: "Enjoy exclusive discounts on selected books every week.",
      image:
        "https://images.unsplash.com/photo-1589998059171-988d887df646?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
      cta: "View Deals",
    },
    {
      title: "Join Our Reading Community",
      text: "Connect with fellow readers and discover new book recommendations.",
      image:
        "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80",
      cta: "Join Now",
    },
  ];

  // Refs for scroll sections
  const catalogRef = useRef(null);
  const featuresRef = useRef(null);

  // Make the showToast function available globally
  showToastGlobal = showNotification;

  // Auto-advance slideshow
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroSlides.length);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentSlide, heroSlides.length]);

  // Handle manual slideshow navigation
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prevSlide) => (prevSlide - 1 + heroSlides.length) % heroSlides.length
    );
  };

  // Load books data
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        // API base URL
        const API_BASE_URL = "https://localhost:7133";

        // Function to handle API requests with error handling
        const fetchWithErrorHandling = async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Error fetching from ${url}`);
            }
            return await response.json();
          } catch (error) {
            console.error(`Error with ${url}:`, error);
            return { data: { items: { $values: [] } } };
          }
        };

        // Fetch data based on active tab
        let booksEndpoint = `${API_BASE_URL}/api/Book/BookPagination?page=1&pageSize=8`;

        // Modify endpoint based on active tab
        switch (activeTab) {
          case "bestsellers":
            booksEndpoint = `${API_BASE_URL}/api/Book/BestSellers`;
            break;
          case "new-releases":
            booksEndpoint = `${API_BASE_URL}/api/Book/NewReleases`;
            break;
          case "deals":
            booksEndpoint = `${API_BASE_URL}/api/Book/BookPagination?page=1&pageSize=8&onSale=true`;
            break;
          default:
            // Use default endpoint for "all"
            break;
        }

        // Parallel fetching for efficiency
        const [booksData, newReleasesData, bestsellersData] = await Promise.all(
          [
            fetchWithErrorHandling(booksEndpoint),
            fetchWithErrorHandling(`${API_BASE_URL}/api/Book/NewReleases`),
            fetchWithErrorHandling(`${API_BASE_URL}/api/Book/BestSellers`),
          ]
        );

        // Update state with fetched data
        setBooks(booksData.data?.items?.$values || []);
        setNewReleases(newReleasesData.data?.$values || []);
        setBestsellers(bestsellersData.data?.$values || []);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [activeTab]);

  // Handle search
  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      showNotification(`Searching for "${searchTerm}"...`, "info");

      const API_BASE_URL = "https://localhost:7133";
      const response = await fetch(
        `${API_BASE_URL}/api/Book/SearchBooks?query=${encodeURIComponent(
          searchTerm
        )}`
      );

      if (response.ok) {
        const data = await response.json();
        setBooks(data.items?.$values || []);
      } else {
        showNotification("Search failed. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error searching books:", error);
      showNotification("An error occurred during search", "error");
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  function showNotification(message, type) {
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
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preload carousel images */}
      <div className="hidden">
        {heroSlides.map((slide, index) => (
          <img key={index} src={slide.image} alt="Preload" />
        ))}
      </div>

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform ${
            notification.show ? "translate-x-0" : "translate-x-full"
          } ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : notification.type === "error"
              ? "bg-red-100 text-red-800 border-l-4 border-red-500"
              : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
          }`}
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              {notification.type === "success" && (
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {notification.type === "error" && (
                <svg
                  className="h-5 w-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {notification.type === "info" && (
                <svg
                  className="h-5 w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Banner Announcement */}
      <BannerAnnouncement message="🎉 Summer Reading Sale! Get up to 30% off on selected titles. Limited time offer!" />

      {/* Navbar */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TabletIcon className="text-blue-600 w-8 h-8" />
            <span className="text-2xl font-bold text-gray-800">eBook</span>
          </div>

          <nav className="hidden md:flex space-x-6">
            <a
              href="#home"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              Home
            </a>
            <a
              href="#catalog"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              Books
            </a>
            <a
              href="#new-releases"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              New Releases
            </a>
            <a
              href="#bestsellers"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              Bestsellers
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <a
              href="/login"
              className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
            >
              Login
            </a>
            <Button onClick={() => (window.location.href = "/register")}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Fixed Height and Background Size Cover */}
      <section
        id="home"
        className="relative h-[80vh] max-h-[800px] overflow-hidden"
      >
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              zIndex: index === currentSlide ? 10 : 0,
            }}
          >
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center px-6 sm:px-12 lg:px-24 text-center">
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 transition-all duration-700"
                style={{
                  transform: `translateY(${
                    index === currentSlide ? "0" : "20px"
                  })`,
                  opacity: index === currentSlide ? 1 : 0,
                }}
              >
                {slide.title}
              </h1>
              <p
                className="text-xl sm:text-2xl text-white mb-8 max-w-2xl mx-auto transition-all duration-700 delay-150"
                style={{
                  transform: `translateY(${
                    index === currentSlide ? "0" : "20px"
                  })`,
                  opacity: index === currentSlide ? 1 : 0,
                }}
              >
                {slide.text}
              </p>
              <div
                className="transition-all duration-700 delay-300"
                style={{
                  transform: `translateY(${
                    index === currentSlide ? "0" : "20px"
                  })`,
                  opacity: index === currentSlide ? 1 : 0,
                }}
              >
                <a
                  href="#catalog"
                  className="inline-flex items-center px-8 py-3 bg-white text-blue-700 text-lg font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl"
                >
                  {slide.cta}
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/70 w-3"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white py-8 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <SearchComponent onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Categories and Book Catalog */}
      <section id="catalog" ref={catalogRef} className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Book Catalog</h2>

          {/* Category Tabs */}
          <CategoryTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Book Grid */}
          <div className="mt-8">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
                  <SkeletonBookCard key={index} />
                ))}
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id || book.bookId}
                    book={book}
                    onViewDetails={() => setSelectedBook(book)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No books found"
                description="Try adjusting your search or browse our full collection"
                buttonText="Browse All Books"
                buttonLink="/books"
              />
            )}
          </div>
        </div>
      </section>

      {/* New Releases Section */}
      <section id="new-releases" className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">New Releases</h2>
              <p className="text-gray-600 mt-2">Fresh off the press</p>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("new-releases");
                document
                  .getElementById("catalog")
                  .scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <SkeletonBookCard key={index} />
              ))}
            </div>
          ) : newReleases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newReleases.slice(0, 4).map((book) => (
                <BookCard
                  key={book.id || book.bookId}
                  book={book}
                  onViewDetails={() => setSelectedBook(book)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No new releases yet"
              description="We're preparing exciting new books for you"
              buttonText="Explore Collection"
              buttonLink="/books"
            />
          )}
        </div>
      </section>

      {/* Bestsellers Section */}
      <section id="bestsellers" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Bestsellers</h2>
              <p className="text-gray-600 mt-2">
                Top-rated books loved by readers
              </p>
            </div>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("bestsellers");
                document
                  .getElementById("catalog")
                  .scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <SkeletonBookCard key={index} />
              ))}
            </div>
          ) : bestsellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestsellers.slice(0, 4).map((book) => (
                <BookCard
                  key={book.id || book.bookId}
                  book={book}
                  onViewDetails={() => setSelectedBook(book)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No bestsellers available"
              description="Check back later for our top-rated books"
              buttonText="Browse Books"
              buttonLink="/books"
            />
          )}
        </div>
      </section>

      {/* Membership Benefits Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Member Benefits
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg transform transition-transform hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4 mx-auto">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">
                Bookmark Books
              </h3>
              <p className="text-gray-300 text-center">
                Save your favorite books to your whitelist for easy access
                later.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg transform transition-transform hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-4 mx-auto">
                <ShoppingCartIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">
                Add to Cart
              </h3>
              <p className="text-gray-300 text-center">
                Easily add books to your cart and manage your shopping
                experience.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg transform transition-transform hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-full mb-4 mx-auto">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">
                Exclusive Discounts
              </h3>
              <p className="text-gray-300 text-center">
                Get 5% off when you order 5+ books, and 10% after every 10
                successful orders.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg transform transition-transform hover:scale-105">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-600 rounded-full mb-4 mx-auto">
                <StarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">
                Review Purchased Books
              </h3>
              <p className="text-gray-300 text-center">
                Share your thoughts by leaving ratings and reviews on books
                you've purchased.
              </p>
            </div>
          </div>

          <div className="mt-10 bg-gray-800 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4 text-center">
              More Member Benefits
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">
                    Cancellable Orders
                  </h4>
                  <p className="text-gray-300">
                    Place orders with the flexibility to cancel if needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">
                    5% Bulk Discount
                  </h4>
                  <p className="text-gray-300">
                    Save 5% on any order containing 5 or more books.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">
                    Loyalty Program
                  </h4>
                  <p className="text-gray-300">
                    Earn a stackable 10% discount after 10 successful orders.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-white">
                    Members-Only Events
                  </h4>
                  <p className="text-gray-300">
                    Access to exclusive online reading clubs and author
                    interviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Start Your Reading Journey Today
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of satisfied readers who have discovered their next
            favorite book with us. Sign up now to receive personalized
            recommendations and special offers.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => (window.location.href = "/register")}
            >
              Create Free Account
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-blue-700"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TabletIcon className="text-blue-400 w-8 h-8" />
                <span className="text-2xl font-bold">eBook</span>
              </div>
              <p className="text-gray-400">
                Your gateway to digital reading and unlimited knowledge.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <nav className="space-y-2">
                <a
                  href="#home"
                  className="block text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Home
                </a>
                <a
                  href="#catalog"
                  className="block text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Books
                </a>
                <a
                  href="#new-releases"
                  className="block text-gray-400 hover:text-white transition-colors duration-300"
                >
                  New Releases
                </a>
                <a
                  href="#bestsellers"
                  className="block text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Bestsellers
                </a>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <nav className="space-y-2">
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Help Center
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Contact Us
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors duration-300"
                >
                  FAQ
                </a>
                <a
                  href="#"
                  className="block text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Terms of Service
                </a>
              </nav>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-gray-800 hover:bg-gray-700 h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-gray-800 hover:bg-gray-700 h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-gray-800 hover:bg-gray-700 h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.415 2.227.056 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.415-1.274.056-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.17-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.681-.824-.9-1.38-.164-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.256-1.814.42-2.234.219-.57.479-.96.9-1.381.419-.419.81-.679 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.795.646-1.44 1.44-1.44.793-.001 1.44.645 1.44 1.44z" />
                  </svg>
                </a>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-4">
                  Subscribe to Our Newsletter
                </h4>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="px-4 py-2 rounded-l-md text-gray-900 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md transition-colors duration-300">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© 2025 eBook. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Book Details Modal */}
      {selectedBook && (
        <BookDetailsModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
};

export default Landing;
