import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../services/loanService';
import { accountService } from '../services/accountService';
import { personService } from '../services/personService';
import { BankAccount, CashWallet, Person } from '../types/account.types';
import { CreateLoanData } from '../types/loan.types';

const CreateLoan: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cashWallets, setCashWallets] = useState<CashWallet[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [formData, setFormData] = useState<CreateLoanData>({
    loanType: 'borrowed',
    loanCategory: 'bank',
    principal: 0,
    interestType: 'flat',
    interestRate: 0,
    startDate: new Date().toISOString().split('T')[0],
    currency: 'INR',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reset linked account/wallet when category changes
    if (formData.loanCategory === 'bank') {
      setFormData({ ...formData, linkedWalletId: undefined, linkedAccountId: undefined });
    } else {
      setFormData({ ...formData, linkedAccountId: undefined, linkedWalletId: undefined });
    }
  }, [formData.loanCategory]);

  const loadData = async () => {
    try {
      const [banks, wallets, persons] = await Promise.all([
        accountService.getBankAccounts(),
        accountService.getCashWallets(),
        personService.getPeople(),
      ]);
      setBankAccounts(banks);
      setCashWallets(wallets);
      setPeople(persons.filter((p) => p.isActive));
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await loanService.createLoan(formData);
      navigate('/loans');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>Create Loan</h1>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Loan Type *</label>
          <select
            value={formData.loanType}
            onChange={(e) =>
              setFormData({ ...formData, loanType: e.target.value as any })
            }
            required
            style={styles.input}
          >
            <option value="borrowed">Borrowed</option>
            <option value="given">Given</option>
            <option value="hand">Hand Loan</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Loan Category *</label>
          <select
            value={formData.loanCategory}
            onChange={(e) =>
              setFormData({ ...formData, loanCategory: e.target.value as any })
            }
            required
            style={styles.input}
          >
            <option value="bank">Bank</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Principal Amount *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.principal || ''}
            onChange={(e) =>
              setFormData({ ...formData, principal: parseFloat(e.target.value) || 0 })
            }
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Interest Type *</label>
          <select
            value={formData.interestType}
            onChange={(e) =>
              setFormData({ ...formData, interestType: e.target.value as any })
            }
            required
            style={styles.input}
          >
            <option value="flat">Flat</option>
            <option value="simple">Simple</option>
            <option value="compound">Compound</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Interest Rate (%) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.interestRate || ''}
            onChange={(e) =>
              setFormData({ ...formData, interestRate: parseFloat(e.target.value) || 0 })
            }
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Start Date *</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>End Date (Optional)</label>
          <input
            type="date"
            value={formData.endDate || ''}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value || undefined })
            }
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Linked Person (Optional)</label>
          <select
            value={formData.linkedPersonId || ''}
            onChange={(e) =>
              setFormData({ ...formData, linkedPersonId: e.target.value || undefined })
            }
            style={styles.input}
          >
            <option value="">None</option>
            {people.map((person) => (
              <option key={person._id} value={person._id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>

        {formData.loanCategory === 'bank' && (
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

        {formData.loanCategory === 'cash' && (
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

        {formData.loanCategory === 'bank' && (
          <div style={styles.formGroup}>
            <label>Number of EMIs (Optional - for auto-generation)</label>
            <input
              type="number"
              min="1"
              value={formData.numberOfEMIs || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  numberOfEMIs: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              style={styles.input}
            />
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
          <button type="button" onClick={() => navigate('/loans')} style={styles.buttonSecondary}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={styles.buttonPrimary}>
            {loading ? 'Creating...' : 'Create Loan'}
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

export default CreateLoan;

