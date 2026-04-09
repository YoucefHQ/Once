import React, { useState } from 'react';

import '../../assets/css/reset.css';
import './Options.css';

import TabBar from './components/TabBar';
import SettingsTab from './components/SettingsTab';
import StatsTab from './components/StatsTab';

function getInitialTab(): 'settings' | 'stats' {
  const params = new URLSearchParams(window.location.search);
  return params.get('tab') === 'stats' ? 'stats' : 'settings';
}

const Options = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'stats'>(getInitialTab);

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
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'settings' ? <SettingsTab /> : <StatsTab />}
      </div>
    </>
  );
};

export default Options;
