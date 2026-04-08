import React from 'react';
import Select from 'react-select';
import { defaultWebsites } from '../default-websites';

interface WebsiteOption {
  label: string;
  value: string;
}

class MultiSelectWebsites extends React.Component {
  state = {
    selectedWebsites: [],
    saveText: 'Save',
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

  handleChange = (selectedWebsites: any) => {
    var newSelectedWebsites = [];
    if (this.state.saveText === 'You are all set!') {
      this.setState({
        saveText: 'Save',
      });
    }
    for (
      let index = 0;
      selectedWebsites != null && index < selectedWebsites.length;
      index++
    ) {
      newSelectedWebsites.push({
        value: selectedWebsites[index].value,
        label: selectedWebsites[index].label,
      });
      if (selectedWebsites[index].label === '\u{1D54F}') {
        newSelectedWebsites.push({
          value: 'https://x.com/home',
          label: '\u{1D54F}',
        });
      } else if (selectedWebsites[index].label === 'Reddit') {
        newSelectedWebsites.push({
          value: 'https://old.reddit.com/',
          label: 'Reddit',
        });
      }
    }
    this.setState({
      selectedWebsites: newSelectedWebsites,
    });
  };

  saveBlockedWebsites = () => {
    chrome.storage.local.set({
      onceBlockedWebsites: JSON.stringify(
        this.state.selectedWebsites.map((item: any) => item.value)
      ),
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

    this.setState({
      saveText: 'You are all set!',
    });
  };

  render() {
    return (
      <>
        <Select<WebsiteOption, true>
          options={defaultWebsites}
          value={this.state.selectedWebsites}
          onChange={this.handleChange}
          isMulti
          name="colors"
          className="multi-select"
          placeholder="E.g. Instagram, Reddit, Youtube, etc. "
        />
        <button onClick={() => this.saveBlockedWebsites()}>
          {this.state.saveText}
        </button>
      </>
    );
  }
}

const SettingsTab: React.FC = () => {
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
      <h2 style={{ color: 'black' }}>Which websites waste your time?</h2>
      <MultiSelectWebsites />
      <div className="toggle-section">
        <div className="faq-item toggle-row">
          <div className="toggle-label">
            <h3>Aggressive mode</h3>
            <p>
              Visiting any blocked site starts the timer for all blocked sites
            </p>
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
    </>
  );
};

export default SettingsTab;
