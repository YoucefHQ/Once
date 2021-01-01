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
  if (details.reason == 'install') {
    chrome.runtime.openOptionsPage();
    amplitude.getInstance().logEvent('Installed');
  } else if (details.reason == 'update') {
    amplitude.getInstance().logEvent('Updated');
  }
});

chrome.browserAction.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
  amplitude.getInstance().logEvent('Options Visited');
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == 'openOptions') {
    chrome.runtime.openOptionsPage();
    amplitude.getInstance().logEvent('Options Visited');
  } else if (request.type == 'closeTab') {
    chrome.tabs.remove(sender.tab.id);
    amplitude.getInstance().logEvent('Website Closed');
  } else if (request.type == 'checkWebsite') {
    if (isWebsiteBlocked(request.url)) {
      const websiteName = getWebsiteName(request.url);
      if (isLastVisitLessThanOneHour(websiteName)) {
        sendResponse({
          websiteName: getWebsiteName(request.url),
          timeAgo: timeAgo(websiteName),
        });
        amplitude.getInstance().logEvent('Website Blocked');
      } else {
        amplitude.getInstance().logEvent('Website Visited');
      }
    }
    sendResponse(false);
  }
});

const isWebsiteBlocked = (url) => {
  const blockedWebsites = JSON.parse(
    window.localStorage.getItem('onceBlockedWebsites')
  );
  if (!blockedWebsites) return false;
  return JSON.parse(
    window.localStorage.getItem('onceBlockedWebsites')
  ).includes(url);
};

const isLastVisitLessThanOneHour = (websiteName) => {
  const lastVisit = window.localStorage.getItem(websiteName);
  if (!lastVisit) return false;
  return Date.now() - lastVisit < 60 * 60 * 1000;
};

const maybePluralize = (count, noun, suffix = 's') =>
  `${count} ${noun}${count !== 1 ? suffix : ''}`;

const timeAgo = (websiteName) => {
  const prev = window.localStorage.getItem(websiteName);
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
};

const newUrls = [];
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.url) newUrls[tabId] = changeInfo.url;
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  if (isWebsiteBlocked(newUrls[tabId])) {
    const websiteName = getWebsiteName(newUrls[tabId]);

    if (!isLastVisitLessThanOneHour(websiteName))
      window.localStorage.setItem(websiteName, Date.now());
  }
});
