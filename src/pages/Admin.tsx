import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BarChart3,
  Users,
  Wallet,
  Lock,
  X,
  Plus,
  DollarSign,
  Send,
  Settings,
  CheckCircle,
  Zap,
  Bot,
  Copy,
  CreditCard,
  Trash2,
  Edit2,
  Bitcoin,
  Shield,
  Gift
} from 'lucide-react';
import { useStore } from '../lib/store';
import { BotManagementTabComponent } from '../components/BotManagementTab';
import { SignalManagementTabComponent } from '../components/SignalManagementTab';
import { CopyTradeManagementTab } from '../components/CopyTradeManagementTab';
import { WalletBankManagementTab } from '../components/WalletBankManagementTab';
import { AdminWalletManagement } from '../components/AdminWalletManagement';
import { AdminCreditCardDeposits } from '../components/AdminCreditCardDeposits';
import { BalanceControlTab } from '../components/BalanceControlTab';
import { KYCManagementTab } from '../components/KYCManagementTab';
import { ReferralManagementTab } from '../components/ReferralManagementTab';

const AVAILABLE_PAGES = ['dashboard', 'trade', 'wallet', 'signals', 'bot', 'copy-trading', 'funded-accounts', 'kyc'];
const WALLET_TYPES = ['DEPOSIT', 'PURCHASE'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'BTC', 'ETH'];
const NETWORKS = ['', 'ERC20', 'TRC20', 'BEP20', 'Polygon'];

