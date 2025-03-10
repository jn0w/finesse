"use client";

import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function ExploreMealsPage() {
  const [meals, setMeals] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch("/api/meals");
        if (response.ok) {
          const data = await response.json();
          setMeals(data);
        }
      } catch (error) {
        console.error("Error fetching meals:", error);
      }
    };

    fetchMeals();
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Explore Meals
        </h1>
        <ul className="space-y-6">
          {meals.map((meal) => (
            <li
              key={meal._id}
              className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {meal.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Total Calories: {meal.totalCalories}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Total Protein: {meal.totalProtein}g
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Total Carbs: {meal.totalCarbs}g
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Total Fats: {meal.totalFats}g
              </p>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                Ingredients:
              </h3>
              <ul className="list-disc list-inside text-gray-500 dark:text-gray-400">
                {meal.ingredients.map((ingredient) => (
                  <li key={ingredient.name}>
                    {ingredient.name} - Quantity: {ingredient.quantity}{" "}
                    {ingredient.unit}
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
      </div>
    </div>
  );
}
