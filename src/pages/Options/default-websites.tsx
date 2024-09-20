export const defaultWebsites = [
  { label: 'Amazon', value: 'https://www.amazon.com/' },
  { label: 'BBC', value: 'https://www.bbc.com/' },
  { label: 'BuzzFeed', value: 'https://www.buzzfeed.com/' },
  { label: 'CNN', value: 'https://www.cnn.com/' },
  { label: 'Discord', value: 'https://discord.com/channels/@me' },
  { label: 'eBay', value: 'https://www.ebay.com/' },
  { label: 'ESPN', value: 'https://www.espn.com/' },
  { label: 'Facebook', value: 'https://www.facebook.com/' },
  { label: 'Fandom', value: 'https://www.fandom.com/' },
  { label: 'Fox News', value: 'https://www.foxnews.com/' },
  { label: 'Hacker News', value: 'https://news.ycombinator.com/' },
  { label: 'Instagram', value: 'https://www.instagram.com/' },
  { label: 'LinkedIn', value: 'https://www.linkedin.com/feed/' },
  { label: 'MSN', value: 'https://www.msn.com/' },
  { label: 'Netflix', value: 'https://www.netflix.com/' },
  { label: 'The New York Times', value: 'https://www.nytimes.com/' },
  { label: 'Pinterest', value: 'https://www.pinterest.com/' },
  { label: 'Quora', value: 'https://www.quora.com/' },
  { label: 'Reddit', value: 'https://www.reddit.com/' },
  { label: 'Techmeme', value: 'https://techmeme.com/' },
  { label: 'The New York Times', value: 'https://www.nytimes.com/' },
  { label: 'Tiktok', value: 'https://www.tiktok.com/' },
  { label: 'Walmart', value: 'https://www.walmart.com/' },
  { label: '𝕏', value: 'https://x.com/' },
  { label: 'Yahoo', value: 'https://www.yahoo.com/' },
  { label: 'Youtube', value: 'https://www.youtube.com/' },
];

export function getWebsiteName(url: String) {
  if (url === 'https://x.com/home') {
    return '𝕏';
  } else if (url === 'https://old.reddit.com/') {
    return 'Reddit';
  } else {
    const blockedWebsitesObject = defaultWebsites.filter(function (
      blockedWebsite
    ) {
      return blockedWebsite.value === url;
    });

    return blockedWebsitesObject[0]?.label;
  }
}
