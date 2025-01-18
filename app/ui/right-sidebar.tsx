import React from "react";

interface RightSidebarProps {
  streak: number;
  points: number;
  badges: string[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ streak, points, badges }) => {
  return (
    <aside className="w-1/5 bg-gray-900 text-white p-4 sticky top-0 h-screen flex flex-col space-y-6">
      <h2 className="text-xl font-bold mb-4">Your Dashboard</h2>
      <div className="bg-green-500 text-white p-4 rounded-lg">
        <h3 className="text-lg font-bold">🔥 Streak: {streak}</h3>
      </div>
      <div className="bg-blue-500 text-white p-4 rounded-lg">
        <h3 className="text-lg font-bold">⭐ Points: {points}</h3>
      </div>
      <div className="bg-yellow-500 text-black p-4 rounded-lg">
        <h3 className="text-lg font-bold">🏅 Badges:</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {badges.length > 0 ? (
            badges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-white text-black px-4 py-2 rounded-md shadow-md border border-gray-300"
              >
                {badge}
              </div>
            ))
          ) : (
            <span className="text-gray-700">No badges earned yet!</span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
