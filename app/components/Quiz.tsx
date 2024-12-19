import React, { useState } from 'react';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizProps {
  questions: QuizQuestion[];
}

const Quiz: React.FC<QuizProps> = ({ questions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [showResults, setShowResults] = useState<boolean>(false);

  const handleOptionChange = (qIndex: number, option: string) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[qIndex] = option;
    setSelectedAnswers(updatedAnswers);
  };

  const handleSubmit = () => {
    // Ensure every question has an answer selected
    if (selectedAnswers.some((answer) => answer === '')) {
      alert('Please select an answer for all questions before submitting.');
      return;
    }
    setShowResults(true);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qIndex) => {
        const isCorrect = selectedAnswers[qIndex] === q.correctAnswer;

        return (
          <div key={qIndex} className="border border-gray-600 p-4 rounded">
            <p className="text-white font-semibold mb-2">
              {qIndex + 1}. {q.question}
            </p>
            {q.options.map((option, oIndex) => (
              <label key={oIndex} className="block text-white mb-1">
                <input
                  type="radio"
                  name={`question-${qIndex}`}
                  value={option}
                  checked={selectedAnswers[qIndex] === option}
                  onChange={() => handleOptionChange(qIndex, option)}
                  className="mr-2"
                />
                {option}
              </label>
            ))}

            {showResults && (
              <div className="mt-2">
                {isCorrect ? (
                  <p className="text-green-400 font-semibold">Correct!</p>
                ) : (
                  <div>
                    <p className="text-red-400 font-semibold">Incorrect.</p>
                    <p className="text-white mt-1">Explanation: {q.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!showResults && questions.length > 0 && (
        <button
          onClick={handleSubmit}
          className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit Answers
        </button>
      )}
    </div>
  );
};

export default Quiz;
