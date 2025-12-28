import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { GroupSummary, Transaction } from '../types/account.types';

const GroupDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [summary, setSummary] = useState<GroupSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [summaryData, transactionsData] = await Promise.all([
        groupService.getGroupSummary(id!),
        groupService.getGroupTransactions(id!),
      ]);
      setSummary(summaryData);
      setTransactions(transactionsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading group details...</div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Group not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{summary.group.name}</h1>
          <p className="text-gray-600 capitalize">{summary.group.type}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/groups/${id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Edit
          </button>
          <button
            onClick={() => navigate('/groups')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total Spent</h3>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalSpent, summary.group.currency)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Transactions</h3>
          <p className="text-2xl font-bold">{summary.transactionCount}</p>
        </div>
        {summary.budgetVsActual && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Budget Usage</h3>
            <p className="text-2xl font-bold">{summary.budgetVsActual.percentage}%</p>
            <p className="text-sm text-gray-500">
              {formatCurrency(summary.budgetVsActual.actual, summary.group.currency)} / {formatCurrency(summary.budgetVsActual.budget, summary.group.currency)}
            </p>
          </div>
        )}
      </div>

      {/* Budget vs Actual */}
      {summary.budgetVsActual && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Budget vs Actual</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Budget</span>
              <span className="font-medium">{formatCurrency(summary.budgetVsActual.budget, summary.group.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Actual</span>
              <span className="font-medium">{formatCurrency(summary.budgetVsActual.actual, summary.group.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Difference</span>
              <span className={`font-medium ${summary.budgetVsActual.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(summary.budgetVsActual.difference), summary.group.currency)}
                {summary.budgetVsActual.difference >= 0 ? ' under' : ' over'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className={`h-2 rounded-full ${summary.budgetVsActual.percentage > 100 ? 'bg-red-600' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(summary.budgetVsActual.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Per Person Share */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Per Person Share</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Person</th>
                <th className="text-right py-2 px-4">Share</th>
                <th className="text-right py-2 px-4">Paid</th>
                <th className="text-right py-2 px-4">Balance</th>
              </tr>
            </thead>
            <tbody>
              {summary.perPersonShare.map((person) => (
                <tr key={person.personId} className="border-b">
                  <td className="py-2 px-4">{person.personName}</td>
                  <td className="text-right py-2 px-4">{formatCurrency(person.share, summary.group.currency)}</td>
                  <td className="text-right py-2 px-4">{formatCurrency(person.paid, summary.group.currency)}</td>
                  <td className={`text-right py-2 px-4 font-medium ${person.balance > 0 ? 'text-red-600' : person.balance < 0 ? 'text-green-600' : ''}`}>
                    {person.balance > 0 ? `Owes ${formatCurrency(person.balance, summary.group.currency)}` : person.balance < 0 ? `Owed ${formatCurrency(Math.abs(person.balance), summary.group.currency)}` : 'Settled'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No transactions in this group</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Description</th>
                  <th className="text-right py-2 px-4">Amount</th>
                  <th className="text-left py-2 px-4">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-2 px-4">{tx.description}</td>
                    <td className={`text-right py-2 px-4 font-medium ${tx.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="py-2 px-4 capitalize">{tx.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;

