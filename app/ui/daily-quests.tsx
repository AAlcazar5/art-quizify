import React from "react";
import { FaLock, FaLockOpen } from "react-icons/fa";
// or any icons you prefer for lock/unlock

interface DailyQuest {
  id: number;
  label: string;
  current: number;      // current progress
  goal: number;         // goal to achieve
  rewardUnlocked: boolean;
  icon: React.ReactNode; // optional quest icon
}

interface DailyQuestsProps {
  quests: DailyQuest[];
  onViewAll?: () => void;
}

const DailyQuests: React.FC<DailyQuestsProps> = ({ quests, onViewAll }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Daily Quests</h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-400 hover:text-blue-500 text-sm"
          >
            VIEW ALL
          </button>
        )}
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        {quests.map((quest) => {
          // Calculate progress as a percentage
          const percentage = Math.min(
            Math.round((quest.current / quest.goal) * 100),
            100
          );

          // Decide which icon to show if the reward is locked/unlocked
          const lockIcon = quest.rewardUnlocked ? (
            <FaLockOpen className="text-yellow-400" />
          ) : (
            <FaLock className="text-gray-300" />
          );

          return (
            <div
              key={quest.id}
              className="bg-gray-900 p-3 rounded-lg flex flex-col gap-2"
            >
              {/* Quest Label & Icon */}
              <div className="flex items-center gap-2">
                {/* If quest has a custom icon, show it */}
                {quest.icon && <div className="text-xl">{quest.icon}</div>}

                {/* Label and lock/unlock icon */}
                <span className="flex-grow">{quest.label}</span>
                <div>{lockIcon}</div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              {/* Numeric progress */}
              <p className="text-sm text-gray-400">
                {quest.current} / {quest.goal}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyQuests;
