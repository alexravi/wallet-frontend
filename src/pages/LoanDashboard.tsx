import React, { useState, useEffect } from 'react';
import { loanService } from '../services/loanService';
import { Loan } from '../types/loan.types';
import SummaryCard from '../design-system/components/ui/SummaryCard';
import ChartCard from '../design-system/components/charts/ChartCard';
import BarChart from '../design-system/components/charts/BarChart';
import LineChart from '../design-system/components/charts/LineChart';
import Button from '../design-system/components/ui/Button';
import LoadingSpinner from '../design-system/components/ui/LoadingSpinner';
import { TrendingUp } from 'lucide-react';

const LoanDashboard: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'lastMonth' | 'daily'>('lastMonth');
  const [lastSynced, setLastSynced] = useState<string>('5 minutes ago');

  useEffect(() => {
    loadLoans();
    // Update last synced time
    const interval = setInterval(() => {
      setLastSynced('5 minutes ago');
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const loadLoans = async () => {
    try {
      setLoading(true);
      const data = await loanService.getLoans();
      setLoans(data);
    } catch (error) {
      console.error('Failed to load loans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Filter loans
    const newLoans = loans.filter(
      (loan) => new Date(loan.createdAt) >= thisMonthStart
    );
    const activeLoans = loans.filter((loan) => loan.status === 'active');
    const closedLoans = loans.filter((loan) => loan.status === 'closed');
    const writtenOffLoans = loans.filter((loan) => loan.status === 'written-off');
    const closedSinceYesterday = closedLoans.filter(
      (loan) => loan.endDate && new Date(loan.endDate) >= yesterday
    );

    // Calculate amounts
    const totalSanctioned = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalDisbursed = loans.reduce((sum, loan) => sum + loan.principal, 0);
    const totalRepayment = loans.reduce((sum, loan) => sum + loan.totalPaid, 0);
    const totalWriteOff = writtenOffLoans.reduce(
      (sum, loan) => sum + loan.outstandingAmount,
      0
    );

    // Calculate month-over-month changes
    const lastMonthLoans = loans.filter(
      (loan) =>
        new Date(loan.createdAt) >= lastMonth &&
        new Date(loan.createdAt) < thisMonthStart
    );
    const activeLoansLastMonth = loans.filter(
      (loan) =>
        loan.status === 'active' &&
        new Date(loan.updatedAt) < thisMonthStart
    ).length;

    const activeLoansChange =
      activeLoansLastMonth > 0
        ? ((activeLoans.length - activeLoansLastMonth) / activeLoansLastMonth) * 100
        : 0;

    const sanctionedChange =
      lastMonthLoans.length > 0
        ? ((newLoans.length - lastMonthLoans.length) / lastMonthLoans.length) * 100
        : 0;

    // Generate chart data (daily for last month)
    const chartData = [];
    const daysInMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - 1, i);
      const dateStr = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

      const newLoansCount = loans.filter(
        (loan) =>
          new Date(loan.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          }) === dateStr
      ).length;

      const disbursedAmount = loans
        .filter(
          (loan) =>
            new Date(loan.startDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }) === dateStr
        )
        .reduce((sum, loan) => sum + loan.principal, 0);

      chartData.push({
        date: dateStr,
        newLoans: newLoansCount,
        disbursed: disbursedAmount / 10000000, // Convert to Crores
      });
    }

    return {
      newLoans: newLoans.length,
      activeLoans: activeLoans.length,
      activeLoansChange,
      closedLoans: closedLoans.length,
      closedSinceYesterday: closedSinceYesterday.length,
      openApplications: 0, // Not available in current data model
      newApplications: 0, // Not available in current data model
      totalSanctioned,
      sanctionedChange,
      totalDisbursed,
      disbursedChange: sanctionedChange,
      totalRepayment,
      repaymentChange: 0,
      unpaidShortfall: 0,
      unpaidShortfallAmount: 0,
      activeSecurities: activeLoans.length, // Using active loans as proxy
      securitiesChange: 1,
      totalWriteOff,
      writeOffChange: 1,
      chartData,
    };
  }, [loans]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹ ${(amount / 100000).toFixed(2)} L`;
    }
    return `₹ ${amount.toLocaleString('en-IN')}`;
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
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Loan Dashboard</h1>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="NEW LOANS"
          value={stats.newLoans}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="ACTIVE LOANS"
          value={stats.activeLoans}
          change={{
            value: Math.round(stats.activeLoansChange),
            label: 'since last month',
            trend: stats.activeLoansChange >= 0 ? 'up' : 'down',
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="CLOSED LOANS"
          value={stats.closedLoans}
          change={{
            value: 0,
            label: 'since yesterday',
            trend: 'neutral',
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="OPEN LOAN APPLICATIONS"
          value={stats.openApplications}
          change={{
            value: 0,
            label: 'since last month',
            trend: 'neutral',
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="NEW LOAN APPLICATIONS"
          value={stats.newApplications}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="TOTAL SANCTIONED AMOUNT"
          value={formatCurrency(stats.totalSanctioned)}
          change={{
            value: Math.round(stats.sanctionedChange),
            label: 'since last month',
            trend: stats.sanctionedChange >= 0 ? 'up' : 'down',
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="APPLICANTS WITH UNPAID SHORTFALL"
          value={stats.unpaidShortfall}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="TOTAL SHORTFALL AMOUNT"
          value={formatCurrency(stats.unpaidShortfallAmount)}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="TOTAL REPAYMENT"
          value={formatCurrency(stats.totalRepayment)}
          change={{
            value: 0,
            label: 'since yesterday',
            trend: 'neutral',
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="TOTAL DISBURSED"
          value={formatCurrency(stats.totalDisbursed)}
          change={{
            value: Math.round(stats.disbursedChange),
            label: 'since last month',
            trend: stats.disbursedChange >= 0 ? 'up' : 'down',
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="ACTIVE SECURITIES"
          value={stats.activeSecurities}
          change={{
            value: stats.securitiesChange,
            label: 'since yesterday',
            trend: 'up',
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <SummaryCard
          title="TOTAL WRITE OFF"
          value={formatCurrency(stats.totalWriteOff)}
          change={{
            value: stats.writeOffChange,
            label: 'since yesterday',
            trend: 'up',
          }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="New Loans"
          lastSynced={lastSynced}
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
            dataKey="newLoans"
            xAxisKey="date"
            color="#2490EF"
            height={250}
          />
        </ChartCard>

        <ChartCard
          title="Loan Disbursements"
          lastSynced={lastSynced}
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
          <LineChart
            data={stats.chartData}
            dataKey="disbursed"
            xAxisKey="date"
            color="#2490EF"
            height={250}
          />
        </ChartCard>
      </div>
    </div>
  );
};

export default LoanDashboard;

