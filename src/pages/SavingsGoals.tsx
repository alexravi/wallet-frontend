import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savingsService } from '../services/savingsService';
import { SavingsGoal } from '../types/savings.types';

const SavingsGoals: React.FC = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<{
    status?: 'active' | 'paused' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high';
  }>({});

  useEffect(() => {
    loadGoals();
  }, [filters]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await savingsService.getSavingsGoals(filters);
      setGoals(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load savings goals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'paused':
        return '#f59e0b';
      case 'completed':
        return '#3b82f6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Savings Goals</h1>
        <button
          onClick={() => navigate('/savings/new')}
          style={styles.buttonPrimary}
        >
          + Create Goal
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.filters}>
        <select
          value={filters.status || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value as any || undefined,
            })
          }
          style={styles.select}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.priority || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              priority: e.target.value as any || undefined,
            })
          }
          style={styles.select}
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div style={styles.goalsGrid}>
        {goals.map((goal) => (
          <div
            key={goal._id}
            style={styles.goalCard}
            onClick={() => navigate(`/savings/${goal._id}`)}
          >
            <div style={styles.goalHeader}>
              <h3>{goal.goalName}</h3>
              <div style={styles.badges}>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: getStatusColor(goal.status),
                  }}
                >
                  {goal.status}
                </span>
                <span
                  style={{
                    ...styles.badge,
                    backgroundColor: getPriorityColor(goal.priority),
                  }}
                >
                  {goal.priority}
                </span>
              </div>
            </div>
            <div style={styles.progressContainer}>
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${goal.progress || 0}%`,
                  }}
                />
              </div>
              <div style={styles.progressText}>
                {goal.progress?.toFixed(1) || 0}%
              </div>
            </div>
            <div style={styles.goalInfo}>
              <div>
                <strong>Current:</strong> {goal.currency} {goal.currentAmount.toLocaleString()}
              </div>
              <div>
                <strong>Target:</strong> {goal.currency} {goal.targetAmount.toLocaleString()}
              </div>
              {goal.targetDate && (
                <div>
                  <strong>Target Date:</strong> {new Date(goal.targetDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && !loading && (
        <div style={styles.empty}>No savings goals found</div>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  buttonPrimary: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  select: {
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  goalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  goalCard: {
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  goalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  badges: {
    display: 'flex',
    gap: '8px',
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  progressContainer: {
    marginBottom: '15px',
  },
  progressBar: {
    width: '100%',
    height: '20px',
    backgroundColor: '#e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    transition: 'width 0.3s',
  },
  progressText: {
    textAlign: 'right',
    marginTop: '5px',
    fontSize: '14px',
    color: '#6b7280',
  },
  goalInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
  },
};

export default SavingsGoals;

