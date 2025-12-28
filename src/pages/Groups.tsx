import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { Group } from '../types/account.types';

const Groups: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      trip: 'bg-blue-100 text-blue-800',
      fees: 'bg-purple-100 text-purple-800',
      event: 'bg-green-100 text-green-800',
      custom: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.custom;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Groups</h1>
        <button
          onClick={() => navigate('/groups/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create Group
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">No groups found</p>
          <button
            onClick={() => navigate('/groups/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <div
              key={group._id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/groups/${group._id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold">{group.name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(group.type)}`}>
                  {group.type}
                </span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Start: {formatDate(group.startDate)}</p>
                <p>End: {formatDate(group.endDate)}</p>
                {group.budget && (
                  <p className="font-medium">Budget: {group.currency} {group.budget.toLocaleString()}</p>
                )}
                <p>Members: {Array.isArray(group.members) ? group.members.length : 0}</p>
              </div>
              {group.notes && (
                <p className="text-sm text-gray-500 mt-3 line-clamp-2">{group.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Groups;

