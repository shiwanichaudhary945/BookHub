import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  DollarSign,
  Tag,
  Calendar,
  FileText,
  User,
  Upload,
  Check,
  X,
  Percent,
  Info,
  Globe,
} from "lucide-react";

const BookForm = ({ book, mode, onSubmit, onCancel, availableGenres = [] }) => {
  // Reference to file input
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    isbn: "",
    author: "",
    description: "",
    genre: "",
    price: "",
    discountPercentage: "",
    discountStartDate: "",
    discountEndDate: "",
    stock: "",
    language: "English",
    format: "Paperback",
    publisher: "",
    publicationDate: "",
    imageUrl: "",
    bookPhoto: "",
    onSale: false,
    isAvailableInLibrary: false,
    exclusiveEdition: "",
  });

  // Image state
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Additional form states
  const [errors, setErrors] = useState({});
  const [isDiscountActive, setIsDiscountActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Track active section for accordion
  const [activeSections, setActiveSections] = useState({
    bookInfo: true,
    pricing: true,
    discounts: false,
  });

  // Initialize form with book data if editing
  useEffect(() => {
    if (book && mode === "edit") {
      // Format dates for input fields
      const formattedDiscountStartDate = book.discountStartDate
        ? new Date(book.discountStartDate).toISOString().split("T")[0]
        : "";

      const formattedDiscountEndDate = book.discountEndDate
        ? new Date(book.discountEndDate).toISOString().split("T")[0]
        : "";

      const formattedPublicationDate = book.publicationDate
        ? new Date(book.publicationDate).toISOString().split("T")[0]
        : "";

      // Determine which image field to use
      const bookImage = book.bookPhoto || book.imageUrl || "";

      setFormData({
        bookId: book.bookId || "",
        title: book.title || "",
        isbn: book.isbn || "",
        author: book.author || "",
        description: book.description || "",
        genre: book.genre || "",
        price: book.price || 0,
        discountPercentage: book.discountPercentage || 0,
        discountStartDate: formattedDiscountStartDate,
        discountEndDate: formattedDiscountEndDate,
        stock: book.stock || 0,
        language: book.language || "English",
        format: book.format || "Paperback",
        publisher: book.publisher || "",
        publicationDate: formattedPublicationDate,
        imageUrl: bookImage,
        bookPhoto: bookImage,
        onSale: book.onSale || false,
        isAvailableInLibrary: book.isAvailableInLibrary || false,
        exclusiveEdition: book.exclusiveEdition || "",
      });

      // Set image preview for existing image
      if (bookImage) {
        setImagePreview(bookImage);
      }

      setIsDiscountActive(book.discountPercentage > 0);
      if (book.discountPercentage > 0) {
        setActiveSections((prev) => ({ ...prev, discounts: true }));
      }
    }
  }, [book, mode]);

  // Toggle section visibility
  const toggleSection = (section) => {
    setActiveSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // For checkbox inputs
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
      return;
    }

    // For number inputs
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
      return;
    }

    // For all other inputs
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  // Process the selected file
  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.match("image.*")) {
      setErrors({
        ...errors,
        image: "Please select an image file (JPEG, PNG, etc.)",
      });
      return;
    }

    // Clear any previous errors
    setErrors({
      ...errors,
      image: null,
    });

    // Save the file
    setSelectedFile(file);
    setFormData({
      ...formData,
      bookPhotoFile: file, // Add the file directly to formData
    });

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Remove the selected image
  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview("");

    // Update formData to remove the file
    const updatedFormData = { ...formData };
    delete updatedFormData.bookPhotoFile;
    setFormData(updatedFormData);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Toggle discount section
  const handleDiscountToggle = (e) => {
    const isChecked = e.target.checked;
    setIsDiscountActive(isChecked);

    // Open discount section when activated
    if (isChecked) {
      setActiveSections((prev) => ({ ...prev, discounts: true }));
    }

    // Reset discount values if turning off
    if (!isChecked) {
      setFormData({
        ...formData,
        discountPercentage: 0,
        discountStartDate: "",
        discountEndDate: "",
        onSale: false,
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "title",
      "author",
      "isbn",
      "description",
      "genre",
      "format",
      "publicationDate",
      "stock",
      "price",
      "publisher",
      "language",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      newErrors.form = `The following fields are required: ${missingFields.join(
        ", "
      )}`;
    }

    if (formData.price < 0) {
      newErrors.price = "Price cannot be negative";
    }

    if (formData.stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    if (isDiscountActive) {
      if (
        formData.discountPercentage <= 0 ||
        formData.discountPercentage > 100
      ) {
        newErrors.discountPercentage = "Discount must be between 1% and 100%";
      }

      if (!formData.discountStartDate) {
        newErrors.discountStartDate = "Start date is required for discounts";
      }

      if (!formData.discountEndDate) {
        newErrors.discountEndDate = "End date is required for discounts";
      }

      if (
        formData.discountStartDate &&
        formData.discountEndDate &&
        new Date(formData.discountStartDate) >=
          new Date(formData.discountEndDate)
      ) {
        newErrors.discountEndDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convert a date string to UTC ISO string properly
  const toUTCISOString = (dateString) => {
    if (!dateString) return null;

    // Create a date object from the input date string (YYYY-MM-DD)
    // This will create a date at 00:00:00 in the local timezone
    const localDate = new Date(dateString);

    // Ensure it's a valid date
    if (isNaN(localDate.getTime())) return null;

    // Create a new Date at UTC midnight for the same calendar date
    // This ensures consistent date representation regardless of timezone
    const year = localDate.getFullYear();
    const month = localDate.getMonth();
    const day = localDate.getDate();

    // Create date with UTC components
    const utcDate = new Date(Date.UTC(year, month, day));

    // Return UTC ISO string
    return utcDate.toISOString();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submission started");

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      // Create a new FormData object manually instead of using the form element
      const submitFormData = new FormData();

      // FIXED: Add all fields manually to ensure correct values and avoid form element quirks

      // Add text fields
      submitFormData.append("Title", formData.title);
      submitFormData.append("Author", formData.author);
      submitFormData.append("Isbn", formData.isbn);
      submitFormData.append("Description", formData.description);
      submitFormData.append("Genre", formData.genre);
      submitFormData.append("Price", formData.price.toString());
      submitFormData.append("Stock", formData.stock.toString());
      submitFormData.append("Language", formData.language);
      submitFormData.append("Format", formData.format);
      submitFormData.append("Publisher", formData.publisher);

      // FIX: Set boolean values explicitly as strings "true" or "false"
      submitFormData.append(
        "IsAvailableInLibrary",
        formData.isAvailableInLibrary ? "true" : "false"
      );
      submitFormData.append(
        "OnSale",
        isDiscountActive && formData.onSale ? "true" : "false"
      );

      if (formData.exclusiveEdition) {
        submitFormData.append("ExclusiveEdition", formData.exclusiveEdition);
      }

      // Handle dates with proper UTC formatting
      if (formData.publicationDate) {
        const utcPublicationDate = toUTCISOString(formData.publicationDate);
        if (utcPublicationDate) {
          submitFormData.append("PublicationDate", utcPublicationDate);
        }
      }

      // Handle discount-related fields
      if (isDiscountActive) {
        submitFormData.append(
          "DiscountPercentage",
          formData.discountPercentage.toString()
        );

        if (formData.discountStartDate) {
          const utcDiscountStartDate = toUTCISOString(
            formData.discountStartDate
          );
          if (utcDiscountStartDate) {
            submitFormData.append("DiscountStartDate", utcDiscountStartDate);
          }
        }

        if (formData.discountEndDate) {
          const utcDiscountEndDate = toUTCISOString(formData.discountEndDate);
          if (utcDiscountEndDate) {
            submitFormData.append("DiscountEndDate", utcDiscountEndDate);
          }
        }
      } else {
        submitFormData.append("DiscountPercentage", "0");
      }

      // For edit mode, ensure ID is included
      if (mode === "edit" && formData.bookId) {
        submitFormData.append("Id", formData.bookId);
      }

      // Handle file uploads
      if (selectedFile) {
        submitFormData.append("BookPhotoFile", selectedFile);
        submitFormData.append("BookCoverFile", selectedFile);
      } else if (formData.bookPhoto || formData.imageUrl) {
        // If we have an existing image URL but no new file
        submitFormData.append(
          "BookPhoto",
          formData.bookPhoto || formData.imageUrl
        );
        submitFormData.append(
          "ImageUrl",
          formData.imageUrl || formData.bookPhoto
        );
      }

      // Log the FormData entries for debugging
      console.log("Final FormData entries:");
      for (let [key, value] of submitFormData.entries()) {
        console.log(
          key +
            ": " +
            (value instanceof File
              ? `FILE: ${value.name} (${value.size} bytes)`
              : value)
        );
      }

      // Submit the FormData
      console.log("Submitting form data");
      await onSubmit(submitFormData);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onCancel(true); // Close the form with success
      }, 1500);
    } catch (err) {
      console.error("Error in form submission:", err);
      setErrors({
        ...errors,
        form: "Error submitting form: " + (err.message || "An error occurred"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Available book formats
  const bookFormats = [
    "Paperback",
    "Hardcover",
    "Signed Edition",
    "Limited Edition",
    "First Edition",
    "Collector's Edition",
    "Illustrated Edition",
    "Deluxe Edition",
    "eBook",
  ];

  // Available languages
  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
    "Russian",
    "Arabic",
    "Hindi",
    "Portuguese",
    "Other",
  ];

  // Render required field indicator
  const RequiredField = () => <span className="text-red-500 ml-1">*</span>;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
      encType="multipart/form-data"
    >
      {/* Header with status indicators */}

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700 p-4 animate-pulse shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                Book {mode === "edit" ? "updated" : "added"} successfully!
              </p>
              <p className="text-xs mt-1">
                The page will refresh in a moment...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {errors.form && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 p-4 shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">There was an error</p>
              <p className="text-sm mt-1">{errors.form}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick navigation */}
      <div className="bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-1 text-sm overflow-x-auto pb-1">
          <span className="text-gray-500 px-2">Jump to:</span>
          <button
            type="button"
            onClick={() => toggleSection("bookInfo")}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors whitespace-nowrap"
          >
            Book Information
          </button>
          <button
            type="button"
            onClick={() => toggleSection("pricing")}
            className="px-3 py-1 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors whitespace-nowrap"
          >
            Pricing & Inventory
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveSections((prev) => ({ ...prev, discounts: true }));
              setIsDiscountActive(true);
            }}
            className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors whitespace-nowrap"
          >
            Discount Settings
          </button>
          <button
            type="button"
            onClick={handleBrowseClick}
            className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors whitespace-nowrap"
          >
            Cover Image
          </button>
        </div>
      </div>

      {/* Book Image Upload - Featured at the top */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl shadow-md border border-gray-200">
        <div className="absolute top-0 right-0 left-0 h-20 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
        <div className="relative p-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Image preview */}
            <div className="md:w-1/4 flex flex-col items-center">
              <div className="relative">
                <div
                  className={`h-52 w-40 rounded-lg shadow-md overflow-hidden bg-white border-2 ${
                    imagePreview
                      ? "border-indigo-300"
                      : "border-dashed border-gray-300"
                  } flex items-center justify-center`}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Book cover preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <BookOpen className="h-16 w-16 mx-auto text-gray-300" />
                      <p className="text-sm text-gray-500 mt-2">
                        No cover image
                      </p>
                    </div>
                  )}
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 shadow-md hover:bg-red-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {mode === "edit" && !selectedFile && formData.bookPhoto && (
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Current image: {formData.bookPhoto.split("/").pop()}
                </p>
              )}
            </div>

            {/* Upload area */}
            <div className="md:w-3/4">
              <h3 className="text-lg font-semibold mb-3 flex items-center text-gray-800">
                <Upload className="w-5 h-5 mr-2 text-indigo-600" />
                Book Cover Image
                {!imagePreview && !mode === "edit" && <RequiredField />}
              </h3>

              <div
                className={`border-2 border-dashed rounded-lg ${
                  isDragging
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-300 hover:border-indigo-300 hover:bg-gray-50"
                } ${
                  errors.image ? "border-red-300" : ""
                } p-6 text-center cursor-pointer transition-all duration-200`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  name="BookPhotoFile"
                />
                <div className="space-y-3">
                  <div className="mx-auto h-12 w-12 text-indigo-500 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col items-center text-sm text-gray-600">
                    <p className="font-medium">
                      <span className="text-indigo-600 hover:text-indigo-500 hover:underline">
                        Click to upload
                      </span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      SVG, PNG, JPG or GIF (Max. 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {errors.image && (
                <p className="mt-2 text-sm text-red-600">{errors.image}</p>
              )}

              <div className="mt-4 bg-indigo-50 rounded-lg p-3 text-sm text-indigo-700">
                <div className="flex">
                  <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>
                    High-quality cover images improve book visibility and sales.
                    For best results, use an image with a 2:3 ratio (e.g.,
                    400×600 pixels) with the book title clearly visible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information Section */}
      <div
        className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
          activeSections.bookInfo
            ? "border-blue-200 border"
            : "border border-gray-200"
        }`}
      >
        {/* Section header */}
        <button
          type="button"
          onClick={() => toggleSection("bookInfo")}
          className={`w-full px-6 py-4 flex justify-between items-center ${
            activeSections.bookInfo ? "bg-blue-50" : "bg-gray-50"
          } text-left`}
        >
          <div className="flex items-center">
            <FileText
              className={`w-5 h-5 mr-2 ${
                activeSections.bookInfo ? "text-blue-600" : "text-gray-500"
              }`}
            />
            <h3
              className={`text-lg font-medium ${
                activeSections.bookInfo ? "text-blue-800" : "text-gray-700"
              }`}
            >
              Book Information
            </h3>
          </div>
          <svg
            className={`w-5 h-5 transform transition-transform ${
              activeSections.bookInfo
                ? "rotate-180 text-blue-600"
                : "text-gray-400"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Section content */}
        {activeSections.bookInfo && (
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <RequiredField />
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${
                    errors.title
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-blue-500"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
                  placeholder="Enter book title"
                  required
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author <RequiredField />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.author
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-blue-500"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
                    placeholder="Author name"
                    required
                  />
                </div>
                {errors.author && (
                  <p className="mt-1 text-sm text-red-600">{errors.author}</p>
                )}
              </div>

              {/* ISBN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN <RequiredField />
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${
                    errors.isbn
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-blue-500"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
                  placeholder="e.g. 978-3-16-148410-0"
                  required
                />
                {errors.isbn && (
                  <p className="mt-1 text-sm text-red-600">{errors.isbn}</p>
                )}
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <RequiredField />
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-2.5 border ${
                    errors.description
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-blue-500"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
                  placeholder="Provide a compelling book description that will attract readers..."
                  required
                  style={{ minHeight: "120px" }}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Genre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Genre <RequiredField />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 border ${
                      errors.genre
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-blue-500"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none transition-colors`}
                    required
                  >
                    <option value="">Select a genre</option>

                    {/* Fiction */}
                    <optgroup label="Fiction">
                      <option value="Literary Fiction">Literary Fiction</option>
                      <option value="Historical Fiction">
                        Historical Fiction
                      </option>
                      <option value="Contemporary Fiction">
                        Contemporary Fiction
                      </option>
                    </optgroup>

                    {/* Popular Fiction */}
                    <optgroup label="Popular Fiction">
                      <option value="Science Fiction">Science Fiction</option>
                      <option value="Fantasy">Fantasy</option>
                      <option value="Mystery">Mystery</option>
                      <option value="Thriller">Thriller</option>
                      <option value="Horror">Horror</option>
                      <option value="Romance">Romance</option>
                      <option value="Crime">Crime</option>
                    </optgroup>

                    {/* Non-Fiction */}
                    <optgroup label="Non-Fiction">
                      <option value="Biography">Biography</option>
                      <option value="Memoir">Memoir</option>
                      <option value="History">History</option>
                      <option value="Science & Nature">Science & Nature</option>
                      <option value="Technology">Technology</option>
                      <option value="Business & Economics">
                        Business & Economics
                      </option>
                      <option value="Self-Help">Self-Help</option>
                      <option value="Health & Wellness">
                        Health & Wellness
                      </option>
                      <option value="Travel">Travel</option>
                      <option value="Food & Cooking">Food & Cooking</option>
                      <option value="Art & Photography">
                        Art & Photography
                      </option>
                    </optgroup>

                    {/* Age Groups */}
                    <optgroup label="Age Groups">
                      <option value="Children's">Children's</option>
                      <option value="Middle Grade">Middle Grade</option>
                      <option value="Young Adult">Young Adult</option>
                    </optgroup>

                    {/* Other */}
                    <option value="Poetry">Poetry</option>
                    <option value="Drama">Drama</option>
                    <option value="Graphic Novel">Graphic Novel</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.genre && (
                  <p className="mt-1 text-sm text-red-600">{errors.genre}</p>
                )}
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format <RequiredField />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 border ${
                      errors.format
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-blue-500"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none transition-colors`}
                    required
                  >
                    {bookFormats.map((format) => (
                      <option key={format} value={format}>
                        {format}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.format && (
                  <p className="mt-1 text-sm text-red-600">{errors.format}</p>
                )}
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language <RequiredField />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-10 py-2.5 border ${
                      errors.language
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-blue-500"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none transition-colors`}
                    required
                  >
                    {languages.map((language) => (
                      <option key={language} value={language}>
                        {language}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                {errors.language && (
                  <p className="mt-1 text-sm text-red-600">{errors.language}</p>
                )}
              </div>

              {/* Publisher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publisher <RequiredField />
                </label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${
                    errors.publisher
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-blue-500"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
                  placeholder="Publisher name"
                  required
                />
                {errors.publisher && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.publisher}
                  </p>
                )}
              </div>

              {/* Publication Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publication Date <RequiredField />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="publicationDate"
                    value={formData.publicationDate}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.publicationDate
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-blue-500"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors`}
                    required
                  />
                </div>
                {errors.publicationDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.publicationDate}
                  </p>
                )}
              </div>

              {/* Exclusive Edition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exclusive Edition (if any)
                </label>
                <input
                  type="text"
                  name="exclusiveEdition"
                  value={formData.exclusiveEdition}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                  placeholder="e.g. Signed, Collector's, First"
                />
              </div>

              {/* Callout box with tips */}
              <div className="col-span-2 mt-2">
                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Publisher & ISBN guidelines
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>
                          Ensure the ISBN is formatted correctly (e.g.,
                          978-3-16-148410-0) as this helps retailers identify
                          your book.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pricing & Inventory Section */}
      <div
        className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
          activeSections.pricing
            ? "border-green-200 border"
            : "border border-gray-200"
        }`}
      >
        {/* Section header */}
        <button
          type="button"
          onClick={() => toggleSection("pricing")}
          className={`w-full px-6 py-4 flex justify-between items-center ${
            activeSections.pricing ? "bg-green-50" : "bg-gray-50"
          } text-left`}
        >
          <div className="flex items-center">
            <DollarSign
              className={`w-5 h-5 mr-2 ${
                activeSections.pricing ? "text-green-600" : "text-gray-500"
              }`}
            />
            <h3
              className={`text-lg font-medium ${
                activeSections.pricing ? "text-green-800" : "text-gray-700"
              }`}
            >
              Pricing & Inventory
            </h3>
          </div>
          <svg
            className={`w-5 h-5 transform transition-transform ${
              activeSections.pricing
                ? "rotate-180 text-green-600"
                : "text-gray-400"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Section content */}
        {activeSections.pricing && (
          <div className="p-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) <RequiredField />
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full pl-10 pr-4 py-2.5 border ${
                      errors.price
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-green-500"
                    } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition-colors`}
                    required
                  />
                </div>
                {errors.price ? (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the base price before any discounts
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity <RequiredField />
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2.5 border ${
                    errors.stock
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 focus:border-green-500"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-200 transition-colors`}
                  required
                />
                {errors.stock ? (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Enter 0 for out of stock
                  </p>
                )}
              </div>

              {/* Library availability */}
              <div className="col-span-2 bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="isAvailableInLibrary"
                      name="isAvailableInLibrary"
                      type="checkbox"
                      checked={formData.isAvailableInLibrary}
                      onChange={handleChange}
                      className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500 transition-colors"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="isAvailableInLibrary"
                      className="text-sm font-medium text-gray-700"
                    >
                      Available in Physical Library
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Check if this book is available for access in the physical
                      library
                    </p>
                  </div>
                </div>
              </div>

              {/* Price preview card */}
              <div className="col-span-2">
                <div className="bg-white border border-green-200 rounded-lg p-4 shadow-sm">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Price Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-gray-500">Base Price:</span>
                      <div className="text-lg font-semibold text-gray-800">
                        {formatCurrency(formData.price)}
                      </div>
                    </div>

                    {isDiscountActive && formData.discountPercentage > 0 && (
                      <>
                        <div>
                          <span className="text-xs text-gray-500">
                            Discount:
                          </span>
                          <div className="text-lg font-medium text-red-600">
                            -{formData.discountPercentage}%
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-gray-500">
                            Final Price:
                          </span>
                          <div className="text-lg font-bold text-green-600">
                            {formatCurrency(
                              formData.price *
                                (1 - formData.discountPercentage / 100)
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-xs text-gray-500">
                            Customer Saves:
                          </span>
                          <div className="text-lg font-medium text-indigo-600">
                            {formatCurrency(
                              formData.price *
                                (formData.discountPercentage / 100)
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Apply Discount toggle */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="form-control">
                    <label className="cursor-pointer label flex items-center space-x-2">
                      <input
                        id="hasDiscount"
                        type="checkbox"
                        checked={isDiscountActive}
                        onChange={handleDiscountToggle}
                        className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 transition-colors"
                      />
                      <span className="label-text ml-2 text-sm font-medium text-gray-700">
                        Apply Discount
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    <Percent className="w-3 h-3 mr-1" />
                    Promotional Pricing
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Discount section */}
      {isDiscountActive && (
        <div
          className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${
            activeSections.discounts
              ? "border-orange-200 border"
              : "border border-gray-200"
          }`}
        >
          {/* Section header */}
          <button
            type="button"
            onClick={() => toggleSection("discounts")}
            className={`w-full px-6 py-4 flex justify-between items-center ${
              activeSections.discounts ? "bg-orange-50" : "bg-gray-50"
            } text-left`}
          >
            <div className="flex items-center">
              <Percent
                className={`w-5 h-5 mr-2 ${
                  activeSections.discounts ? "text-orange-600" : "text-gray-500"
                }`}
              />
              <h3
                className={`text-lg font-medium ${
                  activeSections.discounts ? "text-orange-800" : "text-gray-700"
                }`}
              >
                Discount Settings
              </h3>
            </div>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                activeSections.discounts
                  ? "rotate-180 text-orange-600"
                  : "text-gray-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Section content */}
          {activeSections.discounts && (
            <div className="p-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Discount percentage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Percentage (%) <RequiredField />
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={formData.discountPercentage}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        errors.discountPercentage
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-orange-500"
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors`}
                      required={isDiscountActive}
                    />
                  </div>
                  {errors.discountPercentage ? (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.discountPercentage}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      Enter a value between 1-100
                    </p>
                  )}
                </div>

                {/* "On Sale" flag */}
                <div className="flex items-center bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center h-5">
                    <input
                      id="onSale"
                      name="onSale"
                      type="checkbox"
                      checked={formData.onSale}
                      onChange={handleChange}
                      className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 transition-colors"
                    />
                  </div>
                  <div className="ml-3">
                    <label
                      htmlFor="onSale"
                      className="text-sm font-medium text-gray-700"
                    >
                      Mark as "On Sale"
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Display a special sale badge to highlight this discount
                    </p>
                  </div>
                </div>

                {/* Discount start date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <RequiredField />
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="discountStartDate"
                      value={formData.discountStartDate}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        errors.discountStartDate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-orange-500"
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors`}
                      required={isDiscountActive}
                    />
                  </div>
                  {errors.discountStartDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.discountStartDate}
                    </p>
                  )}
                </div>

                {/* Discount end date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <RequiredField />
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="discountEndDate"
                      value={formData.discountEndDate}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border ${
                        errors.discountEndDate
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-orange-500"
                      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-200 transition-colors`}
                      required={isDiscountActive}
                    />
                  </div>
                  {errors.discountEndDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.discountEndDate}
                    </p>
                  )}
                </div>

                {/* Discount visualization */}
                <div className="md:col-span-2">
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-5 border border-orange-100 shadow-sm">
                    <h4 className="text-sm font-medium text-orange-800 mb-3">
                      Discount Preview
                    </h4>
                    <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-4 sm:mb-0">
                        <div className="relative">
                          <div className="w-16 h-24 bg-gray-200 rounded-md overflow-hidden"></div>
                          {formData.onSale && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center transform rotate-12 shadow-md">
                              SALE
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-700">
                            Sample Book Title
                          </div>
                          <div className="text-xs text-gray-500">
                            by Author Name
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <div className="flex items-center">
                          <span className="line-through text-sm text-gray-500 mr-2">
                            {formatCurrency(formData.price)}
                          </span>
                          <span className="font-bold text-lg text-red-600">
                            {formatCurrency(
                              formData.price *
                                (1 - formData.discountPercentage / 100)
                            )}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-green-600 mt-1">
                          Save {formData.discountPercentage}% (
                          {formatCurrency(
                            (formData.price * formData.discountPercentage) / 100
                          )}
                          )
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formData.discountStartDate &&
                            formData.discountEndDate && (
                              <>
                                Valid:{" "}
                                {new Date(
                                  formData.discountStartDate
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {new Date(
                                  formData.discountEndDate
                                ).toLocaleDateString()}
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form buttons */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-md rounded-b-lg mt-8 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-6 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-all duration-200 ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          }`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {mode === "add" ? "Adding Book..." : "Updating Book..."}
            </span>
          ) : (
            <>{mode === "add" ? "Add Book" : "Update Book"}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default BookForm;
