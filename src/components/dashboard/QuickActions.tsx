import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Quick Actions</h2>
      <div style={styles.actions}>
        <button
          onClick={() => navigate('/transactions/add')}
          style={styles.actionButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#eff6ff';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          <span style={styles.icon}>+</span>
          <div style={styles.buttonContent}>
            <div style={styles.buttonTitle}>Add Transaction</div>
            <div style={styles.buttonSubtitle}>Record income or expense</div>
          </div>
        </button>
        <button
          onClick={() => navigate('/loans/new')}
          style={styles.actionButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#eff6ff';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          <span style={styles.icon}>💰</span>
          <div style={styles.buttonContent}>
            <div style={styles.buttonTitle}>Add Loan</div>
            <div style={styles.buttonSubtitle}>Create new loan record</div>
          </div>
        </button>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginTop: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 16px 0',
  },
  actions: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: '1',
    minWidth: '200px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    backgroundColor: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  icon: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#3b82f6',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
  },
  buttonContent: {
    flex: 1,
  },
  buttonTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  buttonSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
  },
};

export default QuickActions;

