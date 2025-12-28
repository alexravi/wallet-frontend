import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CashWallet } from '../../types/account.types';

interface CashWalletCardProps {
  wallet: CashWallet;
  onArchive?: (id: string) => void;
  onCashIn?: (id: string) => void;
  onCashOut?: (id: string) => void;
}

const CashWalletCard: React.FC<CashWalletCardProps> = ({
  wallet,
  onArchive,
  onCashIn,
  onCashOut,
}) => {
  const navigate = useNavigate();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: wallet.currency || 'INR',
    }).format(amount);
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '16px',
        backgroundColor: wallet.color || 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: wallet.color ? 'white' : 'inherit',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600' }}>
            {wallet.name}
          </h3>
          <div style={{ marginTop: '12px' }}>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold' }}>
              {formatAmount(wallet.currentBalance)}
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: '12px',
                opacity: 0.8,
              }}
            >
              Current Balance
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => navigate(`/accounts/cash/${wallet._id}/edit`)}
            style={{
              padding: '8px 16px',
              backgroundColor: wallet.color ? 'rgba(255,255,255,0.2)' : '#007bff',
              color: wallet.color ? 'white' : 'white',
              border: wallet.color ? '1px solid rgba(255,255,255,0.3)' : 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Edit
          </button>
          {onCashIn && (
            <button
              onClick={() => onCashIn(wallet._id)}
              style={{
                padding: '8px 16px',
                backgroundColor: wallet.color ? 'rgba(255,255,255,0.2)' : '#28a745',
                color: wallet.color ? 'white' : 'white',
                border: wallet.color ? '1px solid rgba(255,255,255,0.3)' : 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cash In
            </button>
          )}
          {onCashOut && (
            <button
              onClick={() => onCashOut(wallet._id)}
              style={{
                padding: '8px 16px',
                backgroundColor: wallet.color ? 'rgba(255,255,255,0.2)' : '#ffc107',
                color: wallet.color ? 'white' : '#333',
                border: wallet.color ? '1px solid rgba(255,255,255,0.3)' : 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cash Out
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => onArchive(wallet._id)}
              style={{
                padding: '8px 16px',
                backgroundColor: wallet.color ? 'rgba(255,255,255,0.2)' : '#dc3545',
                color: wallet.color ? 'white' : 'white',
                border: wallet.color ? '1px solid rgba(255,255,255,0.3)' : 'none',
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

export default CashWalletCard;

