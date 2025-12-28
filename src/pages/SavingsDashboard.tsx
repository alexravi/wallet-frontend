import React, { useState, useEffect } from 'react';
import { savingsService } from '../services/savingsService';
import { SavingsGoal } from '../types/savings.types';
import SummaryCard from '../design-system/components/ui/SummaryCard';
import Card from '../design-system/components/ui/Card';
import LoadingSpinner from '../design-system/components/ui/LoadingSpinner';
import { PiggyBank, Target } from 'lucide-react';

const SavingsDashboard: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await savingsService.getSavingsGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to load savings goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = React.useMemo(() => {
    const activeGoals = goals.filter((goal) => goal.status === 'active');
    const completedGoals = goals.filter((goal) => goal.status === 'completed');
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const activeTarget = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const activeSaved = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);

    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      totalTarget,
      totalSaved,
      activeTarget,
      activeSaved,
      completionRate: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    };
  }, [goals]);

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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Savings Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Total Goals"
          value={stats.totalGoals}
          subtitle={`${stats.activeGoals} active, ${stats.completedGoals} completed`}
          icon={<Target className="h-5 w-5" />}
        />
        <SummaryCard
          title="Total Saved"
          value={formatCurrency(stats.totalSaved)}
          subtitle={`${stats.completionRate.toFixed(1)}% of target`}
          icon={<PiggyBank className="h-5 w-5" />}
        />
        <SummaryCard
          title="Total Target"
          value={formatCurrency(stats.totalTarget)}
          icon={<Target className="h-5 w-5" />}
        />
        <SummaryCard
          title="Active Goals"
          value={stats.activeGoals}
          subtitle={formatCurrency(stats.activeSaved)}
          icon={<PiggyBank className="h-5 w-5" />}
        />
      </div>

      {/* Goals List */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Goals</h2>
        <div className="space-y-4">
          {goals
            .filter((goal) => goal.status === 'active')
            .map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal._id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{goal.goalName}</h3>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {progress.toFixed(1)}% complete
                  </p>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
};

export default SavingsDashboard;

