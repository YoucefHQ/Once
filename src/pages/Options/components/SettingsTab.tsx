import React from 'react';
import Select from 'react-select';
import { defaultWebsites } from '../default-websites';

interface WebsiteOption {
  label: string;
  value: string;
}

const selectStyles = {
  control: (base: any) => ({
    ...base,
    background: 'var(--color-bg)',
    borderColor: 'var(--color-border)',
  }),
  menu: (base: any) => ({
    ...base,
    background: 'var(--color-bg)',
  }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isFocused ? 'var(--color-surface)' : 'var(--color-bg)',
    color: 'var(--color-text)',
  }),
  multiValue: (base: any) => ({
    ...base,
    background: 'var(--color-surface)',
  }),
  multiValueLabel: (base: any) => ({
    ...base,
    color: 'var(--color-text)',
  }),
  input: (base: any) => ({
    ...base,
    color: 'var(--color-text)',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'var(--color-text-secondary)',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'var(--color-text)',
  }),
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

  handleChange = (selectedWebsites: any) => {
    var newSelectedWebsites: any[] = [];
    const seen = new Set<string>();
    for (
      let index = 0;
      selectedWebsites != null && index < selectedWebsites.length;
      index++
    ) {
      const { value, label } = selectedWebsites[index];
      if (seen.has(value)) continue;
      seen.add(value);
      newSelectedWebsites.push({ value, label });
      // Also block alternate URLs for X and Reddit
      if (label === 'X' && !seen.has('https://x.com/home')) {
        seen.add('https://x.com/home');
        newSelectedWebsites.push({ value: 'https://x.com/home', label: 'X' });
      } else if (label === 'Reddit' && !seen.has('https://old.reddit.com/')) {
        seen.add('https://old.reddit.com/');
        newSelectedWebsites.push({ value: 'https://old.reddit.com/', label: 'Reddit' });
      }
    }
    this.setState({
      selectedWebsites: newSelectedWebsites,
    }, () => {
      this.saveBlockedWebsites();
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

  };

  render() {
    return (
      <>
        <Select<WebsiteOption, true>
          options={defaultWebsites}
          value={this.state.selectedWebsites.filter((w: any) =>
            defaultWebsites.some((dw) => dw.value === w.value)
          )}
          onChange={this.handleChange}
          isMulti
          closeMenuOnSelect={false}
          maxMenuHeight={175}
          isClearable
          name="colors"
          className="multi-select"
          placeholder="E.g. Instagram, Reddit, Youtube, etc. "
          styles={selectStyles}
        />
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
      <h2>Which websites waste your time?</h2>
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
