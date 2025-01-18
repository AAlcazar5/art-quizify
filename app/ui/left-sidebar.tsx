import React from "react";

interface LeftSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-1/5 bg-gray-900 text-white p-4 sticky top-0 h-screen flex flex-col space-y-6">
      <h2 className="text-xl font-bold mb-4">Navigation</h2>
      <nav className="flex flex-col space-y-4">
        <button
          onClick={() => setActiveTab("imageAnalysis")}
          className={`p-2 rounded-lg text-left ${
            activeTab === "imageAnalysis" ? "bg-blue-500" : "hover:bg-gray-700"
          }`}
        >
          🖼️ Image Analysis
        </button>

        <button
          onClick={() => setActiveTab("practice")}
          className={`p-2 rounded-lg text-left ${
            activeTab === "practice" ? "bg-blue-500" : "hover:bg-gray-700"
          }`}
        >
          🎯 Practice
        </button>

         <button
          onClick={() => setActiveTab("canvas")}
          className={`p-2 rounded-lg text-left ${
            activeTab === "canvas" ? "bg-blue-500" : "hover:bg-gray-700"
          }`}
        >
          🎨 Canvas
        </button>

        <button
          onClick={() => setActiveTab("progress")}
          className={`p-2 rounded-lg text-left ${
            activeTab === "progress" ? "bg-blue-500" : "hover:bg-gray-700"
          }`}
        >
          📈 Progress
        </button>

       
      </nav>
    </aside>
  );
};

export default LeftSidebar;
