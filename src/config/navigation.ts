import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  TrendingUp,
  PiggyBank,
  Users,
  Tag,
  User,
  FolderTree,
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: React.ElementType;
  children?: NavigationItem[];
}

export const navigationItems: NavigationItem[] = [
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

