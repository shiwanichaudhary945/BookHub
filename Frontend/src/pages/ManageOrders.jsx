import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/Orders/GetOrders");

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch("/api/Orders/UpdateOrderStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Optimistically update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-grow p-6">
          <div className="text-center py-4">Loading orders...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-grow p-6">
          <div className="text-red-500 text-center py-4">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-6">
        <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-4">No orders found</div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left">Order Number</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{order.orderNumber}</td>
                    <td className="p-3">{order.customer}</td>
                    <td className="p-3">{order.date}</td>
                    <td className="p-3">${order.total.toFixed(2)}</td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.id, e.target.value)
                        }
                        className={`
                          px-2 py-1 rounded text-xs
                          ${
                            order.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "Processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }
                        `}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            /* View Order Details */
                          }}
                        >
                          View
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
    </div>
  );
};

export default ManageOrders;
