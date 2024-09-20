import '../../assets/img/icon-240.png';
import '../../assets/img/icon-128.png';
import '../../assets/img/icon-48.png';
import '../../assets/img/icon-32.png';
import '../../assets/img/icon-24.png';
import '../../assets/img/icon-16.png';
import { getWebsiteName } from './../Options/default-websites';
import amplitude from 'amplitude-js';
amplitude.getInstance().init('bb78085862f7083491987eb4258d2614');

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === 'install') {
    chrome.runtime.openOptionsPage();
    amplitude.getInstance().logEvent('Installed');
  } else if (details.reason === 'update') {
    amplitude.getInstance().logEvent('Updated');
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
  amplitude.getInstance().logEvent('Options Visited');
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  (async () => {
    if (request.type === 'openOptions') {
      chrome.runtime.openOptionsPage();
      amplitude.getInstance().logEvent('Options Visited');
    } else if (request.type === 'closeTab') {
      chrome.tabs.remove(sender.tab.id);
      amplitude.getInstance().logEvent('Website Closed');
    } else if (request.type === 'checkWebsite') {
      if (await isWebsiteBlocked(request.url)) {
        const websiteName = getWebsiteName(request.url);
        if (await isLastVisitLessThanOneHour(websiteName)) {
          let storage = await chrome.storage.local.get('blockedTimes');
          if (storage.blockedTimes == null) {
            await chrome.storage.local.set({ blockedTimes: '2' });
          } else {
            const incrementBlockedTimes = parseInt(storage.blockedTimes) + 1;
            await chrome.storage.local.set({
              blockedTimes: incrementBlockedTimes.toString()
            });
          }
  
          storage = await chrome.storage.local.get('blockedTimes')
  
          sendResponse({
            blockWebsite: true,
            websiteName: getWebsiteName(request.url),
            timeAgo: await timeAgo(websiteName),
            timeRemaining: await timeRemaining(websiteName),
            blockedTimes: storage.blockedTimes,
          });
          amplitude.getInstance().logEvent('Website Blocked');
        } else {
          //const onceOnboarding = window.localStorage.getItem('onceOnboarding');
          //if (!onceOnboarding) {
          //window.localStorage.setItem('onceOnboarding', 'done');
          sendResponse({
            showOnboarding: true,
            websiteName: getWebsiteName(request.url),
          });
          amplitude.getInstance().logEvent('Onboarding Shown');
          //}
          amplitude.getInstance().logEvent('Website Visited');
        }
      }
      sendResponse(false);
    }
  })();

  return true
});

async function isWebsiteBlocked (url) {
  const storage = await chrome.storage.local.get('onceBlockedWebsites')

  if (storage.onceBlockedWebsites == null) return false;

  const blockedWebsites = JSON.parse(storage.onceBlockedWebsites);
  if (!blockedWebsites) return false;
  return JSON.parse(storage.onceBlockedWebsites).includes(url);
}

async function isLastVisitLessThanOneHour (websiteName) {
  const lastVisit = await chrome.storage.local.get([websiteName]);
  if (!lastVisit[websiteName]) return false;
  return Date.now() - lastVisit[websiteName] < 60 * 60 * 1000;
}

function maybePluralize (count, noun, suffix = 's') {
  return `${count} ${noun}${count !== 1 ? suffix : ''}`;
}

async function timeAgo (websiteName) {
  let prev = await chrome.storage.local.get([websiteName]);
  prev = prev[websiteName] ?? 0

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

async function timeRemaining (websiteName) {
  let prev = await chrome.storage.local.get([websiteName]);
  prev = prev[websiteName] ?? 0

  var ms_Min = 60 * 1000;
  var ms_Hour = ms_Min * 60;
  var diff = Date.now() - prev;

  if (diff < ms_Min) {
    return '1 hour';
  } else if (diff < ms_Hour) {
    return maybePluralize(60 - Math.round(diff / ms_Min), 'minute');
  }
}

function timeConvert (minutes) {
  var num = minutes;
  var hours = num / 60;
  var rhours = Math.floor(hours);
  minutes = (hours - rhours) * 60;
  var rminutes = Math.round(minutes);
  if (rhours === 0) {
    return maybePluralize(rminutes, 'minute');
  } else if (rminutes === 0) {
    return maybePluralize(rhours, 'hour');
  } else {
    return (
      maybePluralize(rhours, 'hour') +
      ' and ' +
      maybePluralize(rminutes, 'minute')
    );
  }
}

chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo) {
  let storage = await chrome.storage.local.get('newUrls');

  if (storage.newUrls == null) storage.newUrls = {};

  if (changeInfo.url) {
    storage.newUrls[tabId] = changeInfo.url;

    chrome.storage.local.set({ newUrls: storage.newUrls })
  }
});

chrome.tabs.onRemoved.addListener(async function (tabId) {
  let storage = await chrome.storage.local.get('newUrls');

  if (storage.newUrls == null) storage.newUrls = {};

  if (await isWebsiteBlocked(storage.newUrls[tabId])) {
    const websiteName = getWebsiteName(storage.newUrls[tabId]);

    if (! await isLastVisitLessThanOneHour(websiteName))
      chrome.storage.local.set({ [websiteName]: Date.now() });
  }
});
