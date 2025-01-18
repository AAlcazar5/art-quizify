function DailyChallengeButton({ onClick }: { onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className="bg-orange-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-orange-600 active:scale-95 transition-transform duration-200"
      >
        🌟 Start Daily Challenge
      </button>
    );
  }

  
export default DailyChallengeButton