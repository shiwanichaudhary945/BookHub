import React, { useState } from "react";
import { Heart, ShoppingCart, Eye, Star } from "lucide-react";

const BookCard = ({
  book,
  isInWishlist,
  onAddToCart,
  onAddToWishlist,
  onRemoveFromWishlist,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(book.bookId);
  };

  // Handle add/remove from wishlist
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isInWishlist) {
      onRemoveFromWishlist(book.bookId);
    } else {
      onAddToWishlist(book.bookId);
    }
  };

  // Handle click to view book details
  const handleViewDetails = (e) => {
    e.preventDefault();
    // Navigate to book details page
    window.location.href = `/books/${book.bookId}`;
  };

  // Generate random rating for demo purposes
  const rating = book.rating || (Math.random() * 2 + 3).toFixed(1);

  return (
    <div
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group transform hover:-translate-y-1 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleViewDetails}
    >
      {/* Image container with gradient overlay */}
      <div className="h-64 bg-gray-100 overflow-hidden relative">
        <img
          src={
            imageError || !book.bookPhoto
              ? "https://via.placeholder.com/300x450?text=No+Cover"
              : book.bookPhoto
          }
          alt={book.title || "Book Cover"}
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
          onError={() => setImageError(true)}
        />

        {/* Permanent subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>

        {/* Hover action overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/70 to-blue-700/30 flex items-center justify-center space-x-3 transition-all duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex flex-col items-center space-y-3">
            {/* Quick view button */}
            <button
              onClick={handleViewDetails}
              className="p-3 bg-white rounded-full text-gray-800 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Quick view"
            >
              <Eye size={22} />
            </button>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              className="p-3 bg-white rounded-full text-gray-800 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              title="Add to cart"
            >
              <ShoppingCart size={22} />
            </button>

            {/* Wishlist button */}
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                isInWishlist
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-white text-gray-800 hover:bg-blue-600 hover:text-white"
              }`}
              title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={22} className={isInWishlist ? "fill-current" : ""} />
            </button>
          </div>
        </div>

        {/* Title overlay at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 px-4 py-3 transition-all duration-300 transform group-hover:translate-y-full">
          <h3 className="text-lg font-medium text-white line-clamp-1">
            {book.title || book.bookTitle || "Untitled Book"}
          </h3>
        </div>
      </div>

      {/* Book details with hover effect */}
      <div className="p-4 bg-white transition-all duration-300">
        {/* Title - only visible when not hovering */}
        <div
          className={`transition-opacity duration-300 ${
            isHovered ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
          }`}
        >
          <h3 className="text-lg font-medium text-gray-800 line-clamp-1">
            {book.title || book.bookTitle || "Untitled Book"}
          </h3>
        </div>

        <p className="text-sm text-gray-600 font-medium">
          By {book.author || book.bookAuthor || "Unknown Author"}
        </p>

        {/* Rating display */}
        <div className="flex items-center mt-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Star size={16} className="text-yellow-500 fill-current" />
            <span className="ml-1 font-medium">{rating}</span>
          </div>
          <span className="mx-2">•</span>
          <span className="line-clamp-1 text-gray-500">
            {book.genre || "Fiction"}
          </span>
        </div>

        {/* Price and discount */}
        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-blue-600 font-bold text-lg">
              $
              {book.price && !isNaN(book.price) ? book.price.toFixed(2) : "N/A"}
            </span>

            {book.discountPercentage > 0 && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${(book.price / (1 - book.discountPercentage / 100)).toFixed(2)}
              </span>
            )}
          </div>

          {book.discountPercentage > 0 && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
              {book.discountPercentage}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Status badges - top corners */}
      {book.stock <= 0 && (
        <div className="absolute top-2 left-2 bg-gray-800/80 text-white text-xs px-3 py-1 rounded-full z-10 backdrop-blur-sm">
          Out of Stock
        </div>
      )}

      {isInWishlist && (
        <div className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full z-10 shadow-md backdrop-blur-sm">
          <Heart size={14} className="fill-current" />
        </div>
      )}

      {book.isNew && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg z-10">
          NEW
        </div>
      )}
    </div>
  );
};

export default BookCard;
