import React, { useState, useEffect, useRef } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  ShoppingBag,
  Clock,
  Users,
  ChevronRight,
} from "lucide-react";

// Helper to load saved state (moved outside the component)
const getSavedState = (key, defaultValue) => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(`Error parsing saved state for ${key}:`, e);
      }
    }
  }
  return defaultValue;
};

// Helper function for bolding measurements/ingredients in a text string
const renderBoldedText = (text) => {
  return text
    .split(/(\d+(?:\/\d+|\.\d+)?\s+(?:[a-z]+\s+)*(?:[a-z-]+))/i)
    .map((part, idx) =>
      idx % 2 === 1 ? (
        <span key={idx} className="font-bold">
          {part}
        </span>
      ) : (
        part
      )
    );
};

// Component for injecting dynamic styles for a given day
const DynamicDayStyle = ({ day }) => (
  <style>{`
    .view-button-${day} {
      background-color: #f3f4f6;
      color: #111827;
      padding: 10px 20px;
      border-radius: 6px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }
    .view-button-${day}:hover {
      background-color: #111827;
      color: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .arrow-${day} {
      margin-left: 8px;
      transition: transform 0.2s ease;
    }
    .view-button-${day}:hover .arrow-${day} {
      transform: translateX(4px);
    }
  `}</style>
);

// Component to handle image uploads using a ref
const ImageUpload = ({ mealId, mealType, imageSrc, onUpload }) => {
  const fileInputRef = useRef(null);
  const handleClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <>
      {imageSrc ? (
        <div className="relative group" onClick={handleClick}>
          <img
            src={imageSrc}
            alt={mealType}
            className="w-full rounded-md max-h-[600px] object-contain mb-2"
          />
          <label className="absolute bottom-4 right-4 bg-black text-white px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100 shadow-md">
            Change Image
          </label>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-100 hover:border-black transition-all duration-200"
          onClick={handleClick}
          style={{ transition: "all 0.2s ease" }}
        >
          <div className="text-gray-500 mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <label className="text-gray-800 font-medium cursor-pointer block">
            Upload an image of this {mealType.toLowerCase()}
          </label>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => onUpload(e)}
        className="hidden"
      />
    </>
  );
};

