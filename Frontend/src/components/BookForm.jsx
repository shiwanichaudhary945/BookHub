import React, { useState, useEffect } from "react";

const BookForm = ({ book, mode, onSubmit, onCancel, availableGenres }) => {
  // Initialize form data from props or defaults for new book
  const [formData, setFormData] = useState({
    id: book?.id || "",
    title: book?.title || "",
    author: book?.author || "",
    description: book?.description || "",
    price: book?.price || 0,
    discountPercentage: book?.discountPercentage || 0,
    imageUrl: book?.imageUrl || "",
    genre: book?.genre || "",
    inStock: book?.inStock !== undefined ? book.inStock : true,
    rating: book?.rating || 0,
    reviewCount: book?.reviewCount || 0,
    publisher: book?.publisher || "",
    language: book?.language || "English",
    isbn: book?.isbn || "",
    publicationDate: book?.publicationDate || "",
    pageCount: book?.pageCount || 0,
    format: book?.format || "Paperback",
  });

  // Form validation
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Update form data when book prop changes
  useEffect(() => {
    if (book) {
      setFormData({
        id: book.id || "",
        title: book.title || "",
        author: book.author || "",
        description: book.description || "",
        price: book.price || 0,
        discountPercentage: book.discountPercentage || 0,
        imageUrl: book.imageUrl || "",
        genre: book.genre || "",
        inStock: book.inStock !== undefined ? book.inStock : true,
        rating: book.rating || 0,
        reviewCount: book.reviewCount || 0,
        publisher: book.publisher || "",
        language: book.language || "English",
        isbn: book.isbn || "",
        publicationDate: book.publicationDate || "",
        pageCount: book.pageCount || 0,
        format: book.format || "Paperback",
      });
    }
  }, [book]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle different input types
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "number") {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Author is required";
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (formData.discountPercentage < 0 || formData.discountPercentage > 100) {
      newErrors.discountPercentage = "Discount must be between 0 and 100";
    }

    if (formData.pageCount < 0) {
      newErrors.pageCount = "Page count cannot be negative";
    }

    // Set errors and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                submitted && errors.title
                  ? "border-red-300 ring-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {submitted && errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700"
            >
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className={`mt-1 block w-full px-3 py-2 border ${
                submitted && errors.author
                  ? "border-red-300 ring-red-500"
                  : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {submitted && errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {formData.imageUrl && (
              <div className="mt-2 flex justify-center">
                <img
                  src={formData.imageUrl}
                  alt="Book cover preview"
                  className="h-40 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/150x225?text=Invalid+URL";
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`block w-full pl-7 pr-12 py-2 border ${
                    submitted && errors.price
                      ? "border-red-300 ring-red-500"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                />
              </div>
              {submitted && errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="discountPercentage"
                className="block text-sm font-medium text-gray-700"
              >
                Discount (%)
              </label>
              <input
                type="number"
                id="discountPercentage"
                name="discountPercentage"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  submitted && errors.discountPercentage
                    ? "border-red-300 ring-red-500"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {submitted && errors.discountPercentage && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.discountPercentage}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="inStock"
              name="inStock"
              checked={formData.inStock}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="inStock"
              className="ml-2 block text-sm text-gray-900"
            >
              In Stock
            </label>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="genre"
              className="block text-sm font-medium text-gray-700"
            >
              Genre
            </label>
            <input
              type="text"
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              list="genreList"
            />
            <datalist id="genreList">
              {availableGenres.map((genre, index) => (
                <option key={index} value={genre} />
              ))}
            </datalist>
          </div>

          <div>
            <label
              htmlFor="publisher"
              className="block text-sm font-medium text-gray-700"
            >
              Publisher
            </label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              value={formData.publisher}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700"
            >
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="isbn"
              className="block text-sm font-medium text-gray-700"
            >
              ISBN
            </label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="publicationDate"
              className="block text-sm font-medium text-gray-700"
            >
              Publication Date
            </label>
            <input
              type="date"
              id="publicationDate"
              name="publicationDate"
              value={formData.publicationDate}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="pageCount"
                className="block text-sm font-medium text-gray-700"
              >
                Page Count
              </label>
              <input
                type="number"
                id="pageCount"
                name="pageCount"
                min="0"
                value={formData.pageCount}
                onChange={handleInputChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  submitted && errors.pageCount
                    ? "border-red-300 ring-red-500"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {submitted && errors.pageCount && (
                <p className="mt-1 text-sm text-red-600">{errors.pageCount}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="format"
                className="block text-sm font-medium text-gray-700"
              >
                Format
              </label>
              <select
                id="format"
                name="format"
                value={formData.format}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Paperback">Paperback</option>
                <option value="Hardcover">Hardcover</option>
                <option value="eBook">eBook</option>
                <option value="Audiobook">Audiobook</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {mode === "add" ? "Add Book" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default BookForm;
