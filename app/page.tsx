"use client";

import React, { useState, useEffect } from "react";
import ImageUploader from "./components/ImageUploader";
import ImageAnalysis from "./components/ImageAnalysis";
import Quiz from "./components/Quiz";
import Practice from "./components/Practice";
import LeftSidebar from "./ui/left-sidebar";
import RightSidebar from "./ui/right-sidebar";
import DrawingCanvas from "./ui/drawing-canvas";
import { DailyQuest } from "./types/DailyQuest";
import { QuizQuestion } from "./types/QuizQuestion";

// Icons for quests
import { FaBolt, FaBullseye, FaClock, FaLock, FaLockOpen } from "react-icons/fa";


// -------------------------------------
// Helper function for day-based streak
// -------------------------------------
function getDayDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

// -------------------------------------
// Inline DailyQuests component
// -------------------------------------
const DailyQuests: React.FC<{
  quests: DailyQuest[];
}> = ({ quests }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white w-full max-w-md mb-6">
      <h2 className="text-xl font-bold mb-4">Daily Quests</h2>
      <div className="space-y-4">
        {quests.map((quest) => {
          const percentage = Math.min(
            Math.round((quest.current / quest.goal) * 100),
            100
          );
          const lockIcon = quest.rewardUnlocked ? (
            <FaLockOpen className="text-yellow-400" />
          ) : (
            <FaLock className="text-gray-300" />
          );

          return (
            <div
              key={quest.id}
              className="bg-gray-900 p-3 rounded-lg flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                {quest.icon && <div className="text-xl">{quest.icon}</div>}
                <span className="flex-grow">{quest.label}</span>
                <div>{lockIcon}</div>
              </div>
              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">
                {quest.current} / {quest.goal}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// -------------------------------------
// Main Home Component
// -------------------------------------
export default function Home() {
  // -----------------------------
  // Image classification states
  // -----------------------------
  const [imageStyle, setImageStyle] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // -----------------------------
  // Quiz states
  // -----------------------------
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [practiceQuizQuestions, setPracticeQuizQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [quizGenerated, setQuizGenerated] = useState<boolean>(false);
  const [practiceQuizGenerated, setPracticeQuizGenerated] = useState<boolean>(false);

  // -----------------------------
  // Results / score
  // -----------------------------
  const [showResults, setShowResults] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [pointsEarnedThisQuiz, setPointsEarnedThisQuiz] = useState<number>(0);

  // -----------------------------
  // Gamification
  // -----------------------------
  const [streak, setStreak] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("imageAnalysis");

  // -----------------------------
  // Day-based streak
  // -----------------------------
  const [lastPointDate, setLastPointDate] = useState<string | null>(null);

  // -----------------------------
  // Loading states (one per tab!)
  // -----------------------------
  const [isImageAnalysisLoading, setIsImageAnalysisLoading] = useState(false);
  const [isPracticeLoading, setIsPracticeLoading] = useState(false);
  

  // -------------------------------------
  // Daily Quests State
  // -------------------------------------
  const [quests, setQuests] = useState<DailyQuest[]>([
    {
      id: 1,
      label: "Earn 100 XP",
      current: 0,
      goal: 100,
      rewardUnlocked: false,
      icon: <FaBolt />,
    },
    {
      id: 2,
      // Now 80%+ instead of 90%+
      label: "Score 80%+ in 2 lessons",
      current: 0,
      goal: 2,
      rewardUnlocked: false,
      icon: <FaBullseye />,
    },
    {
      id: 3,
      label: "Spend 10 minutes learning",
      current: 0,
      goal: 10,
      rewardUnlocked: false,
      icon: <FaClock />,
    },
  ]);

  // If 'points' changes, update quest #1 (earn 100 XP)
  useEffect(() => {
    if (points > 0) {
      setQuests((prev) =>
        prev.map((q) => {
          if (q.id === 1) {
            const newCurrent = Math.min(points, q.goal);
            return {
              ...q,
              current: newCurrent,
              rewardUnlocked: newCurrent >= q.goal,
            };
          }
          return q;
        })
      );
    }
  }, [points]);

  // -----------------------------
  // Generate quiz for Image Analysis
  // -----------------------------
  const handleGenerateQuiz = async () => {
    if (!imageStyle) {
      alert("Please classify an image first!");
      return;
    }
    setIsImageAnalysisLoading(true);

    try {
      const payload = { imageStyle };
      const response = await fetch("http://localhost:8000/generate-quiz/image-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        setQuizQuestions(data.questions);
        setQuizGenerated(true);
        setShowResults(false);
        setSelectedAnswers(new Array(data.questions.length).fill(""));
        setQuizScore(0);
        setPointsEarnedThisQuiz(0);
      } else {
        console.error("No questions found in response:", data);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setIsImageAnalysisLoading(false);
    }
  };

  // -----------------------------
  // Generate quiz for Practice
  // -----------------------------
  const handlePracticeQuizGenerate = async (category: string) => {
    setIsPracticeLoading(true);
    try {
      const payload = { imageStyle: category };
      const response = await fetch("http://localhost:8000/generate-quiz/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        setPracticeQuizQuestions(data.questions);
        setPracticeQuizGenerated(true);
        setShowResults(false);
        setSelectedAnswers(new Array(data.questions.length).fill(""));
        setQuizScore(0);
        setPointsEarnedThisQuiz(0);
      } else {
        console.error("No questions found in response:", data);
      }
    } catch (error) {
      console.error("Error generating practice quiz:", error);
    } finally {
      setIsPracticeLoading(false);
    }
  };

  // -----------------------------
  // Track selected options
  // -----------------------------
  const handleOptionChange = (qIndex: number, option: string) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[qIndex] = option;
    setSelectedAnswers(updatedAnswers);
  };

  // -----------------------------
  // Handle quiz submission
  // -----------------------------
  const handleQuizSubmit = () => {
    // Ensure all questions are answered
    if (selectedAnswers.some((ans) => !ans)) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let currentQuestions: QuizQuestion[] = [];
    if (activeTab === "practice") {
      currentQuestions = practiceQuizQuestions;
    } else {
      currentQuestions = quizQuestions;
    }

    // Count correct
    let correctCount = 0;
    currentQuestions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correctAnswer) {
        correctCount++;
      }
    });

    setQuizScore(correctCount);
    const pointsGained = correctCount * 10;
    setPointsEarnedThisQuiz(pointsGained);
    const newTotal = points + pointsGained;
    setPoints(newTotal);

    // Award badges
    if (newTotal >= 100 && !badges.includes("Art Enthusiast")) {
      setBadges([...badges, "Art Enthusiast"]);
    }

    // Day-based streak
    if (pointsGained > 0) {
      handleDayBasedStreak();
    } else {
      setStreak(0);
    }

    setShowResults(true);
  };

  // -----------------------------
  // Day-based streak logic
  // -----------------------------
  const handleDayBasedStreak = () => {
    const today = new Date().toISOString().split("T")[0];

    if (!lastPointDate) {
      // first time earning points
      setStreak(1);
    } else {
      const diff = getDayDifference(lastPointDate, today);
      if (diff === 0) {
        // same day -> do nothing
      } else if (diff === 1) {
        setStreak(streak + 1);
      } else {
        setStreak(1);
      }
    }

    setLastPointDate(today);
  };

  // -----------------------------
  // Return to default (categories or image analysis)
  // -----------------------------
  const handleReturnToDefault = () => {
    setShowResults(false);
    setQuizScore(0);
    setPointsEarnedThisQuiz(0);
    setSelectedAnswers([]);

    if (activeTab === "practice") {
      setPracticeQuizGenerated(false);
    } else {
      setQuizGenerated(false);
    }
  };

  // -----------------------------
  // Render quiz results
  // -----------------------------
  const renderQuizResults = () => {
    const currentQuestions =
      activeTab === "practice" ? practiceQuizQuestions : quizQuestions;

    const returnBtnText =
      activeTab === "practice" ? "Back to Categories" : "Back to Image Analysis";

    return (
      <div className="mt-6 p-4 bg-gray-600 rounded-lg text-white">
        <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
        <p className="mb-1">
          You got <strong>{quizScore}</strong> correct out of{" "}
          <strong>{currentQuestions.length}</strong>.
        </p>
        <p className="mb-4">
          <strong>Points Gained:</strong> {pointsEarnedThisQuiz}
        </p>
        <ul className="list-disc pl-5 mb-4">
          {currentQuestions.map((q, i) => {
            const isCorrect = selectedAnswers[i] === q.correctAnswer;
            return (
              <li key={i} className="mb-2">
                <p className="font-semibold">
                  Q{i + 1}: {q.question}
                </p>
                <p className="text-sm">
                  Your answer:{" "}
                  <span className={isCorrect ? "text-green-300" : "text-red-400"}>
                    {selectedAnswers[i]}
                  </span>
                  {isCorrect ? " ✅" : ` ❌ (Correct: ${q.correctAnswer})`}
                </p>
                <p className="italic text-gray-300">
                  Explanation: {q.explanation}
                </p>
              </li>
            );
          })}
        </ul>
        <button
          onClick={handleReturnToDefault}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
        >
          {returnBtnText}
        </button>
      </div>
    );
  };

  // -------------------------------------
  // Main Render
  // -------------------------------------
  return (
    <div className="flex min-h-screen bg-gray-800">
      {/* Left Sidebar */}
      <LeftSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="flex-grow p-6">
        {activeTab === "imageAnalysis" ? (
          // ----------------------------------
          // IMAGE ANALYSIS TAB
          // ----------------------------------
          <>
            {isImageAnalysisLoading ? (
              <div className="flex justify-center items-center h-screen">
                <p className="text-white text-lg font-bold">
                  Loading... Please wait.
                </p>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold mb-6 text-white">
                  Image Analysis
                </h1>
                <ImageUploader
                  setUploadedImage={setUploadedImage}
                  setImageStyle={setImageStyle}
                  setConfidence={setConfidence}
                  setRecommendations={setRecommendations}
                  setDescription={setDescription}
                  // Pass the tab-specific setter:
                  setIsLoading={setIsImageAnalysisLoading}
                />
                <ImageAnalysis
                  uploadedImage={uploadedImage}
                  imageStyle={imageStyle}
                  confidence={confidence}
                  description={description}
                  recommendations={recommendations}
                  // This prop can remain or be removed if not needed:
                  isLoading={isImageAnalysisLoading}
                />

                {/* QUIZ for this tab */}
                {quizGenerated && !showResults ? (
                  <div className="mt-8">
                    <Quiz
                      questions={quizQuestions}
                      selectedAnswers={selectedAnswers}
                      onOptionChange={handleOptionChange}
                      onSubmit={handleQuizSubmit}
                    />
                  </div>
                ) : quizGenerated && showResults ? (
                  <div className="mt-8">{renderQuizResults()}</div>
                ) : (
                  <div className="mt-6 p-4 bg-gray-600 rounded-lg shadow-lg text-white">
                    <p className="text-center">
                      Generate a quiz based on the detected art style to test your
                      knowledge!
                    </p>
                    {imageStyle && (
                      <button
                        onClick={handleGenerateQuiz}
                        className="mt-4 p-2 w-full rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Generate Quiz
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        ) : activeTab === "practice" ? (
          // ----------------------------------
          // PRACTICE TAB
          // ----------------------------------
          <>
            {isPracticeLoading ? (
              <div className="flex justify-center items-center h-screen">
                <p className="text-white text-lg font-bold">
                  Loading... Please wait.
                </p>
              </div>
            ) : practiceQuizGenerated ? (
              !showResults ? (
                <Quiz
                  questions={practiceQuizQuestions}
                  selectedAnswers={selectedAnswers}
                  onOptionChange={handleOptionChange}
                  onSubmit={handleQuizSubmit}
                />
              ) : (
                renderQuizResults()
              )
            ) : (
              <Practice
                onQuizGenerate={handlePracticeQuizGenerate}
                // you can remove this if Practice doesn't need a loading prop:
                isLoading={isPracticeLoading}
              />
            )}
          </>
        ) : activeTab === "progress" ? (
          // ----------------------------------
          // PROGRESS TAB (Daily Quests)
          // (If you don't fetch anything, you may not need isProgressLoading)
          // ----------------------------------
          <>
              <DailyQuests quests={quests} />
          </>
        ) : activeTab === "canvas" ? (
          // ----------------------------------
          // CANVAS TAB
          // ----------------------------------
          <>
            <h1 className="text-4xl font-bold mb-4 text-white">
              Canvas Critique
            </h1>
            <DrawingCanvas width={800} height={500} />
          </>
        ) : (
          // ----------------------------------
          // DEFAULT: prompt user
          // ----------------------------------
          <div className="text-white">
            <h1 className="text-4xl font-bold">
              Select an option from the sidebar
            </h1>
          </div>
        )}
      </main>

      {/* Right Sidebar */}
      <RightSidebar streak={streak} points={points} badges={badges} />
    </div>
  );
}
