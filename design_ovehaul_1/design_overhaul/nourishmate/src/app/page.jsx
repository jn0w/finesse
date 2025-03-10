// src/app/page.js
"use client";

import React, { useState } from "react";
import "./globals.css";
import Navbar from "./components/Navbar";
import SlidingPanel from "./components/SlidingPanel";
import Footer from "./components/Footer";
import Card from "./components/Card";
import RegisterForm from "./components/RegisterForm";

function HomePage() {
  const [showPopup, setShowPopup] = useState(false);
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");

  const foodItems = [
    {
      name: "Chicken",
      price: 5.2,
      isHighProtein: true,
      image: "https://via.placeholder.com/150?text=Chicken",
    },
    {
      name: "Beans",
      price: 0.89,
      isHighProtein: true,
      image: "https://via.placeholder.com/150?text=Beans",
    },
    {
      name: "Broccoli",
      price: 1.5,
      isHighProtein: false,
      image: "https://via.placeholder.com/150?text=Broccoli",
    },
    {
      name: "Salmon",
      price: 12.0,
      isHighProtein: true,
      image: "https://via.placeholder.com/150?text=Salmon",
    },
  ];

  // Handle form submission
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    try {
      const res = await fetch("/api/save-user-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ activityLevel, goal }),
      });

      if (res.ok) {
        const data = await res.json();
        alert("Data saved successfully: " + data.message);
        setShowPopup(false);
      } else {
        alert("Failed to save data");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      alert("An error occurred");
    }
  };

  return (
    <div className="home-page">
      <Navbar />
      <h1 className="title">Welcome to NourishMate!</h1>
      <p className="description">
        Start your journey to a healthier lifestyle.
      </p>
      <SlidingPanel />

      <button
        className="personalized-meal-btn"
        onClick={() => setShowPopup(true)}
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          display: "block",
          margin: "0 auto",
        }}
      >
        Click me for a personalized meal plan
      </button>

      {/* Popup form for personalized meal plan */}
      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Personalize Your Meal Plan</h2>
            <form onSubmit={handleFormSubmit}>
              <label>
                Activity Level:
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label>
                Goal:
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="fat_loss">Fat Loss</option>
                  <option value="budget_meals">Budget Meals</option>
                </select>
              </label>
              <button type="submit" style={{ marginTop: "10px" }}>
                Save Preferences
              </button>
            </form>
            <button
              onClick={() => setShowPopup(false)}
              style={{ marginTop: "10px" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="cards-container">
        {foodItems.map((item, index) => (
          <Card key={index} food={item} />
        ))}
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;
