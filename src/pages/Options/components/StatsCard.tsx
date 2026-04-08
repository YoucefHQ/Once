import React, { useRef, useEffect, useState, useCallback } from 'react';
import { formatTimeSaved } from './StatsSummary';

interface StatsCardProps {
  stats: {
    totalBlocks: number;
    siteBlocks: Record<string, number>;
    streak: {
      current: number;
      longest: number;
      milestones: number[];
    };
  };
  onClose: () => void;
}

type CardFormat = 'twitter' | 'story';

interface CardToggles {
  showStreak: boolean;
  showTotalBlocks: boolean;
  showTimeSaved: boolean;
  showSites: boolean;
}

const FORMATS: Record<CardFormat, { width: number; height: number; label: string }> = {
  twitter: { width: 1200, height: 675, label: 'Twitter/X' },
  story: { width: 1080, height: 1920, label: 'Story' },
};

function drawCard(
  canvas: HTMLCanvasElement,
  stats: StatsCardProps['stats'],
  toggles: CardToggles,
  format: CardFormat,
  logo: HTMLImageElement | null,
) {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = FORMATS[format];
  canvas.width = width;
  canvas.height = height;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Purple accent border
  const borderWidth = 6;
  const borderRadius = 24;
  ctx.strokeStyle = '#8e97fd';
  ctx.lineWidth = borderWidth;
  roundRect(ctx, borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth, borderRadius);
  ctx.stroke();

  const isStory = format === 'story';
  const centerX = width / 2;

  // Logo
  const logoSize = isStory ? 80 : 60;
  const logoY = isStory ? 120 : 50;
  if (logo) {
    ctx.drawImage(logo, centerX - logoSize / 2, logoY, logoSize, logoSize);
  }

  // Title
  const titleY = logoY + logoSize + (isStory ? 48 : 36);
  ctx.fillStyle = '#19191b';
  ctx.font = `700 ${isStory ? 56 : 42}px "DM Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Once', centerX, titleY);

  // Subtitle
  const subtitleY = titleY + (isStory ? 40 : 28);
  ctx.fillStyle = '#696871';
  ctx.font = `500 ${isStory ? 24 : 18}px "DM Sans", sans-serif`;
  ctx.fillText('My focus stats', centerX, subtitleY);

  // Stats boxes
  const enabledStats: { label: string; value: string; icon: string }[] = [];
  if (toggles.showStreak) {
    enabledStats.push({ icon: '\u{1F525}', value: String(stats.streak.current), label: 'day streak' });
  }
  if (toggles.showTotalBlocks) {
    enabledStats.push({ icon: '\u{1F6E1}\uFE0F', value: String(stats.totalBlocks), label: 'blocks' });
  }
  if (toggles.showTimeSaved) {
    enabledStats.push({ icon: '\u23F1\uFE0F', value: formatTimeSaved(stats.totalBlocks), label: 'saved' });
  }

  if (enabledStats.length > 0) {
    const boxW = isStory ? 260 : 200;
    const boxH = isStory ? 160 : 120;
    const boxGap = isStory ? 24 : 20;
    const totalW = enabledStats.length * boxW + (enabledStats.length - 1) * boxGap;

    const boxesY = isStory
      ? subtitleY + 80
      : subtitleY + 50;

    if (isStory && enabledStats.length > 2) {
      // Stack vertically for story with many stats
      const startY = boxesY;
      enabledStats.forEach((stat, i) => {
        const bx = centerX - boxW / 2;
        const by = startY + i * (boxH + boxGap);
        drawStatBox(ctx, bx, by, boxW, boxH, stat, isStory);
      });
    } else {
      const startX = centerX - totalW / 2;
      enabledStats.forEach((stat, i) => {
        const bx = startX + i * (boxW + boxGap);
        drawStatBox(ctx, bx, boxesY, boxW, boxH, stat, isStory);
      });
    }
  }

  // Site names (if opted in)
  if (toggles.showSites && Object.keys(stats.siteBlocks).length > 0) {
    const sorted = Object.entries(stats.siteBlocks).sort(([, a], [, b]) => b - a).slice(0, 5);
    const sitesText = sorted.map(([name, count]) => `${name} (${count})`).join('  \u00B7  ');
    const sitesY = isStory ? height - 280 : height - 100;
    ctx.fillStyle = '#696871';
    ctx.font = `500 ${isStory ? 22 : 16}px "DM Sans", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(sitesText, centerX, sitesY, width - 80);
  }

  // Footer
  const footerY = height - (isStory ? 100 : 36);
  ctx.fillStyle = '#8e97fd';
  ctx.font = `500 ${isStory ? 24 : 18}px "DM Sans", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('onceforchrome.com', centerX, footerY);
}

function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  stat: { icon: string; value: string; label: string },
  isStory: boolean,
) {
  // Box background
  ctx.fillStyle = '#f4f5ff';
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();

  const cx = x + w / 2;
  const iconSize = isStory ? 28 : 22;
  const valueSize = isStory ? 40 : 30;
  const labelSize = isStory ? 18 : 14;

  // Icon
  ctx.font = `${iconSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#19191b';
  ctx.fillText(stat.icon, cx, y + (isStory ? 44 : 34));

  // Value
  ctx.font = `700 ${valueSize}px "DM Sans", sans-serif`;
  ctx.fillStyle = '#8e97fd';
  ctx.fillText(stat.value, cx, y + (isStory ? 96 : 72));

  // Label
  ctx.font = `500 ${labelSize}px "DM Sans", sans-serif`;
  ctx.fillStyle = '#696871';
  ctx.fillText(stat.label, cx, y + (isStory ? 126 : 96));
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const StatsCard: React.FC<StatsCardProps> = ({ stats, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<CardFormat>('twitter');
  const [toggles, setToggles] = useState<CardToggles>({
    showStreak: true,
    showTotalBlocks: true,
    showTimeSaved: true,
    showSites: false,
  });
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = chrome.runtime.getURL('icon-240.png');
    img.onload = () => setLogo(img);
  }, []);

  const redraw = useCallback(() => {
    if (canvasRef.current) {
      document.fonts.ready.then(() => {
        drawCard(canvasRef.current!, stats, toggles, format, logo);
      });
    }
  }, [stats, toggles, format, logo]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `once-stats-${format}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback: download instead
        handleDownload();
      }
    }, 'image/png');
  };

  const handleShareX = () => {
    const text = encodeURIComponent(
      `I've stayed focused ${stats.totalBlocks} times with @onceforchrome!` +
      (stats.streak.current > 0 ? ` \u{1F525} ${stats.streak.current}-day streak` : '')
    );
    window.open(
      `https://x.com/intent/tweet?url=https%3A%2F%2Fonceforchrome.com%2F&text=${text}`,
      '_blank'
    );
  };

  const toggleKey = (key: keyof CardToggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="card-modal-overlay" onClick={onClose}>
      <div className="card-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Share your stats</h3>

        <div className="card-controls">
          <div className="card-format-toggle">
            <button
              className={`card-format-btn${format === 'twitter' ? ' active' : ''}`}
              onClick={() => setFormat('twitter')}
            >
              Twitter/X
            </button>
            <button
              className={`card-format-btn${format === 'story' ? ' active' : ''}`}
              onClick={() => setFormat('story')}
            >
              Story
            </button>
          </div>

          <div className="card-toggles">
            <label className="card-toggle">
              <input
                type="checkbox"
                checked={toggles.showStreak}
                onChange={() => toggleKey('showStreak')}
              />
              Streak
            </label>
            <label className="card-toggle">
              <input
                type="checkbox"
                checked={toggles.showTotalBlocks}
                onChange={() => toggleKey('showTotalBlocks')}
              />
              Total blocks
            </label>
            <label className="card-toggle">
              <input
                type="checkbox"
                checked={toggles.showTimeSaved}
                onChange={() => toggleKey('showTimeSaved')}
              />
              Time saved
            </label>
            <label className="card-toggle">
              <input
                type="checkbox"
                checked={toggles.showSites}
                onChange={() => toggleKey('showSites')}
              />
              Site names
            </label>
          </div>
        </div>

        <div className="card-canvas-wrap">
          <canvas ref={canvasRef} />
        </div>

        <div className="card-actions">
          <button className="card-action-btn primary" onClick={handleDownload}>
            Download PNG
          </button>
          <button className="card-action-btn" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy to clipboard'}
          </button>
          <button className="card-action-btn" onClick={handleShareX}>
            Share on X
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
