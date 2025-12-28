import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { accountService } from '../services/accountService';
import { cashOperationService } from '../services/cashOperationService';
import { CashWallet, AccountListItem } from '../types/account.types';

const CashOperations: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const walletIdParam = searchParams.get('walletId');
  const actionParam = searchParams.get('action');

  const [wallets, setWallets] = useState<CashWallet[]>([]);
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [activeTab, setActiveTab] = useState<'cashIn' | 'cashOut' | 'transfer'>(actionParam === 'cashIn' ? 'cashIn' : actionParam === 'cashOut' ? 'cashOut' : 'cashIn');
  const [formData, setFormData] = useState({
    walletId: walletIdParam || '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    toAccountId: '',
    fromAccountId: walletIdParam || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletData, accountData] = await Promise.all([
        accountService.getCashWallets(),
        accountService.getAllAccounts(),
      ]);
      setWallets(walletData);
      setAccounts(accountData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    }
  };

  const handleCashIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const wallet = wallets.find((w) => w._id === formData.walletId);
      if (!wallet) throw new Error('Wallet not found');

      await cashOperationService.cashIn({
        walletId: formData.walletId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        currency: wallet.currency,
      });

      setSuccess('Cash in successful!');
      setTimeout(() => {
        navigate('/accounts');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to process cash in');
    } finally {
      setLoading(false);
    }
  };

  const handleCashOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const wallet = wallets.find((w) => w._id === formData.walletId);
      if (!wallet) throw new Error('Wallet not found');

      await cashOperationService.cashOut({
        walletId: formData.walletId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        currency: wallet.currency,
      });

      setSuccess('Cash out successful!');
      setTimeout(() => {
        navigate('/accounts');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to process cash out');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const fromAccount = accounts.find((a) => a.id === formData.fromAccountId);
      if (!fromAccount) throw new Error('Source account not found');

      await cashOperationService.transfer({
        fromAccountId: formData.fromAccountId,
        fromAccountType: fromAccount.type,
        toAccountId: formData.toAccountId,
        toAccountType: accounts.find((a) => a.id === formData.toAccountId)?.type || 'cash',
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        currency: fromAccount.currency,
      });

      setSuccess('Transfer successful!');
      setTimeout(() => {
        navigate('/accounts');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to process transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>
        Cash Operations
      </h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('cashIn')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'cashIn' ? '#007bff' : 'transparent',
            color: activeTab === 'cashIn' ? 'white' : '#007bff',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'cashIn' ? '2px solid #007bff' : 'none',
          }}
        >
          Cash In
        </button>
        <button
          onClick={() => setActiveTab('cashOut')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'cashOut' ? '#007bff' : 'transparent',
            color: activeTab === 'cashOut' ? 'white' : '#007bff',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'cashOut' ? '2px solid #007bff' : 'none',
          }}
        >
          Cash Out
        </button>
        <button
          onClick={() => setActiveTab('transfer')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeTab === 'transfer' ? '#007bff' : 'transparent',
            color: activeTab === 'transfer' ? 'white' : '#007bff',
            border: 'none',
            cursor: 'pointer',
            borderBottom: activeTab === 'transfer' ? '2px solid #007bff' : 'none',
          }}
        >
          Transfer
        </button>
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

      {success && (
        <div
          style={{
            padding: '12px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            color: '#155724',
            marginBottom: '20px',
          }}
        >
          {success}
        </div>
      )}

      {activeTab === 'cashIn' && (
        <form onSubmit={handleCashIn}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Wallet *</label>
            <select
              value={formData.walletId}
              onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            >
              <option value="">-- Select Wallet --</option>
              {wallets.map((w) => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Amount *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            {loading ? 'Processing...' : 'Cash In'}
          </button>
        </form>
      )}

      {activeTab === 'cashOut' && (
        <form onSubmit={handleCashOut}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Wallet *</label>
            <select
              value={formData.walletId}
              onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            >
              <option value="">-- Select Wallet --</option>
              {wallets.map((w) => (
                <option key={w._id} value={w._id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Amount *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            {loading ? 'Processing...' : 'Cash Out'}
          </button>
        </form>
      )}

      {activeTab === 'transfer' && (
        <form onSubmit={handleTransfer}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>From Account *</label>
            <select
              value={formData.fromAccountId}
              onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            >
              <option value="">-- Select Source Account --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>To Account *</label>
            <select
              value={formData.toAccountId}
              onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            >
              <option value="">-- Select Destination Account --</option>
              {accounts.filter((acc) => acc.id !== formData.fromAccountId).map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Amount *</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: 'white' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
            }}
          >
            {loading ? 'Processing...' : 'Transfer'}
          </button>
        </form>
      )}
    </div>
  );
};

export default CashOperations;

