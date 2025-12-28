import React, { useState } from 'react';
import BasicProfileForm from '../components/profile/BasicProfileForm';
import PreferencesForm from '../components/profile/PreferencesForm';
import SecuritySettings from '../components/profile/SecuritySettings';

type TabType = 'basic' | 'preferences' | 'security';

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');

  const tabs = [
    { id: 'basic' as TabType, label: 'Basic Profile' },
    { id: 'preferences' as TabType, label: 'Preferences' },
    { id: 'security' as TabType, label: 'Security Settings' },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>User Profile</h1>

        <div style={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.content}>
          {activeTab === 'basic' && <BasicProfileForm />}
          {activeTab === 'preferences' && <PreferencesForm />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '40px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '800px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#333',
  },
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #eee',
    marginBottom: '30px',
    gap: '8px',
  },
  tab: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#007bff',
    borderBottomColor: '#007bff',
  },
  content: {
    minHeight: '400px',
  },
};

export default Profile;

