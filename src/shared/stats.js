// Stats data layer for Once
// Shared module imported by both Background and Options entry points

function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDateStringDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const MILESTONE_THRESHOLDS = [50, 100, 250, 500, 1000, 5000, 10000];

function computeMilestones(totalBlocks) {
  return MILESTONE_THRESHOLDS.filter((t) => totalBlocks >= t);
}

/**
 * Record a block event. Called from Background on every block.
 * Single get() + single set() for efficiency.
 */
export async function recordBlock(websiteName) {
  const storage = await chrome.storage.local.get([
    'blockedTimes',
    'stats_siteBlocks',
    'stats_dailyLog',
    'stats_streak',
  ]);

  // blockedTimes (backward compat — still used by overlay text)
  const newBlockedTimes = (parseInt(storage.blockedTimes) || 0) + 1;

  // Per-site counts
  const siteBlocks = storage.stats_siteBlocks || {};
  siteBlocks[websiteName] = (siteBlocks[websiteName] || 0) + 1;

  // Daily log
  const today = getTodayDateString();
  const dailyLog = storage.stats_dailyLog || {};
  if (!dailyLog[today]) dailyLog[today] = { _total: 0 };
  dailyLog[today]._total += 1;
  dailyLog[today][websiteName] = (dailyLog[today][websiteName] || 0) + 1;

  // Streak
  const streak = storage.stats_streak || {
    current: 0,
    longest: 0,
    lastActiveDate: null,
    lastCleanupDate: null,
    milestones: [],
  };

  if (streak.lastActiveDate !== today) {
    const yesterday = getYesterdayDateString();
    if (streak.lastActiveDate === yesterday) {
      streak.current += 1;
    } else {
      streak.current = 1;
    }
    streak.lastActiveDate = today;
    if (streak.current > streak.longest) {
      streak.longest = streak.current;
    }
  }

  // Milestones
  for (const threshold of MILESTONE_THRESHOLDS) {
    if (newBlockedTimes >= threshold && !streak.milestones.includes(threshold)) {
      streak.milestones.push(threshold);
    }
  }

  // Persist lastCleanupDate before cleanup to prevent concurrent runs
  const needsCleanup = streak.lastCleanupDate !== today;
  if (needsCleanup) {
    streak.lastCleanupDate = today;
  }

  // Single write
  await chrome.storage.local.set({
    blockedTimes: newBlockedTimes.toString(),
    stats_siteBlocks: siteBlocks,
    stats_dailyLog: dailyLog,
    stats_streak: streak,
  });

  // Cleanup (awaited to prevent concurrent read-modify-write corruption)
  if (needsCleanup) {
    await maybeCleanupDailyLog(dailyLog);
  }

  return { newBlockedTimes, streak };
}

/**
 * Prune daily log entries older than 90 days, roll up into monthly.
 */
async function maybeCleanupDailyLog(dailyLog) {
  const cutoffDate = getDateStringDaysAgo(90);
  const monthlyUpdates = {};
  let pruned = false;

  for (const dateKey of Object.keys(dailyLog)) {
    if (dateKey.startsWith('_')) continue;
    if (dateKey < cutoffDate) {
      const monthKey = dateKey.substring(0, 7);
      if (!monthlyUpdates[monthKey]) monthlyUpdates[monthKey] = {};
      for (const [site, count] of Object.entries(dailyLog[dateKey])) {
        if (site === '_total') continue;
        monthlyUpdates[monthKey][site] = (monthlyUpdates[monthKey][site] || 0) + count;
      }
      delete dailyLog[dateKey];
      pruned = true;
    }
  }

  if (!pruned) return;

  const storage = await chrome.storage.local.get('stats_monthlyLog');
  const monthlyLog = storage.stats_monthlyLog || {};
  for (const [month, sites] of Object.entries(monthlyUpdates)) {
    if (!monthlyLog[month]) monthlyLog[month] = {};
    for (const [site, count] of Object.entries(sites)) {
      monthlyLog[month][site] = (monthlyLog[month][site] || 0) + count;
    }
  }

  await chrome.storage.local.set({
    stats_monthlyLog: monthlyLog,
    stats_dailyLog: dailyLog,
  });
}

/**
 * Full stats read for the dashboard.
 */
export async function getStats() {
  const storage = await chrome.storage.local.get([
    'blockedTimes',
    'stats_siteBlocks',
    'stats_dailyLog',
    'stats_monthlyLog',
    'stats_streak',
  ]);

  const totalBlocks = parseInt(storage.blockedTimes) || 0;
  const siteBlocks = storage.stats_siteBlocks || {};
  const dailyLog = storage.stats_dailyLog || {};
  const monthlyLog = storage.stats_monthlyLog || {};
  const streak = storage.stats_streak || {
    current: 0,
    longest: 0,
    lastActiveDate: null,
    lastCleanupDate: null,
    milestones: [],
  };

  return {
    totalBlocks,
    siteBlocks,
    dailyLog,
    monthlyLog,
    streak: adjustStreakForDisplay(streak),
  };
}

/**
 * Adjust streak for display — if lastActiveDate is stale, streak is broken.
 */
function adjustStreakForDisplay(streak) {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  if (streak.lastActiveDate === today || streak.lastActiveDate === yesterday) {
    return streak;
  }
  return { ...streak, current: 0 };
}

/**
 * Lightweight stats for the blocking overlay.
 */
export function getStatsForOverlay(totalBlockedTimes, streak) {
  const displayStreak = adjustStreakForDisplay(streak);
  const totalMinutes = totalBlockedTimes * 15;
  let timeSaved;
  if (totalMinutes < 60) {
    timeSaved = `${totalMinutes} min`;
  } else {
    const hours = Math.round(totalMinutes / 60);
    timeSaved = `${hours} hr${hours !== 1 ? 's' : ''}`;
  }

  return {
    streak: displayStreak.current,
    timeSaved,
  };
}

/**
 * One-time migration from existing blockedTimes.
 */
export async function migrateStats() {
  const storage = await chrome.storage.local.get(['stats_streak', 'blockedTimes']);

  // Already migrated
  if (storage.stats_streak) return;

  const totalBlocks = parseInt(storage.blockedTimes) || 0;

  await chrome.storage.local.set({
    stats_siteBlocks: {},
    stats_dailyLog: {},
    stats_monthlyLog: {},
    stats_streak: {
      current: 0,
      longest: 0,
      lastActiveDate: null,
      lastCleanupDate: null,
      milestones: computeMilestones(totalBlocks),
    },
  });
}

export { MILESTONE_THRESHOLDS };
