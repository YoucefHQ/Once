const loadFont = () => {
  if (!document.querySelector('link[href*="DM+Sans"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap';
    document.head.append(link);
  }
};

const showOverlay = (websiteName, timeAgo, timeRemaining, blockedTimes, triggerSite) => {
  loadFont();
  const style = document.createElement('style');
  style.textContent = `body{overflow-y:hidden!important}#onceOverlay{background:#FFF;z-index:99999999;top:0;left:0;bottom:0;right:0;position:fixed}#onceContent{position:fixed;left:50%;transform:translateX(-50%)!important;top:0;text-align:center;width:62.66%;padding-top:80px;margin-top:0.5rem;z-index:9999999999}#onceRow{position:relative;width:100%}#onceContainer{width:90%;max-width:60rem;margin-left:auto;margin-right:auto}#onceLogo{display:inline-block;cursor:pointer;width:80px;margin:auto}#onceContent h2{font-family:'DM Sans',sans-serif!important;color:#19191b;margin-top:46px;margin-bottom:32px;text-align:center;font-weight:bold;font-size:64px;letter-spacing:-1px;line-height:1.1}#onceContent h3{font-family:'DM Sans',sans-serif!important;color:#696871;margin-bottom:32px;text-align:center;font-weight:500;font-size:24px;letter-spacing:-1px;line-height:1.1}#onceButton{font-family:'DM Sans',sans-serif!important;font-style:normal;font-weight:500;font-size:16px;background:#8e97fd;padding:16px 40px;border-radius:32px;border:0;color:#fff;cursor:pointer}#onceButton:hover{background:rgba(142,151,253,0.9)}#onceButton:active,#onceButton:focus{outline:0}#onceContent p{font-family:'DM Sans',sans-serif!important;font-style:normal;font-weight:500;font-size:16px;line-height:20px;color:#696871;margin-top:32px}#onceOptions{text-decoration:underline;cursor:pointer}#onceContent a {color:#8e97fd;font-family:inherit;font-size:inherit;text-decoration:underline;}`;
  document.head.append(style);

  const onceOverlay = document.createElement('div');
  onceOverlay.id = 'onceOverlay';
  document.body.appendChild(onceOverlay);

  const onceContent = document.createElement('div');
  onceContent.id = 'onceContent';

  const container = document.createElement('div');
  container.id = 'onceContainer';
  const row = document.createElement('div');
  row.id = 'onceRow';

  const logo = document.createElement('img');
  logo.id = 'onceLogo';
  logo.width = 80;
  logo.src = chrome.runtime.getURL('icon-240.png');
  logo.addEventListener('click', openOptions);

  const displayName = triggerSite && triggerSite !== websiteName ? triggerSite : websiteName;
  const heading = document.createElement('h2');
  heading.textContent = 'You visited ' + displayName + ' ' + timeAgo;

  const subheading = document.createElement('h3');
  subheading.textContent = 'You can visit ' + websiteName + ' again in ' + timeRemaining + '.';

  const button = document.createElement('button');
  button.id = 'onceButton';
  button.textContent = 'Close tab';
  button.addEventListener('click', closeTab);

  const info = document.createElement('p');
  const onceLink = document.createElement('span');
  onceLink.id = 'onceOptions';
  onceLink.textContent = 'Once';
  onceLink.addEventListener('click', openOptions);

  const reviewLink = document.createElement('a');
  reviewLink.href = 'https://chromewebstore.google.com/detail/once-block-distracting-we/cmkicojchpmgdakmdjfhjjibbfmfplep/reviews';
  reviewLink.target = '_blank';
  reviewLink.textContent = 'a review';

  const tweetLink = document.createElement('a');
  tweetLink.href = 'https://x.com/intent/tweet?url=https%3A%2F%2Fonceforchrome.com%2F&text=Stop%20wasting%20time%20on%20distracting%20websites%20with%20Once';
  tweetLink.target = '_blank';
  tweetLink.textContent = 'a tweet';

  info.append(
    onceLink,
    ' helps you stop wasting time on distracting websites.',
    document.createElement('br'),
    document.createElement('br'),
    'Once blocked you ' + blockedTimes + ' times from distracting websites. Support Once with ',
    reviewLink,
    ' or ',
    tweetLink,
    '.'
  );

  row.append(logo, heading, subheading, button, info);
  container.appendChild(row);
  onceContent.appendChild(container);
  document.body.appendChild(onceContent);
};

const showOnboarding = (websiteName, aggressiveMode) => {
  loadFont();
  const style = document.createElement('style');
  style.textContent = `#onceContent{position:fixed;bottom:0;left:0;right:0;text-align:center;background:#8e97fd;width:100%;z-index:9999999999}#onceContent p{font-family:'DM Sans',sans-serif!important;font-style:normal;font-weight:500;font-size:14px;color:#FFF;margin:8px}#onceOptions{text-decoration:underline;cursor:pointer}#onceButton{margin-left:10px;font-family:'DM Sans',sans-serif!important;font-weight:500;font-size:14px;background:transparent;padding:2px 8px;border-radius:32px;border:1px solid white;color:#FFF;cursor:pointer}#onceButton:active,#onceButton:focus{outline:0}`;
  document.head.append(style);

  const onceContent = document.createElement('div');
  onceContent.id = 'onceContent';

  const p = document.createElement('p');
  const onceLink = document.createElement('span');
  onceLink.id = 'onceOptions';
  onceLink.textContent = 'Once';
  onceLink.addEventListener('click', openOptions);

  const button = document.createElement('button');
  button.id = 'onceButton';
  button.textContent = 'OK';
  button.addEventListener('click', closeOverlay);

  p.append(
    onceLink,
    aggressiveMode
      ? ' limits your visits to all blocked websites to once an hour. The timer has started.'
      : ' limits your visits to ' + websiteName + ' to once an hour. The timer starts after closing this tab',
    button
  );

  onceContent.appendChild(p);
  document.body.appendChild(onceContent);
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
  { type: 'checkWebsite', url: location.href },
  function (response) {
    if (chrome.runtime.lastError) return;
    if (response && response.blockWebsite)
      showOverlay(
        response.websiteName,
        response.timeAgo,
        response.timeRemaining,
        response.blockedTimes,
        response.triggerSite
      );
    else if (response && response.showOnboarding)
      showOnboarding(response.websiteName, response.aggressiveMode);
  }
);
