function StreakDisplay({ streak }: { streak: number }) {
    return (
      <div className="bg-green-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2">
        <span className="text-xl font-bold">🔥 Streak:</span>
        <span className="text-2xl font-extrabold">{streak}</span>
      </div>
    );
  }

export default StreakDisplay;