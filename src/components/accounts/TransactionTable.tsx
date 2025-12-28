import React, { useState } from 'react';
import { ParsedTransaction } from '../../types/account.types';
import DuplicateAlert from './DuplicateAlert';

interface TransactionTableProps {
  transactions: ParsedTransaction[];
  onEdit?: (transaction: ParsedTransaction) => void;
  onSelect?: (transactionId: string, selected: boolean) => void;
  selectedIds?: string[];
  showSelect?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onSelect,
  selectedIds = [],
  showSelect = false,
}) => {
  const [sortConfig] = useState<{
    key: keyof ParsedTransaction;
    direction: 'asc' | 'desc';
  } | null>(null);

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div>
      {sortedTransactions.map((transaction) => (
        <div key={transaction._tempId || transaction.date}>
          {transaction.isDuplicate && (
            <DuplicateAlert
              transaction={transaction}
              onSkip={() => {
                if (onSelect && transaction._tempId) {
                  onSelect(transaction._tempId, false);
                }
              }}
              onKeep={() => {
                if (onSelect && transaction._tempId) {
                  onSelect(transaction._tempId, true);
                }
              }}
            />
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: showSelect
                ? 'auto 1fr 1fr 2fr 1fr auto'
                : '1fr 1fr 2fr 1fr auto',
              gap: '16px',
              padding: '12px',
              borderBottom: '1px solid #eee',
              backgroundColor: transaction.isDuplicate ? '#fff3cd' : 'white',
              alignItems: 'center',
            }}
          >
            {showSelect && (
              <input
                type="checkbox"
                checked={selectedIds.includes(transaction._tempId || '')}
                onChange={(e) => {
                  if (onSelect && transaction._tempId) {
                    onSelect(transaction._tempId, e.target.checked);
                  }
                }}
              />
            )}
            <div>{formatDate(transaction.date)}</div>
            <div
              style={{
                color: transaction.type === 'income' ? '#28a745' : '#dc3545',
                fontWeight: '500',
              }}
            >
              {formatAmount(transaction.amount)}
            </div>
            <div>{transaction.description}</div>
            <div>
              <span
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor:
                    transaction.type === 'income' ? '#d4edda' : '#f8d7da',
                  color: transaction.type === 'income' ? '#155724' : '#721c24',
                }}
              >
                {transaction.type}
              </span>
            </div>
            {onEdit && (
              <button
                onClick={() => onEdit(transaction)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Edit
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionTable;

