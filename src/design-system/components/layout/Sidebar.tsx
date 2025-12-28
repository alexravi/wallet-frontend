import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Users,
  FolderTree,
  Tag,
  User,
  X,
  ChevronRight,
  Split,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Transactions',
    path: '/transactions',
    icon: Wallet,
    children: [
      { label: 'All Transactions', path: '/transactions', icon: Wallet },
      { label: 'Transaction Dashboard', path: '/transactions/dashboard', icon: TrendingUp },
      { label: 'Add Transaction', path: '/transactions/add', icon: Wallet },
    ],
  },
  {
    label: 'Accounts',
    path: '/accounts',
    icon: CreditCard,
    children: [
      { label: 'All Accounts', path: '/accounts', icon: CreditCard },
      { label: 'Account Dashboard', path: '/accounts/dashboard', icon: TrendingUp },
    ],
  },
  {
    label: 'Loans',
    path: '/loans',
    icon: TrendingUp,
    children: [
      { label: 'All Loans', path: '/loans', icon: TrendingUp },
      { label: 'Loan Dashboard', path: '/loans/dashboard', icon: TrendingUp },
      { label: 'New Loan', path: '/loans/new', icon: TrendingUp },
    ],
  },
  {
    label: 'Savings',
    path: '/savings',
    icon: PiggyBank,
    children: [
      { label: 'All Goals', path: '/savings', icon: PiggyBank },
      { label: 'Savings Dashboard', path: '/savings/dashboard', icon: TrendingUp },
      { label: 'New Goal', path: '/savings/new', icon: PiggyBank },
    ],
  },
  {
    label: 'Groups',
    path: '/groups',
    icon: Users,
    children: [
      { label: 'All Groups', path: '/groups', icon: Users },
      { label: 'Groups Dashboard', path: '/groups/dashboard', icon: TrendingUp },
    ],
  },
  {
    label: 'Splits',
    path: '/splits',
    icon: Split,
  },
  {
    label: 'Settlements',
    path: '/settlements',
    icon: Users,
  },
  {
    label: 'Categories',
    path: '/categories',
    icon: Tag,
  },
  {
    label: 'People',
    path: '/people',
    icon: User,
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: FolderTree,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isItemExpanded = (path: string) => expandedItems.includes(path);

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.path);
    const expanded = isItemExpanded(item.path);

    return (
      <div key={item.path}>
        <div
          className={`
            flex items-center justify-between px-4 py-2.5 rounded-md transition-colors
            ${active && level === 0 ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-100'}
            ${level > 0 ? 'ml-4' : ''}
          `}
        >
          <Link
            to={item.path}
            className="flex items-center flex-1"
            onClick={level === 0 && hasChildren ? () => toggleExpanded(item.path) : undefined}
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleExpanded(item.path);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              />
            </button>
          )}
        </div>
        {hasChildren && expanded && (
          <div className="mt-1">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">Wallet</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

