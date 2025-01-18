"use client";

import React, { useRef, useEffect, useState } from "react";

interface DrawingCanvasProps {
    width: number;
    height: number;
    // onCritiqueResponse: (critique: string) => void;
  }

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({  }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [critiqueText, setCritiqueText] = useState("");

  // Ensure the canvas has a white background and is responsive
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Set the canvas background to white
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Handle resizing
      const handleResize = () => {
        const parentWidth = canvas.parentElement?.clientWidth || window.innerWidth;
        const maxWidth = 800;
        const aspectRatio = 16 / 10;
        const newWidth = Math.min(parentWidth, maxWidth);
        const newHeight = newWidth / aspectRatio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Redraw the white background after resizing
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      };

      // Initial setup and listen for window resizing
      handleResize();
      window.addEventListener("resize", handleResize);

      // Cleanup on unmount
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in event ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = "touches" in event ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in event ? event.touches[0].clientX - rect.left : event.clientX - rect.left;
    const y = "touches" in event ? event.touches[0].clientY - rect.top : event.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = "black"; // Ensure the stroke color is black
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.closePath();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF"; // Reset the background to white
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    setCritiqueText("");
  };

  const handleCritique = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL("image/png");
      setIsLoading(true);
      setCritiqueText("");

      try {
        const response = await fetch("http://localhost:8000/critique-canvas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData }),
        });
        const data = await response.json();
        setCritiqueText(data.critique);
        // onCritiqueResponse?.(data.critique);
      } catch (error) {
        console.error("Error fetching critique:", error);
        setCritiqueText("An error occurred while fetching the critique.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full p-4 bg-gray-900 rounded-lg">
        <canvas
          ref={canvasRef}
          className="border border-gray-700 bg-gray-900 rounded-md"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex space-x-4">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200"
        >
          Clear
        </button>
        <button
          onClick={handleCritique}
          disabled={isLoading}
          className={`px-4 py-2 rounded transition duration-200 ${
            isLoading
              ? "bg-gray-500 text-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {isLoading ? "Loading..." : "Get Critique"}
        </button>
      </div>
      {!isLoading && critiqueText && (
        <div className="mt-4 p-4 bg-gray-700 text-white rounded">
          <h2 className="text-xl font-bold mb-2">Canvas Critique</h2>
          <p>{critiqueText}</p>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
