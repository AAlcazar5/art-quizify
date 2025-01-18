"use client";
import React, { useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  setUploadedImage?: (imageUrl: string | null) => void; 
  setImageStyle?: (style: string | null) => void;
  setConfidence?: (confidence: number | null) => void;
  setRecommendations?: (recommendations: string | null) => void;
  setDescription?: (description: string | null) => void;
  setIsLoading?: (loading: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  setUploadedImage,
  setImageStyle,
  setConfidence,
  setRecommendations,
  setDescription,
  setIsLoading,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      // If no file is chosen or user cancels, clear the preview (if desired)
      setPreviewUrl(null);
      return;
    }

    const file = event.target.files[0];
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadedImage?.(url);

    // Begin loading (optional)
    setIsLoading?.(true);

    // Create form data to send to your FastAPI backend
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:8000/classify-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setImageStyle?.(data.imageStyle);
      setConfidence?.(data.confidence);
      setRecommendations?.(data.recommendations);
      setDescription?.(data.description);
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageStyle?.(null);
      setConfidence?.(null);
      setRecommendations?.("Error uploading image");
      setDescription?.(null);
    } finally {
      setIsLoading?.(false);
    }
  };

  return (
    // Center everything with Tailwind classes
    <div className="flex flex-col items-center mb-4">
      {/* 1) Hidden native file input so we avoid "No file chosen" text entirely */}
      <input
        id="fileInput"
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 2) Custom label that acts as the "Upload File" button */}
      <label
        htmlFor="fileInput"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
      >
        Upload File
      </label>

      {/* 3) Optional preview of the uploaded image */}
      {previewUrl && (
        <div className="mt-4 flex justify-center">
          <Image
            src={previewUrl}
            alt="Image Preview"
            width={300}
            height={300}
            style={{ objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
