import React, { useState } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  setImageStyle: (style: string | null) => void;
  setConfidence: (confidence: number | null) => void;
  setRecommendations: (recommendations: string | null) => void;
  setDescription: (description: string | null) => void;
  setIsLoading: (loading: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ setImageStyle, setConfidence, setDescription, setRecommendations, setIsLoading }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setPreviewUrl(URL.createObjectURL(file)); // Set the preview URL

      setIsLoading(true); // Set loading state to true

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('http://localhost:8000/classify-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setImageStyle(data.imageStyle);
        setConfidence(data.confidence);
        setRecommendations(data.recommendations);
        setDescription(data.description);

      } catch (error) {
        console.error('Error uploading image:', error);
        setImageStyle(null);
        setConfidence(null);
        setRecommendations('Error uploading image');
      } finally {
        setIsLoading(false); // Set loading state to false
      }
    }
  };

  return (
    <div className="mb-4">
      <input type="file" onChange={handleFileChange} className="text-white" />
      {previewUrl && (
        <div className="mt-4 flex justify-center"> {/* Adjust the container size here */}
          <Image
            src={previewUrl}
            alt="Image Preview"
            width={300} // Aspect ratio width
            height={300} // Aspect ratio height
            objectFit="contain"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;