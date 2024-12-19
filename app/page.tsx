"use client";

import React, { useState, useRef, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import ImageAnalysis from './components/ImageAnalysis';
import Quiz from './components/Quiz';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export default function Home() {
  const [imageStyle, setImageStyle] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [quizGenerated, setQuizGenerated] = useState<boolean>(false);

  const quizContainerRef = useRef<HTMLDivElement>(null);

  const handleGenerateQuiz = async () => {
    if (!imageStyle) {
      alert('Please classify an image first!');
      return;
    }

    setIsLoading(true);

    try {
      const payload = { imageStyle };
      console.log('Payload:', payload);

      const response = await fetch('http://localhost:8000/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Quiz data received:', data);

      if (data.questions && Array.isArray(data.questions)) {
        setQuizQuestions(data.questions);
        setQuizGenerated(true);
      } else {
        console.error('No questions found in response:', data);
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (quizContainerRef.current) {
      quizContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [quizQuestions]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 p-4">
      <h1 className="text-4xl font-bold mb-6 text-white">Art Quizify</h1>
      <ImageUploader
        setImageStyle={setImageStyle}
        setConfidence={setConfidence}
        setRecommendations={setRecommendations}
        setDescription={setDescription}
        setIsLoading={setIsLoading}
      />
      <ImageAnalysis imageStyle={imageStyle} confidence={confidence} description={description} recommendations={recommendations} isLoading={isLoading} />

      {imageStyle && (
        <button
          onClick={handleGenerateQuiz}
          disabled={quizGenerated || isLoading}
          className={`mt-4 p-2 rounded-lg text-white ${
            quizGenerated || isLoading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Quiz Generating...' : quizGenerated ? 'Quiz Generated' : 'Generate Quiz'}
        </button>
      )}

      <div className="w-full max-w-lg mt-4 p-2" ref={quizContainerRef}>
        {quizQuestions.length > 0 && <Quiz questions={quizQuestions} />}
      </div>
    </div>
  );
}
