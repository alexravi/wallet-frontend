import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import { Transaction } from '../types/account.types';
import SummaryCard from '../design-system/components/ui/SummaryCard';
import ChartCard from '../design-system/components/charts/ChartCard';
import BarChart from '../design-system/components/charts/BarChart';
import AreaChart from '../design-system/components/charts/AreaChart';
import Button from '../design-system/components/ui/Button';
import LoadingSpinner from '../design-system/components/ui/LoadingSpinner';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

const TransactionDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'lastMonth' | 'daily'>('lastMonth');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const response = await transactionService.getTransactions({
        startDate: startOfMonth.toISOString().split('T')[0],
        limit: 1000,
      });
      setTransactions(response.transactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = React.useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income' && !t.deletedAt)
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === 'expense' && !t.deletedAt)
      .reduce((sum, t) => sum + t.amount, 0);
    const transfer = transactions
      .filter((t) => t.type === 'transfer' && !t.deletedAt)
      .reduce((sum, t) => sum + t.amount, 0);

    // Generate chart data
    const chartData: any[] = [];
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - 1, i);
      const dateStr = date.toISOString().split('T')[0];

      const dayIncome = transactions
        .filter(
          (t) =>
            t.type === 'income' &&
            !t.deletedAt &&
            t.date.startsWith(dateStr)
        )
        .reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = transactions
        .filter(
          (t) =>
            t.type === 'expense' &&
            !t.deletedAt &&
            t.date.startsWith(dateStr)
        )
        .reduce((sum, t) => sum + t.amount, 0);

      chartData.push({
        date: date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
        }),
        income: dayIncome / 1000,
        expense: dayExpense / 1000,
      });
    }

    return {
      totalTransactions: transactions.filter((t) => !t.deletedAt).length,
      totalIncome: income,
      totalExpense: expense,
      totalTransfer: transfer,
      netIncome: income - expense,
      chartData,
    };
  }, [transactions]);

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Transactions"
          value={stats.totalTransactions}
          icon={<Wallet className="h-5 w-5" />}
        />
        <SummaryCard
          title="Total Income"
          value={formatCurrency(stats.totalIncome)}
          icon={<TrendingUp className="h-5 w-5 text-success-500" />}
        />
        <SummaryCard
          title="Total Expense"
          value={formatCurrency(stats.totalExpense)}
          icon={<TrendingDown className="h-5 w-5 text-error-500" />}
        />
        <SummaryCard
          title="Net Income"
          value={formatCurrency(stats.netIncome)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Income vs Expense"
          filters={
            <>
              <Button
                variant={dateFilter === 'lastMonth' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setDateFilter('lastMonth')}
              >
                Last Month
              </Button>
              <Button
                variant={dateFilter === 'daily' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setDateFilter('daily')}
              >
                Daily
              </Button>
            </>
          }
        >
          <AreaChart
            data={stats.chartData}
            dataKey="income"
            xAxisKey="date"
            color="#10B981"
            height={250}
          />
        </ChartCard>

        <ChartCard
          title="Transaction Volume"
          filters={
            <>
              <Button
                variant={dateFilter === 'lastMonth' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setDateFilter('lastMonth')}
              >
                Last Month
              </Button>
              <Button
                variant={dateFilter === 'daily' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setDateFilter('daily')}
              >
                Daily
              </Button>
            </>
          }
        >
          <BarChart
            data={stats.chartData}
            dataKey="expense"
            xAxisKey="date"
            color="#EF4444"
            height={250}
          />
        </ChartCard>
      </div>
    </div>
  );
};

export default TransactionDashboard;

