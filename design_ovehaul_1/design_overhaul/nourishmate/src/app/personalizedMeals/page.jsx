"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function PersonalizedMealsPage() {
  const [userData, setUserData] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/check-auth", {
          credentials: "include",
        });

        if (!response.ok) {
          console.error("Failed to fetch user data");
          setLoading(false);
          return;
        }

        const data = await response.json();
        if (!data.user || !data.user.email) {
          console.error("User data or email is missing in check-auth response");
          setLoading(false);
          return;
        }

        setUserData(data.user);

        if (data.user.email) {
          const mealResponse = await fetch(
            `/api/personalizedMeals?email=${encodeURIComponent(
              data.user.email
            )}`
          );
          if (mealResponse.ok) {
            const mealData = await mealResponse.json();
            setMeals(mealData);
          } else {
            console.error("Failed to fetch meals");
          }
        }
      } catch (error) {
        console.error("Error fetching personalized meals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const addToFavorites = async (meal) => {
    try {
      const response = await fetch("/api/favorites/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mealId: meal._id }),
        credentials: "include",
      });

      if (response.ok) {
        setFavorites((prevFavorites) => [...prevFavorites, meal]);
        alert("Meal added to favorites!");
      } else {
        alert("Failed to add meal to favorites.");
      }
    } catch (error) {
      console.error("Error adding meal to favorites:", error);
      alert("An error occurred while adding to favorites.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Personalized Meals
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Loading personalized meal recommendations...
          </p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Personalized Meals
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Error loading user data. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const caloricData = userData.caloricData || { targetCalories: 0 };
  const budgetData = userData.budgetData || {
    budgetAmount: 0,
    budgetType: "weekly",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Personalized Meals for {userData.name || "User"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Budget: <strong>€{budgetData.budgetAmount}</strong> (
          {budgetData.budgetType}), Calorie Target:{" "}
          <strong>{caloricData.targetCalories} kcal</strong>
        </p>

        {meals.length > 0 ? (
          <ul className="space-y-6">
            {meals.map((meal) => (
              <li
                key={meal._id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {meal.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Total Calories: {meal.totalCalories}
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Protein: {meal.totalProtein}g, Carbs: {meal.totalCarbs}g,
                  Fats: {meal.totalFats}g
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Estimated Cost: €{meal.estimatedCost.toFixed(2)}
                </p>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                  Ingredients:
                </h4>
                <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                  {meal.ingredients.map((ingredient, index) => (
                    <li key={index}>
                      {ingredient.name} - {ingredient.quantity}{" "}
                      {ingredient.unit ? ingredient.unit : "g"}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => addToFavorites(meal)}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Add to Favorites
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            No meals match your preferences. Try adjusting your budget.
          </p>
        )}
      </div>
    </div>
  );
}
