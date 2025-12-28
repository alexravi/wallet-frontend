import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { savingsService } from '../services/savingsService';
import { accountService } from '../services/accountService';
import { BankAccount, CashWallet } from '../types/account.types';
import { CreateSavingsGoalData } from '../types/savings.types';

const CreateSavingsGoal: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cashWallets, setCashWallets] = useState<CashWallet[]>([]);
  const [formData, setFormData] = useState<CreateSavingsGoalData>({
    goalName: '',
    targetAmount: 0,
    priority: 'medium',
    currency: 'INR',
    accountType: 'all',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [banks, wallets] = await Promise.all([
        accountService.getBankAccounts(),
        accountService.getCashWallets(),
      ]);
      setBankAccounts(banks);
      setCashWallets(wallets);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await savingsService.createSavingsGoal(formData);
      navigate('/savings');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create savings goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Create Savings Goal</h1>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Goal Name *</label>
          <input
            type="text"
            value={formData.goalName}
            onChange={(e) => setFormData({ ...formData, goalName: e.target.value })}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Target Amount *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.targetAmount || ''}
            onChange={(e) =>
              setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })
            }
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Target Date (Optional)</label>
          <input
            type="date"
            value={formData.targetDate || ''}
            onChange={(e) =>
              setFormData({ ...formData, targetDate: e.target.value || undefined })
            }
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Priority *</label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as any })
            }
            required
            style={styles.input}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Account Type</label>
          <select
            value={formData.accountType}
            onChange={(e) =>
              setFormData({ ...formData, accountType: e.target.value as any })
            }
            style={styles.input}
          >
            <option value="all">All Accounts</option>
            <option value="bank">Bank Only</option>
            <option value="cash">Cash Only</option>
          </select>
        </div>

        {formData.accountType === 'bank' && (
          <div style={styles.formGroup}>
            <label>Linked Bank Account (Optional)</label>
            <select
              value={formData.linkedAccountId || ''}
              onChange={(e) =>
                setFormData({ ...formData, linkedAccountId: e.target.value || undefined })
              }
              style={styles.input}
            >
              <option value="">None</option>
              {bankAccounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.bankName} - {acc.accountNumber}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.accountType === 'cash' && (
          <div style={styles.formGroup}>
            <label>Linked Cash Wallet (Optional)</label>
            <select
              value={formData.linkedWalletId || ''}
              onChange={(e) =>
                setFormData({ ...formData, linkedWalletId: e.target.value || undefined })
              }
              style={styles.input}
            >
              <option value="">None</option>
              {cashWallets.map((wallet) => (
                <option key={wallet._id} value={wallet._id}>
                  {wallet.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={styles.formGroup}>
          <label>Currency</label>
          <input
            type="text"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Notes (Optional)</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            style={styles.textarea}
            rows={3}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button type="button" onClick={() => navigate('/savings')} style={styles.buttonSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={styles.buttonPrimary}>
            {loading ? 'Creating...' : 'Create Goal'}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  input: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    backgroundColor: 'white',
  },
  textarea: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
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
  buttonSecondary: {
    padding: '10px 20px',
    backgroundColor: '#6b7280',
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
};

export default CreateSavingsGoal;

