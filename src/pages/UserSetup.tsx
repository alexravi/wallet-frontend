import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';
import { CURRENCIES, LOCALES, TIMEZONES, DEFAULT_START_SCREENS, WEEK_START_DAYS } from '../utils/constants';

const UserSetup: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [basicData, setBasicData] = useState({
    name: '',
    currency: 'INR',
    locale: 'en-IN',
    timezone: 'Asia/Kolkata',
  });

  const [preferencesData, setPreferencesData] = useState({
    notifications: {
      email: true,
      inApp: true,
      push: true,
    },
    defaultStartScreen: 'dashboard',
    weekStartDay: 'monday' as 'monday' | 'sunday',
  });

  useEffect(() => {
    if (user) {
      setBasicData({
        name: user.name || '',
        currency: user.currency || 'INR',
        locale: user.locale || 'en-IN',
        timezone: user.timezone || 'Asia/Kolkata',
      });
      if (user.preferences) {
        setPreferencesData({
          notifications: {
            email: user.preferences.notifications?.email ?? true,
            inApp: user.preferences.notifications?.inApp ?? true,
            push: user.preferences.notifications?.push ?? true,
          },
          defaultStartScreen: user.preferences.defaultStartScreen || 'dashboard',
          weekStartDay: user.preferences.weekStartDay || 'monday',
        });
      }
    }
  }, [user]);

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBasicData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setPreferencesData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleNotificationChange = (key: 'email' | 'inApp' | 'push') => {
    setPreferencesData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleBasicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!basicData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.put(API_ENDPOINTS.PROFILE, basicData);
      await updateProfile();
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to save basic information');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // If skipping, at least set a default name so user is not considered new anymore
    if (!basicData.name.trim()) {
      try {
        await api.put(API_ENDPOINTS.PROFILE, { name: 'User' });
        await updateProfile();
      } catch (err) {
        console.error('Error setting default name:', err);
      }
    }
    navigate('/dashboard');
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.put(API_ENDPOINTS.PROFILE_PREFERENCES, preferencesData);
      await updateProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome! Let's set up your profile</h1>
          <p style={styles.subtitle}>Step {step} of 2</p>
        </div>

        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(step / 2) * 100}%` }} />
        </div>

        {step === 1 && (
          <form onSubmit={handleBasicSubmit} style={styles.form}>
            <h2 style={styles.sectionTitle}>Basic Information</h2>
            <p style={styles.sectionDescription}>Tell us a bit about yourself</p>

            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input
                type="text"
                name="name"
                value={basicData.name}
                onChange={handleBasicChange}
                style={styles.input}
                placeholder="Enter your name"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Currency</label>
              <select
                name="currency"
                value={basicData.currency}
                onChange={handleBasicChange}
                style={styles.select}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Locale</label>
              <select
                name="locale"
                value={basicData.locale}
                onChange={handleBasicChange}
                style={styles.select}
              >
                {LOCALES.map((locale) => (
                  <option key={locale.code} value={locale.code}>
                    {locale.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Timezone</label>
              <select
                name="timezone"
                value={basicData.timezone}
                onChange={handleBasicChange}
                style={styles.select}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.buttonGroup}>
              <button type="button" onClick={handleSkip} style={styles.skipButton}>
                Skip for now
              </button>
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePreferencesSubmit} style={styles.form}>
            <h2 style={styles.sectionTitle}>Preferences</h2>
            <p style={styles.sectionDescription}>Customize your experience</p>

            <div style={styles.section}>
              <h3 style={styles.subsectionTitle}>Notification Preferences</h3>
              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={preferencesData.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                    style={styles.checkbox}
                  />
                  Email Notifications
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={preferencesData.notifications.inApp}
                    onChange={() => handleNotificationChange('inApp')}
                    style={styles.checkbox}
                  />
                  In-App Notifications
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={preferencesData.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                    style={styles.checkbox}
                  />
                  Push Notifications
                </label>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Default Start Screen</label>
              <select
                name="defaultStartScreen"
                value={preferencesData.defaultStartScreen}
                onChange={handlePreferencesChange}
                style={styles.select}
              >
                {DEFAULT_START_SCREENS.map((screen) => (
                  <option key={screen.value} value={screen.value}>
                    {screen.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Week Start Day</label>
              <div style={styles.radioGroup}>
                {WEEK_START_DAYS.map((day) => (
                  <label key={day.value} style={styles.radioLabel}>
                    <input
                      type="radio"
                      name="weekStartDay"
                      value={day.value}
                      checked={preferencesData.weekStartDay === day.value}
                      onChange={handlePreferencesChange}
                      style={styles.radio}
                    />
                    {day.label}
                  </label>
                ))}
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.buttonGroup}>
              <button type="button" onClick={() => setStep(1)} style={styles.backButton}>
                Back
              </button>
              <button type="button" onClick={handleSkip} style={styles.skipButton}>
                Skip
              </button>
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    maxWidth: '600px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    margin: 0,
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: '#eee',
    borderRadius: '2px',
    marginBottom: '30px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007bff',
    transition: 'width 0.3s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  sectionDescription: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 20px 0',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  subsectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: 'white',
  },
  select: {
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    backgroundColor: 'white',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  radioGroup: {
    display: 'flex',
    gap: '16px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  radio: {
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  skipButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  backButton: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#666',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginRight: 'auto',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    fontSize: '14px',
  },
};

export default UserSetup;

