const showOverlay = (websiteName, timeAgo, timeRemaining, blockedTimes) => {
  const style = document.createElement('style');
  style.textContent = `@import url(https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap);body{overflow-y:hidden!important}#onceOverlay{background:#FFF;z-index:99999999;top:0;left:0;bottom:0;right:0;position:fixed}#onceContent{position:fixed;left:50%;transform:translateX(-50%)!important;top:0;text-align:center;width:62.66%;padding-top:80px;margin-top:0.5rem;z-index:9999999999}#onceRow{position:relative;width:100%}#onceContainer{width:90%;max-width:60rem;margin-left:auto;margin-right:auto}#onceLogo{display:inline-block;cursor:pointer;width:80px;margin:auto}#onceContent h2{font-family:'DM Sans',sans-serif!important;color:#19191b;margin-top:46px;margin-bottom:32px;text-align:center;font-weight:bold;font-size:64px;letter-spacing:-1px;line-height:1.1}#onceContent h3{font-family:'DM Sans',sans-serif!important;color:#696871;margin-bottom:32px;text-align:center;font-weight:500;font-size:24px;letter-spacing:-1px;line-height:1.1}#onceButton{font-family:'DM Sans',sans-serif!important;font-style:normal;font-weight:500;font-size:16px;background:#8e97fd;padding:16px 40px;border-radius:32px;border:0;color:#fff;cursor:pointer}#onceButton:hover{background:rgba(142,151,253,0.9)}#onceButton:active,#onceButton:focus{outline:0}#onceContent p{font-family:'DM Sans',sans-serif!important;font-style:normal;font-weight:500;font-size:16px;line-height:20px;color:#696871;margin-top:32px}#onceOptions{text-decoration:underline;cursor:pointer}#onceContent a {color:#8e97fd;font-family:inherit;font-size:inherit;text-decoration:underline;}`;
  document.head.append(style);

  const onceOverlay = document.createElement('div');
  onceOverlay.setAttribute('id', 'onceOverlay');
  document.body.appendChild(onceOverlay);

  const onceContent = document.createElement('div');
  onceContent.setAttribute('id', 'onceContent');
  onceContent.innerHTML =
    "<div id='onceContainer'><div id='onceRow'><img id='onceLogo' width='80' src='" +
    chrome.runtime.getURL('icon-240.png') +
    "'/><h2>You visited " +
    websiteName +
    ' ' +
    timeAgo +
    '</h2><h3>You can visit ' +
    websiteName +
    ' again in ' +
    timeRemaining +
    ".</h3><button id='onceButton'>Close tab</button><p><span id='onceOptions'>Once</span> helps you stop wasting time on distracting websites.<br><br>Once blocked you " +
    blockedTimes +
    ' times from distracting websites. Support Once with <a href="https://chromewebstore.google.com/detail/once-block-distracting-we/cmkicojchpmgdakmdjfhjjibbfmfplep/reviews" target="_blank">a review</a> or <a href="https://x.com/intent/tweet?url=https%3A%2F%2Fonceforchrome.com%2F&text=Stop%20wasting%20time%20on%20distracting%20websites%20with%20Once" target="_blank">a tweet</a>.</p></div></div>';
  document.body.appendChild(onceContent);

  document.getElementById('onceLogo').addEventListener('click', openOptions);
  document.getElementById('onceOptions').addEventListener('click', openOptions);
  document.getElementById('onceButton').addEventListener('click', closeTab);
};

const showOnboarding = (websiteName) => {
  const style = document.createElement('style');
  style.textContent = `@import url(https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap);#onceContent{position:fixed;bottom:0;left:0;right:0;text-align:center;background:#8e97fd;width:100%;z-index:9999999999}#onceContent p{font-family:'DM Sans',sans-serif!important;font-style:normal;font-weight:500;font-size:14px;color:#FFF;margin:8px}#onceOptions{text-decoration:underline;cursor:pointer}#onceButton{margin-left:10px;font-family:'DM Sans',sans-serif!important;font-weight:500;font-size:14px;background:transparent;padding:2px 8px;border-radius:32px;border:1px solid white;color:#FFF;cursor:pointer}#onceButton:active,#onceButton:focus{outline:0}`;
  document.head.append(style);

  const onceContent = document.createElement('div');
  onceContent.setAttribute('id', 'onceContent');
  onceContent.innerHTML =
    "<p><span id='onceOptions'>Once</span> limits your visits to " +
    websiteName +
    ' to once an hour. The timer starts after closing this tab<button id="onceButton">OK</button></p>';
  document.body.appendChild(onceContent);

  document.getElementById('onceOptions').addEventListener('click', openOptions);
  document.getElementById('onceButton').addEventListener('click', closeOverlay);
};

const openOptions = () => {
  chrome.runtime.sendMessage({ type: 'openOptions' });
};

const closeTab = () => {
  chrome.runtime.sendMessage({ type: 'closeTab' });
};

const closeOverlay = () => {
  document.getElementById('onceContent').remove();
};

chrome.runtime.sendMessage(
  // eslint-disable-next-line no-restricted-globals
  { type: 'checkWebsite', url: location.href },
  function (response) {
    if (response.blockWebsite)
      showOverlay(
        response.websiteName,
        response.timeAgo,
        response.timeRemaining,
        response.blockedTimes
      );
    else if (response.showOnboarding) showOnboarding(response.websiteName);
  }
);
