import React from 'react';
import { ParsedTransaction } from '../../types/account.types';

interface DuplicateAlertProps {
  transaction: ParsedTransaction;
  onSkip: () => void;
  onKeep: () => void;
}

const DuplicateAlert: React.FC<DuplicateAlertProps> = ({
  transaction,
  onSkip,
  onKeep,
}) => {
  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        marginBottom: '8px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ color: '#856404' }}>⚠️ Duplicate Transaction Detected</strong>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#856404' }}>
            This transaction appears to already exist in your records.
            {transaction.matchingTransactionId && (
              <span> Matching transaction ID: {transaction.matchingTransactionId}</span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onSkip}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Skip
          </button>
          <button
            onClick={onKeep}
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
            Keep
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateAlert;

