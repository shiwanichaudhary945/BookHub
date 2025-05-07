import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BookDetailsModal = ({ bookId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen && bookId) {
      fetchBookDetails();
    }
  }, [isOpen, bookId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://localhost:7133/api/Book/GetBookById/${bookId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch book details");
      }

      const data = await response.json();
      setBook(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching book details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      onClose();
    }
  };

  const handleEscape = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 99) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    // You would implement your cart logic here
    console.log(`Added ${quantity} of ${book.title} to cart`);

    // Close the modal after adding to cart
    onClose();
  };

  const handleBuyNow = () => {
    // Redirect to checkout with this book
    navigate("/checkout", {
      state: {
        items: [{ bookId: book.id, quantity, price: book.price }],
      },
    });
  };

  // Format price to 2 decimal places
  const formatPrice = (value) => {
    return (Math.round(value * 100) / 100).toFixed(2);
  };

  // Render star ratings
  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg
          key={`full-${i}`}
          className="w-5 h-5 text-yellow-400 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <svg
          key="half"
          className="w-5 h-5 text-yellow-400 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          <path
            d="M12 17.27V2"
            stroke="#fff"
            strokeWidth="2"
            style={{ transform: "translate(0, 0)" }}
          />
          <path
            fill="#e5e7eb"
            d="M12 2v15.27l-6.18 3.73 1.64-7.03L2 9.24l7.19-.61L12 2z"
          />
        </svg>
      );
    }

    // Empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg
          key={`empty-${i}`}
          className="w-5 h-5 text-gray-300 fill-current"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    }

    return stars;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p className="font-bold">Error loading book details</p>
              <p>{error}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        ) : book ? (
          <div className="relative">
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
              onClick={onClose}
            >
              <svg
                className="h-6 w-6"
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
            </button>

            <div className="flex flex-col md:flex-row">
              {/* Book Image */}
              <div className="w-full md:w-2/5 p-6 flex items-center justify-center bg-gray-50">
                <div className="relative">
                  <img
                    src={
                      book.imageUrl ||
                      "https://via.placeholder.com/300x450?text=No+Image"
                    }
                    alt={book.title}
                    className="max-w-full max-h-[450px] object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/300x450?text=No+Image";
                    }}
                  />

                  {/* Discount Badge */}
                  {book.discountPercentage > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 m-2 rounded">
                      {book.discountPercentage}% OFF
                    </div>
                  )}
                </div>
              </div>

              {/* Book Details */}
              <div className="w-full md:w-3/5 p-6">
                <div className="mb-6">
                  <span className="inline-block bg-indigo-600 text-white text-sm font-medium px-3 py-1 rounded mr-2">
                    {book.genre || "Fiction"}
                  </span>
                  {book.inStock ? (
                    <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded">
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-block bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {book.title}
                </h1>

                <p className="text-lg text-gray-600 mb-4">
                  by <span className="font-medium">{book.author}</span>
                </p>

                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {renderRating(book.rating || 0)}
                  </div>
                  <span className="text-gray-600">
                    {book.rating?.toFixed(1) || "0.0"} ({book.reviewCount || 0}{" "}
                    reviews)
                  </span>
                </div>

                <div className="mb-6">
                  {book.discountPercentage > 0 ? (
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-indigo-600 mr-3">
                        $
                        {formatPrice(
                          book.price -
                            book.price * (book.discountPercentage / 100)
                        )}
                      </span>
                      <span className="text-xl text-gray-500 line-through">
                        ${formatPrice(book.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-indigo-600">
                      ${formatPrice(book.price)}
                    </span>
                  )}
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {book.description || "No description available."}
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-gray-600">
                    <div>
                      <p>
                        <span className="font-medium">Publisher:</span>{" "}
                        {book.publisher || "Unknown"}
                      </p>
                      <p>
                        <span className="font-medium">Language:</span>{" "}
                        {book.language || "English"}
                      </p>
                      <p>
                        <span className="font-medium">ISBN:</span>{" "}
                        {book.isbn || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Publication Date:</span>{" "}
                        {book.publicationDate || "Unknown"}
                      </p>
                      <p>
                        <span className="font-medium">Pages:</span>{" "}
                        {book.pageCount || "Unknown"}
                      </p>
                      <p>
                        <span className="font-medium">Format:</span>{" "}
                        {book.format || "Paperback"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Section */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center mb-4">
                    <span className="mr-3 text-gray-700">Quantity:</span>
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        onClick={decrementQuantity}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-12 py-1 text-center border-x border-gray-300 focus:outline-none"
                      />
                      <button
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        onClick={incrementQuantity}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={!book.inStock}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed flex-1"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={handleBuyNow}
                      disabled={!book.inStock}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex-1"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p>No book details found.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetailsModal;
