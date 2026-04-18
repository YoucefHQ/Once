import React, { useState } from 'react';

interface TrendChartProps {
  dailyLog: Record<string, { _total: number; [site: string]: number }>;
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push(str);
  }
  return days;
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const TrendChart: React.FC<TrendChartProps> = ({ dailyLog }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);
  const days = getLast30Days();
  const values = days.map((d) => dailyLog[d]?._total || 0);
  const maxVal = Math.max(...values, 1);

  const padLeft = 20;
  const svgWidth = 600 + padLeft;
  const svgHeight = 160;
  const barPadding = 3;
  const barWidth = (600 - barPadding * 30) / 30;
  const chartBottom = svgHeight - 24;
  const chartHeight = chartBottom - 8;

  return (
    <div className="trend-chart faq-item" style={{ position: 'relative' }}>
      <h3>Last 30 days</h3>
      <svg
        className="trend-svg"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {days.map((day, i) => {
          const x = padLeft + i * (barWidth + barPadding) + barPadding / 2;
          const val = values[i];
          const barH = val > 0 ? Math.max((val / maxVal) * chartHeight, 4) : 2;
          const y = chartBottom - barH;

          return (
            <g key={day}>
              <rect
                className={val > 0 ? 'trend-bar' : 'trend-empty'}
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={3}
                onMouseEnter={(e) => {
                  const rect = (e.target as SVGRectElement).getBoundingClientRect();
                  setTooltip({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 8,
                    text: `${formatDayLabel(day)}: ${val} block${val !== 1 ? 's' : ''}`,
                  });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
              {i % 5 === 0 && (
                <text
                  className="trend-label"
                  x={x + barWidth / 2}
                  y={svgHeight - 4}
                  textAnchor="middle"
                >
                  {formatDayLabel(day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {tooltip && (
        <div
          className="trend-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            position: 'fixed',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default TrendChart;
