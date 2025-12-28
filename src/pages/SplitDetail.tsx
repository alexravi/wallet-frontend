import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { splitService } from '../services/splitService';
import { settlementService } from '../services/settlementService';
import { SplitDetails, Settlement, PendingBalance } from '../types/account.types';
import Card from '../design-system/components/ui/Card';
import Button from '../design-system/components/ui/Button';
import Badge from '../design-system/components/ui/Badge';
import Table from '../design-system/components/ui/Table';
import LoadingSpinner from '../design-system/components/ui/LoadingSpinner';
import { ArrowLeft, Users, DollarSign, Calendar } from 'lucide-react';

const SplitDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [splitDetails, setSplitDetails] = useState<SplitDetails | null>(null);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [pendingBalances, setPendingBalances] = useState<PendingBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (id) {
      loadSplitData();
      loadSettlements();
    }
  }, [id]);

  const loadSplitData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError('');
      const details = await splitService.getSplitDetails(id);
      if (!details) {
        setError('Split transaction not found');
        return;
      }
      setSplitDetails(details);
    } catch (err: any) {
      setError(err.message || 'Failed to load split details');
    } finally {
      setLoading(false);
    }
  };

  const loadSettlements = async () => {
    try {
      const balances = await settlementService.getPendingBalances();
      setPendingBalances(balances);
      
      // Load settlement history
      const history = await settlementService.getSettlementHistory(100);
      // Filter settlements related to this split's people
      if (splitDetails) {
        const personIds = splitDetails.splitBreakdown.map((b) => b.personId);
        const related = history.settlements.filter((s) => {
          const fromId = typeof s.fromPersonId === 'object' ? s.fromPersonId._id : s.fromPersonId;
          const toId = typeof s.toPersonId === 'object' ? s.toPersonId._id : s.toPersonId;
          return personIds.includes(fromId) || personIds.includes(toId);
        });
        setSettlements(related);
      }
    } catch (err) {
      console.error('Failed to load settlements:', err);
    }
  };

  useEffect(() => {
    if (splitDetails) {
      loadSettlements();
    }
  }, [splitDetails]);

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !splitDetails) {
    return (
      <div>
        <Button variant="ghost" onClick={() => navigate('/splits')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Splits
        </Button>
        <Card className="bg-error-50 border-error-200">
          <p className="text-error-600">{error || 'Split transaction not found'}</p>
        </Card>
      </div>
    );
  }

  const { parentTransaction, childTransactions, splitBreakdown } = splitDetails;

  const splitTableColumns = [
    {
      key: 'person',
      header: 'Person',
      render: (item: typeof splitBreakdown[0]) => (
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-400 mr-2" />
          <span className="font-medium">{item.personName}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (item: typeof splitBreakdown[0]) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(item.amount, parentTransaction.currency)}
        </span>
      ),
    },
    {
      key: 'percentage',
      header: 'Percentage',
      render: (item: typeof splitBreakdown[0]) => (
        <span className="text-gray-600">
          {item.percentage
            ? `${item.percentage.toFixed(2)}%`
            : `${((item.amount / parentTransaction.amount) * 100).toFixed(2)}%`}
        </span>
      ),
    },
  ];

  const settlementsTableColumns = [
    {
      key: 'from',
      header: 'From',
      render: (settlement: Settlement) => {
        const fromPerson = typeof settlement.fromPersonId === 'object' ? settlement.fromPersonId : null;
        return <span className="font-medium">{fromPerson?.name || 'Unknown'}</span>;
      },
    },
    {
      key: 'to',
      header: 'To',
      render: (settlement: Settlement) => {
        const toPerson = typeof settlement.toPersonId === 'object' ? settlement.toPersonId : null;
        return <span className="font-medium">{toPerson?.name || 'Unknown'}</span>;
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (settlement: Settlement) => (
        <span className="font-semibold">{formatCurrency(settlement.amount, settlement.currency)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (settlement: Settlement) => (
        <Badge variant={settlement.status === 'settled' ? 'success' : 'warning'}>
          {settlement.status}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (settlement: Settlement) => formatDate(settlement.createdAt),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/splits')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Splits
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Split Details</h1>
        <p className="text-gray-600">{parentTransaction.description}</p>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center mb-2">
            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Total Amount</span>
          </div>
          <p
            className={`text-2xl font-bold ${
              parentTransaction.type === 'income'
                ? 'text-success-600'
                : parentTransaction.type === 'expense'
                ? 'text-error-600'
                : 'text-info-600'
            }`}
          >
            {formatCurrency(parentTransaction.amount, parentTransaction.currency)}
          </p>
        </Card>
        <Card>
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Split With</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {splitBreakdown.length} {splitBreakdown.length === 1 ? 'Person' : 'People'}
          </p>
        </Card>
        <Card>
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Date</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {parentTransaction.date ? formatDate(parentTransaction.date) : 'N/A'}
          </p>
        </Card>
      </div>

      {/* Split Breakdown */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Split Breakdown</h2>
          <Badge
            variant={
              parentTransaction.splitType === 'equal'
                ? 'info'
                : parentTransaction.splitType === 'percentage'
                ? 'success'
                : 'warning'
            }
          >
            {parentTransaction.splitType
              ? parentTransaction.splitType.charAt(0).toUpperCase() + parentTransaction.splitType.slice(1)
              : ''}{' '}
            Split
          </Badge>
        </div>
        <Table
          columns={splitTableColumns}
          data={splitBreakdown}
          keyExtractor={(item) => item.personId}
        />
      </Card>

      {/* Child Transactions */}
      {childTransactions.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Individual Transactions</h2>
          <div className="space-y-3">
            {childTransactions.map((child) => {
              const person = typeof child.personId === 'object' ? child.personId : null;
              return (
                <div
                  key={child._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {person?.name || 'Unknown Person'}
                    </p>
                    <p className="text-sm text-gray-500">{child.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(child.amount, child.currency)}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(child.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Pending Balances */}
      {pendingBalances.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Balances</h2>
          <div className="space-y-3">
            {pendingBalances
              .filter((balance) =>
                splitBreakdown.some(
                  (b) =>
                    b.personId === balance.fromPersonId.toString() ||
                    b.personId === balance.toPersonId.toString()
                )
              )
              .map((balance) => (
                <div
                  key={`${balance.fromPersonId}-${balance.toPersonId}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {balance.fromPersonName} → {balance.toPersonName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-error-600">
                      {formatCurrency(balance.amount, balance.currency)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              onClick={() => navigate('/settlements')}
              className="w-full"
            >
              View All Settlements
            </Button>
          </div>
        </Card>
      )}

      {/* Related Settlements */}
      {settlements.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Related Settlements</h2>
          <Table
            columns={settlementsTableColumns}
            data={settlements}
            keyExtractor={(settlement) => settlement._id}
            onRowClick={() => navigate(`/settlements`)}
          />
        </Card>
      )}
    </div>
  );
};

export default SplitDetail;

