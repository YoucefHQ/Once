import React from 'react';

interface TabBarProps {
  activeTab: 'settings' | 'stats';
  onTabChange: (tab: 'settings' | 'stats') => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="tab-bar" role="tablist">
      <div
        className={`tab-item${activeTab === 'settings' ? ' tab-active' : ''}`}
        role="tab"
        aria-selected={activeTab === 'settings'}
        onClick={() => onTabChange('settings')}
      >
        Settings
      </div>
      <div
        className={`tab-item${activeTab === 'stats' ? ' tab-active' : ''}`}
        role="tab"
        aria-selected={activeTab === 'stats'}
        onClick={() => onTabChange('stats')}
      >
        Stats
      </div>
    </div>
  );
};

export default TabBar;
