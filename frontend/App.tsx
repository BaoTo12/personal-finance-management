import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RootLayout from './app/layout';
import { DashboardLayout } from './components/DashboardLayout';
import DashboardPage from './app/page';
import TransactionsPage from './app/transactions/page';
import WalletPage from './app/wallet/page';
import InvoicesPage from './app/invoices/page';
import SettingsPage from './app/settings/page';
import SignInPage from './app/auth/signin/page';
import SignUpPage from './app/auth/signup/page';
import { AuthGuard } from './components/AuthGuard';

const App: React.FC = () => {
  return (
    <RootLayout>
      <Routes>
        {/* Public Authentication Routes - Accessible without login */}
        <Route path="/auth/signin" element={<SignInPage />} />
        <Route path="/auth/signup" element={<SignUpPage />} />
        
        {/* Protected Dashboard Routes - Wrapped in AuthGuard */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/transactions" element={<TransactionsPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/cards" element={<WalletPage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  
                  {/* Fallback for any unknown protected routes -> Redirect to Dashboard */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DashboardLayout>
            </AuthGuard>
          }
        />
      </Routes>
    </RootLayout>
  );
};

export default App;