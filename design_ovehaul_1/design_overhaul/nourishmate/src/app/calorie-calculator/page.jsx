"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function CalorieCalculator() {
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [specificGoal, setSpecificGoal] = useState(""); // State for specific goal
  const [errors, setErrors] = useState({});
  const [results, setResults] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [weightEntries, setWeightEntries] = useState([]);
  const [inputWeight, setInputWeight] = useState("");
  const [inputDate, setInputDate] = useState("");
  const [user, setUser] = useState(null);
  const [deleteMode, setDeleteMode] = useState(false); // ✅ New state for Delete Mode

  const validateInputs = () => {
    const newErrors = {};
    if (!gender) newErrors.gender = "Please select your gender.";
    if (!activityLevel)
      newErrors.activityLevel = "Please select your activity level.";
    if (!goal) newErrors.goal = "Please select your goal.";
    if ((goal === "weight_loss" || goal === "weight_gain") && !specificGoal)
      newErrors.specificGoal = "Please select a specific goal.";
    if (!weight || weight <= 0)
      newErrors.weight = "Please enter a valid weight.";
    if (!height || height <= 0)
      newErrors.height = "Please enter a valid height.";
    if (!age || age <= 0) newErrors.age = "Please enter a valid age.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDownloadCSV = () => {
    if (weightEntries.length === 0) {
      alert("No weight data available for download.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,Date,Weight (kg)\n";

    weightEntries.forEach((entry) => {
      const formattedDate = new Date(entry.date)
        .toLocaleDateString("en-GB", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .replace(/\//g, "-"); // Ensures Excel reads it correctly
      csvContent += `${formattedDate},${entry.weight}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "weight_data.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleUploadCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split("\n").slice(1); // Skip header row
      const parsedData = [];

      rows.forEach((row) => {
        if (row.trim() === "") return;

        const [dateString, weight] = row.split(",");
        const formattedDate = new Date(
          dateString.split(/[-/]/).reverse().join("-")
        ).toISOString();

        parsedData.push({ date: formattedDate, weight: parseFloat(weight) });
      });

      console.log("Parsed Data:", parsedData);
      setWeightEntries(parsedData); // ✅ Update UI instantly

      // ✅ Send the parsed CSV data to the backend for saving
      try {
        const res = await fetch("/api/upload-csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: parsedData }),
        });

        if (!res.ok) throw new Error("Failed to save CSV data");

        console.log("CSV data successfully saved to the database!");
      } catch (error) {
        console.error("Error saving CSV:", error);
      }
    };

    reader.readAsText(file);
  };

  useEffect(() => {
    const fetchWeightData = async () => {
      try {
        console.log("🔄 Fetching authentication...");

        const response = await fetch("/api/check-auth", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          console.log("✅ User authenticated:", data.user);

          console.log("🔄 Fetching weight history...");
          const weightResponse = await fetch("/api/get-weight-history", {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });

          if (weightResponse.ok) {
            let weightData = await weightResponse.json();
            console.log("✅ Raw weight data received:", weightData);

            if (Array.isArray(weightData) && weightData.length > 0) {
              weightData.sort((a, b) => new Date(a.date) - new Date(b.date)); // ✅ Correct sorting
              console.log("✅ Sorted weight data:", weightData);
              setWeightEntries(weightData);
            } else {
              console.warn("⚠️ No weight data found for user.");
              setWeightEntries([]); // Ensure state is cleared if no data
            }
          } else {
            console.error("❌ Failed to fetch weight history.");
          }
        } else {
          console.error("❌ User is not authenticated.");
        }
      } catch (error) {
        console.error("❌ Error checking authentication:", error);
      }
    };

    fetchWeightData();
  }, []); // ✅ Keep dependency array empty to run only on page load

  const getTokenFromCookies = () => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("token="));
    return tokenCookie ? tokenCookie.split("=")[1] : null;
  };

  const handleAddWeightEntry = async () => {
    if (!inputWeight || !inputDate) {
      alert("Please enter a weight and date.");
      return;
    }

    if (!user) {
      alert("You must be logged in to track weight.");
      return;
    }

    try {
      console.log("🔄 Adding weight entry...");
      const response = await fetch("/api/save-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: inputDate,
          weight: parseFloat(inputWeight),
        }),
        credentials: "include",
      });

      if (response.ok) {
        console.log("✅ Weight entry saved!");

        // ✅ Update the weightEntries state dynamically instead of fetching all data again
        setWeightEntries((prevEntries) => {
          const updatedEntries = [
            ...prevEntries,
            { date: inputDate, weight: parseFloat(inputWeight) },
          ];
          updatedEntries.sort((a, b) => new Date(a.date) - new Date(b.date)); // ✅ Ensure sorting
          return updatedEntries;
        });

        setInputWeight("");
        setInputDate("");
      } else {
        console.error("❌ Failed to save weight entry.");
        alert("Failed to save weight entry. Try again.");
      }
    } catch (error) {
      console.error("❌ Error saving weight entry:", error);
    }
  };

  const handleDeleteWeightEntry = async (entryId) => {
    if (!entryId) {
      console.error("❌ Entry ID is missing when calling delete function.");
      alert("Error: Entry ID is missing.");
      return;
    }

    if (!user) {
      alert("You must be logged in to delete weight entries.");
      return;
    }

    try {
      console.log("🗑 Deleting weight entry with ID:", entryId);

      const response = await fetch("/api/remove-weight-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entryId }), // ✅ Ensure entryId is sent correctly
        credentials: "include",
      });

      const result = await response.json(); // Read the response

      if (response.ok) {
        console.log("✅ Weight entry deleted successfully:", result);

        // ✅ Remove the deleted entry from state
        setWeightEntries((prevEntries) =>
          prevEntries.filter((entry) => entry._id !== entryId)
        );
      } else {
        console.error("❌ Failed to delete weight entry:", result);
        alert(result.error || "Failed to delete weight entry. Try again.");
      }
    } catch (error) {
      console.error("❌ Error deleting weight entry:", error);
    }
  };

  const handleDeleteAllWeightEntries = async () => {
    if (!confirm("Are you sure you want to delete all weight entries?")) return;

    try {
      const response = await fetch("/api/delete-all-weight-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        alert("All weight entries deleted successfully!");
        setWeightEntries([]); // Clear the local state
      } else {
        const errorData = await response.json();
        alert(`Failed to delete weight entries: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting all weight entries:", error);
      alert("An error occurred while deleting weight entries.");
    }
  };

  const handleCalculate = async () => {
    setResults(null); // Clear previous results
    if (!validateInputs()) return;

    try {
      const response = await fetch("/api/calorie-calculator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          weight,
          height,
          age,
          activityLevel,
          goal,
          specificGoal, // Include specific goal
        }),
      });
      const data = await response.json();
      setResults(data); // Update with new results
    } catch (error) {
      console.error("Error calculating calories:", error);
    }
  };

  const handleGoalChange = (e) => {
    setGoal(e.target.value);
    setSpecificGoal(""); // ✅ Reset specific goal when goal changes
    setResults(null);
  };

  const handleSave = async () => {
    if (!results) {
      setSuccessMessage("No results to save. Please calculate first.");
      return;
    }

    try {
      const response = await fetch("/api/save-calories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bmr: results.bmr,
          tdee: results.tdee,
          targetCalories: results.targetCalories,
          activityLevel, // ✅ Send activity level
          goal, // ✅ Send goal
        }),
      });

      if (response.ok) {
        setSuccessMessage(
          "Caloric data, activity level, and goal saved to your profile successfully."
        );
      } else {
        setSuccessMessage("Failed to save data to your profile.");
      }
    } catch (error) {
      console.error("Error saving caloric data:", error);
      setSuccessMessage("An error occurred while saving data.");
    }
  };

  return (
    <>
      <Navbar />
      <div
        className="flex justify-between items-start"
        style={{ padding: "20px" }}
      >
        <div
          className="bg-white shadow-md rounded-lg p-6"
          style={{ maxWidth: "600px" }}
        >
          <h1 className="text-3xl font-bold mb-4">Calorie Calculator</h1>
          <div className="mb-4">
            <label className="block text-gray-700">
              Gender:
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setResults(null);
                }}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.gender && <p className="text-red-500">{errors.gender}</p>}
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Weight (kg):
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md"
                value={weight}
                onChange={(e) => {
                  setWeight(e.target.value);
                  setResults(null);
                }}
              />
              {errors.weight && <p className="text-red-500">{errors.weight}</p>}
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Height (cm):
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md"
                value={height}
                onChange={(e) => {
                  setHeight(e.target.value);
                  setResults(null);
                }}
              />
              {errors.height && <p className="text-red-500">{errors.height}</p>}
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Age:
              <input
                type="number"
                className="mt-1 block w-full border border-gray-300 rounded-md"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  setResults(null);
                }}
              />
              {errors.age && <p className="text-red-500">{errors.age}</p>}
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">
              Activity Level:
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md"
                value={activityLevel}
                onChange={(e) => {
                  setActivityLevel(e.target.value);
                  setResults(null);
                }}
              >
                <option value="">Select Activity Level</option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light Activity</option>
                <option value="moderate">Moderate Activity</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>
              {errors.activityLevel && (
                <p className="text-red-500">{errors.activityLevel}</p>
              )}
            </label>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">
              Goal:
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md"
                value={goal}
                onChange={handleGoalChange}
              >
                <option value="">Select Goal</option>
                <option value="maintain">Maintain Weight</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="weight_gain">Weight Gain</option>
              </select>
              {errors.goal && <p className="text-red-500">{errors.goal}</p>}
            </label>
          </div>
          {(goal === "weight_loss" || goal === "weight_gain") && (
            <div className="mb-4">
              <label className="block text-gray-700">
                Specific Goal:
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md"
                  value={specificGoal}
                  onChange={(e) => setSpecificGoal(e.target.value)}
                >
                  <option value="">Select Specific Goal</option>
                  {goal === "weight_loss" && (
                    <>
                      <option value="mild_weight_loss">
                        Mild Weight Loss (0.25 kg/week)
                      </option>
                      <option value="weight_loss">
                        Weight Loss (0.5 kg/week)
                      </option>
                      <option value="extreme_weight_loss">
                        Extreme Weight Loss (1 kg/week)
                      </option>
                    </>
                  )}
                  {goal === "weight_gain" && (
                    <>
                      <option value="mild_weight_gain">
                        Mild Weight Gain (0.25 kg/week)
                      </option>
                      <option value="weight_gain">
                        Weight Gain (0.5 kg/week)
                      </option>
                      <option value="extreme_weight_gain">
                        Extreme Weight Gain (1 kg/week)
                      </option>
                    </>
                  )}
                </select>
                {errors.specificGoal && (
                  <p className="text-red-500">{errors.specificGoal}</p>
                )}
              </label>
            </div>
          )}
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={handleCalculate}
          >
            Calculate
          </button>
          {results && (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold">Results:</h2>
              <p>
                <strong>BMR:</strong> {results.bmr} kcal/day
              </p>
              <p>
                <strong>TDEE:</strong> {results.tdee} kcal/day
              </p>
              <p>
                <strong>Calorie Target:</strong> {results.targetCalories}{" "}
                kcal/day
              </p>
              <button
                className="bg-green-500 text-white px-4 py-2 mt-2 rounded-md"
                onClick={handleSave}
              >
                Save to Profile
              </button>
            </div>
          )}
          {successMessage && <p className="text-green-500">{successMessage}</p>}
        </div>

        {/* Explanation Cards (Always Visible) */}
        <div className="flex-1 mx-6 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold">What These Numbers Mean:</h2>
          <div className="flex justify-between gap-4">
            <div className="flex-1 p-4 border border-gray-300 rounded-md bg-white text-center">
              <h3 className="font-bold">BMR (Basal Metabolic Rate)</h3>
              <p>
                Your BMR represents the number of calories your body burns at
                rest to maintain basic functions like breathing, circulation,
                and cell production.
              </p>
            </div>

            <div className="flex-1 p-4 border border-gray-300 rounded-md bg-white text-center">
              <h3 className="font-bold">
                TDEE (Total Daily Energy Expenditure)
              </h3>
              <p>
                Your TDEE is the total number of calories you burn in a day,
                including all activities such as walking, exercising, and daily
                tasks. It is calculated by multiplying your BMR by an activity
                factor.
              </p>
            </div>

            <div className="flex-1 p-4 border border-gray-300 rounded-md bg-white text-center">
              <h3 className="font-bold">Calorie Target</h3>
              <p>
                Your calorie target is based on your goal: <br />
                <strong>Maintain Weight:</strong> Matches your TDEE. <br />
                <strong>Lose Weight:</strong> Below TDEE to create a calorie
                deficit. <br />
                <strong>Gain Weight:</strong> Above TDEE to create a calorie
                surplus.
              </p>
            </div>
          </div>
        </div>

        {/* ✅ Weight Tracking Section */}
        <div
          className="bg-white shadow-md rounded-lg p-6 ml-6"
          style={{ maxWidth: "600px" }}
        >
          <h2 className="text-xl font-semibold">Track Your Weight</h2>
          <p>Enter your weight and date to monitor progress.</p>

          <div className="mt-4">
            <input
              type="number"
              placeholder="Enter weight (kg)"
              className="border border-gray-300 rounded-md p-2"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
            />
            <input
              type="date"
              className="border border-gray-300 rounded-md p-2"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2"
              onClick={handleAddWeightEntry}
            >
              Add Entry
            </button>
          </div>

          {/* ✅ Delete Mode Toggle Button (Appears Only Once) */}
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-md mt-2"
            onClick={() => setDeleteMode(!deleteMode)}
          >
            {deleteMode ? "Exit Delete Mode" : "Delete Entries"}
          </button>

          {/* ✅ Show weight entries ONLY when Delete Mode is active */}
          {deleteMode && (
            <>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md mt-2"
                onClick={handleDeleteAllWeightEntries}
              >
                Delete All Weight Entries
              </button>

              {weightEntries.length > 0 && (
                <ul className="list-disc pl-8 mt-2">
                  {weightEntries.map((entry) => (
                    <li key={entry._id}>
                      {new Date(entry.date).toLocaleDateString("en-GB")} -{" "}
                      {entry.weight} kg
                      {/* ✅ Delete button appears only inside Delete Mode */}
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded-md ml-2"
                        onClick={() => handleDeleteWeightEntry(entry._id)}
                      >
                        ❌ Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {/* ✅ Graph is always visible */}
          <Line
            data={{
              labels: weightEntries.map((entry) =>
                new Date(entry.date).toLocaleDateString("en-GB")
              ),
              datasets: [
                {
                  label: "Weight Over Time",
                  data: weightEntries.map((entry) => entry.weight),
                  fill: false,
                  borderColor: "blue",
                  tension: 0.1,
                },
              ],
            }}
          />
          {/* Move buttons below the graph */}
          <div className="mt-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={handleDownloadCSV}
            >
              Download CSV
            </button>
            <input
              type="file"
              accept=".csv"
              className="border border-gray-300 rounded-md p-2"
              onChange={handleUploadCSV}
            />
          </div>
        </div>
      </div>
    </>
  );
}
