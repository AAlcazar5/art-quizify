import React from "react";

interface ImageAnalysisProps {
  imageStyle: string | null;
  confidence: number | null;
  description: string | null;
  recommendations: string | null;
  isLoading: boolean;
}

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ imageStyle, confidence, description, recommendations, isLoading }) => {
  return (
    <div className="p-4 bg-gray-500 rounded-lg shadow-lg w-full max-w-lg">
      {isLoading ? (
        <p className="text-white">Generating...</p>
      ) : imageStyle ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Image Analysis</h2>
          <p className="mb-2">
            <span className="font-semibold">Detected Style:</span> {imageStyle}
          </p>
          {confidence !== null && (
            <p className="mb-4">
              <span className="font-semibold">Confidence Score:</span> {(confidence * 100).toFixed(2)}%
            </p>
          )}
          {description && <p className="mt-2">{description}</p>}
          {recommendations && (
            <>
              <h3 className="text-xl font-semibold mb-2">Recommendations</h3>
              <p className="text-gray-700">{recommendations}</p>
            </>
          )}
        </>
      ) : (
        <p className="text-white">Upload an image to see the analysis results.</p>
      )}
    </div>
  );
};

export default ImageAnalysis;