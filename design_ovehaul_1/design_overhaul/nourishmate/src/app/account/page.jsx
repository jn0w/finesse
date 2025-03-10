"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const [userData, setUserData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const router = useRouter();
  const [favoriteMeals, setFavoriteMeals] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/check-auth", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
        } else {
          console.log("Not authorized");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const fetchBudget = async () => {
      try {
        const response = await fetch("/api/budget-tracker");
        if (response.ok) {
          const data = await response.json();
          setBudgetData(data);
        } else {
          console.log("No budget data available");
        }
      } catch (error) {
        console.error("Error fetching budget data:", error);
      }
    };

    checkAuth();
    fetchBudget();
  }, []);

  useEffect(() => {
    const fetchFavoriteMeals = async () => {
      try {
        const response = await fetch("/api/favorites");
        if (response.ok) {
          const data = await response.json();
          setFavoriteMeals(data);
        } else {
          console.log("No favorite meals available");
        }
      } catch (error) {
        console.error("Error fetching favorite meals:", error);
      }
    };

    fetchFavoriteMeals();
  }, []);

  const removeFromFavorites = async (mealId) => {
    try {
      const response = await fetch("/api/favorites/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mealId }),
        credentials: "include",
      });

      if (response.ok) {
        setFavoriteMeals((prevFavorites) =>
          prevFavorites.filter((meal) => meal._id !== mealId)
        );
        alert("Meal removed from favorites!");
      } else {
        alert("Failed to remove meal from favorites.");
      }
    } catch (error) {
      console.error("Error removing meal from favorites:", error);
      alert("An error occurred while removing from favorites.");
    }
  };

  if (!userData) {
    return (
      <div>
        <Navbar />
        <h1 className="text-2xl font-bold text-center mt-8">Account Page</h1>
        <p className="text-center mt-4">Loading account details...</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-6 flex gap-6">
        <div className="flex-1">
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome, {userData.name || userData.email}!
            </h2>
            <p className="mb-4">Here is your account information:</p>
            <ul className="space-y-2">
              <li>
                <strong>Name:</strong> {userData.name}
              </li>
              <li>
                <strong>Email:</strong> {userData.email}
              </li>
              <li>
                <strong>Address:</strong> {userData.address}
              </li>
              <li>
                <strong>Phone Number:</strong> {userData.phoneNumber}
              </li>
            </ul>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Favorite Meals</h3>
            {favoriteMeals.length > 0 ? (
              <ul className="space-y-4">
                {favoriteMeals.map((meal) => (
                  <li key={meal._id} className="border-b pb-4">
                    <h4 className="font-bold">{meal.name}</h4>
                    <p>Total Calories: {meal.totalCalories}</p>
                    <p>Estimated Cost: €{meal.estimatedCost.toFixed(2)}</p>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-md mt-2"
                      onClick={() => removeFromFavorites(meal._id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No favorite meals added yet.</p>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">
              Nutrition Information
            </h3>
            {userData.caloricData ? (
              <ul className="space-y-2">
                <li>
                  <strong>BMR:</strong> {userData.caloricData.bmr} kcal/day
                </li>
                <li>
                  <strong>TDEE:</strong> {userData.caloricData.tdee} kcal/day
                </li>
                <li>
                  <strong>Calorie Target:</strong>{" "}
                  {userData.caloricData.targetCalories} kcal/day
                </li>
                <li>
                  <strong>Activity Level:</strong>{" "}
                  {userData.activityLevel || "Not specified"}
                </li>
                <li>
                  <strong>Goal:</strong> {userData.goal || "Not specified"}
                </li>
              </ul>
            ) : (
              <p>
                No caloric data available. Please calculate your calories and
                save them to your profile.
              </p>
            )}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4"
              onClick={() => router.push("/calorie-calculator")}
            >
              Go to Calorie Calculator
            </button>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Budget Information</h3>
            {budgetData ? (
              <ul className="space-y-2">
                <li>
                  <strong>Budget Type:</strong> {budgetData.budgetType}
                </li>
                <li>
                  <strong>Total Budget:</strong> ${budgetData.budgetAmount}
                </li>
                <li>
                  <strong>Remaining Budget:</strong> $
                  {budgetData.budgetAmount -
                    (budgetData.expenses
                      ? budgetData.expenses.reduce(
                          (sum, exp) => sum + exp.amount,
                          0
                        )
                      : 0)}
                </li>
              </ul>
            ) : (
              <p>
                No budget data available. Set your budget to start tracking.
              </p>
            )}
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md mt-4"
              onClick={() => router.push("/budget-tracker")}
            >
              Go to Budget Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
