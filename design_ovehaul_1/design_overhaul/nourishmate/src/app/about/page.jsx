"use client";

import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md dark:bg-gray-800 p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            About NourishMate
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            NourishMate is your personal health and nutrition companion. Our app
            helps you track your caloric intake, manage your meals, and monitor
            your progress towards your health goals. Whether you're looking to
            lose weight, gain muscle, or maintain a healthy lifestyle,
            NourishMate provides the tools and insights you need to succeed.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our mission is to empower individuals to make informed decisions
            about their nutrition and health. We believe that with the right
            information and support, everyone can achieve their wellness goals.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Thank you for choosing NourishMate as your trusted partner in your
            health journey. We are committed to providing you with the best
            experience and continuously improving our app to meet your needs.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-white rounded-lg shadow-md dark:bg-gray-800 p-6 mt-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use NourishMate
          </h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-4">
            <li>
              <strong>Set Your Calories:</strong> Navigate to the Calorie
              Calculator page. Enter your personal details such as gender,
              weight, height, age, and activity level. Choose your goal (e.g.,
              weight loss, muscle gain) and calculate your daily caloric needs.
              Save your results to your profile.
              <div className="mt-2">
                <button
                  onClick={() => router.push("/calorie-calculator")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Go to Calorie Calculator
                </button>
              </div>
            </li>
            <li>
              <strong>Set Your Budget:</strong> Go to the Budget Tracker page.
              Enter your budget type (weekly or monthly) and the total budget
              amount. Track your expenses to ensure you stay within your budget.
              <div className="mt-2">
                <button
                  onClick={() => router.push("/budget-tracker")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Go to Budget Tracker
                </button>
              </div>
            </li>
            <li>
              <strong>Get Personalized Meals:</strong> Visit the Personalized
              Meals page. Based on your caloric needs and budget, explore meal
              options tailored to your preferences. Add meals to your favorites
              for easy access.
              <div className="mt-2">
                <button
                  onClick={() => router.push("/personalizedMeals")}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Go to Personalized Meals
                </button>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
