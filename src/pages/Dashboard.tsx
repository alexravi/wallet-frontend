import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import { loanService } from '../services/loanService';
import { AccountListItem, Transaction } from '../types/account.types';
import { Loan } from '../types/loan.types';
import SummaryCard from '../design-system/components/ui/SummaryCard';
import Card from '../design-system/components/ui/Card';
import Table from '../design-system/components/ui/Table';
import LoadingSpinner from '../design-system/components/ui/LoadingSpinner';
import Button from '../design-system/components/ui/Button';
import Badge from '../design-system/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, CreditCard, Plus, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Data state
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Summary state
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [activeLoansCount, setActiveLoansCount] = useState(0);
  const [outstandingLoans, setOutstandingLoans] = useState(0);
  const [monthlyTransactionCount, setMonthlyTransactionCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all data in parallel
      const [allAccounts, transactionsData, loansData] = await Promise.all([
        accountService.getAllAccounts(),
        transactionService.getTransactions({ limit: 10 }),
        loanService.getLoans(),
      ]);

      setAccounts(allAccounts);
      setTransactions(transactionsData.transactions);

      // Calculate summaries
      calculateSummaries(allAccounts, transactionsData.transactions, loansData);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaries = (
    allAccounts: AccountListItem[],
    _recentTransactions: Transaction[],
    allLoans: Loan[]
  ) => {
    // Calculate total balance
    const balance = allAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    setTotalBalance(balance);

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Fetch all transactions for current month to calculate income/expense
    transactionService.getTransactions({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
    }).then((response) => {
      const monthlyTransactions = response.transactions;
      
      // Calculate monthly income and expense
      const income = monthlyTransactions
        .filter(t => t.type === 'income' && !t.deletedAt)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = monthlyTransactions
        .filter(t => t.type === 'expense' && !t.deletedAt)
        .reduce((sum, t) => sum + t.amount, 0);

      setMonthlyIncome(income);
      setMonthlyExpense(expense);
      setMonthlyTransactionCount(monthlyTransactions.filter(t => !t.deletedAt).length);
    }).catch((err) => {
      console.error('Failed to load monthly transactions:', err);
    });

    // Calculate active loans
    const activeLoans = allLoans.filter(loan => loan.status === 'active');
    setActiveLoansCount(activeLoans.length);
    
    const outstanding = activeLoans.reduce((sum, loan) => sum + loan.outstandingAmount, 0);
    setOutstandingLoans(outstanding);
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getCurrency = () => {
    if (accounts.length > 0) {
      return accounts[0].currency;
    }
    return 'INR';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getAccountName = (transaction: Transaction) => {
    if (accounts.length > 0) {
      const account = accounts.find(acc => acc.id === transaction.accountId);
      if (account) {
        return account.name;
      }
    }
    return transaction.accountType === 'bank' ? 'Bank Account' : 'Cash Wallet';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="mb-4 bg-error-50 border-error-200">
          <p className="text-error-600">{error}</p>
        </Card>
        <Button onClick={loadDashboardData}>Retry</Button>
      </div>
    );
  }

  const tableColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (tx: Transaction) => formatDate(tx.date),
    },
    {
      key: 'description',
      header: 'Description',
      render: (tx: Transaction) => (
        <div>
          <div className="font-medium text-gray-900">{tx.description}</div>
          {tx.notes && (
            <div className="text-sm text-gray-500 mt-1">{tx.notes}</div>
          )}
        </div>
      ),
    },
    {
      key: 'account',
      header: 'Account',
      render: (tx: Transaction) => getAccountName(tx),
    },
    {
      key: 'type',
      header: 'Type',
      render: (tx: Transaction) => {
        const variant = tx.type === 'income' ? 'success' : tx.type === 'expense' ? 'error' : 'info';
        return <Badge variant={variant}>{tx.type}</Badge>;
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (tx: Transaction) => {
        const color = tx.type === 'income' ? 'text-success-600' : tx.type === 'expense' ? 'text-error-600' : 'text-info-600';
        const sign = tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '';
        return (
          <span className={`font-semibold ${color}`}>
            {sign}{formatCurrency(tx.amount, tx.currency)}
          </span>
        );
      },
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.email?.split('@')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">Here's your financial overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Balance"
          value={formatCurrency(totalBalance, getCurrency())}
          subtitle={`Across ${accounts.length} account${accounts.length !== 1 ? 's' : ''}`}
          icon={<Wallet className="h-5 w-5" />}
        />
        <SummaryCard
          title="Monthly Income"
          value={formatCurrency(monthlyIncome, getCurrency())}
          subtitle={`${monthlyTransactionCount} transactions this month`}
          icon={<TrendingUp className="h-5 w-5 text-success-500" />}
        />
        <SummaryCard
          title="Monthly Expense"
          value={formatCurrency(monthlyExpense, getCurrency())}
          subtitle={monthlyIncome > 0 ? `${((monthlyExpense / monthlyIncome) * 100).toFixed(1)}% of income` : 'No income recorded'}
          icon={<TrendingDown className="h-5 w-5 text-error-500" />}
        />
        <SummaryCard
          title="Active Loans"
          value={activeLoansCount}
          subtitle={outstandingLoans > 0 ? `${formatCurrency(outstandingLoans, getCurrency())} outstanding` : 'No outstanding loans'}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      {/* Quick Actions */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/transactions/add')}
            className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left"
          >
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <Plus className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Add Transaction</div>
              <div className="text-sm text-gray-500">Record income or expense</div>
            </div>
          </button>
          <button
            onClick={() => navigate('/loans/new')}
            className="flex items-center p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-left"
          >
            <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Add Loan</div>
              <div className="text-sm text-gray-500">Create new loan record</div>
            </div>
          </button>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        {transactions.length > 0 ? (
          <Table
            columns={tableColumns}
            data={transactions}
            keyExtractor={(tx) => tx._id}
            onRowClick={(tx) => navigate(`/transactions/${tx._id}/edit`)}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">No recent transactions</div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
