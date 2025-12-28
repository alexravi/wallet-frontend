import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../services/accountService';
import { BankAccount, CashWallet } from '../types/account.types';
import BankAccountCard from '../components/accounts/BankAccountCard';
import CashWalletCard from '../components/accounts/CashWalletCard';

const Accounts: React.FC = () => {
  const navigate = useNavigate();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cashWallets, setCashWallets] = useState<CashWallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const [banks, wallets] = await Promise.all([
        accountService.getBankAccounts(),
        accountService.getCashWallets(),
      ]);
      setBankAccounts(banks);
      setCashWallets(wallets);
    } catch (err: any) {
      setError(err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveBank = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this bank account?')) {
      try {
        await accountService.archiveBankAccount(id);
        await loadAccounts();
      } catch (err: any) {
        setError(err.message || 'Failed to archive account');
      }
    }
  };

  const handleArchiveWallet = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this cash wallet?')) {
      try {
        await accountService.archiveCashWallet(id);
        await loadAccounts();
      } catch (err: any) {
        setError(err.message || 'Failed to archive wallet');
      }
    }
  };

  const handleUploadStatement = (accountId: string) => {
    navigate(`/accounts/statement/upload?accountId=${accountId}`);
  };

  const handleCashIn = (walletId: string) => {
    navigate(`/accounts/cash/operations?walletId=${walletId}&action=cashIn`);
  };

  const handleCashOut = (walletId: string) => {
    navigate(`/accounts/cash/operations?walletId=${walletId}&action=cashOut`);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Accounts</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/accounts/bank/new')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            + Add Bank Account
          </button>
          <button
            onClick={() => navigate('/accounts/cash/new')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
            }}
          >
            + Add Cash Wallet
          </button>
        </div>
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

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Bank Accounts</h2>
        {bankAccounts.length === 0 ? (
          <p style={{ color: '#666' }}>No bank accounts yet. Add one to get started.</p>
        ) : (
          bankAccounts.map((account) => (
            <BankAccountCard
              key={account._id}
              account={account}
              onArchive={handleArchiveBank}
              onUploadStatement={handleUploadStatement}
            />
          ))
        )}
      </div>

      <div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>Cash Wallets</h2>
        {cashWallets.length === 0 ? (
          <p style={{ color: '#666' }}>No cash wallets yet. Add one to get started.</p>
        ) : (
          cashWallets.map((wallet) => (
            <CashWalletCard
              key={wallet._id}
              wallet={wallet}
              onArchive={handleArchiveWallet}
              onCashIn={handleCashIn}
              onCashOut={handleCashOut}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Accounts;

