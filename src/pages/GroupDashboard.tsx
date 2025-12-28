import React, { useState, useEffect } from 'react';
import { groupService } from '../services/groupService';
import SummaryCard from '../design-system/components/ui/SummaryCard';
import Card from '../design-system/components/ui/Card';
import LoadingSpinner from '../design-system/components/ui/LoadingSpinner';
import { Users } from 'lucide-react';

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: any[];
  createdAt: string;
}

const GroupDashboard: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = React.useMemo(() => {
    const totalMembers = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0);
    return {
      totalGroups: groups.length,
      totalMembers,
      averageMembersPerGroup: groups.length > 0 ? totalMembers / groups.length : 0,
    };
  }, [groups]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Groups Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <SummaryCard
          title="Total Groups"
          value={stats.totalGroups}
          icon={<Users className="h-5 w-5" />}
        />
        <SummaryCard
          title="Total Members"
          value={stats.totalMembers}
          icon={<Users className="h-5 w-5" />}
        />
        <SummaryCard
          title="Avg Members/Group"
          value={stats.averageMembersPerGroup.toFixed(1)}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Groups List */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">All Groups</h2>
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group._id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{group.name}</p>
                  <p className="text-sm text-gray-500">
                    {group.members?.length || 0} members
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default GroupDashboard;

