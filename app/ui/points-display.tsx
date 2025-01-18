function PointsDisplay({ points }: { points: number }) {
    return (
      <div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center gap-2">
        <span className="text-xl font-bold">⭐ Points:</span>
        <span className="text-2xl font-extrabold">{points}</span>
      </div>
    );
  }

export default PointsDisplay;  
