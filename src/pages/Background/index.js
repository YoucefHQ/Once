import { getWebsiteName } from './../Options/default-websites';
import { recordBlock, migrateStats, getStatsForOverlay, generatePersonalizedTweet } from '../../shared/stats.js';

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
  }
  if (details.reason === 'install' || details.reason === 'update') {
    migrateStats();
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  (async () => {
    if (request.type === 'openOptions') {
      chrome.runtime.openOptionsPage();
    } else if (request.type === 'closeTab') {
      chrome.tabs.remove(sender.tab.id);
    } else if (request.type === 'checkWebsite') {
      if (await isWebsiteBlocked(request.url)) {
        const websiteName = getWebsiteName(request.url);
        const aggressive = await isAggressiveModeEnabled();

        if (aggressive) {
          if (await isGlobalTimerActive()) {
            const { newBlockedTimes, streak } = await recordBlock(websiteName);
            const overlayStats = getStatsForOverlay(newBlockedTimes, streak);
            const personalizedTweet = generatePersonalizedTweet(
              newBlockedTimes.toString(),
              overlayStats.streak
            );

            const storage = await chrome.storage.local.get('onceGlobalTriggerSite');

            sendResponse({
              blockWebsite: true,
              websiteName: websiteName,
              triggerSite: storage.onceGlobalTriggerSite,
              timeAgo: await timeAgo('onceGlobalTimestamp'),
              timeRemaining: await timeRemaining('onceGlobalTimestamp'),
              blockedTimes: newBlockedTimes.toString(),
              streak: overlayStats.streak,
              timeSaved: overlayStats.timeSaved,
              personalizedTweet,
            });
          } else {
            await chrome.storage.local.set({
              onceGlobalTimestamp: Date.now(),
              onceGlobalTriggerSite: websiteName,
            });

            sendResponse({
              showOnboarding: true,
              websiteName: websiteName,
              aggressiveMode: true,
            });
          }
        } else if (await isLastVisitLessThanOneHour(websiteName)) {
          const { newBlockedTimes, streak } = await recordBlock(websiteName);
          const overlayStats = getStatsForOverlay(newBlockedTimes, streak);
          const personalizedTweet = generatePersonalizedTweet(
            newBlockedTimes.toString(),
            overlayStats.streak
          );

          sendResponse({
            blockWebsite: true,
            websiteName: websiteName,
            timeAgo: await timeAgo(websiteName),
            timeRemaining: await timeRemaining(websiteName),
            blockedTimes: newBlockedTimes.toString(),
            streak: overlayStats.streak,
            timeSaved: overlayStats.timeSaved,
            personalizedTweet,
          });
        } else {
          sendResponse({
            showOnboarding: true,
            websiteName: websiteName,
          });
        }
      } else {
        sendResponse(false);
      }
    }
  })();

  return true;
});

async function isAggressiveModeEnabled() {
  const storage = await chrome.storage.local.get('onceAggressiveMode');
  return storage.onceAggressiveMode === true;
}

async function isGlobalTimerActive() {
  const storage = await chrome.storage.local.get('onceGlobalTimestamp');
  if (!storage.onceGlobalTimestamp) return false;
  return Date.now() - storage.onceGlobalTimestamp < 60 * 60 * 1000;
}

async function isWebsiteBlocked(url) {
  if (!url) return false;

  const storage = await chrome.storage.local.get('onceBlockedWebsites');

  if (!storage.onceBlockedWebsites) return false;

  const blockedWebsites = JSON.parse(storage.onceBlockedWebsites);

  let urlDomain;
  try {
    urlDomain = new URL(url).hostname;
  } catch {
    return false;
  }

  // Check if the domain is included in the blocked list
  return blockedWebsites.some(
    (blocked) => new URL(blocked).hostname === urlDomain
  );
}

async function isLastVisitLessThanOneHour(websiteName) {
  const lastVisit = await chrome.storage.local.get([websiteName]);
  if (!lastVisit[websiteName]) return false;
  return Date.now() - lastVisit[websiteName] < 60 * 60 * 1000;
}

function maybePluralize(count, noun, suffix = 's') {
  return `${count} ${noun}${count !== 1 ? suffix : ''}`;
}

async function timeAgo(websiteName) {
  let prev = await chrome.storage.local.get([websiteName]);
  prev = prev[websiteName] ?? 0;

  var ms_Min = 60 * 1000;
  var ms_Hour = ms_Min * 60;
  var ms_Day = ms_Hour * 24;
  var diff = Date.now() - prev;

  if (diff < ms_Min) {
    return maybePluralize(Math.round(diff / 1000), 'second') + ' ago';
  } else if (diff < ms_Hour) {
    return maybePluralize(Math.round(diff / ms_Min), 'minute') + ' ago';
  } else if (diff < ms_Day) {
    return maybePluralize(Math.round(diff / ms_Hour), 'hour') + ' ago';
  }
}

async function timeRemaining(websiteName) {
  let prev = await chrome.storage.local.get([websiteName]);
  prev = prev[websiteName] ?? 0;

  var ms_Min = 60 * 1000;
  var ms_Hour = ms_Min * 60;
  var diff = Date.now() - prev;

  if (diff < ms_Min) {
    return '1 hour';
  } else if (diff < ms_Hour) {
    return maybePluralize(60 - Math.round(diff / ms_Min), 'minute');
  }
}

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
  let storage = await chrome.storage.local.get('newUrls');

  if (storage.newUrls == null) storage.newUrls = {};

  const url = changeInfo.url || tab.url;
  if (url) {
    storage.newUrls[tabId] = url;
    chrome.storage.local.set({ newUrls: storage.newUrls });
  }
});

chrome.tabs.onRemoved.addListener(async function (tabId) {
  let storage = await chrome.storage.local.get('newUrls');

  if (storage.newUrls == null) storage.newUrls = {};

  if (await isWebsiteBlocked(storage.newUrls[tabId])) {
    const websiteName = getWebsiteName(storage.newUrls[tabId]);

    if (!(await isAggressiveModeEnabled())) {
      if (!(await isLastVisitLessThanOneHour(websiteName)))
        chrome.storage.local.set({ [websiteName]: Date.now() });
    }
  }
});
