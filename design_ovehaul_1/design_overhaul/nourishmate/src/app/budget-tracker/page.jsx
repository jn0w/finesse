"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function BudgetTracker() {
  const [budgetAmount, setBudgetAmount] = useState(0);
  const [budgetType, setBudgetType] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDescription, setExpenseDescription] = useState("");
  const [remainingBudget, setRemainingBudget] = useState(0);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [chartType, setChartType] = useState("pie");
  const [expenseCategory, setExpenseCategory] = useState("");

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/check-auth", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setUser(null);
    }
  };

  const ExpenseChart = ({ type, expenses }) => {
    const categoryData = groupExpensesByCategory(expenses);

    const data = {
      labels: Object.keys(categoryData),
      datasets: [
        {
          label: "Expenses by Category",
          data: Object.values(categoryData),
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
          borderColor: "#333",
          borderWidth: 1,
        },
      ],
    };

    return (
      <div className="w-full md:w-1/2 h-96">
        {type === "bar" && (
          <Bar data={data} options={{ maintainAspectRatio: false }} />
        )}
        {type === "pie" && <Pie data={data} />}
      </div>
    );
  };

  const groupExpensesByCategory = (expenses) => {
    const categoryTotals = {};

    expenses.forEach(({ category = "Uncategorized", amount }) => {
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += amount;
    });

    return categoryTotals;
  };

  const fetchBudget = async () => {
    try {
      const response = await fetch("/api/budget-tracker");
      if (response.ok) {
        const data = await response.json();
        setBudgetAmount(data.budgetAmount || 0);
        setBudgetType(data.budgetType || "");
        setExpenses(data.expenses || []);
        updateRemainingBudget(data.budgetAmount, data.expenses);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchBudget();
  }, []);

  const updateRemainingBudget = (budget, exp) => {
    const totalExpenses = exp.reduce((sum, expense) => sum + expense.amount, 0);
    setRemainingBudget(budget - totalExpenses);
  };

  const handleSetBudget = async () => {
    if (!user) {
      setMessage("You must be logged in to set a budget.");
      return;
    }
    if (!budgetAmount || !budgetType) {
      setMessage("Please enter a budget amount and select a type.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/budget-tracker/set-budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetAmount, budgetType }),
      });

      if (response.ok) {
        setMessage("Budget set successfully!");
        await fetchBudget();
      } else {
        setMessage("Failed to set budget.");
      }
    } catch (error) {
      console.error("Error setting budget:", error);
      setMessage("An error occurred.");
    }
    setIsLoading(false);
  };

  const handleAddExpense = async () => {
    if (!user) {
      setMessage("You must be logged in to add an expense.");
      return;
    }
    if (!expenseAmount || !expenseDescription || !expenseCategory) {
      setMessage("Please enter a valid amount, description, and category.");
      return;
    }

    const newExpense = {
      amount: Number(expenseAmount),
      description: expenseDescription.trim(),
      category: expenseCategory,
    };

    setIsLoading(true);
    try {
      const response = await fetch("/api/budget-tracker/add-expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });

      if (response.ok) {
        setMessage("Expense added!");
        setExpenseAmount("");
        setExpenseDescription("");
        setExpenseCategory("");
        await fetchBudget();
      } else {
        const errorData = await response.json();
        setMessage(`Failed to add expense: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      setMessage("An error occurred.");
    }
    setIsLoading(false);
  };

  const handleDeleteExpense = async (id) => {
    if (!user) {
      setMessage("You must be logged in to delete an expense.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/budget-tracker/delete-expense?id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setMessage("Expense removed!");
        await fetchBudget();
      } else {
        setMessage("Failed to delete expense.");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      setMessage("An error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-6 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
        <div className="w-full md:w-1/2 space-y-6">
          {budgetAmount > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Remaining Budget: ${remainingBudget}
              </h2>
              <progress
                value={remainingBudget}
                max={budgetAmount}
                className="w-full"
              ></progress>
            </div>
          )}

          <ExpenseChart type={chartType} expenses={expenses} />

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Visualize Your Expenses
            </h2>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Chart Type:
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
        </div>

        <div className="w-full md:w-1/2 space-y-6">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Set Your Budget
            </h2>
            <input
              type="number"
              placeholder="Budget Amount"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <select
              value={budgetType}
              onChange={(e) => setBudgetType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Budget Type</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button
              onClick={handleSetBudget}
              disabled={isLoading}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              {isLoading ? "Saving..." : "Set Budget"}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Add Expense
            </h2>
            <input
              type="number"
              placeholder="Expense Amount"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <input
              type="text"
              placeholder="Expense Description"
              value={expenseDescription}
              onChange={(e) => setExpenseDescription(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            >
              <option value="">Select Category</option>
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other</option>
            </select>

            <button
              onClick={handleAddExpense}
              disabled={isLoading}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              {isLoading ? "Adding..." : "Add Expense"}
            </button>
          </div>

          {expenses.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Expenses
              </h2>
              <ul className="space-y-4">
                {expenses.map((expense) => (
                  <li
                    key={expense.id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      {expense.description} (
                      {expense.category || "Uncategorized"}): ${expense.amount}
                    </div>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      disabled={isLoading}
                      className="text-red-600 hover:underline"
                    >
                      {isLoading ? "Deleting..." : "Delete"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {message && (
            <p className={`mt-4 ${user ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
