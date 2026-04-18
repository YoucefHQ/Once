import React, { useEffect, useState } from 'react';
import { getStats } from '../../../shared/stats.js';
import StatsSummary from './StatsSummary';
import SiteBreakdown from './SiteBreakdown';
import TrendChart from './TrendChart';
import Milestones from './Milestones';

interface StatsData {
  totalBlocks: number;
  siteBlocks: Record<string, number>;
  dailyLog: Record<string, { _total: number; [site: string]: number }>;
  monthlyLog: Record<string, Record<string, number>>;
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string | null;
    milestones: number[];
  };
}

const StatsTab: React.FC = () => {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) {
    return <div className="stats-empty"><p>Loading stats...</p></div>;
  }

  if (stats.totalBlocks === 0) {
    return (
      <div className="faq-item">
        <h3>No blocks yet</h3>
        <p>Once will track your stats as soon as it blocks a distracting site.</p>
      </div>
    );
  }

  return (
    <>
      <StatsSummary
        streak={stats.streak.current}
        longestStreak={stats.streak.longest}
        totalBlocks={stats.totalBlocks}
      />
      <SiteBreakdown siteBlocks={stats.siteBlocks} />
      <TrendChart dailyLog={stats.dailyLog} />
      <Milestones earned={stats.streak.milestones} />
    </>
  );
};

export default StatsTab;
