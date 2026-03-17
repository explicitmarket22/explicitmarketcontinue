import React, { useState } from 'react';
import { StoreProvider, useStore } from './lib/store';
import { LoginPage } from './pages/Login';
import { SignupPage } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { TradePage } from './pages/TradePage';
import { WalletPage } from './pages/Wallet';
import { SignalsPage } from './pages/Signals';
import { BotPage } from './pages/Bot';
import { SettingsPage } from './pages/SettingsPage';
import { KYCPage } from './pages/KYC';
import { CopyTradingPage } from './pages/CopyTrading';
import { FundedAccountsPage } from './pages/FundedAccounts';
import { ReferralPage } from './pages/Referral';
import { AdminPage } from './pages/Admin';
import { Layout } from './components/Layout';
function AppContent() {
  const { isAuthenticated, user, allUsers, theme } = useStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Determine current auth page from URL
  const authPath = window.location.pathname.split('/')[2]; // /auth/login or /auth/signup

  // ensure that when authentication state changes we land on dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated]);

  // Re-render when theme changes to ensure all pages update
  React.useEffect(() => {
    // This effect just needs to depend on theme to cause re-renders
  }, [theme]);

  // Show separate Login or Signup pages
  if (!isAuthenticated) {
    if (authPath === 'signup') {
      return <SignupPage />;
    }
    // Default to login page
    return <LoginPage />;
  }

  const renderPage = () => {
    // Admin route protection
    if (currentPage === 'admin' && !user?.isAdmin) {
      setCurrentPage('dashboard');
      return <Dashboard onNavigate={setCurrentPage} />;
    }

    // Page lock enforcement
    if (user?.lockedPages?.includes(currentPage)) {
      return <Dashboard onNavigate={setCurrentPage} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'trade':
        return <TradePage />;
      case 'wallet':
        return <WalletPage />;
      case 'signals':
        return <SignalsPage />;
      case 'bot':
        return <BotPage />;
      case 'kyc':
        return <KYCPage />;
      case 'copy-trading':
        return <CopyTradingPage />;
      case 'funded-accounts':
        return <FundedAccountsPage />;
      case 'referral':
        return <ReferralPage />;
      case 'admin':
        return <AdminPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };
  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>);

}
export function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>);

}