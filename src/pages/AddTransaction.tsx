import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../services/transactionService';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { personService } from '../services/personService';
import { groupService } from '../services/groupService';
import { splitService } from '../services/splitService';
import { AccountListItem, Category, Person, CreateTransactionData, Group, CreateSplitTransactionData } from '../types/account.types';

const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isSplit, setIsSplit] = useState(false);
  const [splitType, setSplitType] = useState<'equal' | 'percentage' | 'custom'>('equal');
  const [splitPersonIds, setSplitPersonIds] = useState<string[]>([]);
  const [splitPercentages, setSplitPercentages] = useState<number[]>([]);
  const [splitCustomAmounts, setSplitCustomAmounts] = useState<number[]>([]);
  const [formData, setFormData] = useState<CreateTransactionData>({
    accountId: '',
    accountType: 'bank',
    type: 'expense',
    amount: 0,
    currency: 'INR',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bankAccounts, cashWallets, cats, persons, groupsData] = await Promise.all([
        accountService.getBankAccounts(),
        accountService.getCashWallets(),
        categoryService.getCategories(),
        personService.getPeople(),
        groupService.getGroups(),
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
      setCategories(cats);
      setPeople(persons);
      setGroups(groupsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (isSplit && splitPersonIds.length > 0) {
        // Create split transaction
        const splitData: CreateSplitTransactionData = {
          ...formData,
          splitType,
          personIds: splitPersonIds,
          percentages: splitType === 'percentage' ? splitPercentages : undefined,
          customAmounts: splitType === 'custom' ? splitCustomAmounts : undefined,
        };
        await splitService.createSplitTransaction(splitData);
      } else {
        // Create regular transaction
        await transactionService.createTransaction(formData);
      }
      navigate('/transactions');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleSplitPersonToggle = (personId: string) => {
    if (splitPersonIds.includes(personId)) {
      setSplitPersonIds(splitPersonIds.filter(id => id !== personId));
      setSplitPercentages(splitPercentages.filter((_, i) => splitPersonIds[i] !== personId));
      setSplitCustomAmounts(splitCustomAmounts.filter((_, i) => splitPersonIds[i] !== personId));
    } else {
      setSplitPersonIds([...splitPersonIds, personId]);
      if (splitType === 'equal') {
        // Will be calculated on submit
      } else if (splitType === 'percentage') {
        setSplitPercentages([...splitPercentages, 0]);
      } else if (splitType === 'custom') {
        setSplitCustomAmounts([...splitCustomAmounts, 0]);
      }
    }
  };

  const handleSplitPercentageChange = (index: number, value: number) => {
    const newPercentages = [...splitPercentages];
    newPercentages[index] = value;
    setSplitPercentages(newPercentages);
  };

  const handleSplitCustomAmountChange = (index: number, value: number) => {
    const newAmounts = [...splitCustomAmounts];
    newAmounts[index] = value;
    setSplitCustomAmounts(newAmounts);
  };

  const handleAccountChange = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (account) {
      setFormData({
        ...formData,
        accountId,
        accountType: account.type,
        currency: account.currency,
      });
    }
  };

  return (
    <div style={styles.container}>
      <h1>Add Transaction</h1>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Account *</label>
          <select
            value={formData.accountId}
            onChange={(e) => handleAccountChange(e.target.value)}
            required
            style={styles.input}
          >
            <option value="">Select Account</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Type *</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            required
            style={styles.input}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label>Amount *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Description *</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Date *</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Category</label>
          <select
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value || undefined })}
            style={styles.input}
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {!isSplit && (
          <div style={styles.formGroup}>
            <label>Person</label>
            <select
              value={formData.personId || ''}
              onChange={(e) => setFormData({ ...formData, personId: e.target.value || undefined })}
              style={styles.input}
            >
              <option value="">No Person</option>
              {people.map((person) => (
                <option key={person._id} value={person._id}>{person.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={styles.formGroup}>
          <label>Group (Optional)</label>
          <select
            value={formData.groupId || ''}
            onChange={(e) => setFormData({ ...formData, groupId: e.target.value || undefined })}
            style={styles.input}
          >
            <option value="">No Group</option>
            {groups.filter(g => g.isActive).map((group) => (
              <option key={group._id} value={group._id}>{group.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={isSplit}
              onChange={(e) => {
                setIsSplit(e.target.checked);
                if (!e.target.checked) {
                  setSplitPersonIds([]);
                  setSplitPercentages([]);
                  setSplitCustomAmounts([]);
                }
              }}
            />
            <span>Split this transaction</span>
          </label>
        </div>

        {isSplit && (
          <div style={{ ...styles.formGroup, border: '1px solid #ddd', padding: '15px', borderRadius: '4px' }}>
            <div style={styles.formGroup}>
              <label>Split Type *</label>
              <select
                value={splitType}
                onChange={(e) => {
                  setSplitType(e.target.value as any);
                  setSplitPercentages([]);
                  setSplitCustomAmounts([]);
                }}
                style={styles.input}
              >
                <option value="equal">Equal Split</option>
                <option value="percentage">Percentage Split</option>
                <option value="custom">Custom Amount Split</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Select People to Split With *</label>
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
                {people.filter(p => p.isActive).map((person) => (
                  <label key={person._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="checkbox"
                      checked={splitPersonIds.includes(person._id)}
                      onChange={() => handleSplitPersonToggle(person._id)}
                    />
                    <span>{person.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {splitType === 'percentage' && splitPersonIds.length > 0 && (
              <div style={styles.formGroup}>
                <label>Percentages (must sum to 100%)</label>
                {splitPersonIds.map((personId, index) => {
                  const person = people.find(p => p._id === personId);
                  return (
                    <div key={personId} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ minWidth: '100px' }}>{person?.name}:</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={splitPercentages[index] || 0}
                        onChange={(e) => handleSplitPercentageChange(index, parseFloat(e.target.value) || 0)}
                        style={{ ...styles.input, flex: 1 }}
                      />
                      <span>%</span>
                    </div>
                  );
                })}
                <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                  Total: {splitPercentages.reduce((a, b) => a + b, 0).toFixed(2)}%
                </div>
              </div>
            )}

            {splitType === 'custom' && splitPersonIds.length > 0 && (
              <div style={styles.formGroup}>
                <label>Custom Amounts (must sum to {formData.amount.toFixed(2)})</label>
                {splitPersonIds.map((personId, index) => {
                  const person = people.find(p => p._id === personId);
                  return (
                    <div key={personId} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ minWidth: '100px' }}>{person?.name}:</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={splitCustomAmounts[index] || 0}
                        onChange={(e) => handleSplitCustomAmountChange(index, parseFloat(e.target.value) || 0)}
                        style={{ ...styles.input, flex: 1 }}
                      />
                    </div>
                  );
                })}
                <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                  Total: {splitCustomAmounts.reduce((a, b) => a + b, 0).toFixed(2)} / {formData.amount.toFixed(2)}
                </div>
              </div>
            )}

            {splitPersonIds.length === 0 && (
              <div style={{ color: '#c00', fontSize: '14px' }}>Please select at least one person to split with</div>
            )}
          </div>
        )}

        <div style={styles.formGroup}>
          <label>Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
            style={styles.input}
            rows={3}
          />
        </div>

        <div style={styles.formGroup}>
          <label>Reference Number</label>
          <input
            type="text"
            value={formData.referenceNumber || ''}
            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value || undefined })}
            style={styles.input}
          />
        </div>

        <div style={styles.formActions}>
          <button type="submit" disabled={loading} style={styles.buttonPrimary}>
            {loading ? 'Creating...' : 'Create Transaction'}
          </button>
          <button type="button" onClick={() => navigate('/transactions')} style={styles.button}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '20px',
    maxWidth: '800px',
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
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    backgroundColor: 'white',
  },
  formActions: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
  },
  buttonPrimary: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    color: '#c00',
    borderRadius: '4px',
    marginBottom: '20px',
  },
};

export default AddTransaction;

