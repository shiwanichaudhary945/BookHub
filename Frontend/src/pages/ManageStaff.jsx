import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    username: "",
    email: "",
    role: "",
  });

  // Fetch staff
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/Staff/GetStaff");

        if (!response.ok) {
          throw new Error("Failed to fetch staff");
        }

        const data = await response.json();
        setStaff(data);
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, []);

  // Add new staff
  const handleAddStaff = async () => {
    try {
      const response = await fetch("/api/Staff/AddStaff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStaff),
      });

      if (!response.ok) {
        throw new Error("Failed to add staff");
      }

      // Assuming the response returns the added staff member
      const addedStaff = await response.json();

      // Update local state
      setStaff((prevStaff) => [...prevStaff, addedStaff]);

      // Reset form and close dialog
      setNewStaff({ username: "", email: "", role: "" });
      setIsAddStaffOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-grow p-6">
          <div className="text-center py-4">Loading staff...</div>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Staff</h1>
          <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Staff</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new staff member
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label htmlFor="username" className="block mb-2">
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    value={newStaff.username}
                    onChange={handleInputChange}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={newStaff.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label htmlFor="role" className="block mb-2">
                    Role
                  </label>
                  <Input
                    id="role"
                    name="role"
                    value={newStaff.role}
                    onChange={handleInputChange}
                    placeholder="Enter role"
                  />
                </div>
                <Button
                  onClick={handleAddStaff}
                  className="w-full"
                  disabled={
                    !newStaff.username || !newStaff.email || !newStaff.role
                  }
                >
                  Add Staff Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {staff.length === 0 ? (
          <div className="text-center py-4">No staff members found</div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-3 text-left">Username</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Role</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{member.username}</td>
                    <td className="p-3">{member.email}</td>
                    <td className="p-3">{member.role}</td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            /* Edit Staff */
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => {
                            /* Delete Staff */
                          }}
                        >
                          Delete
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

export default ManageStaff;
