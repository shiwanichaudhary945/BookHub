import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BookCard from "../components/BookCard";
import { Search, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const Home = () => {
  // State for books data
  const [books, setBooks] = useState([]);
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for search
  const [searchTerm, setSearchTerm] = useState("");

  // State for hero slideshow
  const [currentSlide, setCurrentSlide] = useState(0);

  // State for wishlist
  const [wishlist, setWishlist] = useState([]);

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

  // Preload hero images
  useEffect(() => {
    const preloadImages = () => {
      heroSlides.forEach((slide) => {
        const img = new Image();
        img.src = slide.image;
      });
    };
    preloadImages();
  }, []);

  // Fetch wishlist items on component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) {
          return; // Not logged in, no wishlist to fetch
        }

        const response = await fetch(
          "https://localhost:7133/api/Wishlist/GetBookMarks",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.isSuccess && result.data) {
            setWishlist(result.data.$values);
          }
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, []);

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

  // Fetch books data
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);

        // Fetch paginated books
        const booksResponse = await fetch(
          `https://localhost:7133/api/Book/BookPagination?page=${currentPage}&pageSize=5`
        );

        // Fetch featured sections
        const featuredResponse = await fetch(
          "https://localhost:7133/api/Book/BookPagination?page=1&pageSize=6"
        );
        const newReleasesResponse = await fetch(
          "https://localhost:7133/api/Book/NewReleases"
        );
        const bestsellersResponse = await fetch(
          "https://localhost:7133/api/Book/BestSellers"
        );

        // Process the responses
        if (booksResponse.ok) {
          const booksData = await booksResponse.json();
          console.log(booksData.data.items.$values);
          setBooks(booksData.data.items.$values || []);
          setTotalPages(booksData.data?.totalPages || 1);
        }

        if (featuredResponse.ok) {
          const featuredData = await featuredResponse.json();
          console.log(featuredData.data.items.$values);
          setFeaturedBooks(featuredData.data.items.$values || []);
        }

        if (newReleasesResponse.ok) {
          const newReleasesData = await newReleasesResponse.json();
          setNewReleases(newReleasesData.data.$values || []);
        }

        if (bestsellersResponse.ok) {
          const bestsellersData = await bestsellersResponse.json();
          setBestsellers(bestsellersData.data.$values || []);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage]);
