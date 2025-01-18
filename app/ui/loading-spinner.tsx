import React from "react";

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-gray-700 rounded-lg shadow-lg text-white">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      <p className="mt-4 text-lg font-semibold">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
