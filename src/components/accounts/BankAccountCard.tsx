import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BankAccount } from '../../types/account.types';

interface BankAccountCardProps {
  account: BankAccount;
  onArchive?: (id: string) => void;
  onUploadStatement?: (id: string) => void;
}

const BankAccountCard: React.FC<BankAccountCardProps> = ({
  account,
  onArchive,
  onUploadStatement,
}) => {
  const navigate = useNavigate();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: account.currency || 'INR',
    }).format(amount);
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>
            {account.bankName}
          </h3>
          <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>
            {account.accountNumber}
          </p>
          <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>
            {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account
          </p>
          {account.branchName && (
            <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#666' }}>
              {account.branchName}
            </p>
          )}
          <div style={{ marginTop: '12px' }}>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
              {formatAmount(account.currentBalance)}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#999' }}>
              Current Balance
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => navigate(`/accounts/bank/${account._id}/edit`)}
            style={{
              padding: '8px 16px',
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
          {onUploadStatement && (
            <button
              onClick={() => onUploadStatement(account._id)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Upload Statement
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => onArchive(account._id)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Archive
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccountCard;

