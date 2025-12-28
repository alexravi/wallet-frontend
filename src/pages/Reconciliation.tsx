import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cashOperationService } from '../services/cashOperationService';
import { ReconciliationData } from '../types/account.types';

const Reconciliation: React.FC = () => {
  const navigate = useNavigate();
  const { walletId } = useParams<{ walletId: string }>();
  const [reconciliation, setReconciliation] = useState<ReconciliationData | null>(null);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (walletId) {
      loadReconciliation();
    }
  }, [walletId, month, year]);

  const loadReconciliation = async () => {
    if (!walletId) return;
    
    try {
      setLoading(true);
      const data = await cashOperationService.getReconciliation(walletId, month, year);
      setReconciliation(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reconciliation data');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!walletId) return;
    
    try {
      await cashOperationService.completeReconciliation(walletId);
      navigate('/accounts');
    } catch (err: any) {
      setError(err.message || 'Failed to complete reconciliation');
    }
  };

  const formatAmount = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!reconciliation) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No data available</div>;
  }

  const hasDiscrepancy = Math.abs(reconciliation.discrepancy) > 0.01;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Monthly Reconciliation - {reconciliation.wallet.name}
      </h1>

      <div style={{ marginBottom: '30px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label>
          Month:
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            style={{ marginLeft: '8px', padding: '8px' }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </label>
        <label>
          Year:
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{ marginLeft: '8px', padding: '8px' }}
          />
        </label>
      </div>

      {error && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {hasDiscrepancy && (
        <div
          style={{
            padding: '16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            marginBottom: '20px',
          }}
        >
          <strong>⚠️ Discrepancy Detected!</strong>
          <p>Expected: {formatAmount(reconciliation.expectedBalance, reconciliation.wallet.currency)}</p>
          <p>Actual: {formatAmount(reconciliation.actualBalance, reconciliation.wallet.currency)}</p>
          <p>Difference: {formatAmount(reconciliation.discrepancy, reconciliation.wallet.currency)}</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '30px' }}>
        <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Opening Balance</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {formatAmount(reconciliation.openingBalance, reconciliation.wallet.currency)}
          </div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#d4edda', borderRadius: '4px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Cash In</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {formatAmount(reconciliation.summary.totalCashIn, reconciliation.wallet.currency)}
          </div>
        </div>
        <div style={{ padding: '16px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Total Cash Out</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {formatAmount(reconciliation.summary.totalCashOut, reconciliation.wallet.currency)}
          </div>
        </div>
        <div style={{ padding: '16px', backgroundColor: hasDiscrepancy ? '#fff3cd' : '#d1ecf1', borderRadius: '4px' }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Expected Balance</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {formatAmount(reconciliation.expectedBalance, reconciliation.wallet.currency)}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
          Transactions ({reconciliation.summary.transactionCount})
        </h2>
        <div style={{ border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {reconciliation.transactions.map((tx) => (
                <tr key={tx._id}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{formatDate(tx.date)}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor:
                          tx.type === 'income' ? '#d4edda' : tx.type === 'expense' ? '#f8d7da' : '#d1ecf1',
                        color:
                          tx.type === 'income' ? '#155724' : tx.type === 'expense' ? '#721c24' : '#0c5460',
                      }}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      borderBottom: '1px solid #ddd',
                      textAlign: 'right',
                      color: tx.type === 'income' ? '#28a745' : '#dc3545',
                      fontWeight: '500',
                    }}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatAmount(tx.amount, reconciliation.wallet.currency)}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>{tx.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate('/accounts')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Mark as Complete
        </button>
      </div>
    </div>
  );
};

export default Reconciliation;

