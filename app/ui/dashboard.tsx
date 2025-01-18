import React from "react";

interface DashboardProps {
  streak: number;
  points: number;
  badges: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ streak, points, badges }) => {
  return (
    <div className="w-full max-w-lg mt-6 space-y-4">
      <div className="bg-green-500 text-white p-4 rounded-lg">
        <h2 className="text-lg font-bold">🔥 Streak: {streak}</h2>
      </div>
      <div className="bg-blue-500 text-white p-4 rounded-lg">
        <h2 className="text-lg font-bold">⭐ Points: {points}</h2>
      </div>
      <div className="bg-yellow-500 text-black p-4 rounded-lg">
        <h2 className="text-lg font-bold">🏅 Badges:</h2>
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
    </div>
  );
};

export default Dashboard;
