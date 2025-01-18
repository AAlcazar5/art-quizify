function LevelDisplay({ level }: { level: string }) {
    return (
      <div className="bg-purple-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2">
        <span className="text-xl font-bold">🏆 Level:</span>
        <span className="text-2xl font-extrabold">{level}</span>
      </div>
    );
  }

export default LevelDisplay;  
