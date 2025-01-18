// Practice.tsx
import React from "react";

interface PracticeProps {
  onQuizGenerate: (category: string) => Promise<void>;
  isLoading: boolean;
}

const Practice: React.FC<PracticeProps> = ({ onQuizGenerate, isLoading }) => {
  // Include "Remix (Random Mix)" in your categories array
  const categories = [
    "Academic Art",
    "Art Nouveau",
    "Baroque",
    "Expressionism",
    "Japanese Art",
    "Neoclassicism",
    "Primitivism",
    "Realism",
    "Renaissance",
    "Rococo",
    "Romanticism",
    "Symbolism",
    "Western Medieval",
    "Random", // <-- Bring back Remix here
  ];

  const handleCategoryClick = (category: string) => {
    if (!isLoading) {
      onQuizGenerate(category);
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Practice Quiz</h1>
      <p className="mb-4">Select a category to test your knowledge:</p>
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-lg font-semibold">Generating your quiz...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category)}
              className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Practice;
