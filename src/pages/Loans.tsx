import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../services/loanService';
import { Loan } from '../types/loan.types';

const Loans: React.FC = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState<{
    loanType?: 'borrowed' | 'given' | 'hand';
    loanCategory?: 'bank' | 'cash';
    status?: 'active' | 'closed' | 'written-off';
  }>({});

  useEffect(() => {
    loadLoans();
  }, [filters]);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await loanService.getLoans(filters);
      setLoans(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e';
      case 'closed':
        return '#6b7280';
      case 'written-off':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getLoanTypeLabel = (type: string) => {
    switch (type) {
      case 'borrowed':
        return 'Borrowed';
      case 'given':
        return 'Given';
      case 'hand':
        return 'Hand Loan';
      default:
        return type;
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Loans</h1>
        <button
          onClick={() => navigate('/loans/new')}
          style={styles.buttonPrimary}
        >
          + Create Loan
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.filters}>
        <select
          value={filters.loanType || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              loanType: e.target.value as any || undefined,
            })
          }
          style={styles.select}
        >
          <option value="">All Types</option>
          <option value="borrowed">Borrowed</option>
          <option value="given">Given</option>
          <option value="hand">Hand Loan</option>
        </select>

        <select
          value={filters.loanCategory || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              loanCategory: e.target.value as any || undefined,
            })
          }
          style={styles.select}
        >
          <option value="">All Categories</option>
          <option value="bank">Bank</option>
          <option value="cash">Cash</option>
        </select>

        <select
          value={filters.status || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value as any || undefined,
            })
          }
          style={styles.select}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="closed">Closed</option>
          <option value="written-off">Written Off</option>
        </select>
      </div>

      <div style={styles.loansGrid}>
        {loans.map((loan) => (
          <div
            key={loan._id}
            style={styles.loanCard}
            onClick={() => navigate(`/loans/${loan._id}`)}
          >
            <div style={styles.loanHeader}>
              <h3>{getLoanTypeLabel(loan.loanType)}</h3>
              <span
                style={{
                  ...styles.statusBadge,
                  backgroundColor: getStatusColor(loan.status),
                }}
              >
                {loan.status}
              </span>
            </div>
            <div style={styles.loanInfo}>
              <div>
                <strong>Principal:</strong> {loan.currency} {loan.principal.toLocaleString()}
              </div>
              <div>
                <strong>Outstanding:</strong> {loan.currency}{' '}
                {loan.outstandingAmount.toLocaleString()}
              </div>
              <div>
                <strong>Category:</strong> {loan.loanCategory}
              </div>
              <div>
                <strong>Interest:</strong> {loan.interestRate}% ({loan.interestType})
              </div>
            </div>
          </div>
        ))}
      </div>

      {loans.length === 0 && !loading && (
        <div style={styles.empty}>No loans found</div>
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
  buttonPrimary: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  select: {
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  loansGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  loanCard: {
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s',
  },
  loanHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  loanInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#6b7280',
  },
};

export default Loans;

