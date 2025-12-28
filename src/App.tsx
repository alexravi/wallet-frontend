import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './design-system/components/layout/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserSetup from './pages/UserSetup';
import Accounts from './pages/Accounts';
import BankAccountForm from './pages/BankAccountForm';
import CashWalletForm from './pages/CashWalletForm';
import StatementUpload from './pages/StatementUpload';
import TransactionReview from './pages/TransactionReview';
import CashOperations from './pages/CashOperations';
import Reconciliation from './pages/Reconciliation';
import Categories from './pages/Categories';
import People from './pages/People';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import EditTransaction from './pages/EditTransaction';
import Groups from './pages/Groups';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import Settlements from './pages/Settlements';
import Splits from './pages/Splits';
import SplitDetail from './pages/SplitDetail';
import Loans from './pages/Loans';
import CreateLoan from './pages/CreateLoan';
import LoanDetail from './pages/LoanDetail';
import SavingsGoals from './pages/SavingsGoals';
import CreateSavingsGoal from './pages/CreateSavingsGoal';
import SavingsGoalDetail from './pages/SavingsGoalDetail';
import LoanDashboard from './pages/LoanDashboard';
import TransactionDashboard from './pages/TransactionDashboard';
import AccountDashboard from './pages/AccountDashboard';
import SavingsDashboard from './pages/SavingsDashboard';
import GroupDashboard from './pages/GroupDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/setup" element={<UserSetup />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/accounts/dashboard" element={<AccountDashboard />} />
              <Route path="/accounts/bank/new" element={<BankAccountForm />} />
              <Route path="/accounts/bank/:id/edit" element={<BankAccountForm />} />
              <Route path="/accounts/cash/new" element={<CashWalletForm />} />
              <Route path="/accounts/cash/:id/edit" element={<CashWalletForm />} />
              <Route path="/accounts/statement/upload" element={<StatementUpload />} />
              <Route path="/accounts/statement/:id/review" element={<TransactionReview />} />
              <Route path="/accounts/cash/operations" element={<CashOperations />} />
              <Route path="/accounts/reconciliation/:walletId" element={<Reconciliation />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/people" element={<People />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/transactions/dashboard" element={<TransactionDashboard />} />
              <Route path="/transactions/add" element={<AddTransaction />} />
              <Route path="/transactions/:id/edit" element={<EditTransaction />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/dashboard" element={<GroupDashboard />} />
              <Route path="/groups/new" element={<CreateGroup />} />
              <Route path="/groups/:id" element={<GroupDetail />} />
              <Route path="/groups/:id/edit" element={<CreateGroup />} />
              <Route path="/settlements" element={<Settlements />} />
              <Route path="/splits" element={<Splits />} />
              <Route path="/splits/:id" element={<SplitDetail />} />
              <Route path="/loans" element={<Loans />} />
              <Route path="/loans/dashboard" element={<LoanDashboard />} />
              <Route path="/loans/new" element={<CreateLoan />} />
              <Route path="/loans/:id" element={<LoanDetail />} />
              <Route path="/savings" element={<SavingsGoals />} />
              <Route path="/savings/dashboard" element={<SavingsDashboard />} />
              <Route path="/savings/new" element={<CreateSavingsGoal />} />
              <Route path="/savings/:id" element={<SavingsGoalDetail />} />
            </Route>
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;

