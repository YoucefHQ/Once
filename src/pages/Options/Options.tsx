import React from 'react';
import Select from 'react-select';

interface WebsiteOption {
  label: string;
  value: string;
}

import '../../assets/css/reset.css';
import './Options.css';

import { defaultWebsites } from './default-websites';

const Options = () => {
  const [aggressiveMode, setAggressiveMode] = React.useState(false);

  React.useEffect(() => {
    chrome.storage.local
      .get('onceAggressiveMode')
      .then(({ onceAggressiveMode }) => {
        if (onceAggressiveMode) setAggressiveMode(true);
      });
  }, []);

  const toggleAggressiveMode = () => {
    const newValue = !aggressiveMode;
    setAggressiveMode(newValue);
    chrome.storage.local.set({ onceAggressiveMode: newValue });
  };

  return (
    <>
      <div className="menu">
        <ul>
          <a
            href="https://chromewebstore.google.com/detail/cmkicojchpmgdakmdjfhjjibbfmfplep/support"
            target="_blank"
            rel="noreferrer"
          >
            <li>Support</li>
          </a>
          <a
            href="https://chromewebstore.google.com/detail/cmkicojchpmgdakmdjfhjjibbfmfplep/support"
            target="_blank"
            rel="noreferrer"
          >
            <li>Feedback</li>
          </a>
          <a
            href="https://chromewebstore.google.com/detail/once-block-distracting-we/cmkicojchpmgdakmdjfhjjibbfmfplep/reviews"
            target="_blank"
            rel="noreferrer"
          >
            <li>Rate Once</li>
          </a>
        </ul>
      </div>
      <div className="content">
        <h1>Once</h1>
        <h2 style={{ color: 'black' }}>Which websites waste your time?</h2>
        <MultiSelectWebsites />
        <p>
          Once limits your visits to each of these websites (homepages only!)
          to only once an hour.
        </p>
        <div className="toggle-section">
          <div className="toggle-row">
            <div className="toggle-label">
              <span className="toggle-title">Aggressive mode</span>
              <span className="toggle-description">
                Visiting any blocked site starts the timer for all blocked sites
              </span>
            </div>
            <div
              className={`toggle-switch ${aggressiveMode ? 'active' : ''}`}
              onClick={toggleAggressiveMode}
              role="switch"
              aria-checked={aggressiveMode}
            >
              <div className="toggle-knob" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

class MultiSelectWebsites extends React.Component {
  state = {
    selectedWebsites: [],
    blockedWebsites: null,
  };

  componentDidMount() {
    chrome.storage.local
      .get('onceBlockedWebsites')
      .then(({ onceBlockedWebsites }) => {
        if (onceBlockedWebsites) {
          const websites = JSON.parse(onceBlockedWebsites as string) as string[];
          const blockedWebsitesObject = defaultWebsites.filter(function (
            blockedWebsite
          ) {
            return websites.includes(blockedWebsite.value);
          });
          this.setState({
            selectedWebsites: blockedWebsitesObject,
          });
        }
      });
  }

  getBlockedWebsites = () => {
    chrome.storage.local
      .get('onceBlockedWebsites')
      .then(({ onceBlockedWebsites }) => {
        if (!onceBlockedWebsites) this.setState({ blockedWebsites: null });
        else {
          const websites = JSON.parse(onceBlockedWebsites as string) as string[];
          const blockedWebsitesObject = defaultWebsites.filter(function (
            blockedWebsite
          ) {
            return websites.includes(blockedWebsite.value);
          });
          this.setState({ blockedWebsites: blockedWebsitesObject });
        }
      });
  };

  handleChange = (selectedWebsites: any) => {
    const newSelectedWebsites = (selectedWebsites || []).map((w: any) => ({
      value: w.value,
      label: w.label,
    }));
    this.setState({
      selectedWebsites: newSelectedWebsites,
    }, () => {
      this.saveBlockedWebsites();
    });
  };

  saveBlockedWebsites = () => {
    const urls = this.state.selectedWebsites.map((item: any) => item.value);
    for (const item of this.state.selectedWebsites as any[]) {
      if (item.label === 'X' || item.label === '𝕏') {
        urls.push('https://x.com/home');
      } else if (item.label === 'Reddit') {
        urls.push('https://old.reddit.com/');
      }
    }
    chrome.storage.local.set({
      onceBlockedWebsites: JSON.stringify(urls),
    });

    const previouslyBlockedWebsites = defaultWebsites.filter(
      (blockedWebsite) =>
        !this.state.selectedWebsites.includes(blockedWebsite.value as never) &&
        chrome.storage.local.get(blockedWebsite.label) != null
    );
    for (
      let index = 0;
      previouslyBlockedWebsites != null &&
      index < previouslyBlockedWebsites.length;
      index++
    ) {
      chrome.storage.local.remove(previouslyBlockedWebsites[index].label);
    }
  };

  render() {
    return (
      <>
        <Select<WebsiteOption, true>
          options={defaultWebsites}
          value={this.state.selectedWebsites}
          onChange={this.handleChange}
          isMulti
          closeMenuOnSelect={false}
          maxMenuHeight={175}
          isClearable
          name="colors"
          className="multi-select"
          placeholder="E.g. Instagram, Reddit, Youtube, etc. "
        />
      </>
    );
  }
}

export default Options;
