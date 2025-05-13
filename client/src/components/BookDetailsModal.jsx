import React from "react";
import {
  Star,
  Clock,
  DollarSign,
  BookOpen,
  User,
  Tag,
  Calendar,
  BookMarked,
  CheckCircle,
  XCircle,
  Globe,
  BookText,
  Building,
  Award,
  Bookmark,
  X,
  ArrowLeft,
  Pencil,
  Info,
} from "lucide-react";

const BookDetailsModal = ({ book, onClose, onEdit }) => {
  // Format date string to localized date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Format price with proper currency format
  const formatCurrency = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  // Calculate discounted price
  const calculateDiscountedPrice = (price, discountPercentage) => {
    if (!discountPercentage || discountPercentage <= 0) return price;
    return price * (1 - discountPercentage / 100);
  };

  // Check if discount is active
  const isDiscountActive = () => {
    if (!book.discountPercentage || book.discountPercentage <= 0) return false;

    // If there are discount dates, check if current date is within range
    if (book.discountStartDate && book.discountEndDate) {
      const now = new Date();
      const startDate = new Date(book.discountStartDate);
      const endDate = new Date(book.discountEndDate);

      return now >= startDate && now <= endDate;
    }

    // If no dates but has discount percentage, assume active
    return true;
  };

  // Calculate discount savings
  const calculateSavings = () => {
    if (!isDiscountActive()) return 0;
    return book.price * (book.discountPercentage / 100);
  };

  // Display stars for ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400 fill-current"
        />
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star
            className="absolute w-4 h-4 text-yellow-400 fill-current"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
          <Star className="absolute w-4 h-4 text-gray-300" />
        </div>
      );
    }

    // Fill remaining with empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
  };

  if (!book) return null;

  return (
    <div className="bg-white rounded-xl overflow-hidden max-w-6xl mx-auto shadow-2xl">
      {/* Header with navigation and title */}
      <div className="bg-gradient-to-r from-indigo-800 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={onClose}
            className="mr-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Book Details</h1>
        </div>

        {onEdit && (
          <button
            onClick={() => onEdit(book)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 flex items-center"
          >
            <Pencil className="w-4 h-4 mr-1" />
            <span className="text-sm">Edit</span>
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column - Book Cover and Basic Info */}
          <div className="lg:w-1/3">
            <div className="flex flex-col items-center mb-6">
              {/* Book Cover with Frame */}
              <div className="relative">
                <div className="w-56 h-80 rounded-lg shadow-lg overflow-hidden border-4 border-white relative">
                  {book.bookPhoto ? (
                    <img
                      src={book.bookPhoto}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/300x400?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                      <BookOpen size={64} className="text-gray-300" />
                      <p className="mt-2 text-sm text-gray-400">
                        No image available
                      </p>
                    </div>
                  )}

                  {/* Sale badge */}
                  {isDiscountActive() && book.onSale && (
                    <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-md transform rotate-12">
                      SALE
                    </div>
                  )}
                </div>

                {/* Status label */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                  <span
                    className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-medium shadow-md ${
                      book.inStock
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {book.inStock ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        In Stock
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Out of Stock
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Pricing Card */}
              <div className="w-full mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-blue-700 mr-1.5" />
                    <span className="font-semibold text-blue-900">Pricing</span>
                  </div>
                  {isDiscountActive() && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-lg text-xs font-medium">
                      {book.discountPercentage}% OFF
                    </span>
                  )}
                </div>

                <div className="flex items-end mt-1">
                  {isDiscountActive() ? (
                    <>
                      <span className="text-2xl font-bold text-blue-800">
                        {formatCurrency(
                          calculateDiscountedPrice(
                            book.price,
                            book.discountPercentage
                          )
                        )}
                      </span>
                      <span className="ml-2 text-base text-gray-500 line-through">
                        {formatCurrency(book.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-blue-800">
                      {formatCurrency(book.price)}
                    </span>
                  )}
                </div>

                {/* Discount details */}
                {isDiscountActive() && (
                  <div className="mt-2 p-2 bg-white/70 rounded-lg">
                    <div className="text-sm text-green-700 font-medium">
                      Save {formatCurrency(calculateSavings())}
                    </div>

                    {book.discountStartDate && book.discountEndDate && (
                      <div className="flex items-center mt-1 text-xs text-gray-600">
                        <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                        <span>
                          Sale: {formatDate(book.discountStartDate)} -{" "}
                          {formatDate(book.discountEndDate)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Key Details Card */}
              <div className="w-full mt-4 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {/* ISBN */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">ISBN</div>
                    <div className="text-sm font-medium text-gray-800 flex items-center">
                      <BookMarked className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                      {book.isbn || "N/A"}
                    </div>
                  </div>

                  {/* Format */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Format</div>
                    <div className="text-sm font-medium text-gray-800 flex items-center">
                      <BookText className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                      {book.format || "Paperback"}
                    </div>
                  </div>

                  {/* Language */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Language</div>
                    <div className="text-sm font-medium text-gray-800 flex items-center">
                      <Globe className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                      {book.language || "English"}
                    </div>
                  </div>

                  {/* Publication Date */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Published</div>
                    <div className="text-sm font-medium text-gray-800 flex items-center">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                      {formatDate(book.publicationDate)}
                    </div>
                  </div>

                  {/* Publisher */}
                  {book.publisher && (
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Publisher
                      </div>
                      <div className="text-sm font-medium text-gray-800 flex items-center">
                        <Building className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                        {book.publisher}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Book Details */}
          <div className="lg:w-2/3">
            {/* Title and Author */}
            <div className="border-b border-gray-200 pb-4 mb-5">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              <div className="flex items-center text-gray-700">
                <User className="w-4 h-4 mr-2 text-indigo-500" />
                <span className="text-lg">{book.author}</span>

                {book.exclusiveEdition && (
                  <span className="ml-3 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium flex items-center">
                    <Award className="w-3.5 h-3.5 mr-1" />
                    {book.exclusiveEdition}
                  </span>
                )}
              </div>
            </div>

            {/* Rating and Genre */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                  <Tag className="w-4 h-4 mr-1.5" />
                  {book.genre || "Uncategorized"}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  {book.rating ? renderStars(book.rating) : renderStars(0)}
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {book.rating ? book.rating.toFixed(1) : "0.0"}
                  </span>
                </div>
                <span className="text-xs text-gray-500 mt-0.5">
                  {book.reviewCount || 0} customer reviews
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
                Book Description
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="prose prose-indigo prose-sm max-w-none text-gray-600 leading-relaxed">
                  {book.description ? (
                    <p>{book.description}</p>
                  ) : (
                    <p className="text-gray-400 italic">
                      No description available for this book.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(book.pageCount ||
              book.dimensions ||
              book.stock !== undefined) && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-indigo-600" />
                  Additional Information
                </h2>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Stock */}
                    {book.stock !== undefined && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">
                          Stock
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {book.stock} copies
                        </span>
                      </div>
                    )}

                    {/* Page Count */}
                    {book.pageCount && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">
                          Pages
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {book.pageCount}
                        </span>
                      </div>
                    )}

                    {/* Dimensions */}
                    {book.dimensions && (
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">
                          Dimensions
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {book.dimensions}
                        </span>
                      </div>
                    )}

                    {/* Library Availability */}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 mb-1">
                        Library Access
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          book.isAvailableInLibrary
                            ? "text-green-700"
                            : "text-gray-700"
                        }`}
                      >
                        {book.isAvailableInLibrary
                          ? "Available in physical library"
                          : "Not available in library"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 border-t border-gray-200 pt-6 flex items-center justify-between">
              {/* Left side */}
              <div>
                {book.inStock && (
                  <div className="text-sm text-gray-700 flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-1.5" />
                    <span>
                      Ready to ship with{" "}
                      {book.stock > 5 ? "plenty" : book.stock} in stock
                    </span>
                  </div>
                )}
              </div>

              {/* Right side */}
              <div className="flex space-x-3">
                {onEdit && (
                  <button
                    onClick={() => onEdit(book)}
                    className="px-4 py-2 border border-indigo-300 bg-indigo-50 rounded-lg shadow-sm text-sm font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    <Pencil className="w-4 h-4 inline mr-1.5" />
                    Edit Book
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <X className="w-4 h-4 inline mr-1.5" />
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsModal;
