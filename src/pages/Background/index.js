import '../../assets/img/icon-128.png';
import '../../assets/img/icon-48.png';
import '../../assets/img/icon-32.png';
import '../../assets/img/icon-24.png';
import '../../assets/img/icon-16.png';
import { getWebsiteName } from './../Options/default-websites';

// Open options page after install
chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason == 'install') {
    var optionsUrl = chrome.extension.getURL('options.html');
    chrome.tabs.query({ url: optionsUrl }, function (tabs) {
      if (tabs.length) {
        chrome.tabs.update(tabs[0].id, { active: true });
      } else {
        chrome.tabs.create({ url: optionsUrl });
      }
    });
  }
});

// Open options page after clicking on icon
chrome.browserAction.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
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
  return Date.now() - lastVisit < 3600000;
};

const newUrls = [];
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.url) {
    newUrls[tabId] = changeInfo.url;

    if (isWebsiteBlocked(changeInfo.url)) {
      const websiteName = getWebsiteName(changeInfo.url);

      if (isLastVisitLessThanOneHour(websiteName))
        alert('You were on ' + websiteName + ' less than an hour ago.');
    }
  }
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  if (isWebsiteBlocked(newUrls[tabId])) {
    const websiteName = getWebsiteName(newUrls[tabId]);

    if (!isLastVisitLessThanOneHour(websiteName))
      window.localStorage.setItem(websiteName, Date.now());
  }
});

/*
// Checks if website is fully closed and not open on another tab
const isFullyClosed = (url) => {
  var length;
  chrome.tabs.query({ url: url }, function (tabs) {
    lenght += tabs.length;
  });
  return length == 0;
};
*/