export function AdminPage() {
  const { 
    allUsers, 
    addBalance, 
    removeBalance, 
    togglePageLock, 
    toggleUserLock,
    setUserTradeMode, 
    transactions, 
    approveTransaction, 
    rejectTransaction,
    purchasedBots,
    purchasedSignals,
    purchasedCopyTrades,
    approveBotPurchase,
    approveBotActivation,
    approveSignalPurchase,
    approveSignalSubscription,
    terminateBot,
    terminateSignal,
    closeCopyTrade,
    purchasedFundedAccounts,
    approveFundedAccount,
    rejectFundedAccount,
    wallets,
    addWallet,
    editWallet,
    removeWallet,
    bankAccounts,
    addBankAccount,
    editBankAccount,
    removeBankAccount,
    toggleBankAccountStatus,
    getUserTransactions,
    adminCreateBot,
    adminCreateSignal,
    adminCreateCopyTrade,
    botTemplates,
    addBotTemplate,
    editBotTemplate,
    deleteBotTemplate,
    signalTemplates,
    addSignalTemplate,
    editSignalTemplate,
    deleteSignalTemplate,
    copyTradeTemplates,
    addCopyTradeTemplate,
    editCopyTradeTemplate,
    deleteCopyTradeTemplate,
    approveKYC,
    rejectKYC
  } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [forms, setForms] = useState({
    addBalance: { userId: '', amount: '' },
    createBot: { userId: '', botName: '', allocatedAmount: '', performance: '', totalEarned: '' },
    createSignal: { userId: '', providerName: '', allocation: '', winRate: '', cost: '' },
    createCopyTrade: { userId: '', traderName: '', allocation: '', winRate: '', durationValue: '7', durationType: 'days', traderReturn: '' }
  });
  // Wallet Management State
  const [walletUserId, setWalletUserId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletLabel, setWalletLabel] = useState('');
  const [walletType, setWalletType] = useState('DEPOSIT');
  const [walletCurrency, setWalletCurrency] = useState('USD');
  const [walletNetwork, setWalletNetwork] = useState('');

  // Bot approval outcomes and durations - separate state for clarity
  const [botOutcomes, setBotOutcomes] = useState<Record<string, 'win' | 'lose'>>({});
  const [botDurationValues, setBotDurationValues] = useState<Record<string, string>>({});
  const [botDurationTypes, setBotDurationTypes] = useState<Record<string, 'minutes' | 'hours' | 'days'>>({});

  // Signal approval outcomes and durations - separate state for clarity
  const [signalOutcomes, setSignalOutcomes] = useState<Record<string, 'win' | 'lose'>>({});
  const [signalDurationValues, setSignalDurationValues] = useState<Record<string, string>>({});
  const [signalDurationTypes, setSignalDurationTypes] = useState<Record<string, 'minutes' | 'hours' | 'days'>>({});

  // Modal state for duration inputs
  const [openDurationModal, setOpenDurationModal] = useState<{ type: 'bot' | 'signal'; id: string } | null>(null);

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Get current selected user from allUsers to ensure always fresh data
  const selectedUser = selectedUserId ? allUsers.find(u => u.id === selectedUserId) : null;

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'balance', label: 'Balance Control', icon: Wallet },
    { id: 'pages', label: 'Page Access', icon: Lock },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle },
    { id: 'kyc', label: 'KYC Management', icon: Shield },
    { id: 'referrals', label: 'Referral Management', icon: Gift },
    { id: 'funded', label: 'Funded Accounts', icon: Zap },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'wallets-banks', label: 'Wallets & Banks', icon: CreditCard },
    { id: 'deposit-wallets', label: 'Deposit Wallets', icon: Bitcoin },
    { id: 'credit-card-deposits', label: 'Credit Card Deposits', icon: CreditCard },
    { id: 'bot-management', label: 'Bot Management', icon: Bot },
    { id: 'signal-management', label: 'Signal Management', icon: Zap },
    { id: 'copy-trade-management', label: 'Copy Trade Management', icon: Copy },
    { id: 'manual', label: 'Manual Creation', icon: Plus },
  ];


  const handleTogglePageLock = (userId: string, page: string) => {
    togglePageLock(userId, page);
  };

  const handleToggleUserLock = (userId: string) => {
    toggleUserLock(userId);
  };

  const handleSetTradeMode = (userId: string, mode: 'NORMAL' | 'PROFIT' | 'LOSS') => {
    setUserTradeMode(userId, mode);
    alert(`✅ Trade mode set to ${mode}`);
  };

  // Dashboard Tab
  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Total Users</span>
            <Users className="h-4 w-4 text-[#2962ff]" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{allUsers.length}</p>
          <p className="text-xs text-gray-600 dark:text-[#8b949e]">Active: <span className="text-[#26a69a]">{allUsers.filter(u => u.isVerified).length}</span></p>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Total Balance</span>
            <Wallet className="h-4 w-4 text-[#26a69a]" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${allUsers.reduce((sum, u) => sum + (u.balance || 0), 0).toLocaleString()}</p>
          <p className="text-xs text-gray-600 dark:text-[#8b949e]">Across all users</p>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Pending Deposits</span>
            <Send className="h-4 w-4 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').length}</p>
          <p className="text-xs text-yellow-500">Awaiting approval</p>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Pending Withdrawals</span>
            <Send className="h-4 w-4 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').length}</p>
          <p className="text-xs text-orange-500">Needs action</p>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">System Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0d1117] rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#2962ff]" />
              <span className="text-sm text-gray-600 dark:text-[#8b949e]">{allUsers.length} users registered in system</span>
            </div>
            <span className="text-xs text-[#26a69a]">Updated now</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0d1117] rounded-lg">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-[#26a69a]" />
              <span className="text-sm text-gray-600 dark:text-[#8b949e]">{transactions.filter(t => t.status === 'PENDING').length} pending transactions</span>
            </div>
            <span className="text-xs text-yellow-500">Action required</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0d1117] rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-[#8b949e]">{purchasedFundedAccounts.filter(a => a.status === 'PENDING_APPROVAL').length} pending funded requests</span>
            </div>
            <span className="text-xs text-yellow-500">Action required</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#0d1117] rounded-lg">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-gray-600 dark:text-[#8b949e]">{allUsers.filter(u => !u.isVerified).length} locked users</span>
            </div>
            <span className="text-xs text-orange-500">Restricted</span>
          </div>
        </div>
      </div>
    </div>
  );

  // User Management Tab
  const UserManagementTab = () => (
    <div className="space-y-6">
      <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">All Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 dark:border-[#21262d]">
                <th className="text-left py-3 px-4 text-gray-600 dark:text-[#8b949e] font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-[#8b949e] font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-[#8b949e] font-medium">Phone</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-[#8b949e] font-medium">Country</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-[#8b949e] font-medium">Balance</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-[#8b949e] font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-600 dark:text-[#8b949e] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-300 dark:border-[#21262d] hover:bg-gray-50 hover:dark:bg-[#0d1117]/50">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{user.email}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{user.name}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{user.phoneNumber || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{user.country}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-white font-bold">${(user.balance || 0).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    {user.isVerified ? (
                      <span className="px-2 py-1 bg-[#26a69a]/20 text-[#26a69a] rounded text-xs font-medium">Active</span>
                    ) : (
                      <span className="px-2 py-1 bg-[#ef5350]/20 text-[#ef5350] rounded text-xs font-medium">Locked</span>
                    )}
                  </td>
                  <td className="py-3 px-4 space-x-2 flex">
                    <button
                      onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                      className="px-3 py-1 bg-[#2962ff] hover:bg-[#1e47a0] text-white rounded text-xs transition-colors"
                    >
                      {selectedUserId === user.id ? 'Close' : 'View'}
                    </button>
                    <button
                      onClick={() => handleToggleUserLock(user.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        user.isVerified
                          ? 'bg-[#ef5350]/20 text-[#ef5350] hover:bg-[#ef5350]/30'
                          : 'bg-[#26a69a]/20 text-[#26a69a] hover:bg-[#26a69a]/30'
                      }`}
                    >
                      {user.isVerified ? 'Lock' : 'Unlock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Details: {selectedUser.name}</h3>
            <button onClick={() => setSelectedUserId(null)} className="text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] uppercase mb-1">Email</p>
              <p className="text-gray-900 dark:text-white">{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] uppercase mb-1">Full Name</p>
              <p className="text-gray-900 dark:text-white">{selectedUser.name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] uppercase mb-1">Phone</p>
              <p className="text-gray-900 dark:text-white">{selectedUser.phoneNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] uppercase mb-1">Country</p>
              <p className="text-gray-900 dark:text-white">{selectedUser.country}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] uppercase mb-1">Password</p>
              <p className="text-gray-900 dark:text-white font-mono">{selectedUser.password || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] uppercase mb-1">Current Balance</p>
              <p className="text-gray-900 dark:text-white font-bold">${(selectedUser.balance || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-gray-600 dark:text-[#8b949e] uppercase mb-1">Trade Mode</p>
            {selectedUser.tradeMode === 'PROFIT' ? (
              <span className="px-2 py-1 bg-[#26a69a]/20 text-[#26a69a] rounded text-xs font-medium">PROFIT</span>
            ) : selectedUser.tradeMode === 'LOSS' ? (
              <span className="px-2 py-1 bg-[#ef5350]/20 text-[#ef5350] rounded text-xs font-medium">LOSS</span>
            ) : (
              <span className="px-2 py-1 bg-[#2962ff]/20 text-[#2962ff] rounded text-xs font-medium">NORMAL</span>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-[#8b949e] uppercase mb-2">Locked Pages</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PAGES.map(page => (
                <button
                  key={page}
                  onClick={() => handleTogglePageLock(selectedUser.id, page)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    (selectedUser.lockedPages || []).includes(page)
                      ? 'bg-[#ef5350]/30 text-[#ef5350]'
                      : 'bg-[#26a69a]/20 text-[#26a69a] hover:bg-[#26a69a]/30'
                  }`}
                >
                  {(selectedUser.lockedPages || []).includes(page) ? (
                    <>
                      <Lock className="h-3 w-3 inline mr-1" />
                      {page}
                    </>
                  ) : (
                    <>{page}</>
                  )}
                </button>
              ))}
            </div>
          </div>
                    <div className="mt-8 pt-8 border-t border-gray-300 dark:border-[#21262d]">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#2962ff]" /> Trade Outcome Control
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['NORMAL', 'PROFIT', 'LOSS'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleSetTradeMode(selectedUser.id, mode)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${
                      (selectedUser.tradeMode || 'NORMAL') === mode
                        ? 'bg-[#2962ff]/10 border-[#2962ff] text-white'
                        : 'bg-gray-100 dark:bg-[#161b22] border-gray-300 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e] hover:border-gray-400 dark:hover:border-[#8b949e]/30'
                    }`}
                  >
                    <span className="text-xl font-black mb-1">${mode}</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-60">Logic Control</span>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-[#8b949e] bg-[#0d1117] p-3 rounded-lg border border-[#21262d]">
                * Setting this to <span className="text-[#26a69a] font-bold">PROFIT</span> will force all live trades for this user into a positive state. <span className="text-[#ef5350] font-bold">LOSS</span> will force them into a negative state.
              </p>
            </div>
        </div>
      )}
    </div>
  );

  // Balance Control Tab




  // Page Access Control Tab
  const PageAccessTab = () => (
    <div className="space-y-6">
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">User-Specific Page Access</h3>
        <div className="space-y-4">
          {allUsers.map(user => (
            <div key={user.id} className="p-4 bg-[#0d1117] rounded-lg border border-[#21262d]">
              <p className="text-white font-medium mb-3">{user.name}</p>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PAGES.map(page => (
                  <button
                    key={page}
                    onClick={() => handleTogglePageLock(user.id, page)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      (user.lockedPages || []).includes(page)
                        ? 'bg-[#ef5350] text-white'
                        : 'bg-[#26a69a] text-white'
                    }`}
                  >
                    {(user.lockedPages || []).includes(page) ? (
                      <>
                        <Lock className="h-3 w-3 inline mr-1" />
                        {page}
                      </>
                    ) : (
                      <>{page}</>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Bot & Signal Approvals Tab
  const ApprovalTab = () => (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-2">
          <p className="text-xs text-[#8b949e] uppercase">Pending Purchases</p>
          <p className="text-3xl font-bold text-orange-500">{purchasedBots.filter(b => b.status === 'PENDING_APPROVAL').length}</p>
          <p className="text-xs text-orange-500">Need approval</p>
        </div>
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-2">
          <p className="text-xs text-[#8b949e] uppercase">Approved for Allocation</p>
          <p className="text-3xl font-bold text-[#2962ff]">{purchasedBots.filter(b => b.status === 'APPROVED_FOR_ALLOCATION').length}</p>
          <p className="text-xs text-[#2962ff]">Waiting for capital</p>
        </div>
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-2">
          <p className="text-xs text-[#8b949e] uppercase">Ready for Activation</p>
          <p className="text-3xl font-bold text-yellow-500">{purchasedBots.filter(b => b.status === 'APPROVED_FOR_ALLOCATION' && b.allocatedAmount > 0).length}</p>
          <p className="text-xs text-yellow-500">Capital allocated</p>
        </div>
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-2">
          <p className="text-xs text-[#8b949e] uppercase">Active Bots</p>
          <p className="text-3xl font-bold text-[#26a69a]">{purchasedBots.filter(b => b.status === 'ACTIVE').length}</p>
          <p className="text-xs text-[#26a69a]">Running now</p>
        </div>
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-2">
          <p className="text-xs text-[#8b949e] uppercase">Pending Signals</p>
          <p className="text-3xl font-bold text-yellow-500">{purchasedSignals.filter(s => s.status === 'PENDING_APPROVAL').length}</p>
          <p className="text-xs text-yellow-500">Need approval</p>
        </div>
      </div>

      {/* Workflow Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-sm text-[#2962ff] font-bold mb-2">ℹ️ Bot/Signal Approval Workflow</p>
        <div className="text-xs text-[#8b949e] space-y-1">
          <p><strong>Bots (3 steps):</strong></p>
          <p>1️⃣ Admin approves purchase → Status: APPROVED_FOR_ALLOCATION</p>
          <p>2️⃣ User allocates capital in Bot page</p>
          <p>3️⃣ Admin activates with win/loss settings → Status: ACTIVE</p>
          <p><strong>Signals (1 step):</strong></p>
          <p>1️⃣ Admin approves with win/loss settings → Status: ACTIVE</p>
        </div>
      </div>

      {/* Pending Bot Purchases - First Approval */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-orange-500" /> Pending Bot Purchases (Step 1)
        </h3>
        {purchasedBots.filter(b => b.status === 'PENDING_APPROVAL').length > 0 ? (
          <div className="space-y-4">
            {purchasedBots.filter(b => b.status === 'PENDING_APPROVAL').map((bot) => {
              const user = allUsers.find(u => u.id === bot.userId);
              return (
                <div key={bot.id} className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{bot.botName}</p>
                    <p className="text-xs text-[#8b949e]">User: {user?.email}</p>
                    <p className="text-xs text-[#8b949e]">Performance: {bot.performance}%</p>
                    <p className="text-xs text-orange-400 mt-1">Waiting for admin approval to proceed to capital allocation</p>
                  </div>
                  <button
                    onClick={() => {
                      approveBotPurchase(bot.id);
                    }}
                    className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-bold hover:bg-orange-500/30 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve Purchase
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-[#8b949e]">No pending bot purchases</p>
        )}
      </div>

      {/* Bots Approved for Allocation - Waiting for Capital */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#2962ff]" /> Bots Approved for Allocation (Step 2)
        </h3>
        {purchasedBots.filter(b => b.status === 'APPROVED_FOR_ALLOCATION' && b.allocatedAmount === 0).length > 0 ? (
          <div className="space-y-3">
            {purchasedBots.filter(b => b.status === 'APPROVED_FOR_ALLOCATION' && b.allocatedAmount === 0).map((bot) => {
              const user = allUsers.find(u => u.id === bot.userId);
              return (
                <div key={bot.id} className="flex items-center justify-between p-4 bg-[#2962ff]/5 border border-[#2962ff]/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{bot.botName}</p>
                    <p className="text-xs text-[#8b949e]">User: {user?.email}</p>
                    <p className="text-xs text-[#8b949e]">Performance: {bot.performance}%</p>
                    <p className="text-xs text-[#2962ff] mt-1">Approved - waiting for user to allocate capital</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8b949e]">User Balance</p>
                    <p className="text-white font-bold">${(user?.balance || 0).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-[#8b949e]">No bots waiting for capital allocation</p>
        )}
      </div>

      {/* Bots Ready for Activation - Second Approval */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Bot className="h-5 w-5 text-[#2962ff]" /> Bots Ready for Activation (Step 3)
        </h3>
        {purchasedBots.filter(b => b.status === 'APPROVED_FOR_ALLOCATION' && b.allocatedAmount > 0).length > 0 ? (
          <div className="space-y-4">
            {purchasedBots.filter(b => b.status === 'APPROVED_FOR_ALLOCATION' && b.allocatedAmount > 0).map((bot) => {
              const user = allUsers.find(u => u.id === bot.userId);
              const isAllocated = bot.allocatedAmount && bot.allocatedAmount > 0;
              const hasBalance = (user?.balance || 0) >= bot.allocatedAmount;
              
              return (
                <div 
                  key={bot.id} 
                  className={`border rounded-lg p-4 ${isAllocated ? 'bg-[#0d1117] border-[#21262d]' : 'bg-yellow-500/5 border-yellow-500/30'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-white">{bot.botName}</h4>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          isAllocated 
                            ? 'bg-[#26a69a]/20 text-[#26a69a]' 
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {isAllocated ? '✓ ALLOCATED' : '⚠ NEEDS ALLOCATION'}
                        </span>
                      </div>
                      <div className="text-xs text-[#8b949e] space-y-1">
                        <p>User: <span className="text-white font-medium">{user?.email}</span></p>
                        <p>Performance: <span className="text-[#2962ff] font-bold">{bot.performance}%</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Allocation Status */}
                  <div className="bg-[#0d1117]/50 border border-[#21262d] rounded-lg p-3 mb-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#8b949e] uppercase mb-1">Allocated Amount</p>
                        <p className="text-2xl font-bold text-white">${bot.allocatedAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8b949e] uppercase mb-1">User Balance</p>
                        <p className={`text-2xl font-bold ${hasBalance ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
                          ${(user?.balance || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {!isAllocated && (
                      <div className="bg-yellow-500/10 text-yellow-700 text-xs p-2 rounded border border-yellow-500/20">
                        ⚠️ User must allocate capital in Bot page before approval
                      </div>
                    )}
                    {isAllocated && !hasBalance && (
                      <div className="bg-red-500/10 text-red-400 text-xs p-2 rounded border border-red-500/20">
                        ❌ Insufficient balance! User balance is less than allocated amount
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  {isAllocated && hasBalance && (
                    <div 
                      className="bg-[#0d1117]/50 border border-[#21262d] rounded-lg p-4 space-y-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Outcome Selection */}
                        <div>
                          <p className="text-sm font-bold text-white mb-3">Bot Outcome</p>
                          <div className="space-y-2">
                            <label className="flex items-center gap-3 p-2 bg-[#161b22] rounded cursor-pointer hover:bg-[#1a1f26] transition-all">
                              <input
                                type="radio"
                                name={`outcome-${bot.id}`}
                                value="win"
                                checked={botOutcomes[bot.id] === 'win'}
                                onChange={() => setBotOutcomes(prev => ({ ...prev, [bot.id]: 'win' }))}
                                className="accent-[#26a69a]"
                              />
                              <span className="text-sm text-[#26a69a] font-medium">✓ WIN - Generate profit</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 bg-[#161b22] rounded cursor-pointer hover:bg-[#1a1f26] transition-all">
                              <input
                                type="radio"
                                name={`outcome-${bot.id}`}
                                value="lose"
                                checked={botOutcomes[bot.id] === 'lose'}
                                onChange={() => setBotOutcomes(prev => ({ ...prev, [bot.id]: 'lose' }))}
                                className="accent-[#ef5350]"
                              />
                              <span className="text-sm text-[#ef5350] font-medium">✗ LOSS - Generate loss</span>
                            </label>
                          </div>
                        </div>

                        {/* Duration Selection */}
                        <div className="bg-[#161b22] border-2 border-[#2962ff] rounded-lg p-4 space-y-3">
                          <p className="text-sm font-bold text-white">⏱️ Run Duration</p>
                          
                          <button
                            onClick={() => setOpenDurationModal({ type: 'bot', id: bot.id })}
                            className="w-full px-4 py-3 bg-[#0d1117] border-2 border-[#2962ff]/50 rounded-lg text-white text-sm font-semibold hover:border-[#2962ff] hover:bg-[#0d1117]/80 transition-all flex items-center justify-between"
                          >
                            <span>{botDurationValues[bot.id] ? `${botDurationValues[bot.id]} ${botDurationTypes[bot.id] || 'days'}` : 'Click to set duration'}</span>
                            <span className="text-xs">⚙️</span>
                          </button>
                          
                          {/* Display Selected Duration */}
                          {(botDurationValues[bot.id] || botDurationTypes[bot.id]) && (
                            <div className="bg-[#2962ff]/10 border border-[#2962ff]/30 rounded p-2 text-xs text-[#2962ff] font-semibold">
                              ✓ Selected: {botDurationValues[bot.id] || '7'} {botDurationTypes[bot.id] || 'days'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approve Button */}
                      <button
                        onClick={() => {
                          const outcome = botOutcomes[bot.id] || 'win';
                          const durationValue = botDurationValues[bot.id] || '7';
                          const durationType = botDurationTypes[bot.id] || 'days';
                          approveBotActivation(bot.id, durationValue, durationType, outcome);
                          // Reset form
                          setBotOutcomes(prev => ({ ...prev, [bot.id]: undefined }));
                          setBotDurationValues(prev => ({ ...prev, [bot.id]: '' }));
                          setBotDurationTypes(prev => ({ ...prev, [bot.id]: undefined }));
                        }}
                        className="w-full py-3 bg-[#26a69a] hover:bg-teal-600 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" /> Approve & Activate Bot
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-[#8b949e]">No pending bot purchases</p>
        )}
      </div>

      {/* Pending Signal Purchases - First Approval */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-orange-500" /> Pending Signal Purchases (Step 1)
        </h3>
        {purchasedSignals.filter(s => s.status === 'PENDING_APPROVAL').length > 0 ? (
          <div className="space-y-4">
            {purchasedSignals.filter(s => s.status === 'PENDING_APPROVAL').map((signal) => {
              const user = allUsers.find(u => u.id === signal.userId);
              return (
                <div key={signal.id} className="flex items-center justify-between p-4 bg-orange-500/5 border border-orange-500/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{signal.providerName}</p>
                    <p className="text-xs text-[#8b949e]">User: {user?.email}</p>
                    <p className="text-xs text-[#8b949e]">Win Rate: {signal.winRate}%</p>
                    <p className="text-xs text-orange-400 mt-1">Waiting for admin purchase approval</p>
                  </div>
                  <button
                    onClick={() => {
                      approveSignalPurchase(signal.id);
                    }}
                    className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-bold hover:bg-orange-500/30 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve Purchase
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-[#8b949e]">No pending signal purchases</p>
        )}
      </div>

      {/* Signals Approved for Allocation - Waiting for Capital */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#2962ff]" /> Signals Approved for Allocation (Step 2)
        </h3>
        {purchasedSignals.filter(s => s.status === 'APPROVED_FOR_ALLOCATION' && s.allocation === 0).length > 0 ? (
          <div className="space-y-3">
            {purchasedSignals.filter(s => s.status === 'APPROVED_FOR_ALLOCATION' && s.allocation === 0).map((signal) => {
              const user = allUsers.find(u => u.id === signal.userId);
              return (
                <div key={signal.id} className="flex items-center justify-between p-4 bg-[#2962ff]/5 border border-[#2962ff]/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{signal.providerName}</p>
                    <p className="text-xs text-[#8b949e]">User: {user?.email}</p>
                    <p className="text-xs text-[#8b949e]">Win Rate: {signal.winRate}%</p>
                    <p className="text-xs text-[#2962ff] mt-1">Approved - waiting for user to allocate capital in Signals page</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#8b949e]">User Balance</p>
                    <p className="text-white font-bold">${(user?.balance || 0).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-[#8b949e]">No signals waiting for allocation</p>
        )}
      </div>

      {/* Signals Ready for Activation - Second Approval */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" /> Signals Ready for Activation (Step 3)
        </h3>
        {purchasedSignals.filter(s => s.status === 'APPROVED_FOR_ALLOCATION' && s.allocation > 0).length > 0 ? (
          <div className="space-y-4">
            {purchasedSignals.filter(s => s.status === 'APPROVED_FOR_ALLOCATION' && s.allocation > 0).map((signal) => {
              const user = allUsers.find(u => u.id === signal.userId);
              const hasBalance = (user?.balance || 0) >= signal.allocation;
              
              return (
                <div 
                  key={signal.id} 
                  className={`border rounded-lg p-4 ${hasBalance ? 'bg-[#0d1117] border-[#21262d]' : 'bg-yellow-500/5 border-yellow-500/30'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-white">{signal.providerName}</h4>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                          hasBalance 
                            ? 'bg-[#26a69a]/20 text-[#26a69a]' 
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {hasBalance ? '✓ READY' : '⚠ INSUFFICIENT BALANCE'}
                        </span>
                      </div>
                      <div className="text-xs text-[#8b949e] space-y-1">
                        <p>User: <span className="text-white font-medium">{user?.email}</span></p>
                        <p>Win Rate: <span className="text-[#2962ff] font-bold">{signal.winRate}%</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Allocation Status */}
                  <div className="bg-[#0d1117]/50 border border-[#21262d] rounded-lg p-3 mb-4 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-[#8b949e] uppercase mb-1">Allocated Amount</p>
                        <p className="text-2xl font-bold text-white">${signal.allocation.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#8b949e] uppercase mb-1">User Balance</p>
                        <p className={`text-2xl font-bold ${hasBalance ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
                          ${(user?.balance || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {!hasBalance && (
                      <div className="bg-red-500/10 text-red-400 text-xs p-2 rounded border border-red-500/20">
                        ❌ Insufficient balance! User balance is less than allocated amount
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  {hasBalance && (
                    <div 
                      className="bg-[#0d1117]/50 border border-[#21262d] rounded-lg p-4 space-y-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onTouchStart={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Outcome Selection */}
                        <div>
                          <p className="text-sm font-bold text-white mb-3">Signal Outcome</p>
                          <div className="space-y-2">
                            <label className="flex items-center gap-3 p-2 bg-[#161b22] rounded cursor-pointer hover:bg-[#1a1f26] transition-all">
                              <input
                                type="radio"
                                name={`signal-outcome-${signal.id}`}
                                value="win"
                                checked={signalOutcomes[signal.id] === 'win'}
                                onChange={() => setSignalOutcomes(prev => ({ ...prev, [signal.id]: 'win' }))}
                                className="accent-[#26a69a]"
                              />
                              <span className="text-sm text-[#26a69a] font-medium">✓ WIN - Profitable signals</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 bg-[#161b22] rounded cursor-pointer hover:bg-[#1a1f26] transition-all">
                              <input
                                type="radio"
                                name={`signal-outcome-${signal.id}`}
                                value="lose"
                                checked={signalOutcomes[signal.id] === 'lose'}
                                onChange={() => setSignalOutcomes(prev => ({ ...prev, [signal.id]: 'lose' }))}
                                className="accent-[#ef5350]"
                              />
                              <span className="text-sm text-[#ef5350] font-medium">✗ LOSS - Losing signals</span>
                            </label>
                          </div>
                        </div>

                        {/* Duration Selection */}
                        <div className="bg-[#161b22] border-2 border-yellow-500 rounded-lg p-4 space-y-3">
                          <p className="text-sm font-bold text-white">⏱️ Subscription Duration</p>
                          
                          <button
                            onClick={() => setOpenDurationModal({ type: 'signal', id: signal.id })}
                            className="w-full px-4 py-3 bg-[#0d1117] border-2 border-yellow-500/50 rounded-lg text-white text-sm font-semibold hover:border-yellow-500 hover:bg-[#0d1117]/80 transition-all flex items-center justify-between"
                          >
                            <span>{signalDurationValues[signal.id] ? `${signalDurationValues[signal.id]} ${signalDurationTypes[signal.id] || 'days'}` : 'Click to set duration'}</span>
                            <span className="text-xs">⚙️</span>
                          </button>
                          
                          {/* Display Selected Duration */}
                          {(signalDurationValues[signal.id] || signalDurationTypes[signal.id]) && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 text-xs text-yellow-400 font-semibold">
                              ✓ Selected: {signalDurationValues[signal.id] || '7'} {signalDurationTypes[signal.id] || 'days'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Approve Button */}
                      <button
                        onClick={() => {
                          const outcome = signalOutcomes[signal.id] || 'win';
                          const duration = signalDurationValues[signal.id] || '7';
                          const durationType = signalDurationTypes[signal.id] || 'days';
                          approveSignalSubscription(signal.id, duration, durationType, outcome);
                          // Reset form
                          setSignalOutcomes(prev => ({ ...prev, [signal.id]: undefined }));
                          setSignalDurationValues(prev => ({ ...prev, [signal.id]: '' }));
                          setSignalDurationTypes(prev => ({ ...prev, [signal.id]: undefined }));
                        }}
                        className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" /> Approve & Activate Signal
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-[#8b949e]">No signals ready for activation</p>
        )}
      </div>

      {/* Active Bots History */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Active Bots Running</h3>
        {purchasedBots.filter(b => b.status === 'ACTIVE').length > 0 ? (
          <div className="space-y-3">
            {purchasedBots.filter(b => b.status === 'ACTIVE').map((bot) => {
              const user = allUsers.find(u => u.id === bot.userId);
              const runningTime = Date.now() - (bot.startedAt || bot.approvedAt || Date.now());
              const days = Math.floor(runningTime / (1000 * 60 * 60 * 24));
              const hours = Math.floor((runningTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((runningTime % (1000 * 60 * 60)) / (1000 * 60));
              return (
                <div key={bot.id} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{bot.botName}</p>
                    <p className="text-xs text-[#8b949e]">User: {user?.email}</p>
                    <p className="text-xs text-[#8b949e]">Allocated: ${bot.allocatedAmount.toFixed(2)} | Earned: ${bot.totalEarned.toFixed(2)}</p>
                    <p className="text-xs text-[#26a69a] mt-1">Running: {days}d {hours}h {minutes}m</p>
                  </div>
                  <button
                    onClick={() => terminateBot(bot.id)}
                    className="px-4 py-2 bg-[#ef5350]/20 text-[#ef5350] rounded-lg text-sm font-bold hover:bg-[#ef5350]/30"
                  >
                    Terminate
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-[#8b949e]">No active bots running</p>
        )}
      </div>

      {/* Active Signals History */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Active Signal Subscriptions</h3>
        {purchasedSignals.filter(s => s.status === 'ACTIVE').length > 0 ? (
          <div className="space-y-3">
            {purchasedSignals.filter(s => s.status === 'ACTIVE').map((signal) => {
              const user = allUsers.find(u => u.id === signal.userId);
              const runningTime = Date.now() - (signal.startedAt || signal.approvedAt || Date.now());
              const days = Math.floor(runningTime / (1000 * 60 * 60 * 24));
              const hours = Math.floor((runningTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((runningTime % (1000 * 60 * 60)) / (1000 * 60));
              return (
                <div key={signal.id} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{signal.providerName}</p>
                    <p className="text-xs text-[#8b949e]">User: {user?.email}</p>
                    <p className="text-xs text-[#8b949e]">Win Rate: {signal.winRate}% | Trades Followed: {signal.tradesFollowed}</p>
                    <p className="text-xs text-[#26a69a] mt-1">Earnings: ${signal.earnings.toFixed(2)} | Running: {days}d {hours}h {minutes}m</p>
                  </div>
                  <button
                    onClick={() => terminateSignal(signal.id)}
                    className="px-4 py-2 bg-[#ef5350]/20 text-[#ef5350] rounded-lg text-sm font-bold hover:bg-[#ef5350]/30"
                  >
                    Terminate
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-8 text-[#8b949e]">No active signals</p>
        )}
      </div>
    </div>
  );

  // Transaction Management Tab
  const TransactionTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-2">
          <p className="text-xs text-[#8b949e] uppercase">Pending Deposits</p>
          <p className="text-3xl font-bold text-white">{transactions.filter(t => t.type === 'DEPOSIT').length}</p>
          <p className="text-sm text-yellow-500">${transactions.filter(t => t.type === 'DEPOSIT').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-2">
          <p className="text-xs text-[#8b949e] uppercase">Pending Withdrawals</p>
          <p className="text-3xl font-bold text-white">{transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').length}</p>
          <p className="text-sm text-orange-500">${transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
        </div>
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-2">
          <p className="text-xs text-[#8b949e] uppercase">Total Transactions</p>
          <p className="text-3xl font-bold text-white">{transactions.length}</p>
          <p className="text-sm text-[#26a69a]">${transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Pending Transactions</h3>
        <div className="space-y-2">
          {transactions.filter(t => t.status === 'PENDING').length > 0 ? (
            transactions.filter(t => t.status === 'PENDING').map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Send className={`h-4 w-4 ${tx.type === 'DEPOSIT' ? 'text-[#26a69a]' : 'text-orange-500'}`} />
                    <div>
                      <p className="text-white font-medium">${tx.amount.toLocaleString()} {tx.type}</p>
                      <p className="text-xs text-[#8b949e]">Method: {tx.method}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveTransaction(tx.id)}
                    className="px-3 py-1 bg-[#26a69a]/20 text-[#26a69a] rounded text-xs hover:bg-[#26a69a]/30"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => rejectTransaction(tx.id)}
                    className="px-3 py-1 bg-[#ef5350]/20 text-[#ef5350] rounded text-xs hover:bg-[#ef5350]/30"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-[#8b949e] py-4">No pending transactions</p>
          )}
        </div>
      </div>

      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">All Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#21262d]">
                <th className="text-left py-3 px-4 text-[#8b949e] font-medium">User</th>
                <th className="text-left py-3 px-4 text-[#8b949e] font-medium">Type</th>
                <th className="text-left py-3 px-4 text-[#8b949e] font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-[#8b949e] font-medium">Method</th>
                <th className="text-left py-3 px-4 text-[#8b949e] font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx) => (
                <tr key={tx.id} className="border-b border-[#21262d]">
                  <td className="py-3 px-4 text-white font-medium">{allUsers.find(u => u.id === tx.userId)?.email || 'N/A'}</td>
                  <td className="py-3 px-4 text-white font-medium">{tx.type}</td>
                  <td className="py-3 px-4 text-white">${tx.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-[#8b949e]">{tx.method}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      tx.status === 'COMPLETED' ? 'bg-[#26a69a]/20 text-[#26a69a]' :
                      tx.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-[#ef5350]/20 text-[#ef5350]'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // funded accounts management tab
  const FundedAccountsTab = () => (
    <div className="space-y-6">
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Funded Account Requests</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#21262d]">
                <th className="text-left py-3 px-4 text-[#8b949e] font-medium">User</th>
                <th className="text-left py-3 px-4 text-[#8b949e] font-medium">Plan</th>
                <th className="text-left py-3 px-4 text-[#8b949e] font-medium">Status</th>
                <th className="text-left py-3 px-4 text-[#8b949e] font-medium">Requested</th>
                <th className="text-left py-3 px-4 text-[#8b949e] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchasedFundedAccounts.map(acc => (
                <tr key={acc.id} className="border-b border-[#21262d] hover:bg-[#0d1117]/50">
                  <td className="py-3 px-4 text-white">{allUsers.find(u => u.id === acc.userId)?.email || 'N/A'}</td>
                  <td className="py-3 px-4 text-white">{acc.planName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      acc.status === 'APPROVED' ? 'bg-[#26a69a]/20 text-[#26a69a]' :
                      acc.status === 'REJECTED' ? 'bg-[#ef5350]/20 text-[#ef5350]' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {acc.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#8b949e]">{new Date(acc.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4 space-x-2 flex">
                    {acc.status === 'PENDING_APPROVAL' && (
                      <>
                        <button
                          onClick={() => approveFundedAccount(acc.id)}
                          className="px-3 py-1 bg-[#26a69a]/20 text-[#26a69a] rounded text-xs hover:bg-[#26a69a]/30"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectFundedAccount(acc.id)}
                          className="px-3 py-1 bg-[#ef5350]/20 text-[#ef5350] rounded text-xs hover:bg-[#ef5350]/30"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Manual subscription management tab
  const ManualTab = () => {
    const [form, setForm] = useState({
      userId: '',
      botName: '',
      botAmt: '',
      botPerf: '',
      sigProvider: '',
      sigAlloc: '',
      sigWinRate: '',
      copyTrader: '',
      copyAlloc: '',
      copyDuration: '7'
    });

    const handleCreateBot = (e?: React.MouseEvent) => {
      if (e) e.preventDefault();
      if (form.userId && form.botName && form.botAmt && form.botPerf) {
        adminCreateBot(form.userId, form.botName, parseFloat(form.botAmt), parseFloat(form.botPerf));
        setForm(prev => ({ ...prev, botName: '', botAmt: '', botPerf: '', userId: '' }));
      }
    };
    const handleCreateSignal = (e?: React.MouseEvent) => {
      if (e) e.preventDefault();
      if (form.userId && form.sigProvider && form.sigAlloc && form.sigWinRate) {
        adminCreateSignal(form.userId, form.sigProvider, parseFloat(form.sigAlloc), parseFloat(form.sigWinRate));
        setForm(prev => ({ ...prev, sigProvider: '', sigAlloc: '', sigWinRate: '', userId: '' }));
      }
    };
    const handleCreateCopy = (e?: React.MouseEvent) => {
      if (e) e.preventDefault();
      if (form.userId && form.copyTrader && form.copyAlloc && form.copyDuration && form.traderReturn) {
        adminCreateCopyTrade(form.userId, form.copyTrader, parseFloat(form.copyAlloc), form.copyDuration, 'days', 'Medium', parseFloat(form.traderReturn));
        setForm(prev => ({ ...prev, copyTrader: '', copyAlloc: '', copyDuration: '7', traderReturn: '', userId: '' }));
      }
    };

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white">Manual Subscriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bot form */}
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-3">
            <h4 className="text-white font-bold">New Bot</h4>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-pointer focus:border-[#2962ff] focus:outline-none"
            >
              <option value="">Select user</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Bot name"
              value={form.botName}
              onChange={(e) => setForm({ ...form, botName: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-text focus:border-[#2962ff] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Allocation"
              value={form.botAmt}
              onChange={(e) => setForm({ ...form, botAmt: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-text focus:border-[#2962ff] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Performance %"
              value={form.botPerf}
              onChange={(e) => setForm({ ...form, botPerf: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-text focus:border-[#2962ff] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreateBot}
              className="w-full py-2 bg-[#26a69a] hover:bg-teal-600 text-white font-bold rounded"
            >Create Bot</button>
          </div>

          {/* Signal form */}
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-3">
            <h4 className="text-white font-bold">New Signal</h4>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-pointer focus:border-[#2962ff] focus:outline-none"
            >
              <option value="">Select user</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Provider name"
              value={form.sigProvider}
              onChange={(e) => setForm({ ...form, sigProvider: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-text focus:border-[#2962ff] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Allocation"
              value={form.sigAlloc}
              onChange={(e) => setForm({ ...form, sigAlloc: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-text focus:border-[#2962ff] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Win rate %"
              value={form.sigWinRate}
              onChange={(e) => setForm({ ...form, sigWinRate: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-text focus:border-[#2962ff] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreateSignal}
              className="w-full py-2 bg-[#2962ff] hover:bg-[#1f57d8] text-white font-bold rounded"
            >Create Signal</button>
          </div>

          {/* Copy trade form */}
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-3">
            <h4 className="text-white font-bold">New Copy Trade</h4>
            <select
              value={form.userId}
              onChange={(e) => setForm({ ...form, userId: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-pointer focus:border-[#2962ff] focus:outline-none"
            >
              <option value="">Select user</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Trader name"
              value={form.copyTrader}
              onChange={(e) => setForm({ ...form, copyTrader: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-text focus:border-[#2962ff] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Allocation"
              value={form.copyAlloc}
              onChange={(e) => setForm({ ...form, copyAlloc: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-text focus:border-[#2962ff] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Duration (days)"
              value={form.copyDuration}
              onChange={(e) => setForm({ ...form, copyDuration: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-text focus:border-[#2962ff] focus:outline-none"
            />
            <input
              type="number"
              placeholder="Trader return %"
              value={form.traderReturn}
              onChange={(e) => setForm({ ...form, traderReturn: e.target.value })}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#21262d] rounded text-white cursor-text focus:border-[#2962ff] focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreateCopy}
              className="w-full py-2 bg-[#ef5350] hover:bg-red-600 text-white font-bold rounded"
            >Create Copy Trade</button>
          </div>
        </div>

        {/* Existing subscriptions lists */}
        <div className="space-y-6">
          <h4 className="text-white font-bold">Purchased Bots</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#21262d]">
                  <th className="px-4 py-2 text-left text-[#8b949e]">User</th>
                  <th className="px-4 py-2 text-left text-[#8b949e]">Bot</th>
                  <th className="px-4 py-2 text-right text-[#8b949e]">Allocation</th>
                  <th className="px-4 py-2 text-left text-[#8b949e]">Status</th>
                  <th className="px-4 py-2 text-right text-[#8b949e]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchasedBots.map(b => (
                  <tr key={b.id} className="border-b border-[#21262d] hover:bg-[#0d1117]/50">
                    <td className="px-4 py-2 text-white">{allUsers.find(u => u.id === b.userId)?.email || 'N/A'}</td>
                    <td className="px-4 py-2 text-white">{b.botName}</td>
                    <td className="px-4 py-2 text-right text-white">${b.allocatedAmount.toFixed(2)}</td>
                    <td className="px-4 py-2 text-white">{b.status}</td>
                    <td className="px-4 py-2 text-right">
                      {b.status === 'ACTIVE' && (
                        <button
                          onClick={() => terminateBot(b.id)}
                          className="px-2 py-1 bg-[#ef5350]/20 text-[#ef5350] rounded text-xs hover:bg-[#ef5350]/30"
                        >Terminate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="text-white font-bold">Purchased Signals</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#21262d]">
                  <th className="px-4 py-2 text-left text-[#8b949e]">User</th>
                  <th className="px-4 py-2 text-left text-[#8b949e]">Provider</th>
                  <th className="px-4 py-2 text-right text-[#8b949e]">Allocation</th>
                  <th className="px-4 py-2 text-left text-[#8b949e]">Status</th>
                  <th className="px-4 py-2 text-right text-[#8b949e]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchasedSignals.map(s => (
                  <tr key={s.id} className="border-b border-[#21262d] hover:bg-[#0d1117]/50">
                    <td className="px-4 py-2 text-white">{allUsers.find(u => u.id === s.userId)?.email || 'N/A'}</td>
                    <td className="px-4 py-2 text-white">{s.providerName}</td>
                    <td className="px-4 py-2 text-right text-white">${s.allocation.toFixed(2)}</td>
                    <td className="px-4 py-2 text-white">{s.status}</td>
                    <td className="px-4 py-2 text-right">
                      {s.status === 'ACTIVE' && (
                        <button
                          onClick={() => terminateSignal(s.id)}
                          className="px-2 py-1 bg-[#ef5350]/20 text-[#ef5350] rounded text-xs hover:bg-[#ef5350]/30"
                        >Terminate</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="text-white font-bold">Copy Trades</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#21262d]">
                  <th className="px-4 py-2 text-left text-[#8b949e]">User</th>
                  <th className="px-4 py-2 text-left text-[#8b949e]">Trader</th>
                  <th className="px-4 py-2 text-right text-[#8b949e]">Allocation</th>
                  <th className="px-4 py-2 text-left text-[#8b949e]">Status</th>
                  <th className="px-4 py-2 text-right text-[#8b949e]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchasedCopyTrades.map(ct => (
                  <tr key={ct.id} className="border-b border-[#21262d] hover:bg-[#0d1117]/50">
                    <td className="px-4 py-2 text-white">{allUsers.find(u => u.id === ct.userId)?.email || 'N/A'}</td>
                    <td className="px-4 py-2 text-white">{ct.traderName}</td>
                    <td className="px-4 py-2 text-right text-white">${ct.allocation.toFixed(2)}</td>
                    <td className="px-4 py-2 text-white">{ct.status}</td>
                    <td className="px-4 py-2 text-right">
                      {ct.status === 'ACTIVE' && (
                        <button
                          onClick={() => {
                            const p = prompt('Enter profit/loss amount');
                            if (p) closeCopyTrade(ct.id, parseFloat(p));
                          }}
                          className="px-2 py-1 bg-[#ef5350]/20 text-[#ef5350] rounded text-xs hover:bg-[#ef5350]/30"
                        >Close</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'users':
        return <UserManagementTab />;
      case 'balance':
        return (
          <BalanceControlTab
            allUsers={allUsers}
            addBalance={addBalance}
            removeBalance={removeBalance}
          />
        );
      case 'pages':
        return <PageAccessTab />;
      case 'approvals':
        return <ApprovalTab />;
      case 'kyc':
        return (
          <KYCManagementTab
            allUsers={allUsers}
            approveKYC={approveKYC}
            rejectKYC={rejectKYC}
          />
        );
      case 'referrals':
        return <ReferralManagementTab />;
      case 'funded':
        return <FundedAccountsTab />;
      case 'transactions':
        return <TransactionTab />;
      case 'bot-management':
        return (
          <BotManagementTabComponent
            botTemplates={botTemplates}
            addBotTemplate={addBotTemplate}
            editBotTemplate={editBotTemplate}
            deleteBotTemplate={deleteBotTemplate}
          />
        );
      case 'signal-management':
        return (
          <SignalManagementTabComponent
            signalTemplates={signalTemplates}
            addSignalTemplate={addSignalTemplate}
            editSignalTemplate={editSignalTemplate}
            deleteSignalTemplate={deleteSignalTemplate}
          />
        );
      case 'copy-trade-management':
        return (
          <CopyTradeManagementTab
            copyTradeTemplates={copyTradeTemplates}
            addCopyTradeTemplate={addCopyTradeTemplate}
            editCopyTradeTemplate={editCopyTradeTemplate}
            deleteCopyTradeTemplate={deleteCopyTradeTemplate}
          />
        );
      case 'wallets-banks':
        return (
          <WalletBankManagementTab
            wallets={wallets}
            bankAccounts={bankAccounts}
            allUsers={allUsers}
            addWallet={addWallet}
            editWallet={editWallet}
            removeWallet={removeWallet}
            addBankAccount={addBankAccount}
            editBankAccount={editBankAccount}
            removeBankAccount={removeBankAccount}
            toggleBankAccountStatus={toggleBankAccountStatus}
          />
        );
      case 'deposit-wallets':
        return <AdminWalletManagement />;
      case 'credit-card-deposits':
        return <AdminCreditCardDeposits />;
      case 'manual':
        return <ManualTab />;
      default:
        return <DashboardTab />;
    }
  };

  // Duration Modal Component
  const DurationModal = () => {
    if (!openDurationModal) return null;

    const isBotModal = openDurationModal.type === 'bot';
    const id = openDurationModal.id;
    const currentValue = isBotModal ? botDurationValues[id] ?? '' : signalDurationValues[id] ?? '';
    const currentType = isBotModal ? botDurationTypes[id] ?? 'days' : signalDurationTypes[id] ?? 'days';

    return createPortal(
      <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            setOpenDurationModal(null);
          }
        }}
      >
        <div 
          className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 w-96 shadow-2xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-bold text-white mb-4">Set Duration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#8b949e] font-semibold block mb-2">Duration Value</label>
              <input
                type="number"
                min="1"
                max="999"
                placeholder="Enter duration (e.g., 7)"
                value={currentValue}
                onChange={(e) => {
                  if (isBotModal) {
                    setBotDurationValues(prev => ({ ...prev, [id]: e.target.value }));
                  } else {
                    setSignalDurationValues(prev => ({ ...prev, [id]: e.target.value }));
                  }
                }}
                autoFocus
                className="w-full px-4 py-3 bg-[#0d1117] border-2 border-[#2962ff]/50 rounded-lg text-white text-sm font-semibold focus:border-[#2962ff] focus:outline-none transition-all hover:border-[#2962ff]"
              />
            </div>

            <div>
              <label className="text-xs text-[#8b949e] font-semibold block mb-2">Time Unit</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const units: ('minutes' | 'hours' | 'days')[] = ['minutes', 'hours', 'days'];
                    const currentIndex = units.indexOf(currentType);
                    const prevIndex = currentIndex === 0 ? 2 : currentIndex - 1;
                    if (isBotModal) {
                      setBotDurationTypes(prev => ({ ...prev, [id]: units[prevIndex] }));
                    } else {
                      setSignalDurationTypes(prev => ({ ...prev, [id]: units[prevIndex] }));
                    }
                  }}
                  className="px-3 py-3 bg-[#0d1117] border-2 border-[#2962ff]/50 rounded-lg text-white font-bold hover:border-[#2962ff] hover:bg-[#0d1117]/80 transition-all"
                >
                  &lt;
                </button>
                <select
                  value={currentType}
                  onChange={(e) => {
                    if (isBotModal) {
                      setBotDurationTypes(prev => ({ ...prev, [id]: e.target.value as 'minutes' | 'hours' | 'days' }));
                    } else {
                      setSignalDurationTypes(prev => ({ ...prev, [id]: e.target.value as 'minutes' | 'hours' | 'days' }));
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-[#0d1117] border-2 border-[#2962ff]/50 rounded-lg text-white text-sm font-semibold cursor-pointer focus:border-[#2962ff] focus:outline-none transition-all hover:border-[#2962ff]"
                >
                  <option value="minutes">📍 Minutes</option>
                  <option value="hours">⏳ Hours</option>
                  <option value="days">📅 Days</option>
                </select>
                <button
                  onClick={() => {
                    const units: ('minutes' | 'hours' | 'days')[] = ['minutes', 'hours', 'days'];
                    const currentIndex = units.indexOf(currentType);
                    const nextIndex = currentIndex === 2 ? 0 : currentIndex + 1;
                    if (isBotModal) {
                      setBotDurationTypes(prev => ({ ...prev, [id]: units[nextIndex] }));
                    } else {
                      setSignalDurationTypes(prev => ({ ...prev, [id]: units[nextIndex] }));
                    }
                  }}
                  className="px-3 py-3 bg-[#0d1117] border-2 border-[#2962ff]/50 rounded-lg text-white font-bold hover:border-[#2962ff] hover:bg-[#0d1117]/80 transition-all"
                >
                  &gt;
                </button>
              </div>
            </div>

            <button
              onClick={() => setOpenDurationModal(null)}
              className="w-full py-3 bg-[#26a69a] hover:bg-teal-600 text-white font-bold rounded-lg transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <DurationModal />
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] border border-[#21262d] rounded-lg p-8 space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="h-6 w-6 text-[#2962ff]" />
          <span className="text-[#2962ff] font-bold text-sm">ADMIN CONTROL PANEL</span>
        </div>
        <h1 className="text-4xl font-bold text-white">Platform Administration</h1>
        <p className="text-[#8b949e]">Manage all users, balances, transactions, and system access</p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 bg-[#161b22] border border-[#21262d] rounded-lg p-4 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2962ff] text-white shadow-lg shadow-blue-500/20'
                  : 'bg-[#0d1117] text-[#8b949e] border border-[#21262d] hover:border-[#2962ff] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {renderTab()}
      </div>
    </div>
    </>
  );
}
