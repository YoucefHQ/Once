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
    var newSelectedWebsites: any[] = [];
    if (this.state.saveText === 'You are all set!') {
      this.setState({
        saveText: 'Save',
      });
    }
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
          value={this.state.selectedWebsites.filter((w: any) =>
            defaultWebsites.some((dw) => dw.value === w.value)
          )}
          onChange={this.handleChange}
          isMulti
          closeMenuOnSelect={false}
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
  return (
    <>
      <h2 style={{ color: 'black' }}>Which websites waste your time?</h2>
      <MultiSelectWebsites />
      <p>
        Once limits your visits to each of these websites (homepages only!)
        to only once an hour.
      </p>
    </>
  );
};

export default SettingsTab;
