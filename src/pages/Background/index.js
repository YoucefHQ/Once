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

const isUrlBlocked = (url) => {
  const blockedUrl = JSON.parse(
    window.localStorage.getItem('once_websites')
  ).filter(function (website) {
    return website.blocked === true && url === website.url;
  });
  return blockedUrl.length == 1;
};

const getLastVisit = (url) => {
  const blockedUrl = JSON.parse(
    window.localStorage.getItem('once_websites')
  ).filter(function (website) {
    return url === website.url;
  });
  return blockedUrl[0].last_visited;
};

// Checks if website is fully closed and not open on another tab
const isFullyClosed = (url) => {
  var length;
  chrome.tabs.query({ url: url }, function (tabs) {
    lenght += tabs.length;
  });
  return length == 0;
};

const lessThanOneHour = (lastVisit) => {
  return Date.now() - lastVisit < 3600000;
};

const newUrls = [];
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  if (changeInfo.url) {
    newUrls[tabId] = changeInfo.url;

    if (
      isUrlBlocked(changeInfo.url) &&
      lessThanOneHour(getLastVisit(changeInfo.url))
    ) {
      alert('You were here less than an hour ago.');
    }
  }
});

chrome.tabs.onRemoved.addListener(function (tabId) {
  if (
    isUrlBlocked(newUrls[tabId]) &&
    !lessThanOneHour(getLastVisit(newUrls[tabId]))
  ) {
    const blockedUrls = JSON.parse(
      window.localStorage.getItem('once_websites')
    );
    blockedUrls.map((element) => {
      if (element.url == newUrls[tabId]) {
        element.last_visited = Date.now();
      }
    });
    window.localStorage.setItem('once_websites', JSON.stringify(blockedUrls));
  }
});
