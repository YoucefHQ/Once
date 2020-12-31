const showOverlay = (websiteName, timeAgo) => {
  const style = document.createElement('style');
  style.textContent = `@import url(https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap);#onceOverlay{-webkit-filter:blur(112px)}#onceContent{position:fixed;top:0;text-align:center;width:100%;padding-top:80px}#onceContent img{cursor:pointer;width:80px;margin:auto;}#onceContent h2{font-family:'DM Sans',sans-serif;font-weight:500;font-size:24px;color:#19191b;margin:32px 0;text-align:center;padding:0 80px}#onceButton{font-family:'DM Sans',sans-serif;font-style:normal;font-weight:500;font-size:16px;background:#8e97fd;padding:16px 40px;border-radius:32px;border:0;margin:auto;color:#fff;cursor:pointer;display:flex;align-items:center}#onceButton:hover{background:rgba(142,151,253,0.9)}#onceButton:active,#onceButton:focus{outline:0}`;
  document.head.append(style);

  const onceOverlay = document.createElement('div');
  onceOverlay.setAttribute('id', 'onceOverlay');
  while (document.body.firstChild)
    onceOverlay.appendChild(document.body.firstChild);
  document.body.appendChild(onceOverlay);

  const onceContent = document.createElement('div');
  onceContent.setAttribute('id', 'onceContent');
  onceContent.innerHTML =
    "<img id='onceLogo' width='80' src='" +
    chrome.extension.getURL('icon-128.png') +
    "'/><h2>You were on " +
    websiteName +
    ' ' +
    timeAgo +
    ".</h2><button id='onceButton'>Close " +
    websiteName +
    '</button>';
  document.body.appendChild(onceContent);

  document.getElementById('onceLogo').addEventListener('click', openOptions);
  document.getElementById('onceButton').addEventListener('click', closeTab);
};

const openOptions = () => {
  chrome.runtime.sendMessage({ type: 'openOptions' });
};

const closeTab = () => {
  chrome.runtime.sendMessage({ type: 'closeTab' });
};

chrome.runtime.sendMessage(
  { type: 'checkWebsite', url: location.href },
  function (response) {
    if (response) showOverlay(response.websiteName, response.timeAgo);
  }
);
