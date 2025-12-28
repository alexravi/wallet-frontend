import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { statementService } from '../services/statementService';
import { ParsedTransaction, BankStatement } from '../types/account.types';
import TransactionTable from '../components/accounts/TransactionTable';

const TransactionReview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [statement, setStatement] = useState<BankStatement | null>(null);
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadTransactions();
    }
  }, [id]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const result = await statementService.getParsedTransactions(id!);
      setStatement(result.statement);
      setTransactions(result.transactions);
      // Auto-select non-duplicate transactions
      const nonDuplicateIds = result.transactions
        .filter((tx) => !tx.isDuplicate && tx._tempId)
        .map((tx) => tx._tempId!);
      setSelectedIds(nonDuplicateIds);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (transactionId: string, selected: boolean) => {
    if (selected) {
      setSelectedIds([...selectedIds, transactionId]);
    } else {
      setSelectedIds(selectedIds.filter((id) => id !== transactionId));
    }
  };

  const handleSelectAll = () => {
    const allIds = transactions
      .filter((tx) => !tx.isDuplicate || !skipDuplicates)
      .map((tx) => tx._tempId!)
      .filter(Boolean);
    setSelectedIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleImport = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one transaction to import');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const result = await statementService.confirmParsedTransactions(
        id!,
        selectedIds,
        skipDuplicates
      );
      navigate('/accounts', {
        state: {
          message: `Successfully imported ${result.created} transactions`,
        },
      });
    } catch (err: any) {
      setError(err.message || 'Failed to import transactions');
      setImporting(false);
    }
  };

  const duplicateCount = transactions.filter((tx) => tx.isDuplicate).length;
  const newTransactions = transactions.filter((tx) => !tx.isDuplicate);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Review Transactions
      </h1>

      {statement && (
        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <p><strong>File:</strong> {statement.fileName}</p>
          <p><strong>Total Transactions:</strong> {statement.transactionCount}</p>
          <p><strong>Duplicates Found:</strong> {duplicateCount}</p>
          <p><strong>New Transactions:</strong> {newTransactions.length}</p>
        </div>
      )}

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

      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={skipDuplicates}
            onChange={(e) => setSkipDuplicates(e.target.checked)}
          />
          <span>Skip duplicates automatically</span>
        </label>
        <button
          onClick={handleSelectAll}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Select All
        </button>
        <button
          onClick={handleDeselectAll}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Deselect All
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <TransactionTable
          transactions={transactions}
          onSelect={handleSelect}
          selectedIds={selectedIds}
          showSelect={true}
        />
      </div>

      <div
        style={{
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px',
          marginBottom: '20px',
        }}
      >
        <p><strong>Selected:</strong> {selectedIds.length} transactions</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => navigate('/accounts')}
          disabled={importing}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: importing ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={importing || selectedIds.length === 0}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: importing || selectedIds.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: importing || selectedIds.length === 0 ? 0.6 : 1,
          }}
        >
          {importing ? 'Importing...' : `Import Selected (${selectedIds.length})`}
        </button>
      </div>
    </div>
  );
};

export default TransactionReview;

