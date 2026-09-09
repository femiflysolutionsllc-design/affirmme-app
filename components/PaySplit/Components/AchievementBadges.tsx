type Props = {
  totalSaved: number;
  completedGoals: number;
  totalGoals: number;
};

export default function AchievementBadges({
  totalSaved,
  completedGoals,
  totalGoals,
}: Props) {
  const badges = [
    {
      emoji: "🐷",
      title: "First Goal",
      subtitle: "Created your first goal",
      unlocked: totalGoals > 0,
      color: "#FACC15",
    },
    {
      emoji: "💰",
      title: "Saver",
      subtitle: `$${totalSaved.toLocaleString()} Saved`,
      unlocked: totalSaved >= 1000,
      color: "#22C55E",
    },
    {
      emoji: "🏆",
      title: "Goal Master",
      subtitle: `${completedGoals} / 5 Goals`,
      unlocked: completedGoals >= 5,
      color: "#60A5FA",
    },
    {
      emoji: "👑",
      title: "Piggy Legend",
      subtitle: "Save $10,000",
      unlocked: totalSaved >= 10000,
      color: "#F43F7A",
    },
  ];

  return (
    <section className="achievement-badges-shell relative overflow-hidden rounded-[26px] border-[3px] border-black bg-[#111933] p-6 shadow-[8px_8px_0px_black]">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#FACC15]">
        🏅 Achievement Badges
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <div
            key={badge.title}
            className={`rounded-[22px] border-[3px] border-black p-5 shadow-[6px_6px_0px_black] ${
              badge.unlocked ? "" : "opacity-50 grayscale"
            }`}
            style={{ background: badge.color }}
          >
            <div className="text-5xl">{badge.emoji}</div>

            <p className="mt-3 text-lg font-black uppercase text-black">
              {badge.title}
            </p>

            <p className="mt-1 text-sm font-bold text-black">
              {badge.subtitle}
            </p>

            <div className="mt-4 inline-block rounded-full bg-black px-3 py-1">
              <span className="text-xs font-black text-white">
                {badge.unlocked ? "UNLOCKED" : "LOCKED 🔒"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}