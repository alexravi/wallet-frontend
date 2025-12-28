import React from 'react';
import { RefreshCw, MoreVertical } from 'lucide-react';
import Card from '../ui/Card';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  lastSynced?: string;
  filters?: React.ReactNode;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  children,
  lastSynced,
  filters,
  className = '',
}) => {
  return (
    <Card className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          {lastSynced && (
            <span className="text-xs text-gray-500">
              Last synced {lastSynced}
            </span>
          )}
          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {filters && (
        <div className="mb-4 flex items-center space-x-2">
          {filters}
        </div>
      )}

      {/* Chart Content */}
      <div className="h-64">{children}</div>
    </Card>
  );
};

export default ChartCard;

