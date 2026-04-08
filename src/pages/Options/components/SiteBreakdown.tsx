import React, { useState } from 'react';

interface SiteBreakdownProps {
  siteBlocks: Record<string, number>;
}

const SiteBreakdown: React.FC<SiteBreakdownProps> = ({ siteBlocks }) => {
  const [showAll, setShowAll] = useState(false);
  const entries = Object.entries(siteBlocks).sort(([, a], [, b]) => b - a);
  const maxCount = entries.length > 0 ? entries[0][1] : 1;
  const visible = showAll ? entries : entries.slice(0, 5);

  if (entries.length === 0) return null;

  return (
    <div className="site-breakdown">
      <h3>Top blocked sites</h3>
      {visible.map(([site, count]) => (
        <div className="site-row" key={site}>
          <span className="site-name">{site}</span>
          <div className="site-bar-bg">
            <div
              className="site-bar"
              style={{ width: `${(count / maxCount) * 100}%` }}
            />
          </div>
          <span className="site-count">{count}</span>
        </div>
      ))}
      {entries.length > 5 && (
        <button
          className="site-toggle"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show less' : `Show all (${entries.length})`}
        </button>
      )}
    </div>
  );
};

export default SiteBreakdown;
