import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Calendar,
  Book,
  BookOpen,
  Languages,
  Bookmark,
  Printer,
  Tag,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  User,
  Clock,
} from "lucide-react";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [star, setStars] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [expandedSections, setExpandedSections] = useState({
    description: true,
    details: false,
    reviews: true,
  });

  // Fetch book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setIsLoading(true);

        // Fetch book details
        const bookResponse = await fetch(
          `https://localhost:7133/api/Book/GetBookById/${id}`,
          {
            headers: {
              Accept: "*/*",
            },
          }
        );

        if (!bookResponse.ok) {
          throw new Error("Failed to fetch book details");
        }

        const bookData = await bookResponse.json();
        console.log("Book data:", bookData);

        // FIX: Check for data in the response and set it correctly
        if (bookData && bookData.data) {
          setBook(bookData.data);
        } else if (bookData && typeof bookData === 'object') {
          // If the API is returning the book object directly without a data wrapper
          setBook(bookData);
        } else {
          throw new Error("Invalid book data format");
        }

        // Fetch reviews
        const reviewResponse = await fetch(
          `https://localhost:7133/api/Review/GetReview/${id}`,
          {
            headers: {
              Accept: "*/*",
            },
          }
        );

        if (!reviewResponse.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const reviewData = await reviewResponse.json();
        console.log("Review data:", reviewData);
        
        // FIX: Handle different review data formats
        if (reviewData && reviewData.data && reviewData.data.reviewDtos) {
          if (reviewData.data.reviewDtos.$values) {
            setReviews(reviewData.data.reviewDtos.$values);
          } else if (Array.isArray(reviewData.data.reviewDtos)) {
            setReviews(reviewData.data.reviewDtos);
          }
          
          if (reviewData.data.averageStar !== undefined) {
            setStars(reviewData.data.averageStar);
          }
        } else {
          setReviews([]);
          console.warn("No reviews found or invalid format");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        showNotification("Error loading book details", "error");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  // Add to cart
  const addToCart = async () => {
    try {
      setIsAddingToCart(true);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        showNotification("Please login to add items to cart", "info");
        setIsAddingToCart(false);
        // Redirect to login page
        setTimeout(() => {
          navigate("/login", { state: { from: `/book/${id}` } });
        }, 2000);
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
            bookId: book.bookId,
            quantity: quantity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      showNotification(`"${book.title}" added to cart`, "success");

      // Offer to navigate to cart
      setTimeout(() => {
        setNotification({
          show: true,
          message: "View your cart?",
          type: "viewCart",
        });
      }, 3000);
    } catch (err) {
      setError(err.message);
      showNotification("Error adding to cart", "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Toggle expanded sections
  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({
      show: true,
      message,
      type,
    });

    // Auto-hide notification after 3 seconds (unless it's the cart prompt)
    if (type !== "viewCart") {
      setTimeout(() => {
        setNotification({
          show: false,
          message: "",
          type: "",
        });
      }, 3000);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Format relative time for reviews
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return "just now";
      }
      if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)} min ago`;
      }
      if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      }
      if (diffInSeconds < 604800) {
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
      }
      return formatDate(dateString);
    } catch (e) {
      console.error("Error formatting relative time:", e);
      return dateString;
    }
  };

  // Calculate discount price
  const calculateDiscountPrice = (price, discountPercentage) => {
    if (!price || !discountPercentage) return price;
    return price - (price * discountPercentage) / 100;
  };

  // Check if a discount is active
  const isDiscountActive = (book) => {
    if (!book || !book.onSale || !book.discountPercentage) return false;

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

  // Get availability text
  const getAvailabilityText = (book) => {
    if (!book) return "";

    if (book.stock > 10) {
      return "In Stock";
    } else if (book.stock > 0) {
      return `Only ${book.stock} left in stock`;
    } else {
      return "Out of Stock";
    }
  };

  // Get availability color
  const getAvailabilityColor = (book) => {
    if (!book) return "";

    if (book.stock > 10) {
      return "text-green-600";
    } else if (book.stock > 0) {
      return "text-orange-500";
    } else {
      return "text-red-500";
    }
  };

  // Navigate to cart
  const goToCart = () => {
    navigate("/cart");
  };

  // Debug function to check book data structure
  const debugBookData = () => {
    console.log("Current book state:", book);
    if (!book) {
      console.error("Book data is null or undefined");
      return;
    }
    
    // Check if essential properties exist
    const essentialProps = ['title', 'author', 'price', 'stock', 'isbn'];
    const missingProps = essentialProps.filter(prop => !book[prop]);
    
    if (missingProps.length > 0) {
      console.error(`Missing essential properties: ${missingProps.join(', ')}`);
    }
  };

  // Call debug function
  useEffect(() => {
    if (!isLoading) {
      debugBookData();
    }
  }, [isLoading, book]);

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
              : notification.type === "viewCart"
              ? "bg-blue-100 text-blue-800 border-l-4 border-blue-500 flex items-center justify-between"
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

          {notification.type === "viewCart" && (
            <div className="ml-6 flex items-center">
              <button
                onClick={goToCart}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md mr-2 text-sm"
              >
                View Cart
              </button>
              <button
                onClick={() => setNotification({ show: false })}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex-grow container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        {/* Back to books link */}
        <a
          href="/books"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors font-medium"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Books
        </a>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading book details...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-2">Error loading book details</p>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : book ? (
          <>
            {/* Book Detail Section */}
            <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-8">
              <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                {/* Book Image Column */}
                <div className="p-6 flex flex-col items-center">
                  <div className="w-full max-w-md h-auto rounded-md overflow-hidden shadow-lg bg-gray-100 mb-4">
                    <img
                      src={
                        book.bookPhoto ||
                        "https://via.placeholder.com/400x600?text=No+Cover"
                      }
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x600?text=No+Cover";
                      }}
                    />
                  </div>

                  {/* Action buttons under image */}
                  <div className="flex justify-center space-x-4 w-full mt-4">
                    <button
                      className="text-gray-500 hover:text-red-500 transition-colors flex flex-col items-center text-sm"
                      title="Add to Wishlist"
                    >
                      <Heart size={20} />
                      <span className="mt-1">Wishlist</span>
                    </button>
                    <button
                      className="text-gray-500 hover:text-blue-500 transition-colors flex flex-col items-center text-sm"
                      title="Share"
                    >
                      <Share2 size={20} />
                      <span className="mt-1">Share</span>
                    </button>
                  </div>
                </div>

                {/* Book Details Column */}
                <div className="p-6 lg:col-span-2">
                  {/* Title and Author */}
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {book.title || "Untitled Book"}
                  </h1>
                  <p className="text-xl text-gray-600 mb-4">by {book.author || "Unknown Author"}</p>

                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((value) => {
                        const isFilled = value <= star;
                        const isHalfFilled =
                          star >= value - 0.5 && star < value;

                        return (
                          <div key={value} className="relative">
                            <Star className="text-gray-300" />
                            <div
                              className={`absolute top-0 left-0 overflow-hidden ${
                                isFilled
                                  ? "w-full"
                                  : isHalfFilled
                                  ? "w-1/2"
                                  : "w-0"
                              }`}
                              style={{
                                width: isFilled
                                  ? "100%"
                                  : isHalfFilled
                                  ? "50%"
                                  : "0%",
                              }}
                            >
                              <Star className="fill-current" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <span className="ml-2 text-gray-600">
                      {star.toFixed(1)} ({reviews.length}{" "}
                      {reviews.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>

                  {/* Price with potential discount */}
                  <div className="mb-6">
                    {isDiscountActive(book) ? (
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-800 mr-3">
                          $
                          {calculateDiscountPrice(
                            book.price,
                            book.discountPercentage
                          ).toFixed(2)}
                        </span>
                        <span className="text-xl text-gray-500 line-through">
                          ${(book.price || 0).toFixed(2)}
                        </span>
                        <span className="ml-3 bg-red-100 text-red-700 px-2 py-1 rounded-md text-sm font-medium">
                          {book.discountPercentage}% OFF
                        </span>
                      </div>
                    ) : (
                      <span className="text-3xl font-bold text-gray-800">
                        ${(book.price || 0).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Availability */}
                  <div className="mb-6">
                    <span
                      className={`font-medium ${getAvailabilityColor(
                        book
                      )} flex items-center`}
                    >
                      {book.stock > 0 ? (
                        <CheckCircle size={16} className="mr-1" />
                      ) : (
                        <AlertCircle size={16} className="mr-1" />
                      )}
                      {getAvailabilityText(book)}
                    </span>

                    {book.isAvailableInLibrary && (
                      <div className="mt-2 text-blue-600 flex items-center">
                        <BookOpen size={16} className="mr-1" />
                        <span>Also available in library</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-center">
                      <Book size={16} className="mr-2 text-gray-500" />
                      <span>
                        <strong>ISBN:</strong> {book.isbn || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Languages size={16} className="mr-2 text-gray-500" />
                      <span>
                        <strong>Language:</strong> {book.language || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Bookmark size={16} className="mr-2 text-gray-500" />
                      <span>
                        <strong>Genre:</strong> {book.genre || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Printer size={16} className="mr-2 text-gray-500" />
                      <span>
                        <strong>Format:</strong> {book.format || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-gray-500" />
                      <span>
                        <strong>Published:</strong>{" "}
                        {formatDate(book.publicationDate)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Tag size={16} className="mr-2 text-gray-500" />
                      <span>
                        <strong>Publisher:</strong> {book.publisher || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Exclusive Edition */}
                  {book.exclusiveEdition && (
                    <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="font-medium text-amber-800">
                        Exclusive Edition: {book.exclusiveEdition}
                      </p>
                    </div>
                  )}

                  {/* Add to Cart Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="text-gray-500 hover:text-gray-700 p-2 transition-colors rounded-md hover:bg-gray-200"
                        aria-label="Decrease quantity"
                        disabled={quantity <= 1}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="w-10 text-center font-medium text-gray-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="text-gray-500 hover:text-gray-700 p-2 transition-colors rounded-md hover:bg-gray-200"
                        aria-label="Increase quantity"
                        disabled={quantity >= (book.stock || 0)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    <button
                      onClick={addToCart}
                      disabled={isAddingToCart || (book.stock || 0) <= 0}
                      className={`flex-1 ${
                        isAddingToCart || (book.stock || 0) <= 0
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors`}
                    >
                      {isAddingToCart ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (book.stock || 0) <= 0 ? (
                        "Out of Stock"
                      ) : (
                        <>
                          <ShoppingCart className="mr-2" size={20} />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Content Sections */}
            <div className="grid lg:grid-cols-1 gap-8">
              {/* Description Section */}
              <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-8">
                <div
                  className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("description")}
                >
                  <h3 className="font-medium text-gray-700">Description</h3>
                  {expandedSections.description ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>

                {expandedSections.description && (
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {book.description || "No description available."}
                    </p>
                  </div>
                )}
              </div>

              {/* Book Details Section */}
              <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-8">
                <div
                  className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("details")}
                >
                  <h3 className="font-medium text-gray-700">Product Details</h3>
                  {expandedSections.details ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>

                {expandedSections.details && (
                  <div className="p-6">
                    <table className="w-full text-left">
                      <tbody>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 text-gray-600">ISBN</th>
                          <td className="py-3">{book.isbn || "N/A"}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 text-gray-600">Author</th>
                          <td className="py-3">{book.author || "N/A"}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 text-gray-600">Publisher</th>
                          <td className="py-3">{book.publisher || "N/A"}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 text-gray-600">
                            Publication Date
                          </th>
                          <td className="py-3">
                            {formatDate(book.publicationDate)}
                          </td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 text-gray-600">Language</th>
                          <td className="py-3">{book.language || "N/A"}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 text-gray-600">Format</th>
                          <td className="py-3">{book.format || "N/A"}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 text-gray-600">Genre</th>
                          <td className="py-3">{book.genre || "N/A"}</td>
                        </tr>
                        <tr>
                          <th className="py-3 text-gray-600">Added to Store</th>
                          <td className="py-3">{formatDate(book.addedDate)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Reviews Section */}
              <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 mb-8">
                <div
                  className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleSection("reviews")}
                >
                  <h3 className="font-medium text-gray-700">
                    Reviews ({reviews.length})
                  </h3>
                  {expandedSections.reviews ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>

                {expandedSections.reviews && (
                  <div className="p-6">
                    {/* Reviews List */}
                    {reviews.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare
                          size={36}
                          className="text-gray-300 mx-auto mb-4"
                        />
                        <p className="text-gray-500">
                          No reviews available for this book.
                        </p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-200">
                        {reviews.map((review) => (
                          <li key={review.reviewId} className="py-6">
                            <div className="flex items-center mb-2">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                                <User size={20} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">
                                  {review.fullName || "Anonymous"}
                                </p>
                                <div className="flex items-center text-gray-500 text-sm">
                                  <Clock size={14} className="mr-1" />
                                  {formatRelativeTime(review.createdTime)}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 mt-3">
                              {review.comment || "No comment provided."}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-medium text-gray-700 mb-3">
              Book Not Found
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We couldn't find the book you're looking for. It may have been
              removed or is temporarily unavailable.
            </p>
            <a
              href="/books"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse Other Books
            </a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BookDetail;
