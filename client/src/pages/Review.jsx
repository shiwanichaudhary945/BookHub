import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Star,
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronRight,
  BookOpen,
  X,
} from "lucide-react";

const Review = () => {
  // State for form data
  const [reviewData, setReviewData] = useState({
    bookId: null,
    star: null,
    comment: "",
  });

  // State for book info
  const [bookInfo, setBookInfo] = useState({
    id: null,
    title: "",
    author: "",
    imageUrl: "",
  });

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [error, setError] = useState(null);

  // Stars hover state
  const [hoveredStar, setHoveredStar] = useState(null);

  // Get the book ID from sessionStorage on component mount
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        setIsLoading(true);
        const bookId = sessionStorage.getItem("reviewBookId");

        if (!bookId) {
          throw new Error("No book selected for review");
        }

        // Set initial book ID in reviewData
        setReviewData((prev) => ({
          ...prev,
          bookId: parseInt(bookId),
        }));

        // Fetch book details
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const response = await fetch(
          `https://localhost:7133/api/Book/GetBookById/${bookId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "*/*",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch book details");
        }

        const data = await response.json();
        if (data.isSuccess && data.data) {
          setBookInfo({
            id: data.data.id || data.data.bookId,
            title: data.data.title || "Unknown Book",
            author: data.data.author || "Unknown Author",
            imageUrl:
              data.data.imageUrl ||
              data.data.bookPhoto ||
              data.data.bookCover ||
              null,
          });
        } else {
          throw new Error("Invalid book data received");
        }
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError(err.message);
        showNotification(err.message, "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookDetails();
  }, []);

  // Handle input changes
  const handleCommentChange = (e) => {
    setReviewData({
      ...reviewData,
      comment: e.target.value,
    });
  };

  // Handle star rating
  const handleStarClick = (rating) => {
    setReviewData({
      ...reviewData,
      star: rating,
    });
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!reviewData.star) {
      showNotification("Please select a star rating", "warning");
      return;
    }

    try {
      setIsSubmitting(true);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Submit review to API
      const response = await fetch(
        "https://localhost:7133/api/Review/DoReview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "*/*",
          },
          body: JSON.stringify(reviewData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      const result = await response.json();

      if (result.isSuccess) {
        showNotification(
          "Your review has been submitted successfully!",
          "success"
        );

        // Remove book ID from session storage
        sessionStorage.removeItem("reviewBookId");

        // Redirect to orders page after short delay
        setTimeout(() => {
          window.location.href = "/orders";
        }, 1500);
      } else {
        throw new Error(result.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      showNotification(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Go back to orders page
  const handleGoBack = () => {
    window.location.href = "/orders";
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
              : notification.type === "warning"
              ? "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500"
              : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
          } flex items-center`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="mr-2 h-5 w-5" />
          ) : notification.type === "error" ? (
            <AlertCircle className="mr-2 h-5 w-5" />
          ) : notification.type === "warning" ? (
            <Info className="mr-2 h-5 w-5" />
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
        {/* Breadcrumbs - matching Orders page */}
        <div className="mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <a href="/home" className="hover:text-blue-600 transition-colors">
              Home
            </a>
            <ChevronRight className="h-4 w-4 mx-1" />
            <a href="/orders" className="hover:text-blue-600 transition-colors">
              My Orders
            </a>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-gray-700 font-medium">Write a Review</span>
          </div>
        </div>

        {/* Page Header - matching Orders page style */}
        <div className="flex items-center mb-8">
          <div className="bg-purple-50 p-2 rounded-full mr-3">
            <BookOpen className="text-purple-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Write a Review</h1>
            <p className="text-sm text-gray-500 mt-1">
              Share your thoughts about this book
            </p>
          </div>
        </div>

        {/* Main content */}
        {isLoading ? (
          <div className="py-16 text-center bg-white rounded-xl shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading book details...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center bg-white rounded-xl shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-2">Error loading book details</p>
            <p className="text-gray-600 max-w-md mx-auto">{error}</p>
            <button
              onClick={handleGoBack}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Return to Orders
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm">
            {/* Book Information Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-start">
                <div className="w-20 h-28 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={
                      bookInfo.imageUrl ||
                      "https://via.placeholder.com/160x224?text=Book"
                    }
                    alt={bookInfo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/160x224?text=Book";
                    }}
                  />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-medium text-gray-900">
                    {bookInfo.title}
                  </h2>
                  <p className="text-gray-600">by {bookInfo.author}</p>
                </div>
              </div>
            </div>

            {/* Review Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Your Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      className="focus:outline-none transition-transform transform hover:scale-110 mr-1"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          (
                            hoveredStar !== null
                              ? star <= hoveredStar
                              : star <= (reviewData.star || 0)
                          )
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-gray-500">
                    {reviewData.star
                      ? `${reviewData.star} star${
                          reviewData.star !== 1 ? "s" : ""
                        }`
                      : "Select a rating"}
                  </span>
                </div>
              </div>

              {/* Review Comment */}
              <div className="mb-6">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Review
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={5}
                  value={reviewData.comment}
                  onChange={handleCommentChange}
                  placeholder="What did you think about this book? (Optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  maxLength={500}
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  {reviewData.comment.length}/500 characters
                </p>
              </div>

              {/* Review Guidelines */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Review Guidelines
                </h3>
                <ul className="text-sm text-blue-700 space-y-1 pl-6">
                  <li>Be honest about your experience with the book</li>
                  <li>Focus on specific aspects you liked or disliked</li>
                  <li>Keep your review helpful for other readers</li>
                  <li>Avoid spoilers or inappropriate content</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleGoBack}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !reviewData.star}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center ${
                    isSubmitting || !reviewData.star
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  } transition-colors`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Review;
