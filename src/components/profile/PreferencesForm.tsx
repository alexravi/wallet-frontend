import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { API_ENDPOINTS, DEFAULT_START_SCREENS, WEEK_START_DAYS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

interface PreferencesFormProps {
  onSuccess?: () => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ onSuccess }) => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    notifications: {
      email: true,
      inApp: true,
      push: true,
    },
    reminderTimings: [] as string[],
    defaultStartScreen: 'dashboard',
    weekStartDay: 'monday' as 'monday' | 'sunday',
  });
  const [newReminderTime, setNewReminderTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setFormData({
        notifications: {
          email: user.preferences.notifications?.email ?? true,
          inApp: user.preferences.notifications?.inApp ?? true,
          push: user.preferences.notifications?.push ?? true,
        },
        reminderTimings: user.preferences.reminderTimings || [],
        defaultStartScreen: user.preferences.defaultStartScreen || 'dashboard',
        weekStartDay: user.preferences.weekStartDay || 'monday',
      });
    }
  }, [user]);

  const handleNotificationChange = (key: 'email' | 'inApp' | 'push') => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
    setError(null);
    setSuccess(false);
  };

  const handleReminderTimeAdd = () => {
    if (newReminderTime && /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(newReminderTime)) {
      if (!formData.reminderTimings.includes(newReminderTime)) {
        setFormData((prev) => ({
          ...prev,
          reminderTimings: [...prev.reminderTimings, newReminderTime],
        }));
        setNewReminderTime('');
      }
    }
  };

  const handleReminderTimeRemove = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      reminderTimings: prev.reminderTimings.filter((t) => t !== time),
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.put(API_ENDPOINTS.PROFILE_PREFERENCES, formData);
      await updateProfile();
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Notification Preferences</h3>
        <div style={styles.checkboxGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.notifications.email}
              onChange={() => handleNotificationChange('email')}
              style={styles.checkbox}
            />
            Email Notifications
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.notifications.inApp}
              onChange={() => handleNotificationChange('inApp')}
              style={styles.checkbox}
            />
            In-App Notifications
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.notifications.push}
              onChange={() => handleNotificationChange('push')}
              style={styles.checkbox}
            />
            Push Notifications
          </label>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Reminder Timings</h3>
        <div style={styles.reminderInput}>
          <input
            type="time"
            value={newReminderTime}
            onChange={(e) => setNewReminderTime(e.target.value)}
            style={styles.input}
            placeholder="HH:mm"
          />
          <button
            type="button"
            onClick={handleReminderTimeAdd}
            style={styles.addButton}
          >
            Add
          </button>
        </div>
        {formData.reminderTimings.length > 0 && (
          <div style={styles.reminderList}>
            {formData.reminderTimings.map((time) => (
              <div key={time} style={styles.reminderItem}>
                <span>{time}</span>
                <button
                  type="button"
                  onClick={() => handleReminderTimeRemove(time)}
                  style={styles.removeButton}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Default Start Screen</label>
        <select
          name="defaultStartScreen"
          value={formData.defaultStartScreen}
          onChange={handleChange}
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
                checked={formData.weekStartDay === day.value}
                onChange={handleChange}
                style={styles.radio}
              />
              {day.label}
            </label>
          ))}
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>Preferences updated successfully!</div>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    margin: 0,
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
  reminderInput: {
    display: 'flex',
    gap: '8px',
  },
  reminderList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '8px',
  },
  reminderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    fontSize: '14px',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#c33',
    padding: 0,
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
  addButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#28a745',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  button: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    color: '#c33',
    borderRadius: '4px',
    fontSize: '14px',
  },
  success: {
    padding: '10px',
    backgroundColor: '#efe',
    color: '#3c3',
    borderRadius: '4px',
    fontSize: '14px',
  },
};

export default PreferencesForm;

