import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, AccountListItem } from '../../types/account.types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  accounts?: AccountListItem[];
  loading?: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  accounts = [],
  loading = false,
}) => {
  const navigate = useNavigate();

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

  const getAccountName = (transaction: Transaction) => {
    if (accounts.length > 0) {
      const account = accounts.find(acc => acc.id === transaction.accountId);
      if (account) {
        return account.name;
      }
    }
    // Fallback
    if (transaction.accountType === 'bank') {
      return 'Bank Account';
    }
    return 'Cash Wallet';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Recent Transactions</h2>
        </div>
        <div style={styles.loading}>Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Recent Transactions</h2>
        </div>
        <div style={styles.empty}>No recent transactions</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Recent Transactions</h2>
        <button
          onClick={() => navigate('/transactions')}
          style={styles.viewAllButton}
        >
          View All →
        </button>
      </div>
      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <div style={styles.colDate}>Date</div>
          <div style={styles.colDescription}>Description</div>
          <div style={styles.colAccount}>Account</div>
          <div style={styles.colType}>Type</div>
          <div style={styles.colAmount}>Amount</div>
        </div>
        {transactions.map((tx) => (
          <div
            key={tx._id}
            style={styles.tableRow}
            onClick={() => navigate(`/transactions/${tx._id}/edit`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={styles.colDate}>{formatDate(tx.date)}</div>
            <div style={styles.colDescription}>
              <div style={styles.descriptionText}>{tx.description}</div>
              {tx.notes && (
                <div style={styles.notes}>{tx.notes}</div>
              )}
            </div>
            <div style={styles.colAccount}>{getAccountName(tx)}</div>
            <div style={styles.colType}>
              <span style={{
                ...styles.typeBadge,
                ...(tx.type === 'income' ? styles.typeIncome :
                  tx.type === 'expense' ? styles.typeExpense : styles.typeTransfer)
              }}>
                {tx.type}
              </span>
            </div>
            <div style={{
              ...styles.colAmount,
              color: tx.type === 'income' ? '#10b981' :
                tx.type === 'expense' ? '#ef4444' : '#3b82f6',
            }}>
              {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
              {formatCurrency(tx.amount, tx.currency)}
            </div>
          </div>
        ))}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  viewAllButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr 120px 100px 120px',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#6b7280',
    letterSpacing: '0.5px',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr 120px 100px 120px',
    gap: '12px',
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  colDate: {
    fontSize: '14px',
    color: '#6b7280',
  },
  colDescription: {
    fontSize: '14px',
    color: '#111827',
  },
  descriptionText: {
    fontWeight: '500',
  },
  notes: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '4px',
  },
  colAccount: {
    fontSize: '14px',
    color: '#6b7280',
  },
  colType: {
    fontSize: '14px',
  },
  typeBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  typeIncome: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  typeExpense: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  typeTransfer: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  colAmount: {
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'right',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
  },
  empty: {
    padding: '40px',
    textAlign: 'center',
    color: '#9ca3af',
  },
};

export default RecentTransactions;

