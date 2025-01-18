import React from "react";
import Image from "next/image";

interface ImageAnalysisProps {
  uploadedImage: string | null; // Add this prop
  imageStyle: string | null;
  confidence: number | null;
  description: string | null;
  recommendations: string | null;
  isLoading: boolean;
}

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({
  uploadedImage,
  imageStyle,
  confidence,
  description,
  recommendations,
  isLoading,
}) => {
  return (
    <div className="p-6 bg-gray-700 rounded-lg shadow-lg w-full max-w-lg text-white">
      {uploadedImage && (
        <div className="mb-4 flex justify-center">
          <Image
            src={uploadedImage}
            alt="Uploaded Image"
            width={300}
            height={300}
            objectFit="contain"
            className="rounded-md"
          />
        </div>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p>Analyzing image...</p>
        </div>
      ) : imageStyle ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Image Analysis Results</h2>
          <p className="mb-2">
            <span className="font-semibold">Detected Style:</span>{" "}
            <span className="text-blue-400">{imageStyle}</span>
          </p>
          {confidence !== null && (
            <p className="mb-4">
              <span className="font-semibold">Confidence Score:</span>{" "}
              <span className="text-green-400">{(confidence * 100).toFixed(2)}%</span>
            </p>
          )}
          {description && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold">Style Description</h3>
              <p>{description}</p>
            </div>
          )}
          {recommendations && (
            <div className="mt-4">
              <h3 className="text-xl font-semibold">Recommendations</h3>
              <ul className="list-disc list-inside text-gray-300">
                {recommendations.split("\n").map((recommendation, idx) => (
                  <li key={idx}>{recommendation}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-400">Upload an image to see analysis results.</p>
      )}
    </div>
  );
};

export default ImageAnalysis;
