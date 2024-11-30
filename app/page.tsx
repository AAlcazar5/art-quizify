"use client"

import { useState, useEffect } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";
import Image from "next/image";

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [animalName, setAnimalName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [rationale, setRationale] = useState<string | null>(null);

  useEffect(() => {
    const classifyImage = async () => {
      if (!imagePreview) return;

      const img = new window.Image();
      img.src = imagePreview;
      img.onload = async () => {
        const model = await mobilenet.load();
        const predictions = await model.classify(img);
        const animalPrediction = predictions.find(prediction =>
          ["cat", "dog", "elephant", "lion", "tiger", "bear", "zebra", "hippo", "lobster", "sea star", "monkey"].some(animal =>
            prediction.className.toLowerCase().includes(animal)
          )
        );

        const capitalizeFirstLetter = (string: string) => {
          return string.charAt(0).toUpperCase() + string.slice(1);
        };

        if (animalPrediction) {
          setAnimalName(capitalizeFirstLetter(animalPrediction.className));
          setLoading(true);
          try {
            const response = await fetch("http://localhost:8000/check-animal", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ animal_name: animalPrediction.className }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! The data did not pass to the backend, status: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const data = await response.json();
              setRationale(data.rationale); // Set the rationale
            } else {
              console.error("Expected JSON response but got:", contentType);
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          } finally {
            setLoading(false);
          }
        } else {
          setAnimalName("Unknown");
        }
      };
    };

    if (imagePreview) {
      classifyImage();
    }
  }, [imagePreview]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImagePreview(URL.createObjectURL(file));
      setAnimalName(null); // Clear previous animal name
      setRationale(null);  // Clear previous rationale
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen pt-8">
      <h1 className="text-2xl font-bold mb-4">Is This Animal Dangerous?</h1>
      <p className="mb-4">Please upload a picture of an animal to begin.</p>
      <label className="mb-4 p-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
        Upload Image
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label> 
      {imagePreview && (
        <Image
          src={imagePreview}
          alt="Selected"
          width={400}  // Increase the width
          height={400} // Increase the height
          className="max-w-full h-auto mb-4 border-4 border-gray-300 rounded-lg" // Add border and rounded corners
        />
      )}
       {animalName && (
        <>
          <h2 className="text-xl font-semibold mb-2">Detected Animal</h2>
          <p className="mb-4">{animalName}</p>
        </>
      )}
      {loading && <p className="mb-4">Assessing whether or not the animal is dangerous...</p>}
      {rationale && (
        <div className="w-3/5 text-center mb-4">
          <h2 className="text-xl font-semibold mb-2">Dangerous or Not Dangerous</h2>
          <p>{rationale}</p>
        </div>
      )}
    </div>
  );
}