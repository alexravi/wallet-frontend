import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { transactionService } from '../services/transactionService';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { personService } from '../services/personService';
import { AccountListItem, Category, Person, Transaction, CreateTransactionData } from '../types/account.types';

const EditTransaction: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string>('');
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [formData, setFormData] = useState<Partial<CreateTransactionData>>({});

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [tx, bankAccounts, cashWallets, cats, persons] = await Promise.all([
        transactionService.getTransactionById(id!),
        accountService.getBankAccounts(),
        accountService.getCashWallets(),
        categoryService.getCategories(),
        personService.getPeople(),
      ]);

      setTransaction(tx);

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

      if (tx) {
        setFormData({
          accountId: tx.accountId,
          accountType: tx.accountType,
          type: tx.type,
          amount: tx.amount,
          currency: tx.currency,
          description: tx.description,
          category: typeof tx.category === 'object' ? tx.category._id : tx.category,
          personId: typeof tx.personId === 'object' ? tx.personId._id : tx.personId,
          notes: tx.notes,
          date: tx.date.split('T')[0],
          referenceNumber: tx.referenceNumber,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      await transactionService.updateTransaction(id, formData);
      navigate('/transactions');
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div style={styles.container}>Loading...</div>;
  }

  if (!transaction) {
    return <div style={styles.container}>Transaction not found</div>;
  }

  return (
    <div style={styles.container}>
      <h1>Edit Transaction</h1>
      {error && <div style={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>Account *</label>
          <select
            value={formData.accountId || ''}
            onChange={(e) => {
              const account = accounts.find((acc) => acc.id === e.target.value);
              setFormData({
                ...formData,
                accountId: e.target.value,
                accountType: account?.type,
                currency: account?.currency,
              });
            }}
            required
            style={styles.input}
          >
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
            {loading ? 'Updating...' : 'Update Transaction'}
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

export default EditTransaction;

