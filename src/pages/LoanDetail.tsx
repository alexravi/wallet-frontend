import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loanService } from '../services/loanService';
import { emiService } from '../services/emiService';
import { Loan, LoanPayment, EMISchedule } from '../types/loan.types';
import { RecordPaymentData } from '../types/loan.types';

const LoanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [_payments, _setPayments] = useState<LoanPayment[]>([]);
  const [emiSchedule, setEmiSchedule] = useState<EMISchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState<RecordPaymentData>({
    paymentType: 'partial',
    amount: 0,
    principalAmount: 0,
    interestAmount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (id) {
      loadLoanData();
    }
  }, [id]);

  const loadLoanData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [loanData, emiData] = await Promise.all([
        loanService.getLoanById(id),
        emiService.getEMISchedule(id).catch(() => []),
      ]);
      setLoan(loanData);
      setEmiSchedule(emiData);
      // Payments would be loaded separately if endpoint exists
    } catch (err: any) {
      setError(err.message || 'Failed to load loan');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      setError('');
      await loanService.recordPayment(id, paymentData);
      setShowPaymentForm(false);
      setPaymentData({
        paymentType: 'partial',
        amount: 0,
        principalAmount: 0,
        interestAmount: 0,
        paymentDate: new Date().toISOString().split('T')[0],
      });
      loadLoanData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to record payment');
    }
  };

  const handleCloseLoan = async (writeOff: boolean) => {
    if (!id || !window.confirm(`Are you sure you want to ${writeOff ? 'write off' : 'close'} this loan?`)) {
      return;
    }
    try {
      await loanService.closeLoan(id, writeOff);
      loadLoanData();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to close loan');
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  if (!loan) {
    return <div style={styles.container}>Loan not found</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/loans')} style={styles.backButton}>
          ← Back
        </button>
        <h1>Loan Details</h1>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.loanInfo}>
        <div style={styles.infoCard}>
          <h3>Loan Information</h3>
          <div style={styles.infoRow}>
            <strong>Type:</strong> {loan.loanType}
          </div>
          <div style={styles.infoRow}>
            <strong>Category:</strong> {loan.loanCategory}
          </div>
          <div style={styles.infoRow}>
            <strong>Principal:</strong> {loan.currency} {loan.principal.toLocaleString()}
          </div>
          <div style={styles.infoRow}>
            <strong>Outstanding:</strong> {loan.currency} {loan.outstandingAmount.toLocaleString()}
          </div>
          <div style={styles.infoRow}>
            <strong>Total Paid:</strong> {loan.currency} {loan.totalPaid.toLocaleString()}
          </div>
          <div style={styles.infoRow}>
            <strong>Interest Rate:</strong> {loan.interestRate}% ({loan.interestType})
          </div>
          <div style={styles.infoRow}>
            <strong>Status:</strong> {loan.status}
          </div>
        </div>

        {loan.status === 'active' && (
          <div style={styles.actions}>
            <button
              onClick={() => setShowPaymentForm(!showPaymentForm)}
              style={styles.buttonPrimary}
            >
              Record Payment
            </button>
            <button
              onClick={() => handleCloseLoan(false)}
              style={styles.buttonSecondary}
            >
              Close Loan
            </button>
            <button
              onClick={() => handleCloseLoan(true)}
              style={styles.buttonDanger}
            >
              Write Off
            </button>
          </div>
        )}
      </div>

      {showPaymentForm && (
        <div style={styles.paymentForm}>
          <h3>Record Payment</h3>
          <form onSubmit={handleRecordPayment}>
            <div style={styles.formGroup}>
              <label>Payment Type *</label>
              <select
                value={paymentData.paymentType}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, paymentType: e.target.value as any })
                }
                required
                style={styles.input}
              >
                <option value="emi">EMI</option>
                <option value="partial">Partial</option>
                <option value="prepayment">Prepayment</option>
                <option value="irregular">Irregular</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={paymentData.amount || ''}
                onChange={(e) => {
                  const amount = parseFloat(e.target.value) || 0;
                  setPaymentData({
                    ...paymentData,
                    amount,
                    principalAmount: amount * 0.8, // Default split
                    interestAmount: amount * 0.2,
                  });
                }}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Principal Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={paymentData.principalAmount || ''}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    principalAmount: parseFloat(e.target.value) || 0,
                  })
                }
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Interest Amount *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={paymentData.interestAmount || ''}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    interestAmount: parseFloat(e.target.value) || 0,
                  })
                }
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Payment Date *</label>
              <input
                type="date"
                value={paymentData.paymentDate}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, paymentDate: e.target.value })
                }
                required
                style={styles.input}
              />
            </div>
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                style={styles.buttonSecondary}
              >
                Cancel
              </button>
              <button type="submit" style={styles.buttonPrimary}>
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {emiSchedule.length > 0 && (
        <div style={styles.section}>
          <h3>EMI Schedule</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>EMI #</th>
                <th>Due Date</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {emiSchedule.map((emi) => (
                <tr key={emi._id}>
                  <td>{emi.emiNumber}</td>
                  <td>{new Date(emi.dueDate).toLocaleDateString()}</td>
                  <td>{emi.principalAmount.toLocaleString()}</td>
                  <td>{emi.interestAmount.toLocaleString()}</td>
                  <td>{emi.totalAmount.toLocaleString()}</td>
                  <td>{emi.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
    alignItems: 'center',
    gap: '20px',
    marginBottom: '20px',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  error: {
    padding: '10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  loanInfo: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  },
  infoCard: {
    flex: 1,
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
  },
  infoRow: {
    marginBottom: '10px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  buttonPrimary: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  buttonSecondary: {
    padding: '10px 20px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  buttonDanger: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  paymentForm: {
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  section: {
    marginTop: '30px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
};

export default LoanDetail;

