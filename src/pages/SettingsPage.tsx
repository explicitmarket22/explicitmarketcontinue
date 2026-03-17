import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Lock, Bell, Shield, LogOut, Sun, Moon } from 'lucide-react';

export function SettingsPage() {
  const { user, logout, updateUserProfile, updatePassword, toggleTheme, theme } = useStore();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentTheme, setCurrentTheme] = useState(theme);

  // Update currentTheme when store theme changes
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    trades: true,
    prices: true,
    news: false,
    bot: true
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Name cannot be empty');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    updateUserProfile(name);
    setSuccessMessage('✅ Profile updated successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill all password fields');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const result = updatePassword(user?.email || '', currentPassword, newPassword);

    if (result.success) {
      setSuccessMessage('✅ Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage('❌ ' + result.message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleToggleTheme = () => {
    toggleTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      logout();
    }
  };

  // Get KYC status
  const kycStatus = user?.kycStatus || 'NOT_SUBMITTED';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10 bg-white dark:bg-gray-950 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Account Settings</h1>

      {successMessage && (
        <div className="p-4 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-400">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Profile Section */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                className="opacity-60 cursor-not-allowed"
              />

              <Input
                label="Country"
                value={user?.country || 'Global'}
                disabled
                className="opacity-60 cursor-not-allowed"
              />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Account Type
                </label>
                <div className="flex h-10 items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-400 dark:border-green-900">
                    LIVE ACCOUNT
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-400" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="password"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Input
                type="password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="secondary">
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-400" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: 'trades',
              label: 'Trade Execution Alerts',
              desc: 'Get notified when orders are opened or closed'
            },
            {
              key: 'prices',
              label: 'Price Alerts',
              desc: 'Notifications when assets hit your target price'
            },
            {
              key: 'news',
              label: 'Market News & Updates',
              desc: 'Daily summaries and major economic events'
            },
            {
              key: 'bot',
              label: 'AI Bot Activity',
              desc: 'Updates on automated trading performance'
            }
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-800/30 border border-gray-300 dark:border-gray-800/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() =>
                  toggleNotification(item.key as keyof typeof notifications)
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  notifications[item.key as keyof typeof notifications]
                    ? 'bg-blue-600'
                    : 'bg-gray-700'
                }`}>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* KYC Verification */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Identity Verification (KYC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gray-100 dark:bg-gray-800/30 border border-gray-300 dark:border-gray-800/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">KYC Status</p>
                <p className="text-xs text-gray-600 dark:text-gray-500">Current verification status</p>
              </div>
              <div className="flex items-center gap-2">
                {kycStatus === 'APPROVED' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-400 dark:border-green-600">
                    ✓ KYC VERIFIED
                  </span>
                )}
                {kycStatus === 'PENDING' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-400 dark:border-yellow-600">
                    ⏳ KYC PENDING
                  </span>
                )}
                {kycStatus === 'REJECTED' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-400 dark:border-red-600">
                    ✗ KYC REJECTED
                  </span>
                )}
                {kycStatus === 'NOT_SUBMITTED' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-400 dark:border-gray-600">
                    NOT SUBMITTED
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {kycStatus === 'APPROVED'
                ? '✅ Your identity has been verified. You can now access all trading features without restrictions.'
                : kycStatus === 'PENDING'
                ? '⏳ Your KYC verification is pending. Admin will review your submission shortly.'
                : kycStatus === 'REJECTED'
                ? '❌ Your KYC verification was rejected. Please submit again with correct information.'
                : 'Identity verification is recommended for live trading accounts and withdrawals exceeding $10,000.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme & Account Section */}
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentTheme === 'dark' ? (
              <Moon className="h-5 w-5 text-blue-400" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-400" />
            )}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/30">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Theme Mode</p>
              <p className="text-xs text-gray-600 dark:text-gray-500">Switch between light and dark theme</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleTheme}>
              {currentTheme === 'dark' ? (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark Mode
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="bg-white dark:bg-gray-900 border-red-300 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-500">
            <LogOut className="h-5 w-5" />
            Sign Out
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-300 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/30">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Log out of your account</p>
              <p className="text-xs text-gray-600 dark:text-gray-500">
                You will be logged out from this device
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:border-red-400 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
