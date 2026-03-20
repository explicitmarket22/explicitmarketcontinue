import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  TrendingUp,
  BarChart3,
  Zap,
  Radio,
  Calendar,
  Filter,
} from 'lucide-react';

export function HistoryPage() {
  const {
    user,
    getUserTransactions,
    purchasedCopyTrades,
    purchasedBots,
    purchasedSignals,
    purchasedFundedAccounts,
    recentTrades,
  } = useStore();

  // Debug logging
  React.useEffect(() => {
    console.log('📊 History Page Loaded - Debug Info:');
    console.log('   User:', user?.name || 'Not logged in');
    console.log('   Purchased Bots:', purchasedBots?.length || 0);
    console.log('   Purchased Signals:', purchasedSignals?.length || 0);
    console.log('   Purchased Copy Trades:', purchasedCopyTrades?.length || 0);
    if (purchasedBots && purchasedBots.length > 0) {
      console.log('   Bot Details:', purchasedBots);
    }
  }, [user, purchasedBots, purchasedSignals, purchasedCopyTrades]);

  const [activeTab, setActiveTab] = useState<'all' | 'transactions' | 'copy-trades' | 'bots' | 'signals' | 'funded-accounts' | 'recent-trades'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed' | 'completed' | 'pending' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get user's transaction history
  const userTransactions = user ? getUserTransactions(user.id) : [];

  // Convert transactions to a unified format
  const transactionHistory = userTransactions.map((tx) => ({
    id: tx.id,
    type: 'transaction',
    title: tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal',
    amount: tx.amount,
    date: tx.date,
    status: tx.status,
    method: tx.method,
    icon: tx.type === 'DEPOSIT' ? ArrowDownLeft : ArrowUpRight,
    color: tx.type === 'DEPOSIT' ? 'text-[#26a69a]' : 'text-[#ef5350]',
  }));

  // Convert copy trades to unified format
  const copyTradeHistory = (purchasedCopyTrades || []).map((ct) => ({
    id: ct.id,
    type: 'copy-trade',
    title: `Copy Trade - ${ct.traderName}`,
    amount: ct.profit,
    allocation: ct.allocation,
    date: ct.startDate,
    endDate: ct.endDate,
    status: ct.status,
    winRate: ct.winRate,
    copiedTrades: ct.copiedTrades,
    icon: Copy,
    color: ct.profit >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]',
  }));

  // Convert bots to unified format
  const botHistory = (purchasedBots || []).map((bot) => {
    console.log('Converting bot to history:', bot.botName, 'Status:', bot.status);
    return {
      id: bot.id,
      type: 'bot',
      title: `Bot - ${bot.botName}`,
      amount: bot.totalEarned - bot.totalLost,
      allocation: bot.allocatedAmount,
      date: bot.purchasedAt,
      endDate: bot.endDate,
      status: bot.status,
      earnings: bot.totalEarned,
      losses: bot.totalLost,
      performance: bot.performance,
      icon: Zap,
      color: bot.totalEarned - bot.totalLost >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]',
    };
  });

  // Convert signals to unified format
  const signalHistory = (purchasedSignals || []).map((sig) => ({
    id: sig.id,
    type: 'signal',
    title: `Signal - ${sig.providerName}`,
    amount: sig.earnings,
    allocation: sig.allocation,
    date: sig.subscribedAt,
    endDate: sig.endDate,
    status: sig.status,
    winRate: sig.winRate,
    tradesFollowed: sig.tradesFollowed,
    icon: Radio,
    color: sig.earnings >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]',
  }));

  // Convert funded accounts to unified format
  const fundedAccountHistory = (purchasedFundedAccounts || []).map((fa) => ({
    id: fa.id,
    type: 'funded-account',
    title: `Funded Account - ${fa.planName}`,
    amount: 0, // Will track profit/loss separately
    allocation: fa.capital,
    date: fa.purchasedAt,
    creditedAt: fa.creditedAt,
    status: fa.status,
    profitTarget: fa.profitTarget,
    maxDrawdown: fa.maxDrawdown,
    icon: BarChart3,
    color: 'text-[#2962ff]',
  }));

  // Combine all histories
  const allHistories = [
    ...transactionHistory,
    ...copyTradeHistory,
    ...botHistory,
    ...signalHistory,
    ...fundedAccountHistory,
  ];

  // Filter based on tab and search
  const filteredHistories = allHistories.filter((item) => {
    // Filter by tab
    if (activeTab !== 'all' && item.type !== activeTab.replace('-', '')) return false;

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'active' && item.status !== 'ACTIVE') return false;
      if (filterStatus === 'closed' && item.status !== 'CLOSED') return false;
      if (filterStatus === 'completed' && item.status !== 'COMPLETED') return false;
      if (filterStatus === 'pending' && item.status !== 'PENDING') return false;
      if (filterStatus === 'failed' && item.status !== 'REJECTED') return false;
    }

    // Filter by search
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Sort by date descending
  const sortedHistories = filteredHistories.sort((a, b) => b.date - a.date);

  // Calculate stats
  const totalDeposits = transactionHistory
    .filter((tx) => tx.title === 'Deposit' && tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawals = transactionHistory
    .filter((tx) => tx.title === 'Withdrawal' && tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalTradingProfit = [
    ...copyTradeHistory,
    ...botHistory,
    ...signalHistory,
  ]
    .filter((item) => item.status === 'CLOSED')
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Calendar className="h-8 w-8 text-[#26a69a]" />
            History
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#8b949e] mt-1">
            View all your transaction and trading history
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 bg-gray-100 dark:bg-[#161b22] p-4 rounded-lg border border-gray-300 dark:border-[#21262d]">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-[#8b949e] mb-1">
              Total Deposits
            </p>
            <p className="text-lg font-mono font-bold text-[#26a69a]">
              {formatCurrency(totalDeposits)}
            </p>
          </div>
          <div className="w-[1px] bg-gray-300 dark:bg-[#21262d]" />
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-[#8b949e] mb-1">
              Trading P&L
            </p>
            <p
              className={`text-lg font-mono font-bold ${
                totalTradingProfit >= 0
                  ? 'text-[#26a69a]'
                  : 'text-[#ef5350]'
              }`}
            >
              {formatCurrency(totalTradingProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 dark:bg-[#161b22] p-1 rounded border border-gray-300 dark:border-[#21262d] overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: 'All History' },
          { id: 'recent-trades', label: 'Recent Trades' },
          { id: 'transactions', label: 'Transactions' },
          { id: 'copy-trades', label: 'Copy Trades' },
          { id: 'bots', label: 'Bots' },
          { id: 'signals', label: 'Signals' },
          { id: 'funded-accounts', label: 'Funded Accounts' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 md:px-6 py-2 text-sm font-bold rounded capitalize transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#2962ff] text-white shadow-lg'
                : 'text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search history..."
            className="w-full bg-[#161b22] border border-[#21262d] rounded px-4 py-2 text-white text-sm focus:border-[#26a69a] focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'closed', 'completed', 'pending'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-3 py-1 text-xs font-bold rounded capitalize transition-all ${
                filterStatus === status
                  ? 'bg-[#26a69a] text-white'
                  : 'bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden">
        {sortedHistories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-[#0d1117] text-[#8b949e] text-xs uppercase border-b border-[#21262d]">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Type</th>
                  <th className="px-6 py-4 text-left font-bold">Description</th>
                  <th className="px-6 py-4 text-right font-bold">Amount</th>
                  <th className="px-6 py-4 text-left font-bold">Date</th>
                  <th className="px-6 py-4 text-left font-bold">Status</th>
                  <th className="px-6 py-4 text-right font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262d]">
                {sortedHistories.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1c2128] transition">
                    {/* Type Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="font-bold text-white text-sm capitalize">
                          {item.type.replace('-', ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Description Column */}
                    <td className="px-6 py-4 text-[#8b949e] text-sm">
                      {item.title}
                    </td>

                    {/* Amount Column */}
                    <td className="px-6 py-4 font-mono text-white text-right">
                      <span className={item.amount >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}>
                        {item.amount >= 0 ? '+' : ''}
                        {formatCurrency(item.amount)}
                      </span>
                    </td>

                    {/* Date Column */}
                    <td className="px-6 py-4 text-[#8b949e] text-sm">
                      {formatDate(item.date)}
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded text-xs font-bold inline-block capitalize ${
                          item.status === 'COMPLETED' || item.status === 'CLOSED'
                            ? 'bg-[#26a69a]/10 text-[#26a69a]'
                            : item.status === 'PENDING' ||
                              item.status === 'ACTIVE'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-[#ef5350]/10 text-[#ef5350]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Details Column */}
                    <td className="px-6 py-4 text-right">
                      {item.type === 'transaction' && (
                        <span className="text-[#8b949e] text-xs capitalize">
                          {item.method}
                        </span>
                      )}
                      {item.type === 'copy-trade' && (
                        <span className="text-[#8b949e] text-xs">
                          {item.copiedTrades} trades
                        </span>
                      )}
                      {item.type === 'bot' && (
                        <span className="text-[#8b949e] text-xs">
                          {item.performance?.toFixed(1)}% perf
                        </span>
                      )}
                      {item.type === 'signal' && (
                        <span className="text-[#8b949e] text-xs">
                          {item.tradesFollowed} trades
                        </span>
                      )}
                      {item.type === 'funded-account' && (
                        <span className="text-[#8b949e] text-xs">
                          ${item.profitTarget?.toFixed(0)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-[#8b949e] text-sm">No history records found</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {sortedHistories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
            <p className="text-xs text-[#8b949e] mb-2">Total Records</p>
            <p className="text-lg font-mono font-bold text-white">
              {sortedHistories.length}
            </p>
          </div>
          <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
            <p className="text-xs text-[#8b949e] mb-2">Total Withdrawn</p>
            <p className="text-lg font-mono font-bold text-[#ef5350]">
              {formatCurrency(totalWithdrawals)}
            </p>
          </div>
          <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
            <p className="text-xs text-[#8b949e] mb-2">Active Items</p>
            <p className="text-lg font-mono font-bold text-yellow-500">
              {allHistories.filter((h) => h.status === 'ACTIVE').length}
            </p>
          </div>
          <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
            <p className="text-xs text-[#8b949e] mb-2">Total Items</p>
            <p className="text-lg font-mono font-bold text-white">
              {allHistories.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
