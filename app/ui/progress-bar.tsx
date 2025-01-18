function ProgressBar({ progress, total }: { progress: number; total: number }) {
    const percentage = Math.round((progress / total) * 100);
    return (
      <div className="w-full bg-gray-300 rounded-full h-4 shadow-inner">
        <div
          className="bg-blue-500 h-4 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
        <p className="text-sm text-center mt-2 text-gray-700">
          {progress}/{total} completed ({percentage}%)
        </p>
      </div>
    );
  }

export default ProgressBar;