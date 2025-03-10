"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../components/Navbar";

export default function UserDetails() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [editableData, setEditableData] = useState({});

  const activityLevels = [
    "Sedentary",
    "Light Activity",
    "Moderate Activity",
    "Active",
    "Very Active",
  ];

  const goals = ["Maintain Weight", "Weight Loss", "Weight Gain"];

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/get-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
        });
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();

        const { caloricData, budgetData, ...filteredUserData } = data;
        setUser(filteredUserData);
        setEditableData(filteredUserData);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [id]);

  const handleUpdateUser = async () => {
    try {
      const res = await fetch(`/api/admin/update-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, ...editableData }),
      });

      if (!res.ok) throw new Error("Failed to update user");
      alert("User updated successfully!");
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/delete-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id }),
      });

      if (!res.ok) throw new Error("Failed to delete user");

      alert("User deleted successfully!");
      router.push("/adminPanel");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  if (!user) return <p>Loading user data...</p>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          User Details
        </h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {Object.entries(user)
            .filter(([key]) => key !== "_id" && key !== "password")
            .map(([key, value]) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                </label>
                {key === "activityLevel" ? (
                  <select
                    value={editableData[key] || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...editableData,
                        [key]: e.target.value,
                      })
                    }
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Activity Level</option>
                    {activityLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                ) : key === "goal" ? (
                  <select
                    value={editableData[key] || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...editableData,
                        [key]: e.target.value,
                      })
                    }
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">Select Goal</option>
                    {goals.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editableData[key] || ""}
                    onChange={(e) =>
                      setEditableData({
                        ...editableData,
                        [key]: e.target.value,
                      })
                    }
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                  />
                )}
              </div>
            ))}

          <div className="flex space-x-4">
            <button
              onClick={handleUpdateUser}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Update User
            </button>
            <button
              onClick={handleDeleteUser}
              className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
