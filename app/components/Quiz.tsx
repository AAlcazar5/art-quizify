import React from "react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  selectedAnswers: string[];
  onOptionChange: (qIndex: number, option: string) => void;
  onSubmit: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, selectedAnswers, onOptionChange, onSubmit }) => {
  return (
    <div className="p-4 bg-gray-700 rounded-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Quiz</h2>
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="mb-4 border border-gray-500 p-4 rounded">
          <p className="font-semibold">{qIndex + 1}. {q.question}</p>
          {q.options.map((option, oIndex) => (
            <label key={oIndex} className="block mt-2">
              <input
                type="radio"
                name={`question-${qIndex}`}
                value={option}
                checked={selectedAnswers[qIndex] === option}
                onChange={() => onOptionChange(qIndex, option)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
        </div>
      ))}
      <button
        onClick={onSubmit}
        className="mt-4 p-2 bg-blue-500 rounded hover:bg-blue-600"
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default Quiz;
