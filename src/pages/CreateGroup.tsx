import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { personService } from '../services/personService';
import { Person, CreateGroupData } from '../types/account.types';

const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [people, setPeople] = useState<Person[]>([]);
  const [formData, setFormData] = useState<CreateGroupData>({
    name: '',
    type: 'custom',
    currency: 'INR',
    members: [],
  });

  useEffect(() => {
    loadPeople();
    if (id) {
      loadGroup();
    }
  }, [id]);

  const loadPeople = async () => {
    try {
      const data = await personService.getPeople();
      setPeople(data.filter(p => p.isActive));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load people');
    }
  };

  const loadGroup = async () => {
    try {
      setLoading(true);
      const group = await groupService.getGroupById(id!);
      if (group) {
        setFormData({
          name: group.name,
          type: group.type,
          startDate: group.startDate,
          endDate: group.endDate,
          budget: group.budget,
          currency: group.currency,
          members: Array.isArray(group.members)
            ? group.members.map(m => (typeof m === 'string' ? m : m._id))
            : [],
          notes: group.notes,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (id) {
        await groupService.updateGroup(id, formData);
      } else {
        await groupService.createGroup(formData);
      }

      navigate('/groups');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save group');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (personId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(personId)
        ? prev.members.filter(id => id !== personId)
        : [...prev.members, personId],
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">{id ? 'Edit Group' : 'Create Group'}</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="trip">Trip</option>
            <option value="fees">Fees</option>
            <option value="event">Event</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.startDate ? formData.startDate.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={formData.endDate ? formData.endDate.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget (Optional)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.budget || ''}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency *
          </label>
          <input
            type="text"
            required
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Members
          </label>
          <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto">
            {people.length === 0 ? (
              <p className="text-gray-500 text-sm">No people available</p>
            ) : (
              <div className="space-y-2">
                {people.map((person) => (
                  <label key={person._id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.members.includes(person._id)}
                      onChange={() => toggleMember(person._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{person.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : id ? 'Update Group' : 'Create Group'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/groups')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;

