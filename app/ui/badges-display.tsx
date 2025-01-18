function BadgesDisplay({ badges }: { badges: string[] }) {
    return (
      <div className="bg-yellow-500 text-black p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-2">🏅 Badges:</h2>
        <div className="flex flex-wrap gap-2">
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
    );
  }

export default BadgesDisplay;