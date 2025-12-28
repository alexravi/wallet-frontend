import React, { useState, useEffect } from 'react';
import { accountService } from '../services/accountService';
import { AccountListItem } from '../types/account.types';
import SummaryCard from '../design-system/components/ui/SummaryCard';
import Card from '../design-system/components/ui/Card';
import LoadingSpinner from '../design-system/components/ui/LoadingSpinner';
import { CreditCard, Wallet } from 'lucide-react';

const AccountDashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAllAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = React.useMemo(() => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const bankAccounts = accounts.filter((acc) => acc.type === 'bank');
    const cashWallets = accounts.filter((acc) => acc.type === 'cash');
    const bankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const cashBalance = cashWallets.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      totalAccounts: accounts.length,
      totalBalance,
      bankAccounts: bankAccounts.length,
      bankBalance,
      cashWallets: cashWallets.length,
      cashBalance,
    };
  }, [accounts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          subtitle={`Across ${stats.totalAccounts} account${stats.totalAccounts !== 1 ? 's' : ''}`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <SummaryCard
          title="Bank Accounts"
          value={stats.bankAccounts}
          subtitle={formatCurrency(stats.bankBalance)}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <SummaryCard
          title="Cash Wallets"
          value={stats.cashWallets}
          subtitle={formatCurrency(stats.cashBalance)}
          icon={<Wallet className="h-5 w-5" />}
        />
        <SummaryCard
          title="Total Accounts"
          value={stats.totalAccounts}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      {/* Account List */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Accounts</h2>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center">
                {account.type === 'bank' ? (
                  <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                ) : (
                  <Wallet className="h-5 w-5 text-gray-400 mr-3" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {account.type === 'bank'
                      ? (account as any).bankName || 'Bank Account'
                      : (account as any).name || 'Cash Wallet'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {account.type === 'bank' && (account as any).accountNumber
                      ? `****${(account as any).accountNumber.slice(-4)}`
                      : 'Cash Wallet'}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-gray-900">
                {formatCurrency(account.balance)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AccountDashboard;

