const loadFont = () => {
  if (!document.querySelector('link[href*="DM+Sans"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap';
    document.head.append(link);
  }
};

const showOverlay = (websiteName, timeAgo, timeRemaining, blockedTimes, triggerSite, streak, timeSaved) => {
  loadFont();
  const style = document.createElement('style');
  style.textContent = `body{overflow-y:hidden!important}#onceOverlay{background:#FFF;z-index:99999999;top:0;left:0;bottom:0;right:0;position:fixed}#onceContent{position:fixed;left:50%;transform:translateX(-50%)!important;top:0;text-align:center;width:62.66%;padding-top:80px;z-index:9999999999}#onceRow{position:relative;width:100%}#onceContainer{width:90%;max-width:60rem;margin-left:auto;margin-right:auto}#onceLogo{display:inline-block;cursor:pointer;width:80px;margin:auto}#onceContent h2{font-family:'DM Sans',sans-serif!important;color:#19191b;margin-top:24px;margin-bottom:16px;text-align:center;font-weight:bold;font-size:64px;letter-spacing:-1px;line-height:1.1}#onceContent h3{font-family:'DM Sans',sans-serif!important;color:#696871;margin-bottom:32px;text-align:center;font-weight:500;font-size:24px;letter-spacing:-1px;line-height:1.1}#onceButton{font-family:'DM Sans',sans-serif!important;font-style:normal;font-weight:500;font-size:16px;background:#8e97fd;padding:16px 40px;border-radius:32px;border:0;color:#fff;cursor:pointer}#onceButton:hover{background:rgba(142,151,253,0.9)}#onceButton:active,#onceButton:focus{outline:0}#onceContent p{font-family:'DM Sans',sans-serif!important;font-style:normal;font-weight:500;font-size:16px;line-height:20px;color:#696871;margin-top:32px}#onceOptions{text-decoration:underline;cursor:pointer}#onceContent a{color:#8e97fd;font-family:inherit;font-size:inherit;text-decoration:underline}.oncePills{display:flex;gap:12px;justify-content:center;margin:32px 0;flex-wrap:wrap}.oncePill{font-family:'DM Sans',sans-serif!important;font-size:14px;font-weight:500;background:rgba(142,151,253,0.12);color:#8e97fd;padding:8px 16px;border-radius:20px;display:inline-flex;align-items:center;gap:6px}`;
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

  const pills = document.createElement('div');
  pills.className = 'oncePills';
  if (streak > 0) {
    const streakPill = document.createElement('span');
    streakPill.className = 'oncePill';
    streakPill.textContent = '\u{1F525} ' + streak + '-day streak';
    pills.appendChild(streakPill);
  }
  const blocksPill = document.createElement('span');
  blocksPill.className = 'oncePill';
  blocksPill.textContent = '\u{1F6E1}\uFE0F ' + blockedTimes + (blockedTimes === '1' ? ' block' : ' blocks');
  pills.appendChild(blocksPill);
  if (timeSaved) {
    const savedPill = document.createElement('span');
    savedPill.className = 'oncePill';
    savedPill.textContent = '\u23F1\uFE0F ' + timeSaved + ' saved';
    pills.appendChild(savedPill);
  }

  const statsLink = document.createElement('a');
  statsLink.className = 'oncePill';
  statsLink.style.cssText = 'cursor:pointer;text-decoration:none;color:#8e97fd;border:1px solid rgba(142,151,253,0.3)';
  statsLink.textContent = 'View all stats \u2192';
  statsLink.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'openStats' });
  });
  pills.appendChild(statsLink);

  const info = document.createElement('p');
  const onceLink = document.createElement('span');
  onceLink.id = 'onceOptions';
  onceLink.textContent = 'Once';
  onceLink.addEventListener('click', openOptions);

  const reviewLink = document.createElement('a');
  reviewLink.href = 'https://chromewebstore.google.com/detail/once-block-distracting-we/cmkicojchpmgdakmdjfhjjibbfmfplep/reviews';
  reviewLink.target = '_blank';
  reviewLink.textContent = 'a review';

  info.append(
    onceLink,
    ' helps you stop wasting time on distracting websites.',
    document.createElement('br'),
    document.createElement('br'),
    'Support Once with ',
    reviewLink,
    '.'
  );

  row.append(logo, heading, subheading, button, pills, info);
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
        response.triggerSite,
        response.streak,
        response.timeSaved
      );
    else if (response && response.showOnboarding)
      showOnboarding(response.websiteName, response.aggressiveMode);
  }
);