// Navigation tabs component
const NavigationTabs = ({
  activeTab,
  setActiveTab,
  daysOverview,
  setActiveDay,
  activeDay,
}) => (
  <nav className="bg-white shadow-sm sticky top-0 z-10">
    <div className="container mx-auto px-4">
      <div className="flex overflow-x-auto space-x-1 py-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
            activeTab === "overview"
              ? "bg-gray-200 text-gray-800"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Overview
        </button>
        {daysOverview.map((day) => (
          <button
            key={`day-tab-${day.day}`}
            onClick={() => {
              setActiveTab("day");
              setActiveDay(day.day);
            }}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTab === "day" && activeDay === day.day
                ? "bg-gray-200 text-gray-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Day {day.day}
          </button>
        ))}
        <button
          onClick={() => setActiveTab("shopping")}
          className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors flex items-center ${
            activeTab === "shopping"
              ? "bg-gray-200 text-gray-800"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <ShoppingBag className="w-4 h-4 mr-1" />
          Shopping List
        </button>
      </div>
    </div>
  </nav>
);

// Meal card component for Day View
const MealCard = ({
  meal,
  mealStatus,
  toggleMealStatus,
  recipes,
  expandedRecipe,
  toggleExpandedRecipe,
  getMealTypeColor,
  recipeImages,
  handleImageUpload,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-l-4 border-gray-400">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <button
                onClick={() => toggleMealStatus(meal.id)}
                className="flex-shrink-0 mt-1 mr-3"
              >
                {mealStatus[meal.id] ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <div>
                <span
                  className={`inline-block px-2 py-1 text-xs font-medium rounded ${getMealTypeColor(
                    meal.type
                  )} mb-2`}
                >
                  {meal.type}
                </span>
                <h3
                  onClick={() => toggleExpandedRecipe(meal.id)}
                  className={`text-xl font-semibold cursor-pointer hover:text-gray-600 transition-colors ${
                    mealStatus[meal.id]
                      ? "line-through text-gray-400"
                      : "text-gray-800"
                  }`}
                >
                  {meal.name}
                </h3>
                {recipes[meal.id] && (
                  <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{recipes[meal.id].time}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{recipes[meal.id].servings} servings</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {recipes[meal.id] && (
              <button
                onClick={() => toggleExpandedRecipe(meal.id)}
                className="p-2 rounded-md bg-white hover:bg-gray-100 active:bg-gray-200 transform hover:scale-110 active:scale-100 transition-all duration-200"
                aria-label={
                  expandedRecipe === meal.id
                    ? "Collapse recipe"
                    : "Expand recipe"
                }
              >
                {expandedRecipe === meal.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>
            )}
          </div>
        </div>

        {expandedRecipe === meal.id && recipes[meal.id] && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100">
            {/* Meal Image */}
            <div className="mb-4">
              <ImageUpload
                mealId={meal.id}
                mealType={meal.type}
                imageSrc={recipeImages[meal.id]}
                onUpload={(e) => handleImageUpload(meal.id, e)}
              />
            </div>

            {/* Nutrition */}
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-base text-gray-700">
                <span className="font-semibold">Nutrition:</span>{" "}
                {recipes[meal.id].calories}
              </p>
            </div>

            {/* Ingredients */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2 text-lg">
                Ingredients
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-base font-medium text-gray-700 mb-2">
                    For 1 serving:
                  </p>
                  <ul className="list-disc pl-5 text-base text-gray-600 space-y-1">
                    {recipes[meal.id].ingredients1.map((ingredient, idx) => (
                      <li key={idx} className="ingredient-item">
                        {renderBoldedText(ingredient)}
                      </li>
                    ))}
                  </ul>
                </div>
                {recipes[meal.id].ingredients2 &&
                  recipes[meal.id].ingredients2.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-base font-medium text-gray-700 mb-2">
                        For 2 servings:
                      </p>
                      <ul className="list-disc pl-5 text-base text-gray-600 space-y-1">
                        {recipes[meal.id].ingredients2.map(
                          (ingredient, idx) => (
                            <li key={idx} className="ingredient-item">
                              {renderBoldedText(ingredient)}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-4 text-lg">
                Instructions
              </h4>
              <div className="space-y-6">
                {recipes[meal.id].instructions.map((section, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-gray-50 p-4 rounded-md border-l-4 border-gray-300"
                  >
                    <div className="flex items-center mb-3">
                      {section.title === "Prep:" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mr-2 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                      )}
                      {section.title === "Cooking:" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mr-2 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      )}
                      {section.title === "Assembly:" && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mr-2 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      )}
                      <p className="font-bold text-gray-800 text-lg">
                        {section.title}
                      </p>
                    </div>
                    <ol className="list-none space-y-4 mt-2 pl-8">
                      {section.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="relative instruction-step">
                          <div className="absolute -left-8 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-700 font-bold text-sm">
                            {stepIdx + 1}
                          </div>
                          {step
                            .split(/(\(\d+(?:–\d+)? minutes?\))/i)
                            .map((part, partIdx) => {
                              if (partIdx % 2 === 1) {
                                return (
                                  <span
                                    key={partIdx}
                                    className="ml-2 text-gray-500 italic inline-flex items-center"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 mr-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {part}
                                  </span>
                                );
                              }
                              return (
                                <span key={partIdx}>
                                  {renderBoldedText(part)}
                                </span>
                              );
                            })}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
            {/* Justification */}
            {recipes[meal.id].justification && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-base text-gray-700">
                  <span className="font-semibold text-gray-900">
                    Why this recipe:
                  </span>{" "}
                  {recipes[meal.id].justification}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Shopping list component
const ShoppingList = ({
  shoppingList,
  shoppingItems,
  toggleShoppingItem,
  expandedCategory,
  toggleExpandedCategory,
}) => (
  <div>
    <h2 className="text-2xl font-bold ">Shopping List</h2>
    <div className="space-y-4">
      {shoppingList.map((category, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <button
            onClick={() => toggleExpandedCategory(category.category)}
            className="w-full px-4 py-3 bg-black text-white flex justify-between items-center hover:bg-gray-800 active:bg-gray-900 transition-all duration-200"
            aria-expanded={expandedCategory === category.category}
          >
            <h3 className="font-semibold">{category.category}</h3>
            {expandedCategory === category.category ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {(expandedCategory === category.category ||
            expandedCategory === null) && (
            <div className="p-4">
              <ul className="space-y-2">
                {category.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start group relative overflow-hidden"
                  >
                    <button
                      onClick={() => toggleShoppingItem(item.id)}
                      className="flex-shrink-0 mt-0.5 mr-2 hover:scale-110 transition-transform"
                    >
                      {shoppingItems[item.id] ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                    <div
                      className={
                        shoppingItems[item.id]
                          ? "line-through text-gray-400"
                          : "text-gray-700"
                      }
                    >
                      <span className="font-bold">{item.name}</span>
                      {item.forMeals && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.forMeals}
                        </p>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-emerald-50 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

// Main component
const MealPlannerApp = () => {
  // State declarations
  const [activeTab, setActiveTab] = useState("overview");
  const [activeDay, setActiveDay] = useState(1);
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [hoveredButtons, setHoveredButtons] = useState({});
  const [recipeImages, setRecipeImages] = useState(
    getSavedState("oaklandFreshRecipeImages", {})
  );

  const [mealStatus, setMealStatus] = useState(
    getSavedState("oaklandFreshMealStatus", {
      "day1-breakfast": false,
      "day1-snack1": false,
      "day1-lunch": false,
      "day1-dinner": false,
      "day2-breakfast": false,
      "day2-snack1": false,
      "day2-lunch": false,
      "day2-dinner": false,
      "day3-breakfast": false,
      "day3-snack1": false,
      "day3-lunch": false,
      "day3-dinner": false,
      "day4-breakfast": false,
      "day4-snack1": false,
      "day4-lunch": false,
      "day4-dinner": false,
      "day4-dessert": false,
    })
  );

  const [shoppingItems, setShoppingItems] = useState(
    getSavedState("oaklandFreshShoppingItems", {
      "1-loaf-bread": false,
      "2-avocados": false,
      "2-lemons": false,
      "2-fuji-apples": false,
      "2-granny-smith": false,
      "1-cucumber": false,
      "2-red-bell-peppers": false,
      "1-lb-carrots": false,
      "1-celery": false,
      "1-butternut-squash": false,
      "1-onion": false,
      "1-garlic": false,
      "4-bosc-pears": false,
      "2-tomatoes": false,
      "1-cherry-tomatoes": false,
      "1-broccoli": false,
      "1-zucchini": false,
      "1-basil": false,
      "2-spinach": false,
      "1-mixed-greens": false,
      "1-bok-choy": false,
      "4-oranges": false,
      "1-ricotta": false,
      "1-mozzarella": false,
      "1-greek-yogurt": false,
      "1-heavy-cream": false,
      "1-whole-milk": false,
      "1-butter": false,
      "1-parmesan": false,
      "1-ground-turkey": false,
      "1-chicken-breast": false,
      "1-salmon": false,
      "2-tuna": false,
      "1-pita-bread": false,
      "1-hummus": false,
      "1-olive-oil": false,
      "1-chicken-broth": false,
      "1-flour": false,
      "1-maple-syrup": false,
      "1-miso-paste": false,
      "1-soy-sauce": false,
      "1-rice-vinegar": false,
      "1-capers": false,
      "1-rice-cakes": false,
      "1-rolled-oats": false,
      "1-walnuts": false,
      "1-granola": false,
      "1-jasmine-rice": false,
      "1-whole-wheat-pasta": false,
      "1-diced-tomatoes": false,
      "1-kidney-beans": false,
      "1-gelatin": false,
      "1-sugar": false,
      "1-vanilla-bean": false,
      "1-balsamic-vinaigrette": false,
      "1-balsamic-glaze": false,
      "1-almond-butter": false,
      "1-honey": false,
      "1-sesame-oil": false,
      "1-sauvignon-blanc": false,
    })
  );

  // Combined useEffect to update localStorage when any of the three key states change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "oaklandFreshMealStatus",
        JSON.stringify(mealStatus)
      );
      localStorage.setItem(
        "oaklandFreshShoppingItems",
        JSON.stringify(shoppingItems)
      );
      localStorage.setItem(
        "oaklandFreshRecipeImages",
        JSON.stringify(recipeImages)
      );
    }
  }, [mealStatus, shoppingItems, recipeImages]);

  // Handlers
  const toggleButtonHover = (id, isHovered) => {
    setHoveredButtons((prevState) => ({
      ...prevState,
      [id]: isHovered,
    }));
  };

  const toggleMealStatus = (id) => {
    setMealStatus((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const toggleShoppingItem = (id) => {
    setShoppingItems((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const toggleExpandedRecipe = (id) => {
    setExpandedRecipe(expandedRecipe === id ? null : id);
  };

  const toggleExpandedCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  const handleImageUpload = (mealId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setRecipeImages((prev) => ({
        ...prev,
        [mealId]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Helper to get meal type badge color
  const getMealTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "breakfast":
        return "bg-amber-100 text-amber-800";
      case "snack":
        return "bg-teal-100 text-teal-800";
      case "lunch":
        return "bg-blue-100 text-blue-800";
      case "dinner":
        return "bg-purple-100 text-purple-800";
      case "dessert":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Data declarations (weekIntro, daysOverview, recipes, shoppingList) remain unchanged
  const weekIntro = (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-black mb-3">
        Weekly Introduction: "Oakland Winter Fresh"
      </h2>
      <p className="text-gray-700 mb-4">
        This week's theme celebrates the vibrant, seasonal produce available in
        Oakland during February. We're focusing on quick, nourishing meals that
        highlight winter fruits and vegetables along with lean proteins and
        whole grains. With a mix of modern kitchen tools—including an Instant
        Pot and a grill pan—each recipe is designed to be both efficient and
        full of flavor. Enjoy a week of clean, delicious eating that keeps you
        energized during those cool Oakland mornings and evenings!
      </p>
      <div className="mt-4 bg-emerald-50 p-4 rounded-md">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-emerald-700">
            Estimated Total Cost:
          </span>{" "}
          Approximately $251
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-emerald-700">
            Average Cost per Meal per Serving:
          </span>{" "}
          Approximately $15.70
        </p>
      </div>
    </div>
  );

  const daysOverview = [
    {
      day: 1,
      meals: [
        {
          id: "day1-breakfast",
          type: "Breakfast",
          name: "Avocado Toast with Poached Egg",
        },
        {
          id: "day1-snack1",
          type: "Snack",
          name: "Apple Slices with Almond Butter",
        },
        {
          id: "day1-lunch",
          type: "Lunch",
          name: "Mediterranean Hummus Pita with Cucumbers & Bell Peppers",
        },
        {
          id: "day1-dinner",
          type: "Dinner",
          name: "Instant Pot Turkey Chili with Seasonal Vegetables",
        },
      ],
    },
    {
      day: 2,
      meals: [
        {
          id: "day2-breakfast",
          type: "Breakfast",
          name: "Whole Wheat Toast with Ricotta, Honey & Sliced Bosc Pear",
        },
        {
          id: "day2-snack1",
          type: "Snack",
          name: "Rice Cake with Almond Butter & Banana Slices",
        },
        {
          id: "day2-lunch",
          type: "Lunch",
          name: "Caprese Salad with Mozzarella, Tomato & Basil",
        },
        {
          id: "day2-dinner",
          type: "Dinner",
          name: "Chicken Piccata with Capers & Lemon, Sautéed Spinach",
        },
      ],
    },
    {
      day: 3,
      meals: [
        {
          id: "day3-breakfast",
          type: "Breakfast",
          name: "Oatmeal with Apples, Cinnamon & Walnuts",
        },
        {
          id: "day3-snack1",
          type: "Snack",
          name: "Sliced Bosc Pear with Walnuts",
        },
        {
          id: "day3-lunch",
          type: "Lunch",
          name: "Avocado Tuna Salad with Mixed Greens",
        },
        {
          id: "day3-dinner",
          type: "Dinner",
          name: "Pasta Primavera with Seasonal Vegetables (Wine Pairing: Sauvignon Blanc)",
        },
      ],
    },
    {
      day: 4,
      meals: [
        {
          id: "day4-breakfast",
          type: "Breakfast",
          name: "Greek Yogurt Bowl with Granola & Seasonal Citrus Segments",
        },
        {
          id: "day4-snack1",
          type: "Snack",
          name: "Orange Segments with Cinnamon",
        },
        {
          id: "day4-lunch",
          type: "Lunch",
          name: "Spinach Salad with Sliced Bosc Pear & Walnuts",
        },
        {
          id: "day4-dinner",
          type: "Dinner",
          name: "Baked Salmon with Miso Glaze, Stir-Fried Bok Choy & Jasmine Rice",
        },
        {
          id: "day4-dessert",
          type: "Dessert",
          name: "Vanilla Bean Panna Cotta",
        },
      ],
    },
  ];

  const recipes = {
    "day1-breakfast": {
      name: "Avocado Toast with Poached Egg",
      time: "15 minutes",
      servings: "1-2",
      calories: "300 calories, 12g protein, 28g carbs, 15g fat",
      ingredients1: [
        "1 slice whole wheat bread",
        "1 egg",
        "1/2 avocado",
        "1/4 teaspoon salt",
        "1/8 teaspoon black pepper",
        "1/2 teaspoon lemon juice",
      ],
      ingredients2: [
        "2 slices whole wheat bread",
        "2 eggs",
        "1 avocado",
        "1/2 teaspoon salt",
        "1/4 teaspoon black pepper",
        "1 teaspoon lemon juice",
      ],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: toaster, small pot, slotted spoon, knife, cutting board, bowl. (2 minutes)",
            "Fill the small pot with water and bring it to a gentle simmer on the stove. (5 minutes)",
            "Toast 1 slice whole wheat bread (or 2 slices for 2 servings) in the toaster until golden. (3 minutes)",
            "On the cutting board, cut 1/2 avocado (or 1 avocado for 2 servings) in half, remove the pit, and scoop the flesh into the bowl. Add 1/2 teaspoon lemon juice (or 1 teaspoon for 2 servings) and mash until smooth. (2 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: [
            "Carefully crack 1 egg (or 1 egg per serving) into a small cup. (1 minute)",
            "Stir the simmering water gently to create a whirlpool, then slowly slide the egg into the center. Poach for 3 minutes for a soft yolk (or 4 minutes for a firmer yolk). (3–4 minutes)",
            "Remove the poached egg with a slotted spoon. (1 minute)",
          ],
        },
        {
          title: "Assembly:",
          steps: [
            "Spread the mashed avocado evenly over the toasted bread. (1 minute)",
            "Place the poached egg on top and sprinkle with 1/4 teaspoon salt (or 1/2 teaspoon for 2 servings) and 1/8 teaspoon black pepper (or 1/4 teaspoon for 2 servings). (1 minute)",
            "Serve immediately. (1 minute)",
          ],
        },
      ],
      justification:
        "This recipe is chosen for its quick prep and balanced mix of healthy fats and protein—perfect for a brisk Oakland February morning.",
    },
    "day1-snack1": {
      name: "Apple Slices with Almond Butter",
      time: "5 minutes",
      servings: "1-2",
      calories: "150 calories, 2g protein, 22g carbs, 7g fat",
      ingredients1: ["1 medium Fuji apple", "1 tablespoon almond butter"],
      ingredients2: ["2 medium Fuji apples", "2 tablespoons almond butter"],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: knife, cutting board, plate. (1 minute)",
            "Wash 1 medium Fuji apple (or 2 apples for 2 servings). (1 minute)",
            "Core and slice the apple into thin pieces. (2 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: ["No cooking required."],
        },
        {
          title: "Assembly:",
          steps: [
            "Arrange the apple slices on the plate. (1 minute)",
            "Serve with 1 tablespoon almond butter (or 2 tablespoons for 2 servings) in a small bowl on the side. (1 minute)",
          ],
        },
      ],
      justification:
        "This snack offers a crisp, refreshing taste with a boost of protein and healthy fats.",
    },
    "day1-lunch": {
      name: "Mediterranean Hummus Pita with Cucumbers & Bell Peppers",
      time: "10 minutes",
      servings: "1-2",
      calories: "200 calories, 6g protein, 35g carbs, 5g fat",
      ingredients1: [
        "1 whole wheat pita bread",
        "2 tablespoons hummus",
        "1/4 cup sliced cucumber",
        "1/4 cup sliced red bell pepper",
        "A pinch of salt and pepper",
      ],
      ingredients2: [
        "2 whole wheat pita breads",
        "4 tablespoons hummus",
        "1/2 cup sliced cucumber",
        "1/2 cup sliced red bell pepper",
        "A pinch of salt and pepper",
      ],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: knife, cutting board, plate. (1 minute)",
            "Wash 1/4 cup cucumber and 1/4 cup red bell pepper (or 1/2 cup each for 2 servings). (2 minutes)",
            "Slice the cucumber and red bell pepper into thin strips. (2 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: ["No cooking required."],
        },
        {
          title: "Assembly:",
          steps: [
            "Lay out 1 whole wheat pita bread (or 2 for 2 servings) on the plate. (1 minute)",
            "Evenly spread 2 tablespoons hummus (or 4 tablespoons for 2 servings) over the pita. (1 minute)",
            "Top with the sliced cucumber and red bell pepper; finish with a light sprinkle of salt and pepper. (1 minute)",
            "Serve as is or folded for an easy handheld meal. (1 minute)",
          ],
        },
      ],
      justification:
        "This fresh and vibrant lunch is perfect for a quick, no-cook meal that keeps you energized during your busy day.",
    },
    "day1-dinner": {
      name: "Instant Pot Turkey Chili with Seasonal Vegetables",
      time: "35-40 minutes",
      servings: "2",
      calories: "400 calories, 30g protein, 35g carbs, 15g fat",
      ingredients1: [
        "8 oz ground turkey",
        "1/2 cup chopped onion",
        "1 clove garlic, minced",
        "1/2 cup diced carrots",
        "1/2 cup diced celery",
        "1/2 cup diced red bell pepper",
        "1 cup canned diced tomatoes",
        "1/2 cup chicken broth",
        "1/2 cup chopped winter squash (e.g., butternut squash)",
        "1/2 cup kidney beans, rinsed and drained",
        "1 tablespoon olive oil",
        "1/2 teaspoon chili powder",
        "1/4 teaspoon cumin",
        "Salt and pepper to taste",
      ],
      ingredients2: [],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: Instant Pot, knife, cutting board, measuring cups, spatula. (3 minutes)",
            "Chop 1/2 cup onion, 1/2 cup carrots, 1/2 cup celery, 1/2 cup red bell pepper, and 1/2 cup winter squash (using butternut squash if available). Mince 1 clove garlic. (7 minutes)",
            "Rinse 1/2 cup kidney beans in a strainer. (1 minute)",
          ],
        },
        {
          title: "Cooking:",
          steps: [
            "Set the Instant Pot to 'Sauté' mode and add 1 tablespoon olive oil. (1 minute)",
            "Add the chopped 1/2 cup onion, 1 clove garlic, 1/2 cup carrots, 1/2 cup celery, and 1/2 cup red bell pepper. Sauté until softened, about 3 minutes. (3 minutes)",
            "Stir in 8 oz ground turkey and cook until browned, breaking it apart with a spatula, about 5 minutes. (5 minutes)",
            "Add 1 cup canned diced tomatoes, 1/2 cup chicken broth, 1/2 cup winter squash, and 1/2 cup kidney beans. Season with 1/2 teaspoon chili powder, 1/4 teaspoon cumin, salt, and pepper. (2 minutes)",
            "Secure the Instant Pot lid and set to 'Manual' high pressure for 10 minutes. (10 minutes)",
            "Allow a natural pressure release for 5 minutes, then quick-release any remaining pressure. (5 minutes)",
          ],
        },
        {
          title: "Assembly:",
          steps: [
            "Stir the chili to blend the flavors. (1 minute)",
            "Ladle into bowls and serve hot. (1 minute)",
          ],
        },
      ],
      justification:
        "This hearty turkey chili incorporates seasonal winter vegetables and offers a warming, balanced dinner perfect for Oakland's cool February evenings.",
    },
    "day2-breakfast": {
      name: "Whole Wheat Toast with Ricotta, Honey & Sliced Bosc Pear",
      time: "10-15 minutes",
      servings: "1-2",
      calories: "280 calories, 10g protein, 40g carbs, 8g fat",
      ingredients1: [
        "1 slice whole wheat bread",
        "1/4 cup ricotta cheese",
        "1 teaspoon honey",
        "1/2 Bosc pear, thinly sliced",
      ],
      ingredients2: [
        "2 slices whole wheat bread",
        "1/2 cup ricotta cheese",
        "2 teaspoons honey",
        "1 Bosc pear, thinly sliced",
      ],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: toaster, knife, cutting board, plate. (2 minutes)",
            "Toast 1 slice whole wheat bread (or 2 slices for 2 servings) until golden. (3 minutes)",
            "On the cutting board, carefully slice 1/2 Bosc pear (or 1 Bosc pear for 2 servings) into thin, even slices. (3 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: ["No cooking required."],
        },
        {
          title: "Assembly:",
          steps: [
            "Evenly spread 1/4 cup ricotta cheese (or 1/2 cup for 2 servings) over the toasted bread. (1 minute)",
            "Drizzle 1 teaspoon honey (or 2 teaspoons for 2 servings) on top. (1 minute)",
            "Arrange the pear slices over the ricotta and honey. (1 minute)",
            "Serve immediately. (1 minute)",
          ],
        },
      ],
      justification:
        "This dish is a delightful blend of creamy ricotta and sweet, crisp Bosc pear, capturing the seasonal flavors with a healthy twist.",
    },
    "day2-snack1": {
      name: "Rice Cake with Almond Butter & Banana Slices",
      time: "5 minutes",
      servings: "1-2",
      calories: "150 calories, 3g protein, 25g carbs, 5g fat",
      ingredients1: [
        "1 plain rice cake",
        "1 tablespoon almond butter",
        "1/2 banana, sliced",
      ],
      ingredients2: [
        "2 plain rice cakes",
        "2 tablespoons almond butter",
        "1 banana, sliced",
      ],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: knife, plate, small bowl. (1 minute)",
            "Peel and slice 1/2 banana (or 1 banana for 2 servings) into rounds. (2 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: ["No cooking required."],
        },
        {
          title: "Assembly:",
          steps: [
            "Place 1 plain rice cake (or 2 for 2 servings) on the plate. (1 minute)",
            "Spread 1 tablespoon almond butter (or 2 tablespoons for 2 servings) over the rice cake. (1 minute)",
            "Top with the sliced banana. (1 minute)",
            "Serve immediately. (1 minute)",
          ],
        },
      ],
      justification:
        "This snack is light and energizing, offering a crunchy base paired with the creamy, natural sweetness of banana and almond butter.",
    },
    "day2-lunch": {
      name: "Caprese Salad with Mozzarella, Tomato & Basil",
      time: "10 minutes",
      servings: "1-2",
      calories: "250 calories, 15g protein, 10g carbs, 18g fat",
      ingredients1: [
        "3 oz fresh mozzarella cheese",
        "1 medium tomato, sliced",
        "4 fresh basil leaves",
        "1 teaspoon extra virgin olive oil",
        "A pinch of salt",
        "A pinch of black pepper",
        "(Optional: 1/2 teaspoon balsamic glaze)",
      ],
      ingredients2: [
        "6 oz fresh mozzarella cheese",
        "2 medium tomatoes, sliced",
        "8 fresh basil leaves",
        "2 teaspoons extra virgin olive oil",
        "1/2 teaspoon salt",
        "1/4 teaspoon black pepper",
        "(Optional: 1 teaspoon balsamic glaze)",
      ],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: knife, cutting board, plate. (2 minutes)",
            "Slice 1 medium tomato (or 2 tomatoes for 2 servings) evenly. (2 minutes)",
            "If not pre-sliced, cut 3 oz fresh mozzarella cheese (or 6 oz for 2 servings) and tear 4 fresh basil leaves (or 8 leaves for 2 servings) into bite-sized pieces. (2 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: ["No cooking required."],
        },
        {
          title: "Assembly:",
          steps: [
            "Arrange the tomato slices on the plate. (1 minute)",
            "Layer or scatter the mozzarella over the tomatoes. (1 minute)",
            "Garnish with torn basil, drizzle 1 teaspoon extra virgin olive oil (or 2 teaspoons for 2 servings), and add a drizzle of balsamic glaze if using. Season with a pinch of salt and pepper. (1 minute)",
            "Serve immediately. (1 minute)",
          ],
        },
      ],
      justification:
        "This salad brings together fresh, seasonal flavors in a classic combination that is both satisfying and light.",
    },
    "day2-dinner": {
      name: "Chicken Piccata with Capers & Lemon, Sautéed Spinach",
      time: "45 minutes",
      servings: "2",
      calories: "350 calories, 35g protein, 20g carbs, 15g fat",
      ingredients1: [
        "8 oz chicken breast, thinly sliced",
        "1/4 cup all-purpose flour",
        "2 tablespoons olive oil",
        "1/4 cup chicken broth",
        "2 tablespoons lemon juice",
        "1 tablespoon capers",
        "1 clove garlic, minced",
        "2 cups fresh spinach",
        "1 tablespoon butter",
        "Salt and pepper to taste",
      ],
      ingredients2: [],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: knife, cutting board, non-stick skillet, measuring cups, bowl, spatula. (3 minutes)",
            "Slice 8 oz chicken breast into thin cutlets. (3 minutes)",
            "Place 1/4 cup all-purpose flour in a shallow dish; season with a pinch of salt and pepper. (1 minute)",
            "Mince 1 clove garlic and wash 2 cups fresh spinach. (2 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: [
            "Dredge the chicken slices lightly in the seasoned flour. (2 minutes)",
            "Heat 2 tablespoons olive oil in a non-stick skillet over medium-high heat. Add the chicken and cook for 3–4 minutes per side until golden brown. (8 minutes)",
            "Remove the chicken and set aside. (1 minute)",
            "In the same skillet, add the minced 1 clove garlic and sauté for 30 seconds. (0.5 minute)",
            "Pour in 1/4 cup chicken broth and 2 tablespoons lemon juice; stir in 1 tablespoon capers. Let the sauce simmer for 2–3 minutes until slightly reduced. (3 minutes)",
            "Return the chicken to the skillet and coat with the sauce. (1 minute)",
            "In a separate pan, melt 1 tablespoon butter and quickly sauté 2 cups fresh spinach for 2 minutes until just wilted. (2 minutes)",
          ],
        },
        {
          title: "Assembly:",
          steps: [
            "Plate the chicken and spoon over the caper-lemon sauce. (1 minute)",
            "Serve alongside the sautéed spinach. (1 minute)",
            "Garnish with an extra squeeze of lemon if desired.",
          ],
        },
      ],
      justification:
        "Chicken Piccata delivers a zesty, savory flavor that perfectly complements the vibrant, fresh sautéed spinach.",
    },
    "day3-breakfast": {
      name: "Oatmeal with Apples, Cinnamon & Walnuts",
      time: "15 minutes",
      servings: "1-2",
      calories: "350 calories, 8g protein, 60g carbs, 9g fat",
      ingredients1: [
        "1/2 cup rolled oats",
        "1 cup water",
        "1 medium Granny Smith apple, diced",
        "1/2 teaspoon cinnamon",
        "2 tablespoons chopped walnuts",
        "(Optional: 1 teaspoon honey)",
      ],
      ingredients2: [
        "1 cup rolled oats",
        "2 cups water",
        "2 medium Granny Smith apples, diced",
        "1 teaspoon cinnamon",
        "1/4 cup chopped walnuts",
        "(Optional: 2 teaspoons honey)",
      ],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: Saucepan, measuring cup, stirring spoon, knife, cutting board. (2 minutes)",
            "Dice 1 medium Granny Smith apple (or 2 apples for 2 servings) on the cutting board. (3 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: [
            "Pour 1 cup water (or 2 cups for 2 servings) into the saucepan and bring to a boil. (3 minutes)",
            "Stir in 1/2 cup rolled oats (or 1 cup for 2 servings) and diced apple. Reduce heat to a simmer and cook for 5 minutes, stirring occasionally. (5 minutes)",
            "Mix in 1/2 teaspoon cinnamon (or 1 teaspoon for 2 servings) and 2 tablespoons chopped walnuts (or 1/4 cup for 2 servings); stir well. (1 minute)",
            "(Optional: Drizzle 1 teaspoon honey (or 2 teaspoons for 2 servings) over the oatmeal.) (30 seconds)",
          ],
        },
        {
          title: "Assembly:",
          steps: [
            "Spoon the oatmeal into a bowl and enjoy immediately. (1 minute)",
          ],
        },
      ],
      justification:
        "This hearty breakfast blends fiber-rich oats, tart apples, and crunchy walnuts—a warming, nutritious start to your day.",
    },
    "day3-snack1": {
      name: "Sliced Bosc Pear with Walnuts",
      time: "5 minutes",
      servings: "1-2",
      calories: "180 calories, 2g protein, 30g carbs, 7g fat",
      ingredients1: [
        "1 medium Bosc pear, sliced",
        "2 tablespoons chopped walnuts",
      ],
      ingredients2: ["2 medium Bosc pears, sliced", "1/4 cup chopped walnuts"],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: Knife, cutting board, plate. (1 minute)",
            "Wash the 1 medium Bosc pear (or 2 pears for 2 servings) and slice it thinly. (3 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: ["No cooking required."],
        },
        {
          title: "Assembly:",
          steps: [
            "Arrange the sliced pear on a plate and sprinkle with 2 tablespoons chopped walnuts (or 1/4 cup for 2 servings). (1 minute)",
          ],
        },
      ],
      justification:
        "A crisp, naturally sweet snack that pairs the juicy texture of Bosc pear with protein-packed walnuts.",
    },
    "day3-lunch": {
      name: "Avocado Tuna Salad with Mixed Greens",
      time: "7 minutes",
      servings: "1-2",
      calories: "320 calories, 28g protein, 10g carbs, 20g fat",
      ingredients1: [
        "1 can (5 oz) albacore tuna in water, drained",
        "1/2 avocado, diced",
        "1 cup mixed greens",
        "1 tablespoon extra virgin olive oil",
        "1 teaspoon lemon juice",
        "Salt and pepper to taste",
      ],
      ingredients2: [
        "2 cans (5 oz each) albacore tuna in water, drained",
        "1 avocado, diced",
        "2 cups mixed greens",
        "2 tablespoons extra virgin olive oil",
        "2 teaspoons lemon juice",
        "Salt and pepper to taste",
      ],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: Bowl, fork, knife, cutting board, can opener. (2 minutes)",
            "Dice 1/2 avocado (or 1 avocado for 2 servings) and prepare 1 cup mixed greens (or 2 cups for 2 servings). (3 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: ["No cooking required."],
        },
        {
          title: "Assembly:",
          steps: [
            "In the bowl, combine the drained 1 can tuna (or 2 cans for 2 servings), diced avocado, and mixed greens. (1 minute)",
            "Drizzle with 1 tablespoon olive oil (or 2 tablespoons for 2 servings) and 1 teaspoon lemon juice (or 2 teaspoons for 2 servings). Season with salt and pepper. Mix gently. (1 minute)",
          ],
        },
      ],
      justification:
        "This quick, no-cook salad offers a protein boost with healthy fats and vibrant greens—perfect for a busy lunch.",
    },
    "day3-dinner": {
      name: "Pasta Primavera with Seasonal Vegetables",
      time: "30 minutes",
      servings: "2",
      calories: "450 calories, 15g protein, 65g carbs, 12g fat",
      ingredients1: [
        "150 grams whole wheat pasta",
        "1/2 cup cherry tomatoes, halved",
        "1/2 cup broccoli florets",
        "1/2 cup sliced carrots",
        "1/2 cup zucchini slices",
        "1/2 cup sliced red bell pepper",
        "1 tablespoon olive oil",
        "1 clove garlic, minced",
        "1/2 teaspoon dried oregano",
        "Salt and pepper to taste",
        "1/4 cup grated Parmesan cheese",
        "(Wine Pairing: Enjoy with 1 glass Sauvignon Blanc)",
      ],
      ingredients2: [],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: Large pot, colander, knife, cutting board, large skillet, spatula. (2 minutes)",
            "Bring water to a boil in the pot; add 150 grams whole wheat pasta with a pinch of salt. (1 minute)",
            "Wash and chop 1/2 cup cherry tomatoes, 1/2 cup broccoli florets, 1/2 cup sliced carrots, 1/2 cup zucchini slices, and 1/2 cup sliced red bell pepper. (5 minutes)",
            "Mince 1 clove garlic. (1 minute)",
          ],
        },
        {
          title: "Cooking:",
          steps: [
            "Cook the pasta according to package instructions (about 8-10 minutes); then drain using the colander. (10 minutes)",
            "In the large skillet, heat 1 tablespoon olive oil over medium heat. (1 minute)",
            "Sauté the minced 1 clove garlic for 30 seconds. (0.5 minute)",
            "Add all chopped vegetables to the skillet; stir-fry for 5-6 minutes until tender yet crisp. Season with 1/2 teaspoon dried oregano, salt, and pepper. (6 minutes)",
            "Toss the drained pasta with the sautéed vegetables and stir in 1/4 cup grated Parmesan cheese. (1 minute)",
          ],
        },
        {
          title: "Assembly:",
          steps: [
            "Divide the pasta evenly onto two plates. (1 minute)",
            "Garnish with extra Parmesan if desired and note the wine pairing: Enjoy with 1 glass Sauvignon Blanc. (1 minute)",
          ],
        },
      ],
      justification:
        "Vibrant seasonal vegetables shine in this light pasta dish that's both satisfying and paired perfectly with a crisp white wine.",
    },
    "day4-breakfast": {
      name: "Greek Yogurt Bowl with Granola & Seasonal Citrus Segments",
      time: "7 minutes",
      servings: "1-2",
      calories: "300 calories, 15g protein, 35g carbs, 10g fat",
      ingredients1: [
        "1 cup Greek yogurt",
        "1/2 cup granola",
        "1 cup mixed citrus segments (e.g., segmented 1 navel orange)",
      ],
      ingredients2: [
        "2 cups Greek yogurt",
        "1 cup granola",
        "2 cups mixed citrus segments (e.g., segmented 2 navel oranges)",
      ],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: Bowl, knife, cutting board, spoon. (1 minute)",
            "Peel and segment 1 navel orange (or 2 for 2 servings). (3 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: ["No cooking required."],
        },
        {
          title: "Assembly:",
          steps: [
            "Spoon 1 cup Greek yogurt (or 2 cups for 2 servings) into the bowl. (1 minute)",
            "Top with 1/2 cup granola (or 1 cup for 2 servings). (1 minute)",
            "Add the citrus segments over the top. (1 minute)",
          ],
        },
      ],
      justification:
        "This refreshing bowl combines creamy yogurt, crunchy granola, and bright citrus—ideal for a light, energizing breakfast.",
    },
    "day4-snack1": {
      name: "Orange Segments with Cinnamon",
      time: "5 minutes",
      servings: "1-2",
      calories: "120 calories, 2g protein, 28g carbs, 0.5g fat",
      ingredients1: [
        "1 medium navel orange, segmented",
        "1/4 teaspoon cinnamon",
      ],
      ingredients2: [
        "2 medium navel oranges, segmented",
        "1/2 teaspoon cinnamon",
      ],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: Knife, cutting board, bowl. (1 minute)",
            "Peel 1 medium navel orange (or 2 for 2 servings) and separate into segments. (3 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: ["No cooking required."],
        },
        {
          title: "Assembly:",
          steps: [
            "Place the orange segments in a bowl. (1 minute)",
            "Lightly sprinkle 1/4 teaspoon cinnamon (or 1/2 teaspoon for 2 servings) over the segments. (1 minute)",
          ],
        },
      ],
      justification:
        "This snack's sweet-tart citrus paired with a hint of warming cinnamon makes for a quick and revitalizing treat.",
    },
    "day4-lunch": {
      name: "Spinach Salad with Sliced Bosc Pear & Walnuts",
      time: "8 minutes",
      servings: "1-2",
      calories: "180 calories, 4g protein, 22g carbs, 9g fat",
      ingredients1: [
        "2 cups baby spinach",
        "1/2 Bosc pear, thinly sliced",
        "2 tablespoons chopped walnuts",
        "1 tablespoon balsamic vinaigrette",
        "Salt and pepper to taste",
      ],
      ingredients2: [
        "4 cups baby spinach",
        "1 Bosc pear, thinly sliced",
        "1/4 cup chopped walnuts",
        "2 tablespoons balsamic vinaigrette",
        "Salt and pepper to taste",
      ],
      instructions: [
        {
          title: "Prep:",
          steps: [
            "Gather tools: Knife, cutting board, large salad bowl, measuring spoons. (1 minute)",
            "Wash 2 cups baby spinach (or 4 cups for 2 servings). (2 minutes)",
            "Slice 1/2 Bosc pear (or 1 whole for 2 servings) thinly. (2 minutes)",
          ],
        },
        {
          title: "Cooking:",
          steps: ["No cooking required."],
        },
        {
          title: "Assembly:",
          steps: [
            "In the salad bowl, combine the 2 cups baby spinach, sliced Bosc pear, and 2 tablespoons chopped walnuts (or 1/4 cup for 2 servings). (1 minute)",
            "Drizzle with 1 tablespoon balsamic vinaigrette (or 2 tablespoons for 2 servings) and season with salt and pepper. Toss gently. (1 minute)",
          ],
        },
      ],
      justification:
        "This fresh salad highlights the crispness of spinach and Bosc pear with the crunch of walnuts—a delightful, no-cook meal.",
    },
    "day4-dinner": {
      name: "Baked Salmon with Miso Glaze, Stir-Fried Bok Choy & Jasmine Rice",
      time: "40 minutes",
      servings: "2",
      calories: "500 calories, 35g protein, 45g carbs, 20g fat",
      ingredients1: [
        "2 salmon fillets (6 oz each)",
        "2 tablespoons white miso paste",
        "2 teaspoons soy sauce",
        "1 tablespoon maple syrup",
        "1 teaspoon rice vinegar",
        "1 clove garlic, minced",
        "Salt and pepper to taste",
        "2 cups baby bok choy, halved lengthwise",
        "1 tablespoon sesame oil",
        "1 clove garlic, minced",
        "1 teaspoon soy sauce",
        "1 cup jasmine rice",
        "2 cups water",
        "A pinch of salt",
      ],
      ingredients2: [],
      instructions: [
        {
          title: "Prep (Main Course):",
          steps: [
            "Gather tools: Oven, baking tray, mixing bowl, whisk, knife, cutting board, non-stick skillet, pot, measuring cups, and a grill pan (our second special piece of equipment). (3 minutes)",
            "Preheat the oven to 400°F. (3 minutes)",
            "In a small bowl, whisk together 2 tablespoons white miso paste, 2 teaspoons soy sauce, 1 tablespoon maple syrup, 1 teaspoon rice vinegar, and 1 clove minced garlic. (3 minutes)",
            "Place 2 salmon fillets (6 oz each) on the greased baking tray, brush generously with the miso glaze, and season lightly with salt and pepper. (3 minutes)",
            "Rinse 2 cups baby bok choy under cold water; mince another 1 clove garlic for the stir-fry. (2 minutes)",
            "Rinse 1 cup jasmine rice under cold water until clear. (2 minutes)",
          ],
        },
        {
          title: "Cooking (Main Course):",
          steps: [
            "Bake the salmon in the preheated oven for 12-15 minutes, until it flakes easily with a fork. (15 minutes)",
            "In a non-stick skillet, heat 1 tablespoon sesame oil over medium heat. (1 minute)",
            "Add the minced 1 clove garlic and sauté for 30 seconds. (0.5 minute)",
            "Add 2 cups baby bok choy and drizzle with 1 teaspoon soy sauce; stir-fry for 3-4 minutes until tender yet crisp. (4 minutes)",
            "In a pot, combine the rinsed 1 cup jasmine rice with 2 cups water and a pinch of salt. Bring to a boil, then cover and simmer for 15 minutes until water is absorbed. (15 minutes)",
          ],
        },
        {
          title: "Assembly (Main Course):",
          steps: [
            "Plate one salmon fillet per serving with a side of stir-fried bok choy and 1/2 cup jasmine rice each. (2 minutes)",
            "Optionally, drizzle any remaining miso glaze over the salmon. (1 minute)",
          ],
        },
      ],
      justification:
        "This dinner is a culinary journey—savory baked salmon with an umami miso glaze, crisp stir-fried bok choy, and fragrant jasmine rice create a balanced main course.",
    },
    "day4-dessert": {
      name: "Vanilla Bean Panna Cotta",
      time: "12 minutes (plus chilling)",
      servings: "2",
      calories: "250 calories, 5g protein, 20g carbs, 15g fat",
      ingredients1: [
        "1 cup heavy cream",
        "1 cup whole milk",
        "1/4 cup sugar",
        "1 vanilla bean (split and scraped) (or 1 teaspoon vanilla extract as an alternative)",
        "1 packet (2 1/4 teaspoons) unflavored gelatin dissolved in 2 tablespoons cold water",
      ],
      ingredients2: [],
      instructions: [
        {
          title: "Prep (Dessert):",
          steps: [
            "Gather tools: Small saucepan, whisk, serving glasses or ramekins, measuring cups. (2 minutes)",
            "In the saucepan, combine 1 cup heavy cream, 1 cup whole milk, and 1/4 cup sugar. Split the 1 vanilla bean, scrape out the seeds, and add both seeds and pod (or add 1 teaspoon vanilla extract if using). (3 minutes)",
            "Sprinkle 1 packet unflavored gelatin over 2 tablespoons cold water in a small bowl; let it bloom for 5 minutes. (5 minutes)",
          ],
        },
        {
          title: "Cooking (Dessert):",
          steps: [
            "Heat the cream mixture over medium heat until it almost simmers; remove from heat and discard the vanilla pod. (2 minutes)",
            "Stir in the bloomed gelatin until fully dissolved. (1 minute)",
          ],
        },
        {
          title: "Assembly (Dessert):",
          steps: [
            "Pour the mixture into serving glasses or ramekins. (1 minute)",
            "Refrigerate for at least 4 hours until set. (Note: Best prepared ahead of time.)",
          ],
        },
      ],
      justification:
        "The indulgent Vanilla Bean Panna Cotta offers a luxurious dessert finish to the meal.",
    },
  };

  const shoppingList = [
    {
      category: "Produce",
      items: [
        {
          id: "1-loaf-bread",
          name: "1 loaf organic whole wheat bread",
          forMeals: "For Day 1 Breakfast & Day 2 Breakfast",
        },
        {
          id: "2-avocados",
          name: "2 organic avocados",
          forMeals: "For Day 1 Breakfast & Day 3 Lunch",
        },
        {
          id: "2-lemons",
          name: "2 organic lemons",
          forMeals: "For Day 1 Breakfast, Day 2 Dinner, & Day 3 Lunch",
        },
        {
          id: "2-fuji-apples",
          name: "2 medium organic Fuji apples",
          forMeals: "For Day 1 Snack",
        },
        {
          id: "2-granny-smith",
          name: "2 medium organic Granny Smith apples",
          forMeals: "For Day 3 Breakfast",
        },
        {
          id: "1-cucumber",
          name: "1 organic English cucumber",
          forMeals: "For Day 1 Lunch",
        },
        {
          id: "2-red-bell-peppers",
          name: "2 organic red bell peppers",
          forMeals: "For Day 1 Lunch, Day 1 Dinner, & Day 3 Dinner",
        },
        {
          id: "1-lb-carrots",
          name: "1 lb organic carrots",
          forMeals: "For Day 1 Dinner & Day 3 Dinner",
        },
        {
          id: "1-celery",
          name: "1 small bunch organic celery",
          forMeals: "For Day 1 Dinner",
        },
        {
          id: "1-butternut-squash",
          name: "1 small organic butternut squash",
          forMeals: "For Day 1 Dinner",
        },
        {
          id: "1-onion",
          name: "1 small organic yellow onion",
          forMeals: "For Day 1 Dinner",
        },
        {
          id: "1-garlic",
          name: "1 organic garlic bulb",
          forMeals:
            "For Day 1 Dinner, Day 2 Dinner, Day 3 Dinner, & Day 4 Dinner",
        },
        {
          id: "4-bosc-pears",
          name: "4 organic Bosc pears",
          forMeals: "For Day 2 Breakfast, Day 3 Snack, & Day 4 Lunch",
        },
        {
          id: "2-tomatoes",
          name: "2 medium organic vine tomatoes",
          forMeals: "For Day 2 Lunch",
        },
        {
          id: "1-cherry-tomatoes",
          name: "1 pint organic cherry tomatoes",
          forMeals: "For Day 3 Dinner",
        },
        {
          id: "1-broccoli",
          name: "1 small organic broccoli head",
          forMeals: "For Day 3 Dinner",
        },
        {
          id: "1-zucchini",
          name: "1 small organic zucchini",
          forMeals: "For Day 3 Dinner",
        },
        {
          id: "1-basil",
          name: "1 small bunch organic fresh basil",
          forMeals: "For Day 2 Lunch",
        },
        {
          id: "2-spinach",
          name: "2 (5 oz) bags organic baby spinach",
          forMeals: "For Day 2 Dinner & Day 4 Lunch",
        },
        {
          id: "1-mixed-greens",
          name: "1 (5 oz) bag organic mixed greens",
          forMeals: "For Day 3 Lunch",
        },
        {
          id: "1-bok-choy",
          name: "1 small pack organic baby bok choy",
          forMeals: "For Day 4 Dinner",
        },
        {
          id: "4-oranges",
          name: "4 organic navel oranges",
          forMeals: "For Day 4 Breakfast & Day 4 Snack",
        },
      ],
    },
    {
      category: "Dairy & Refrigerated",
      items: [
        {
          id: "1-ricotta",
          name: "1 container (8 oz) organic ricotta cheese",
          forMeals: "For Day 2 Breakfast",
        },
        {
          id: "1-mozzarella",
          name: "1 ball (8 oz) fresh organic mozzarella cheese",
          forMeals: "For Day 2 Lunch",
        },
        {
          id: "1-greek-yogurt",
          name: "1 container (32 oz) organic Greek yogurt",
          forMeals: "For Day 4 Breakfast",
        },
        {
          id: "1-heavy-cream",
          name: "1 pint organic heavy cream",
          forMeals: "For Day 4 Dessert",
        },
        {
          id: "1-whole-milk",
          name: "1 quart organic whole milk",
          forMeals: "For Day 4 Dessert",
        },
        {
          id: "1-butter",
          name: "1 package (1/2 lb) organic butter",
          forMeals: "For Day 2 Dinner",
        },
        {
          id: "1-parmesan",
          name: "1 container (4 oz) grated Parmesan cheese",
          forMeals: "For Day 3 Dinner",
        },
      ],
    },
    {
      category: "Meat & Seafood",
      items: [
        {
          id: "1-ground-turkey",
          name: "1 lb organic ground turkey",
          forMeals: "For Day 1 Dinner",
        },
        {
          id: "1-chicken-breast",
          name: "1 lb organic chicken breast",
          forMeals: "For Day 2 Dinner",
        },
        {
          id: "1-salmon",
          name: "1 lb wild-caught salmon fillets",
          forMeals: "For Day 4 Dinner",
        },
        {
          id: "2-tuna",
          name: "2 cans (5 oz each) albacore tuna in water",
          forMeals: "For Day 3 Lunch",
        },
      ],
    },
    {
      category: "Pantry & Dry Goods",
      items: [
        {
          id: "1-pita-bread",
          name: "1 package (6 pieces) organic whole wheat pita bread",
          forMeals: "For Day 1 Lunch",
        },
        {
          id: "1-hummus",
          name: "1 container (8 oz) organic hummus",
          forMeals: "For Day 1 Lunch",
        },
        {
          id: "1-olive-oil",
          name: "1 bottle (500 ml) organic extra virgin olive oil",
          forMeals: "For Day 2 Lunch, Day 3 Dinner, & Day 2 Dinner",
        },
        {
          id: "1-chicken-broth",
          name: "1 carton (32 oz) organic chicken broth",
          forMeals: "For Day 1 Dinner & Day 2 Dinner",
        },
        {
          id: "1-flour",
          name: "1 bag (1 lb) organic all-purpose flour",
          forMeals: "For Day 2 Dinner",
        },
        {
          id: "1-maple-syrup",
          name: "1 small bottle organic maple syrup",
          forMeals: "For Day 4 Dinner",
        },
        {
          id: "1-miso-paste",
          name: "1 container (7 oz) organic white miso paste",
          forMeals: "For Day 4 Dinner",
        },
        {
          id: "1-soy-sauce",
          name: "1 bottle (10 oz) organic soy sauce",
          forMeals: "For Day 4 Dinner",
        },
        {
          id: "1-rice-vinegar",
          name: "1 small bottle organic rice vinegar",
          forMeals: "For Day 4 Dinner",
        },
        {
          id: "1-capers",
          name: "1 small jar organic capers",
          forMeals: "For Day 2 Dinner",
        },
        {
          id: "1-rice-cakes",
          name: "1 package (6 pieces) plain organic rice cakes",
          forMeals: "For Day 2 Snack",
        },
        {
          id: "1-rolled-oats",
          name: "1 container (18 oz) organic rolled oats",
          forMeals: "For Day 3 Breakfast",
        },
        {
          id: "1-walnuts",
          name: "1 bag (8 oz) organic chopped walnuts",
          forMeals: "For Day 3 Breakfast, Day 3 Snack, & Day 4 Lunch",
        },
        {
          id: "1-granola",
          name: "1 bag (12 oz) organic granola",
          forMeals: "For Day 4 Breakfast",
        },
        {
          id: "1-jasmine-rice",
          name: "1 bag (1 lb) organic jasmine rice",
          forMeals: "For Day 4 Dinner",
        },
        {
          id: "1-whole-wheat-pasta",
          name: "1 bag (1 lb) organic whole wheat pasta",
          forMeals: "For Day 3 Dinner",
        },
        {
          id: "1-diced-tomatoes",
          name: "1 can (14.5 oz) organic diced tomatoes",
          forMeals: "For Day 1 Dinner",
        },
        {
          id: "1-kidney-beans",
          name: "1 can (15 oz) organic kidney beans",
          forMeals: "For Day 1 Dinner",
        },
        {
          id: "1-gelatin",
          name: "1 box organic unflavored gelatin",
          forMeals: "For Day 4 Dessert",
        },
        {
          id: "1-sugar",
          name: "1 bag (1 lb) organic sugar",
          forMeals: "For Day 4 Dessert",
        },
        {
          id: "1-vanilla-bean",
          name: "1 organic vanilla bean",
          forMeals: "For Day 4 Dessert",
        },
        {
          id: "1-balsamic-vinaigrette",
          name: "1 small bottle organic balsamic vinaigrette",
          forMeals: "For Day 4 Lunch",
        },
        {
          id: "1-balsamic-glaze",
          name: "1 small bottle organic balsamic glaze",
          forMeals: "Optional for Day 2 Lunch",
        },
        {
          id: "1-almond-butter",
          name: "1 jar organic almond butter (16 oz)",
          forMeals: "For Day 1 Snack & Day 2 Snack",
        },
        {
          id: "1-honey",
          name: "1 small jar organic honey",
          forMeals: "For Day 2 Breakfast & optionally Day 3 Breakfast",
        },
        {
          id: "1-sesame-oil",
          name: "1 small bottle organic sesame oil",
          forMeals: "For Day 4 Dinner",
        },
      ],
    },
    {
      category: "Wine",
      items: [
        {
          id: "1-sauvignon-blanc",
          name: "1 bottle (750 ml) organic Sauvignon Blanc",
          forMeals: "For Day 3 Dinner wine pairing",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-black text-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Weekly Meal Plan</h1>
          <p className="text-gray-300">Feb. 24-28th</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        daysOverview={daysOverview}
        setActiveDay={setActiveDay}
        activeDay={activeDay}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === "overview" && (
          <div>
            {weekIntro}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {daysOverview.map((day) => (
                <div
                  key={`day-overview-${day.day}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden group"
                >
                  <div className="bg-black text-white px-4 py-3">
                    <h3 className="font-bold text-lg">Day {day.day}</h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-3">
                      {day.meals.map((meal) => (
                        <li key={meal.id} className="flex items-start">
                          <button
                            onClick={() => toggleMealStatus(meal.id)}
                            className="flex-shrink-0 mt-0.5 mr-2"
                          >
                            {mealStatus[meal.id] ? (
                              <CheckSquare className="w-5 h-5 text-gray-600" />
                            ) : (
                              <Square className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          <div>
                            <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded ${getMealTypeColor(
                                meal.type
                              )} mb-1`}
                            >
                              {meal.type}
                            </span>
                            <p
                              className={`${
                                mealStatus[meal.id]
                                  ? "line-through text-gray-400"
                                  : "text-gray-700"
                              } text-lg hover:text-gray-900 cursor-pointer transition-colors`}
                              onClick={() => {
                                setActiveTab("day");
                                setActiveDay(day.day);
                                setExpandedRecipe(meal.id);
                              }}
                            >
                              {meal.name}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <DynamicDayStyle day={day.day} />
                    <div className="mt-4 relative">
                      <button
                        onClick={() => {
                          setActiveTab("day");
                          setActiveDay(day.day);
                        }}
                        className={`view-button-${day.day}`}
                      >
                        View All Recipes{" "}
                        <span className={`arrow-${day.day}`}>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "day" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Day {activeDay} Recipes
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveDay(Math.max(1, activeDay - 1))}
                  disabled={activeDay === 1}
                  className={`p-2 rounded-md ${
                    activeDay === 1
                      ? "text-gray-300"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveDay(Math.min(4, activeDay + 1))}
                  disabled={activeDay === 4}
                  className={`p-2 rounded-md ${
                    activeDay === 4
                      ? "text-gray-300"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {daysOverview[activeDay - 1].meals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  mealStatus={mealStatus}
                  toggleMealStatus={toggleMealStatus}
                  recipes={recipes}
                  expandedRecipe={expandedRecipe}
                  toggleExpandedRecipe={toggleExpandedRecipe}
                  getMealTypeColor={getMealTypeColor}
                  recipeImages={recipeImages}
                  handleImageUpload={handleImageUpload}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === "shopping" && (
          <ShoppingList
            shoppingList={shoppingList}
            shoppingItems={shoppingItems}
            toggleShoppingItem={toggleShoppingItem}
            expandedCategory={expandedCategory}
            toggleExpandedCategory={toggleExpandedCategory}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-300">
            Weekly Meal Plan | Feb. 24-28th
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Focusing on seasonal, vibrant produce with quick, nourishing meals
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MealPlannerApp;

