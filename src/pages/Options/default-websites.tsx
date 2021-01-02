export const defaultWebsites = [
  { label: 'BBC', value: 'https://www.bbc.com/' },
  { label: 'BuzzFeed', value: 'https://www.buzzfeed.com/' },
  { label: 'CNN', value: 'https://www.cnn.com/' },
  { label: 'ESPN', value: 'https://www.espn.com/' },
  { label: 'Facebook', value: 'https://www.facebook.com/' },
  { label: 'Feedly', value: 'https://feedly.com/' },
  { label: 'Fox News', value: 'https://www.foxnews.com/' },
  { label: 'Hacker News', value: 'https://news.ycombinator.com/' },
  { label: 'Instagram', value: 'https://www.instagram.com/' },
  { label: 'LinkedIn', value: 'https://www.linkedin.com/feed/' },
  { label: 'MSN', value: 'https://www.msn.com/' },
  { label: 'Pinterest', value: 'https://www.pinterest.com/' },
  { label: 'Quora', value: 'https://www.quora.com/' },
  { label: 'Reddit', value: 'https://www.reddit.com/' },
  { label: 'Techmeme', value: 'https://techmeme.com/' },
  { label: 'The New York Times', value: 'https://www.nytimes.com/' },
  { label: 'Twitter', value: 'https://twitter.com/' },
  { label: 'Tiktok', value: 'https://www.tiktok.com/' },
  { label: 'Yahoo', value: 'https://www.yahoo.com/' },
  { label: 'Youtube', value: 'https://www.youtube.com/' },
];

export const getWebsiteName = (url: String) => {
  if (url == 'https://twitter.com/home') {
    return 'Twitter';
  } else if (url == 'https://feedly.com/i/my') {
    return 'Feedly';
  } else {
    const blockedWebsitesObject = defaultWebsites.filter(function (
      blockedWebsite
    ) {
      return blockedWebsite.value === url;
    });

    return blockedWebsitesObject[0].label;
  }
};
