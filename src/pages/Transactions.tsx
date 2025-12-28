import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService, TransactionFilters } from '../services/transactionService';
import { Transaction } from '../types/account.types';
import { accountService } from '../services/accountService';
import { AccountListItem } from '../types/account.types';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'daily'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  useEffect(() => {
    loadAccounts();
    if (viewMode === 'daily') {
      loadDailyTransactions();
    } else {
      loadTransactions();
    }
  }, [viewMode, selectedDate, filters, includeDeleted]);

  const loadAccounts = async () => {
    try {
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
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const loadDailyTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getDailyTransactions(selectedDate, includeDeleted);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionService.getTransactions({ ...filters, includeDeleted });
      setTransactions(response.transactions);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Transactions</h1>
        <div style={styles.actions}>
          <button onClick={() => navigate('/transactions/add')} style={styles.buttonPrimary}>
            + Add Transaction
          </button>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setViewMode('daily')}
          style={{ ...styles.tab, ...(viewMode === 'daily' ? styles.tabActive : {}) }}
        >
          Daily View
        </button>
        <button
          onClick={() => setViewMode('list')}
          style={{ ...styles.tab, ...(viewMode === 'list' ? styles.tabActive : {}) }}
        >
          List View
        </button>
      </div>

      {viewMode === 'daily' && (
        <div style={styles.dailyControls}>
          <button onClick={() => handleDateChange(-1)} style={styles.button}>← Previous</button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={styles.dateInput}
          />
          <button onClick={() => handleDateChange(1)} style={styles.button}>Next →</button>
          <button onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])} style={styles.button}>
            Today
          </button>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
            />
            Include Deleted
          </label>
        </div>
      )}

      {viewMode === 'list' && (
        <div style={styles.filters}>
          <select
            value={filters.accountId || ''}
            onChange={(e) => setFilters({ ...filters, accountId: e.target.value || undefined })}
            style={styles.filterInput}
          >
            <option value="">All Accounts</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
            style={styles.filterInput}
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
            />
            Include Deleted
          </label>
        </div>
      )}

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : transactions.length === 0 ? (
        <div style={styles.empty}>No transactions found</div>
      ) : (
        <div style={styles.transactionsList}>
          {transactions.map((tx) => (
            <div
              key={tx._id}
              style={{
                ...styles.transactionCard,
                ...(tx.deletedAt ? styles.deletedCard : {}),
              }}
            >
              <div style={styles.transactionHeader}>
                <div>
                  <strong>{tx.description}</strong>
                  {tx.deletedAt && <span style={styles.deletedBadge}>Deleted</span>}
                </div>
                <div style={{
                  ...styles.amount,
                  color: tx.type === 'income' ? '#28a745' : tx.type === 'expense' ? '#dc3545' : '#007bff',
                }}>
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                  {formatCurrency(tx.amount, tx.currency)}
                </div>
              </div>
              <div style={styles.transactionDetails}>
                <div>{formatDate(tx.date)} {formatTime(tx.date)}</div>
                {tx.category && (
                  <div>
                    Category: {typeof tx.category === 'object' ? tx.category.name : tx.category}
                  </div>
                )}
                {tx.personId && (
                  <div>
                    Person: {typeof tx.personId === 'object' ? tx.personId.name : tx.personId}
                  </div>
                )}
                {tx.notes && <div>{tx.notes}</div>}
                <div style={styles.transactionActions}>
                  <button onClick={() => navigate(`/transactions/${tx._id}/edit`)} style={styles.smallButton}>
                    Edit
                  </button>
                  {tx.deletedAt ? (
                    <button onClick={async () => {
                      try {
                        await transactionService.restoreTransaction(tx._id);
                        loadDailyTransactions();
                      } catch (err: any) {
                        setError(err.message);
                      }
                    }} style={styles.smallButton}>
                      Restore
                    </button>
                  ) : (
                    <button onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this transaction?')) {
                        try {
                          await transactionService.deleteTransaction(tx._id);
                          loadDailyTransactions();
                        } catch (err: any) {
                          setError(err.message);
                        }
                      }
                    }} style={styles.smallButton}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
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
  actions: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    padding: '8px 16px',
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
  tabs: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid #ddd',
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    borderBottomColor: '#007bff',
    color: '#007bff',
  },
  dailyControls: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '20px',
  },
  dateInput: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    alignItems: 'center',
  },
  filterInput: {
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee',
    color: '#c00',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
  },
  transactionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  transactionCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  deletedCard: {
    opacity: 0.6,
    backgroundColor: '#f5f5f5',
  },
  transactionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  deletedBadge: {
    marginLeft: '10px',
    padding: '2px 8px',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '4px',
    fontSize: '12px',
  },
  amount: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  transactionDetails: {
    fontSize: '14px',
    color: '#666',
  },
  transactionActions: {
    display: 'flex',
    gap: '5px',
    marginTop: '10px',
  },
  smallButton: {
    padding: '5px 10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    backgroundColor: 'white',
  },
};

export default Transactions;

