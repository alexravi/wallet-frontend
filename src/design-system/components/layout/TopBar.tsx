import React from 'react';
import { useLocation } from 'react-router-dom';
import Search from '../navigation/Search';
import UserMenu from '../navigation/UserMenu';
import { Menu } from 'lucide-react';

interface TopBarProps {
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const location = useLocation();

  // Get page title from pathname
  const getPageTitle = () => {
    const path = location.pathname.split('/').filter(Boolean);
    if (path.length === 0 || path[0] === 'dashboard') return 'Dashboard';
    
    const lastSegment = path[path.length - 1];
    return lastSegment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Left: Menu + Title */}
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 truncate">
            {getPageTitle()}
          </h1>
        </div>

        {/* Center: Search (hidden on mobile) */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <Search />
        </div>

        {/* Right: User Menu */}
        <div className="flex-shrink-0">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default TopBar;

