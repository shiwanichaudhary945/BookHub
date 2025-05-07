import React, { useState, useEffect } from "react";

const BookCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setIsLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch("/api/Cart/GetCart");

        if (!response.ok) {
          throw new Error("Failed to fetch cart items");
        }

        const data = await response.json();
        setCartItems(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // Add item to cart
  const addToCart = async (book) => {
    try {
      const response = await fetch("/api/Cart/AddInCart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(book),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
      }

      // Optimistically update local state
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === book.id);
        if (existingItem) {
          return prevItems.map((item) =>
            item.id === book.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevItems, { ...book, quantity: 1 }];
      });
    } catch (err) {
      setError(err.message);
    }
  };

  // Remove item from cart
  const removeItem = async (id) => {
    try {
      const response = await fetch("/api/Cart/RemoveCart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove item from cart");
      }

      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Update quantity
  const updateQuantity = async (id, newQuantity) => {
    try {
      const response = await fetch("/api/Cart/AddInCart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Render loading state
  if (isLoading) {
    return <div className="text-center py-4">Loading cart...</div>;
  }

  // Render error state
  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border-b py-2"
            >
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-gray-600">{item.author}</p>
                <p className="text-gray-600">${item.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() =>
                    updateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  -
                </button>
                <span className="mx-2">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 rounded"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-4 text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="mt-4 text-right">
            <h3 className="text-xl font-bold">
              Total: ${totalPrice.toFixed(2)}
            </h3>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCart;
