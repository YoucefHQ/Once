import React from 'react';
import { MILESTONE_THRESHOLDS } from '../../../shared/stats.js';

interface MilestonesProps {
  earned: number[];
}

function formatThreshold(n: number): string {
  if (n >= 1000) return `${n / 1000}k`;
  return String(n);
}

const Milestones: React.FC<MilestonesProps> = ({ earned }) => {
  return (
    <div className="milestones faq-item">
      <h3>Milestones</h3>
      <div className="milestones-grid">
        {MILESTONE_THRESHOLDS.map((threshold) => {
          const isEarned = earned.includes(threshold);
          return (
            <div
              key={threshold}
              className={`milestone ${isEarned ? 'milestone-earned' : 'milestone-locked'}`}
              title={`${threshold} blocks${isEarned ? ' (earned!)' : ''}`}
            >
              {isEarned ? (
                <>
                  <span>{formatThreshold(threshold)}</span>
                  <span className="milestone-label">blocks</span>
                  <span className="milestone-check">{'\u2713'}</span>
                </>
              ) : (
                <span className="milestone-lock">{'\u{1F512}'}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Milestones;
