import React from "react";

const BookCard = ({ book }) => {
  // Default values in case any data is missing
  const {
    id = "",
    title = "Untitled Book",
    author = "Unknown Author",
    price = 0.0,
    imageUrl = "https://via.placeholder.com/150x225",
    genre = "General",
    rating = 0,
    discountPercentage = 0,
  } = book || {};

  // Calculate discounted price
  const discountedPrice = price - price * (discountPercentage / 100);

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
          className="w-4 h-4 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
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
          className="w-4 h-4 text-yellow-400 fill-current"
          viewBox="0 0 20 20"
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
          className="w-4 h-4 text-gray-300 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
      {/* Book Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/150x225?text=No+Image";
          }}
        />

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 m-2 rounded">
            {discountPercentage}% OFF
          </div>
        )}

        {/* Genre Badge */}
        <div className="absolute top-0 left-0 bg-indigo-600 text-white text-xs font-bold px-2 py-1 m-2 rounded">
          {genre}
        </div>
      </div>

      {/* Book Details */}
      <div className="p-4 flex-grow flex flex-col">
        <h3
          className="text-lg font-semibold text-gray-800 line-clamp-2 mb-1"
          title={title}
        >
          {title}
        </h3>

        <p className="text-sm text-gray-600 mb-2" title={author}>
          by {author}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex mr-1">{renderRating(rating)}</div>
          <span className="text-xs text-gray-500">({rating.toFixed(1)})</span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-center">
          {discountPercentage > 0 ? (
            <>
              <span className="text-lg font-bold text-indigo-600">
                ${formatPrice(discountedPrice)}
              </span>
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${formatPrice(price)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-indigo-600">
              ${formatPrice(price)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
