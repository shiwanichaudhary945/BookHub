import React, { useState, useEffect } from "react";
import BookForm from "../components/BookForm";
import Sidebar from "../components/Sidebar";
import BookDetailsModal from "../components/BookDetailsModal"; // Using the existing component

const AdminBookManagement = () => {
  // State for books data
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGenre, setFilterGenre] = useState("");
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");
  const [genres, setGenres] = useState([]);

  // State for modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formMode, setFormMode] = useState("add"); // 'add' or 'edit'
  const [currentBook, setCurrentBook] = useState(null);

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  // State for notifications
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  // Fetch books with pagination, search, and filters
  useEffect(() => {
    fetchBooks();
  }, [
    currentPage,
    pageSize,
    searchTerm,
    filterGenre,
    sortField,
    sortDirection,
  ]);

  // Fetch books function
  const fetchBooks = async () => {
    try {
      setLoading(true);

      // Construct query parameters
      const params = new URLSearchParams({
        page: currentPage,
        pageSize,
        sortField,
        sortDirection,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterGenre) params.append("genre", filterGenre);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(
        `https://localhost:7133/api/Book/BookPagination?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }

      const data = await response.json();

      setBooks(data.data.items.$values || []);
      setTotalPages(data.totalPages || 1);

      // Extract unique genres for filter dropdown
      const uniqueGenres = new Set();
      data.data.items.$values.forEach((book) => {
        if (book.genre) uniqueGenres.add(book.genre);
      });
      setGenres(Array.from(uniqueGenres).sort());
    } catch (error) {
      console.error("Error fetching books:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Convert a date string to UTC ISO string
  const toUTCISOString = (dateString) => {
    if (!dateString) return null;

    // Create a date object from the input date string (YYYY-MM-DD)
    // This will create a date at 00:00:00 in the local timezone
    const localDate = new Date(dateString);

    // Ensure it's a valid date
    if (isNaN(localDate.getTime())) return null;

    // Create a new Date at UTC midnight for the same calendar day
    const year = localDate.getFullYear();
    const month = localDate.getMonth();
    const day = localDate.getDate();

    // Create date with UTC components
    const utcDate = new Date(Date.UTC(year, month, day));

    // Return UTC ISO string
    return utcDate.toISOString();
  };

  // Process FormData to convert dates to UTC before API submission
  const processFormDataDates = (formData) => {
    // Create a new FormData object to avoid modifying the original
    const processedFormData = new FormData();

    // Copy all entries from the original FormData
    for (let [key, value] of formData.entries()) {
      // Process date fields
      if (key === "PublicationDate" || key === "publicationDate") {
        const utcDate = toUTCISOString(value);
        if (utcDate) {
          processedFormData.append("PublicationDate", utcDate);
          console.log(`Converting ${key} to UTC:`, utcDate);
        } else {
          processedFormData.append(key, value);
        }
      } else if (key === "DiscountStartDate" || key === "discountStartDate") {
        const utcDate = toUTCISOString(value);
        if (utcDate) {
          processedFormData.append("DiscountStartDate", utcDate);
          console.log(`Converting ${key} to UTC:`, utcDate);
        } else {
          processedFormData.append(key, value);
        }
      } else if (key === "DiscountEndDate" || key === "discountEndDate") {
        const utcDate = toUTCISOString(value);
        if (utcDate) {
          processedFormData.append("DiscountEndDate", utcDate);
          console.log(`Converting ${key} to UTC:`, utcDate);
        } else {
          processedFormData.append(key, value);
        }
      } else {
        // For non-date fields, just copy as is
        processedFormData.append(key, value);
      }
    }

    // Check if we should process discount-related fields
    let isDiscountActive = false;
    let discountPercentage = 0;

    // First, determine if discount is active by checking discount percentage
    for (let [key, value] of formData.entries()) {
      if (
        (key === "DiscountPercentage" || key === "discountPercentage") &&
        parseFloat(value) > 0
      ) {
        isDiscountActive = true;
        discountPercentage = parseFloat(value);
        break;
      }
    }

    // If discount is not active, ensure we don't send discount dates
    if (!isDiscountActive) {
      // Remove discount date entries if they exist
      if (processedFormData.has("DiscountStartDate"))
        processedFormData.delete("DiscountStartDate");
      if (processedFormData.has("DiscountEndDate"))
        processedFormData.delete("DiscountEndDate");
      if (processedFormData.has("discountStartDate"))
        processedFormData.delete("discountStartDate");
      if (processedFormData.has("discountEndDate"))
        processedFormData.delete("discountEndDate");

      // Ensure discount percentage is 0
      if (processedFormData.has("DiscountPercentage")) {
        processedFormData.set("DiscountPercentage", "0");
      } else if (processedFormData.has("discountPercentage")) {
        processedFormData.set("discountPercentage", "0");
      } else {
        processedFormData.append("DiscountPercentage", "0");
      }
    }

    return processedFormData;
  };

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Format price to 2 decimal places
  const formatPrice = (price) => {
    return (Math.round(price * 100) / 100).toFixed(2);
  };

  // Open modal for adding new book
  const handleAddNew = () => {
    setCurrentBook(null);
    setFormMode("add");
    setShowFormModal(true);
  };

  // Open modal for editing a book
  const handleEdit = (book) => {
    setCurrentBook(book);
    setFormMode("edit");
    setShowFormModal(true);
  };

  // Open modal for viewing book details
  const handleViewDetails = (book) => {
    setCurrentBook(book);
    setShowDetailsModal(true);
  };

  // Handle form submission (add or edit)
  const handleFormSubmit = async (formData) => {
    try {
      console.log("In AdminBookManagement, received formData:", formData);

      // Check if formData is empty or not a FormData object
      if (!formData || !(formData instanceof FormData)) {
        console.error("Invalid formData received:", formData);
        throw new Error("Invalid form data received");
      }

      // Check if FormData has entries
      let entryCount = 0;
      let hasFile = false;
      for (let [key, value] of formData.entries()) {
        entryCount++;
        console.log(
          `${key}: ${
            value instanceof File
              ? `FILE: ${value.name} (${value.size} bytes)`
              : value
          }`
        );
        if (value instanceof File) {
          hasFile = true;
        }
      }

      if (entryCount === 0) {
        console.error("FormData is empty!");
        throw new Error("No data received from form");
      }

      // PROCESS DATES HERE - Convert all dates to UTC format before sending to API
      const processedFormData = processFormDataDates(formData);

      // Log processed FormData entries for debugging
      console.log("Processed FormData entries with UTC dates:");
      for (let [key, value] of processedFormData.entries()) {
        console.log(
          `${key}: ${
            value instanceof File
              ? `FILE: ${value.name} (${value.size} bytes)`
              : value
          }`
        );
      }

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (formMode === "add") {
        // Add new book using Admin API endpoint with FormData
        const response = await fetch(
          "https://localhost:7133/api/Admin/AddBook",
          {
            method: "POST",
            headers: {
              // IMPORTANT: Do NOT set Content-Type here
              Authorization: `Bearer ${token}`,
            },
            body: processedFormData, // Use processed FormData with UTC dates
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error:", errorText);
          throw new Error(
            `Failed to add book: ${response.status} ${response.statusText}`
          );
        }

        showNotification("Book added successfully", "success");
      } else {
        // Update existing book using Admin API endpoint with FormData
        // Extract ID from formData if possible
        let bookId;
        for (let [key, value] of processedFormData.entries()) {
          if (key === "Id" || key === "id") {
            bookId = value;
            break;
          }
        }

        if (!bookId && currentBook) {
          bookId = currentBook.id;
          // Ensure ID is in the formData
          processedFormData.append("Id", bookId);
        }

        if (!bookId) {
          throw new Error("Book ID is missing for update operation");
        }

        const response = await fetch(
          `https://localhost:7133/api/Admin/UpdateBook/${bookId}`,
          {
            method: "PUT",
            headers: {
              // IMPORTANT: Do NOT set Content-Type here
              Authorization: `Bearer ${token}`,
            },
            body: processedFormData, // Use processed FormData with UTC dates
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error:", errorText);
          throw new Error(
            `Failed to update book: ${response.status} ${response.statusText}`
          );
        }

        showNotification("Book updated successfully", "success");
      }

      // Close modal and refresh book list
      setShowFormModal(false);
      fetchBooks();
    } catch (error) {
      console.error("Error saving book:", error);
      showNotification(`Error: ${error.message}`, "error");
    }
  };

  // Confirm book deletion
  const confirmDelete = (book) => {
    setBookToDelete(book);
    setShowDeleteConfirm(true);
  };

  // // Delete a book
  // const handleDelete = async () => {
  //   if (!bookToDelete) return;

  //   try {
  //     const token =
  //       localStorage.getItem("token") || sessionStorage.getItem("token");
  //     const response = await fetch(
  //       `https://localhost:7133/api/Admin/DeleteBook/${bookToDelete.id}`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error("Failed to delete book");
  //     }

  //     // Update the books list
  //     setBooks(books.filter((book) => book.id !== bookToDelete.id));
  //     showNotification("Book deleted successfully", "success");
  //   } catch (error) {
  //     console.error("Error deleting book:", error);
  //     showNotification(`Error: ${error.message}`, "error");
  //   } finally {
  //     setShowDeleteConfirm(false);
  //     setBookToDelete(null);
  //   }
  // };


  // Handle book deletion
const handleDelete = async () => {
  if (!bookToDelete) return;
  
  try {
    // Log the book object to debug
    console.log("Book to delete:", bookToDelete);
    
    // Get book ID using bookId property (not id)
    const bookId = bookToDelete.bookId;
    
    // Check if bookId exists
    if (!bookId) {
      console.error("Book ID is missing or undefined");
      throw new Error("Book ID is missing");
    }
    
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    
    // Log the delete URL with correct ID
    const deleteUrl = `https://localhost:7133/api/Admin/DeleteBook/${bookId}`;
    console.log("Delete URL:", deleteUrl);
    
    const response = await fetch(deleteUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error response:", errorText);
      throw new Error(`Failed to delete book: ${response.status} ${response.statusText}`);
    }

    // Update the books list - also use bookId for filtering
    setBooks(books.filter((book) => book.bookId !== bookId));
    showNotification("Book deleted successfully", "success");
  } catch (error) {
    console.error("Error deleting book:", error);
    showNotification(`Error: ${error.message}`, "error");
  } finally {
    setShowDeleteConfirm(false);
    setBookToDelete(null);
  }
};

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });

    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? (
      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414l-3.293 3.293a1 1 0 01-1.414 0zM10 15.586l-3.293-3.293a1 1 0 011.414-1.414L10 13.586l2.293-2.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 15.586l3.293-3.293a1 1 0 011.414 0zM10 4.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 4.414z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

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
      <div className="flex justify-center mt-6">
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

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Fixed position */}
      <div className="fixed z-10">
        <Sidebar />
      </div>

      {/* Main content - With appropriate margin */}
      <div className="flex-1 ml-64 transition-all duration-300 overflow-auto h-screen">
        <div className="container mx-auto px-6 py-8">
          {/* Notification */}
          {notification.show && (
            <div
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
                notification.type === "success"
                  ? "bg-green-100 text-green-800 border-l-4 border-green-500"
                  : notification.type === "error"
                  ? "bg-red-100 text-red-800 border-l-4 border-red-500"
                  : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
              }`}
            >
              <div className="flex items-center">
                {notification.type === "success" && (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {notification.type === "error" && (
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <p>{notification.message}</p>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Book Management
              </h1>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center shadow-md"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add New Book
              </button>
            </div>
            <p className="text-gray-600 mt-1">
              Manage your book inventory, pricing, and details
            </p>
          </div>

          {/* Search and Filter Bar - Improved UI */}
          <div className="bg-white p-5 rounded-xl shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-grow">
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, author, or ISBN..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </form>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={filterGenre}
                  onChange={(e) => setFilterGenre(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Genres</option>
                  {genres.map((genre, index) => (
                    <option key={index} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>

                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Books Table with improved UI */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-12">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-500 animate-spin"></div>
                  <div
                    className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-blue-200 animate-spin"
                    style={{
                      animationDirection: "reverse",
                      animationDuration: "1.5s",
                    }}
                  ></div>
                </div>
                <p className="ml-4 text-lg font-medium text-gray-600">
                  Loading books...
                </p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                  <div className="flex items-center">
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="font-bold">Error loading books</p>
                  </div>
                  <p className="mt-2">{error}</p>
                  <button
                    onClick={() => fetchBooks()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : books.length === 0 ? (
              <div className="p-12 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No books found
                </h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your search or filters to find what you're
                  looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterGenre("");
                    setCurrentPage(1);
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          onClick={() => handleSort("title")}
                          className="flex items-center focus:outline-none hover:text-gray-700"
                        >
                          Image & Title
                          {renderSortIndicator("title")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          onClick={() => handleSort("author")}
                          className="flex items-center focus:outline-none hover:text-gray-700"
                        >
                          Author
                          {renderSortIndicator("author")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          onClick={() => handleSort("genre")}
                          className="flex items-center focus:outline-none hover:text-gray-700"
                        >
                          Genre
                          {renderSortIndicator("genre")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          onClick={() => handleSort("price")}
                          className="flex items-center focus:outline-none hover:text-gray-700"
                        >
                          Price
                          {renderSortIndicator("price")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          onClick={() => handleSort("inStock")}
                          className="flex items-center focus:outline-none hover:text-gray-700"
                        >
                          Status
                          {renderSortIndicator("inStock")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <button
                          onClick={() => handleSort("rating")}
                          className="flex items-center focus:outline-none hover:text-gray-700"
                        >
                          Rating
                          {renderSortIndicator("rating")}
                        </button>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {books.map((book) => (
                      <tr
                        key={book.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-14 w-10 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                              <img
                                className="h-14 w-10 object-cover"
                                src={
                                  book.bookPhoto ||
                                  "https://via.placeholder.com/40x60?text=No+Image"
                                }
                                alt={book.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://via.placeholder.com/40x60?text=No+Image";
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {book.title}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                ISBN: {book.isbn || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {book.author}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {book.genre || "Uncategorized"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {book.discountPercentage > 0 ? (
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                $
                                {formatPrice(
                                  book.price *
                                    (1 - book.discountPercentage / 100)
                                )}
                              </span>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 line-through mr-1">
                                  ${formatPrice(book.price)}
                                </span>
                                <span className="text-xs text-green-600 font-semibold">
                                  -{book.discountPercentage}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900">
                              ${formatPrice(book.price)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {book.inStock ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              In Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, index) => (
                                <svg
                                  key={index}
                                  className={`w-4 h-4 ${
                                    index < Math.floor(book.rating)
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              {book.rating ? book.rating.toFixed(1) : "0.0"} (
                              {book.reviewCount || 0})
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => handleEdit(book)}
                              className="text-blue-600 hover:text-blue-900 focus:outline-none transition-colors duration-200"
                              title="Edit book"
                            >
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleViewDetails(book)}
                              className="text-blue-600 hover:text-blue-900 focus:outline-none transition-colors duration-200"
                              title="View details"
                            >
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => confirmDelete(book)}
                              className="text-red-600 hover:text-red-900 focus:outline-none transition-colors duration-200"
                              title="Delete book"
                            >
                              <svg
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination with improved styling */}
          {!loading && !error && books.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow-md p-4">
              {renderPagination()}
            </div>
          )}

          {/* Book Form Modal */}
          {showFormModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 animate-fadeIn">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {formMode === "add" ? "Add New Book" : "Edit Book"}
                  </h3>
                  <button
                    onClick={() => setShowFormModal(false)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full p-1 transition-colors duration-200"
                    aria-label="Close modal"
                  >
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="none"
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
                </div>

                <div className="px-6 py-4 max-h-[calc(95vh-8rem)] overflow-y-auto">
                  <BookForm
                    book={currentBook}
                    mode={formMode}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowFormModal(false)}
                    availableGenres={genres}
                  />
                </div>

                {/* Subtle footer for large forms */}
                <div className="sticky bottom-0 bg-gradient-to-t from-white to-transparent h-8 w-full pointer-events-none" />
              </div>
            </div>
          )}

          {/* Book Details Modal */}
          {showDetailsModal && currentBook && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <BookDetailsModal
                book={currentBook}
                onClose={() => setShowDetailsModal(false)}
              />
            </div>
          )}
          {/* Delete Confirmation Modal with improved UI */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
                    <svg
                      className="w-8 h-8 text-red-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-center text-gray-900">
                    Delete Book
                  </h3>
                  <p className="mt-2 text-sm text-center text-gray-500">
                    Are you sure you want to delete "{bookToDelete?.title}"?
                    This action cannot be undone.
                  </p>
                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookManagement;
