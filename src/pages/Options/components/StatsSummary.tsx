import React from 'react';

interface StatsSummaryProps {
  streak: number;
  longestStreak: number;
  totalBlocks: number;
}

function formatTimeSaved(totalBlocks: number): string {
  const totalMinutes = totalBlocks * 15;
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.round(totalMinutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? 's' : ''}`;
  const days = (totalMinutes / (60 * 24)).toFixed(1);
  return `${days} days`;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({
  streak,
  longestStreak,
  totalBlocks,
}) => {
  return (
    <div className="stats-summary">
      <div className="stat-card">
        <div className="stat-card-icon">{'\u{1F525}'}</div>
        <div className="stat-card-value">{streak}</div>
        <div className="stat-card-label">day streak</div>
        <div className="stat-card-sub">longest: {longestStreak}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card-icon">{'\u{1F6E1}\uFE0F'}</div>
        <div className="stat-card-value">{totalBlocks}</div>
        <div className="stat-card-label">{totalBlocks === 1 ? 'block' : 'blocks'}</div>
      </div>
      <div className="stat-card">
        <div className="stat-card-icon">{'\u23F1\uFE0F'}</div>
        <div className="stat-card-value">{formatTimeSaved(totalBlocks)}</div>
        <div className="stat-card-label">saved</div>
      </div>
    </div>
  );
};

export default StatsSummary;