const handleSearch = async (e) => {
  e.preventDefault();

  if (searchTerm.trim()) {
    try {
      setLoading(true);
      const encodedQuery = encodeURIComponent(searchTerm);

      const response = await fetch(
        `https://localhost:7133/api/Book/SearchBooks?search=${encodedQuery}&page=1&pageSize=5`
      );

      if (response.ok) {
  const data = await response.json();
  console.log("Search results:", data);

  // Set books from the correct path
  setBooks(data?.data?.$values || []);

  // Optional: set dummy total pages if not in response
  setTotalPages(1); 
  setCurrentPage(1);

  // Update the URL
  // window.history.pushState(
  //   {},
  //   "",
  //   `/search?query=${encodeURIComponent(searchTerm)}`
  // );
} else {
  console.error("Search failed:", response.statusText);
}

    } catch (error) {
      console.error("Error searching books:", error);
    } finally {
      setLoading(false);
    }
  } else {
    console.warn("Search term is empty.");
  }
};

  // Check if a book is in wishlist
  const isInWishlist = (bookId) => {
    return wishlist.some((item) => item.bookId === bookId);
  };

  // Add to cart
  const handleAddToCart = async (bookId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please log in to add items to your cart", "info");
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
            quantity: 1,
          }),
        }
      );

      if (response.ok) {
        showNotification("Book added to cart successfully!", "success");
      } else {
        showNotification("Failed to add book to cart", "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("An error occurred", "error");
    }
  };

  // Add to wishlist
  const handleAddToWishlist = async (bookId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please log in to add items to your wishlist", "info");
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

      if (response.ok) {
        // Add to local wishlist state to avoid refetch
        const book = [
          ...books,
          ...featuredBooks,
          ...bestsellers,
          ...newReleases,
        ].find((b) => b.id === bookId);

        if (book) {
          setWishlist([
            ...wishlist,
            {
              bookId: bookId,
              id: Date.now(), // Temporary ID
              bookTitle: book.title,
              bookAuthor: book.author,
              bookPhoto: book.bookPhoto,
              price: book.price,
            },
          ]);
        }

        showNotification("Book added to wishlist!", "success");
      } else {
        showNotification("Failed to add to wishlist", "error");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      showNotification("An error occurred", "error");
    }
  };

  // Remove from wishlist
  const handleRemoveFromWishlist = async (bookId) => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        return;
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

      if (response.ok) {
        // Remove from local wishlist state
        setWishlist(wishlist.filter((item) => item.bookId !== bookId));
        showNotification("Book removed from wishlist", "success");
      } else {
        showNotification("Failed to remove from wishlist", "error");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      showNotification("An error occurred", "error");
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
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

  // Loading skeleton
  const SkeletonBookCard = () => (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg">
      <div className="h-64 bg-gray-200 animate-pulse"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );

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
              ? "bg-blue-600 text-white"
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
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Notification Toast */}
      {notification.show && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : notification.type === "error"
              ? "bg-red-100 text-red-800 border-l-4 border-red-500"
              : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
          }`}
        >
          <p>{notification.message}</p>
        </div>
      )}

      {/* Hero Section with Fixed Height and Background Size Cover */}
      <div className="relative h-[95vh] max-h-[100vh] overflow-hidden">
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
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 lg:px-24 text-center">
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
                  href="#collection"
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
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>

      {/* Main Books Collection */}
      <div
        id="collection"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl font-bold text-gray-900">Our Collection</h2>
            <p className="text-gray-600 mt-2">
              Discover books for every reader
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full md:w-1/2 lg:w-1/3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search books..."
                className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {[...Array(5)].map((_, index) => (
              <SkeletonBookCard key={index} />
            ))}
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {books.map((book) => (
                <BookCard
                  key={book.id || book.bookId}
                  book={book}
                  isInWishlist={isInWishlist(book.id || book.bookId)}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                />
              ))}
            </div>
            {totalPages > 1 && renderPagination()}
          </>
        ) : (
          <EmptyState
            title="No books found"
            description="Try adjusting your search or browse our full collection"
            buttonText="Browse All Books"
            buttonLink="/books"
          />
        )}
      </div>

      {/* Bestsellers Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Bestsellers</h2>
              <p className="text-gray-600 mt-2">
                Top-rated books loved by readers
              </p>
            </div>
            <a
              href="/books"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[...Array(6)].map((_, index) => (
                <SkeletonBookCard key={index} />
              ))}
            </div>
          ) : bestsellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {bestsellers.map((book) => (
                <BookCard
                  key={book.id || book.bookId}
                  book={book}
                  isInWishlist={isInWishlist(book.id || book.bookId)}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
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
      </div>

      {/* New Releases Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">New Releases</h2>
              <p className="text-gray-600 mt-2">Fresh off the press</p>
            </div>
            <a
              href="/books"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[...Array(6)].map((_, index) => (
                <SkeletonBookCard key={index} />
              ))}
            </div>
          ) : newReleases.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {newReleases.map((book) => (
                <BookCard
                  key={book.id || book.bookId}
                  book={book}
                  isInWishlist={isInWishlist(book.id || book.bookId)}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
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
      </div>

      {/* Featured Books Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Books
              </h2>
              <p className="text-gray-600 mt-2">Curated selections for you</p>
            </div>
            <a
              href="/books"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {[...Array(6)].map((_, index) => (
                <SkeletonBookCard key={index} />
              ))}
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {featuredBooks.map((book) => (
                <BookCard
                  key={book.id || book.bookId}
                  book={book}
                  isInWishlist={isInWishlist(book.id || book.bookId)}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No featured books available"
              description="Our team is working on special selections for you"
              buttonText="Discover Books"
              buttonLink="/books"
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
