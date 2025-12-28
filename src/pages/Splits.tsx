import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../services/transactionService';
import { Transaction } from '../types/account.types';
import Card from '../design-system/components/ui/Card';
import Button from '../design-system/components/ui/Button';
import Badge from '../design-system/components/ui/Badge';
import LoadingSpinner from '../design-system/components/ui/LoadingSpinner';
import EmptyState from '../design-system/components/ui/EmptyState';
import Select from '../design-system/components/ui/Select';
import { Users, Plus, ArrowRight } from 'lucide-react';

const Splits: React.FC = () => {
  const navigate = useNavigate();
  const [splits, setSplits] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [splitTypeFilter, setSplitTypeFilter] = useState<'all' | 'equal' | 'percentage' | 'custom'>('all');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');

  useEffect(() => {
    loadSplits();
  }, [splitTypeFilter, transactionTypeFilter]);

  const loadSplits = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch all transactions and filter for split transactions
      const response = await transactionService.getTransactions({ limit: 1000 });
      
      // Filter for parent split transactions (have splitType and no parentTransactionId)
      let filtered = response.transactions.filter(
        (tx) => tx.splitType && tx.splitType !== 'none' && !tx.parentTransactionId && !tx.deletedAt
      );

      // Apply filters
      if (splitTypeFilter !== 'all') {
        filtered = filtered.filter((tx) => tx.splitType === splitTypeFilter);
      }

      if (transactionTypeFilter !== 'all') {
        filtered = filtered.filter((tx) => tx.type === transactionTypeFilter);
      }

      setSplits(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to load splits');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getSplitTypeLabel = (type?: string) => {
    switch (type) {
      case 'equal':
        return 'Equal';
      case 'percentage':
        return 'Percentage';
      case 'custom':
        return 'Custom';
      default:
        return 'Unknown';
    }
  };

  const getSplitTypeColor = (type?: string) => {
    switch (type) {
      case 'equal':
        return 'info';
      case 'percentage':
        return 'success';
      case 'custom':
        return 'warning';
      default:
        return 'gray';
    }
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Split Transactions</h1>
          <p className="text-gray-600">View and manage all your split transactions</p>
        </div>
        <Button onClick={() => navigate('/transactions/add')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Split
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-error-50 border-error-200">
          <p className="text-error-600">{error}</p>
        </Card>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          label="Split Type"
          value={splitTypeFilter}
          onChange={(e) => setSplitTypeFilter(e.target.value as any)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'equal', label: 'Equal Split' },
            { value: 'percentage', label: 'Percentage Split' },
            { value: 'custom', label: 'Custom Split' },
          ]}
        />
        <Select
          label="Transaction Type"
          value={transactionTypeFilter}
          onChange={(e) => setTransactionTypeFilter(e.target.value as any)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
            { value: 'transfer', label: 'Transfer' },
          ]}
        />
      </div>

      {/* Splits Grid */}
      {splits.length === 0 ? (
        <Card>
          <EmptyState
            title="No split transactions found"
            description="Create your first split transaction to get started"
            action={
              <Button onClick={() => navigate('/transactions/add')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Split Transaction
              </Button>
            }
            icon={<Users className="h-12 w-12 text-gray-400" />}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {splits.map((split) => (
            <Card
              key={split._id}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <div onClick={() => navigate(`/splits/${split._id}`)}>
                <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{split.description}</h3>
                  <p className="text-sm text-gray-500">{formatDate(split.date)}</p>
                </div>
                <Badge variant={getSplitTypeColor(split.splitType) as any}>
                  {getSplitTypeLabel(split.splitType)}
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span
                    className={`font-semibold ${
                      split.type === 'income'
                        ? 'text-success-600'
                        : split.type === 'expense'
                        ? 'text-error-600'
                        : 'text-info-600'
                    }`}
                  >
                    {formatCurrency(split.amount, split.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Split with:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {split.splitDetails?.length || 0} person(s)
                  </span>
                </div>
                {split.type && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <Badge
                      variant={
                        split.type === 'income'
                          ? 'success'
                          : split.type === 'expense'
                          ? 'error'
                          : 'info'
                      }
                    >
                      {split.type}
                    </Badge>
                  </div>
                )}
              </div>

                <div className="pt-3 border-t border-gray-200 flex items-center justify-end">
                  <span className="text-sm text-primary-600 font-medium flex items-center">
                    View Details <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Splits;

