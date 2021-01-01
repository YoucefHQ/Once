const showOverlay = (websiteName, timeAgo, timeRemaining) => {
  const style = document.createElement('style');
  style.textContent = `@import url(https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap);body{overflow-y:hidden!important}#onceOverlay{background:#FFF;z-index:99;top:0;left:0;bottom:0;right:0;position:fixed}#onceContent{position:fixed;left:50%;transform:translateX(-50%)!important;top:0;text-align:center;width:62.66%;padding-top:80px;margin-top:0.5rem;z-index:9999}#onceRow{position:relative;width:100%}#onceContainer{width:75%;max-width:60rem;margin-left:auto;margin-right:auto}#onceContent img{display:inline-block;cursor:pointer;width:80px}#onceContent h2{font-family:'DM Sans',sans-serif;color:#19191b;margin-top:46px;margin-bottom:32px;text-align:center;font-weight:bold;font-size:64px;letter-spacing:-1px;line-height:1.1}#onceButton{font-family:'DM Sans',sans-serif;font-style:normal;font-weight:500;font-size:16px;background:#8e97fd;padding:16px 40px;border-radius:32px;border:0;color:#fff;cursor:pointer}#onceButton:hover{background:rgba(142,151,253,0.9)}#onceButton:active,#onceButton:focus{outline:0}#onceContent p{font-family:'DM Sans',sans-serif;font-style:normal;font-weight:500;font-size:16px;line-height:20px;color:#696871;margin-top:32px}#onceContent span{text-decoration:underline;cursor:pointer}`;
  document.head.append(style);

  const onceOverlay = document.createElement('div');
  onceOverlay.setAttribute('id', 'onceOverlay');
  document.body.appendChild(onceOverlay);

  const onceContent = document.createElement('div');
  onceContent.setAttribute('id', 'onceContent');
  onceContent.innerHTML =
    "<div id='onceContainer'><div id='onceRow'><img id='onceLogo' width='80' src='" +
    chrome.extension.getURL('icon-240.png') +
    "'/><h2>You were on " +
    websiteName +
    '<br>' +
    timeAgo +
    ".</h2><button id='onceButton'>Close " +
    websiteName +
    '</button><p>Come back in ' +
    timeRemaining +
    ".<br><br><span id='onceOptions'>Once</span> helps you take control of your digital life, and stay focused.</p></div></div>";
  document.body.appendChild(onceContent);

  document.getElementById('onceLogo').addEventListener('click', openOptions);
  document.getElementById('onceOptions').addEventListener('click', openOptions);
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
    if (response)
      showOverlay(
        response.websiteName,
        response.timeAgo,
        response.timeRemaining
      );
  }
);
