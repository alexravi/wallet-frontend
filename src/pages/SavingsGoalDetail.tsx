import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { savingsService } from '../services/savingsService';
import { accountService } from '../services/accountService';
import { SavingsGoal, SavingsContribution, AddContributionData, DeviationAlert } from '../types/savings.types';
import { AccountListItem } from '../types/account.types';

const SavingsGoalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [contributions, setContributions] = useState<SavingsContribution[]>([]);
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [deviation, setDeviation] = useState<DeviationAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [contributionData, setContributionData] = useState<AddContributionData>({
    amount: 0,
    contributionDate: new Date().toISOString().split('T')[0],
    createTransaction: true,
  });

  useEffect(() => {
    if (id) {
      loadGoalData();
    }
  }, [id]);

  const loadGoalData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [goalData, contributionsData, deviationData] = await Promise.all([
        savingsService.getSavingsGoalById(id),
        savingsService.getContributions(id),
        savingsService.getDeviationAlerts(id).catch(() => null),
      ]);
      setGoal(goalData);
      setContributions(contributionsData);
      setDeviation(deviationData);

      // Load accounts for contribution form
      const [bankAccounts, cashWallets] = await Promise.all([
        accountService.getBankAccounts(),
        accountService.getCashWallets(),
      ]);
      const allAccounts: AccountListItem[] = [
        ...bankAccounts.map((acc) => ({
          id: acc._id,
          name: `${acc.bankName} - ${acc.accountNumber}`,
          type: 'bank' as const,
          balance: acc.currentBalance,
          currency: acc.currency,
        })),
        ...cashWallets.map((wallet) => ({
          id: wallet._id,
          name: wallet.name,
          type: 'cash' as const,
          balance: wallet.currentBalance,
          currency: wallet.currency,
        })),
      ];
      setAccounts(allAccounts);
    } catch (err: any) {
      setError(err.message || 'Failed to load goal');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setError('');
      await savingsService.addContribution(id, contributionData);
      setShowContributionForm(false);
      setContributionData({
        amount: 0,
        contributionDate: new Date().toISOString().split('T')[0],
        createTransaction: true,
      });
      loadGoalData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to add contribution');
    }
  };

  const handlePauseResume = async () => {
    if (!id || !goal) return;
    try {
      if (goal.status === 'active') {
        await savingsService.pauseGoal(id);
      } else if (goal.status === 'paused') {
        await savingsService.resumeGoal(id);
      }
      loadGoalData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update goal');
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  if (!goal) {
    return <div style={styles.container}>Goal not found</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/savings')} style={styles.backButton}>
          ← Back
        </button>
        <h1>{goal.goalName}</h1>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {deviation && deviation.isDeviating && (
        <div style={styles.alert}>
          <strong>Alert:</strong> {deviation.message}
        </div>
      )}

      <div style={styles.goalInfo}>
        <div style={styles.infoCard}>
          <h3>Goal Information</h3>
          <div style={styles.infoRow}>
            <strong>Status:</strong> {goal.status}
          </div>
          <div style={styles.infoRow}>
            <strong>Priority:</strong> {goal.priority}
          </div>
          <div style={styles.infoRow}>
            <strong>Current Amount:</strong> {goal.currency} {goal.currentAmount.toLocaleString()}
          </div>
          <div style={styles.infoRow}>
            <strong>Target Amount:</strong> {goal.currency} {goal.targetAmount.toLocaleString()}
          </div>
          {goal.targetDate && (
            <div style={styles.infoRow}>
              <strong>Target Date:</strong> {new Date(goal.targetDate).toLocaleDateString()}
            </div>
          )}
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
              {goal.progress?.toFixed(1) || 0}% Complete
            </div>
          </div>
        </div>

        {goal.status === 'active' || goal.status === 'paused' ? (
          <div style={styles.actions}>
            <button
              onClick={() => setShowContributionForm(!showContributionForm)}
              style={styles.buttonPrimary}
            >
              Add Contribution
            </button>
            <button
              onClick={handlePauseResume}
              style={styles.buttonSecondary}
            >
              {goal.status === 'active' ? 'Pause Goal' : 'Resume Goal'}
            </button>
          </div>
        ) : null}
      </div>

      {showContributionForm && (
        <div style={styles.contributionForm}>
          <h3>Add Contribution</h3>
          <form onSubmit={handleAddContribution}>
            <div style={styles.formGroup}>
              <label>Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={contributionData.amount || ''}
                onChange={(e) =>
                  setContributionData({
                    ...contributionData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Contribution Date *</label>
              <input
                type="date"
                value={contributionData.contributionDate}
                onChange={(e) =>
                  setContributionData({ ...contributionData, contributionDate: e.target.value })
                }
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Source Account (Optional)</label>
              <select
                value={contributionData.sourceAccountId || ''}
                onChange={(e) => {
                  const account = accounts.find((a) => a.id === e.target.value);
                  setContributionData({
                    ...contributionData,
                    sourceAccountId: e.target.value || undefined,
                    sourceAccountType: account?.type,
                  });
                }}
                style={styles.input}
              >
                <option value="">None</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={contributionData.createTransaction}
                  onChange={(e) =>
                    setContributionData({
                      ...contributionData,
                      createTransaction: e.target.checked,
                    })
                  }
                />
                Create Transaction
              </label>
            </div>
            <div style={styles.formGroup}>
              <label>Notes (Optional)</label>
              <textarea
                value={contributionData.notes || ''}
                onChange={(e) =>
                  setContributionData({ ...contributionData, notes: e.target.value })
                }
                style={styles.textarea}
                rows={3}
              />
            </div>
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setShowContributionForm(false)}
                style={styles.buttonSecondary}
              >
                Cancel
              </button>
              <button type="submit" style={styles.buttonPrimary}>
                Add Contribution
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.section}>
        <h3>Contribution History</h3>
        {contributions.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Source</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((contribution) => (
                <tr key={contribution._id}>
                  <td>{new Date(contribution.contributionDate).toLocaleDateString()}</td>
                  <td>{goal.currency} {contribution.amount.toLocaleString()}</td>
                  <td>
                    {contribution.sourceAccountId
                      ? accounts.find((a) => a.id === contribution.sourceAccountId)?.name || 'N/A'
                      : 'Manual'}
                  </td>
                  <td>{contribution.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No contributions yet</p>
        )}
      </div>
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
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  alert: {
    padding: '10px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  goalInfo: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  },
  infoCard: {
    flex: 1,
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },
  infoRow: {
    marginBottom: '10px',
  },
  progressContainer: {
    marginTop: '20px',
  },
  progressBar: {
    width: '100%',
    height: '30px',
    backgroundColor: '#e5e7eb',
    borderRadius: '15px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    transition: 'width 0.3s',
  },
  progressText: {
    textAlign: 'center',
    marginTop: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  buttonPrimary: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  buttonSecondary: {
    padding: '10px 20px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  contributionForm: {
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #d1d5db',
    fontFamily: 'inherit',
    backgroundColor: 'white',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  section: {
    marginTop: '30px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
};

export default SavingsGoalDetail;

