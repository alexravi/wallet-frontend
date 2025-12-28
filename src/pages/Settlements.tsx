import React, { useState, useEffect } from 'react';
import { settlementService } from '../services/settlementService';
import { accountService } from '../services/accountService';
import { personService } from '../services/personService';
import { PendingBalance, Settlement, AccountListItem, Person } from '../types/account.types';

const Settlements: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [pendingBalances, setPendingBalances] = useState<PendingBalance[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [accounts, setAccounts] = useState<AccountListItem[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [formData, setFormData] = useState({
    fromPersonId: '',
    toPersonId: '',
    amount: 0,
    currency: 'INR',
    settlementMethod: 'cash' as 'bank' | 'cash' | 'other',
    notes: '',
    createTransaction: false,
    accountId: '',
    accountType: 'cash' as 'bank' | 'cash',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balances, history, accountsData, peopleData] = await Promise.all([
        settlementService.getPendingBalances(),
        settlementService.getSettlementHistory(20),
        Promise.all([accountService.getBankAccounts(), accountService.getCashWallets()]),
        personService.getPeople(),
      ]);

      setPendingBalances(balances);
      setSettlements(history.settlements);

      const allAccounts: AccountListItem[] = [
        ...accountsData[0].map((acc) => ({
          id: acc._id,
          name: `${acc.bankName} - ${acc.accountNumber}`,
          type: 'bank' as const,
          balance: acc.currentBalance,
          currency: acc.currency,
        })),
        ...accountsData[1].map((wallet) => ({
          id: wallet._id,
          name: wallet.name,
          type: 'cash' as const,
          balance: wallet.currentBalance,
          currency: wallet.currency,
        })),
      ];
      setAccounts(allAccounts);
      setPeople(peopleData.filter(p => p.isActive));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      await settlementService.createSettlement({
        fromPersonId: formData.fromPersonId,
        toPersonId: formData.toPersonId,
        amount: formData.amount,
        currency: formData.currency,
        settlementMethod: formData.settlementMethod,
        notes: formData.notes,
        createTransaction: formData.createTransaction,
        accountId: formData.createTransaction ? formData.accountId : undefined,
        accountType: formData.createTransaction ? formData.accountType : undefined,
      });
      setShowCreateForm(false);
      setFormData({
        fromPersonId: '',
        toPersonId: '',
        amount: 0,
        currency: 'INR',
        settlementMethod: 'cash',
        notes: '',
        createTransaction: false,
        accountId: '',
        accountType: 'cash',
      });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create settlement');
    }
  };

  const handleSettle = async (settlementId: string) => {
    try {
      await settlementService.settleBalance(settlementId);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark as settled');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading settlements...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settlements</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'Create Settlement'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create Settlement Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Settlement</h2>
          <form onSubmit={handleCreateSettlement} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Person *</label>
                <select
                  required
                  value={formData.fromPersonId}
                  onChange={(e) => setFormData({ ...formData, fromPersonId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Select person</option>
                  {people.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Person *</label>
                <select
                  required
                  value={formData.toPersonId}
                  onChange={(e) => setFormData({ ...formData, toPersonId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Select person</option>
                  {people.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Settlement Method</label>
                <select
                  value={formData.settlementMethod}
                  onChange={(e) => setFormData({ ...formData, settlementMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.createTransaction}
                  onChange={(e) => setFormData({ ...formData, createTransaction: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Create settlement transaction</span>
              </label>
            </div>
            {formData.createTransaction && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                  <select
                    value={formData.accountId}
                    onChange={(e) => {
                      const account = accounts.find(a => a.id === e.target.value);
                      setFormData({
                        ...formData,
                        accountId: e.target.value,
                        accountType: account?.type || 'cash',
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">Select account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Settlement
            </button>
          </form>
        </div>
      )}

      {/* Pending Balances */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Pending Balances</h2>
        {pendingBalances.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No pending balances</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">From</th>
                  <th className="text-left py-2 px-4">To</th>
                  <th className="text-right py-2 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {pendingBalances.map((balance, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{balance.fromPersonName}</td>
                    <td className="py-2 px-4">{balance.toPersonName}</td>
                    <td className="text-right py-2 px-4 font-medium">
                      {formatCurrency(balance.amount, balance.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settlement History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Settlement History</h2>
        {settlements.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No settlements yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">From</th>
                  <th className="text-left py-2 px-4">To</th>
                  <th className="text-right py-2 px-4">Amount</th>
                  <th className="text-left py-2 px-4">Status</th>
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((settlement) => {
                  const fromPerson = typeof settlement.fromPersonId === 'string' ? people.find(p => p._id === settlement.fromPersonId) : settlement.fromPersonId;
                  const toPerson = typeof settlement.toPersonId === 'string' ? people.find(p => p._id === settlement.toPersonId) : settlement.toPersonId;
                  return (
                    <tr key={settlement._id} className="border-b">
                      <td className="py-2 px-4">{typeof fromPerson === 'object' ? fromPerson?.name : 'Unknown'}</td>
                      <td className="py-2 px-4">{typeof toPerson === 'object' ? toPerson?.name : 'Unknown'}</td>
                      <td className="text-right py-2 px-4 font-medium">
                        {formatCurrency(settlement.amount, settlement.currency)}
                      </td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          settlement.status === 'settled' ? 'bg-green-100 text-green-800' :
                          settlement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {settlement.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {settlement.settlementDate ? new Date(settlement.settlementDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-2 px-4">
                        {settlement.status === 'pending' && (
                          <button
                            onClick={() => handleSettle(settlement._id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Mark as Settled
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settlements;

