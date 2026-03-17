import React, { useState } from 'react';
import { useStore } from '../lib/store';
import {
  Bot,
  Zap,
  Shield,
  BarChart2,
  PlayCircle,
  StopCircle,
  TrendingUp,
  Award,
  Clock,
  Lock,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

export function BotPage() {
  const { 
    botActive, 
    toggleBot, 
    trades, 
    account, 
    purchasedBots, 
    purchaseBot,
    allocateBotCapital,
    pauseBot,
    resumeBot,
    terminateBot,
    user,
    botTemplates
  } = useStore();
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    bot: null as any,
    price: 0
  });
  const [allocationModal, setAllocationModal] = useState({
    isOpen: false,
    botId: '',
    amount: ''
  });

  const bots = [
    {
      id: 'scalper-pro',
      name: 'Scalper Pro',
      type: 'High Frequency',
      risk: 'High',
      return: 124,
      price: 249.99,
      color: 'from-purple-500 to-pink-500',
      description: 'Fast-paced trading bot optimized for quick profits',
      trades: 324,
      winRate: 64,
      maxDrawdown: 15,
      isTemplate: false
    },
    {
      id: 'trend-hunter',
      name: 'Trend Hunter V2',
      type: 'Swing Trading',
      risk: 'Medium',
      return: 175,
      price: 599.99,
      color: 'from-blue-500 to-cyan-500',
      description: 'Captures medium-term market trends',
      trades: 156,
      winRate: 72,
      maxDrawdown: 8,
      isTemplate: false
    },
    {
      id: 'gold-rush',
      name: 'Gold Rush AI',
      type: 'Commodities',
      risk: 'Medium',
      return: 168,
      price: 219.99,
      color: 'from-yellow-500 to-orange-500',
      description: 'Specialized in precious metals trading',
      trades: 89,
      winRate: 68,
      maxDrawdown: 12,
      isTemplate: false
    },
    {
      id: 'smart-grid',
      name: 'Smart Grid',
      type: 'Arbitrage',
      risk: 'Low',
      return: 212,
      price: 749.99,
      color: 'from-green-500 to-emerald-500',
      description: 'Safe arbitrage strategy with consistent returns',
      trades: 204,
      winRate: 85,
      maxDrawdown: 3,
      isTemplate: false
    },
    {
      id: 'neural-trader',
      name: 'Neural Trader',
      type: 'AI Prediction',
      risk: 'High',
      return: 356,
      price: 999.99,
      color: 'from-red-500 to-rose-500',
      description: 'Advanced AI-powered prediction engine',
      trades: 421,
      winRate: 71,
      maxDrawdown: 18,
      isTemplate: false
    },
    {
      id: 'crypto-momentum',
      name: 'Crypto Momentum',
      type: 'Crypto Only',
      risk: 'High',
      return: 89,
      price: 149.99,
      color: 'from-indigo-500 to-violet-500',
      description: 'Specialized in cryptocurrency markets',
      trades: 267,
      winRate: 66,
      maxDrawdown: 16,
      isTemplate: false
    }
  ];

  // Combine hardcoded bots with admin-created templates
  const templateBots = botTemplates.map(template => ({
    id: template.id,
    name: template.name,
    type: template.type,
    risk: template.risk,
    return: template.performance,
    price: template.price,
    color: 'from-cyan-500 to-blue-500',
    description: template.description,
    trades: template.trades,
    winRate: template.winRate,
    maxDrawdown: template.maxDrawdown,
    isTemplate: true
  }));

  const allBots = [...bots, ...templateBots];

  const handleBuyBot = (bot: any) => {
    setPaymentModal({
      isOpen: true,
      bot,
      price: typeof bot.price === 'number' ? bot.price : 0
    });
  };

  const handlePaymentComplete = () => {
    if (paymentModal.bot) {
      const botData = paymentModal.bot;
      purchaseBot(
        `bot_${Date.now()}`,
        botData.name,
        botData.price,
        botData.return
      );
      setPaymentModal({ isOpen: false, bot: null, price: 0 });
    }
  };

  const handleAllocateCapital = () => {
    if (allocationModal.botId && allocationModal.amount) {
      const amount = parseFloat(allocationModal.amount);
      if (amount > 0 && (user?.balance ?? 0) >= amount) {
        allocateBotCapital(allocationModal.botId, amount);
        setAllocationModal({ isOpen: false, botId: '', amount: '' });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-10 pb-20 md:pb-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-50 dark:from-[#0d1117] via-gray-100 dark:via-[#161b22] to-gray-50 dark:to-[#0d1117] border border-gray-300 dark:border-[#21262d] rounded-lg overflow-hidden p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#2962ff] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bot className="h-6 w-6 text-[#2962ff]" />
            <span className="text-[#2962ff] font-bold text-sm">AI-Powered Trading</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Automate Your Trading Strategy</h1>
          <p className="text-gray-600 dark:text-[#8b949e] max-w-2xl mx-auto">
            Deploy professional trading algorithms to execute trades 24/7 with precision
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Available Bots</span>
            <Bot className="h-4 w-4 text-[#2962ff]" />
          </div>
          <span className="block text-2xl font-bold text-gray-900 dark:text-white">{allBots.length}</span>
          <span className="text-xs text-gray-600 dark:text-[#8b949e]">Premium & Free</span>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Avg Win Rate</span>
            <Award className="h-4 w-4 text-[#26a69a]" />
          </div>
          <span className="block text-2xl font-bold text-[#26a69a]">71%</span>
          <span className="text-xs text-gray-600 dark:text-[#8b949e]">Across all bots</span>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Total Trades</span>
            <BarChart2 className="h-4 w-4 text-yellow-500" />
          </div>
          <span className="block text-2xl font-bold text-gray-900 dark:text-white">1,561</span>
          <span className="text-xs text-gray-600 dark:text-[#8b949e]">Successfully executed</span>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Users Benefiting</span>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </div>
          <span className="block text-2xl font-bold text-gray-900 dark:text-white">3,247</span>
          <span className="text-xs text-gray-600 dark:text-[#8b949e]">Active traders</span>
        </div>
      </div>

      {/* Active Bot Section */}
      <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#2962ff]/20 rounded-lg">
              <Bot className="h-6 w-6 text-[#2962ff]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">My Active Bot</h2>
              <p className="text-sm text-[#8b949e]">
                {botActive ? 'Running: Scalper Pro' : 'No bot currently running'}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleBot(!botActive)}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-all w-full md:w-auto ${
              botActive
                ? 'bg-[#ef5350]/20 text-[#ef5350] hover:bg-[#ef5350]/30'
                : 'bg-[#26a69a] text-white hover:bg-teal-600 hover:shadow-lg hover:shadow-teal-500/30'
            }`}
          >
            {botActive ? (
              <>
                <StopCircle className="h-4 w-4" /> Stop Bot
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" /> Start Bot
              </>
            )}
          </button>
        </div>

        {botActive && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0d1117] p-4 rounded-lg border border-[#21262d] space-y-2">
              <span className="text-xs text-[#8b949e]">Total Trades Today</span>
              <span className="block text-2xl font-bold text-white">24</span>
              <span className="text-xs text-[#26a69a]">+2 pending</span>
            </div>
            <div className="bg-[#0d1117] p-4 rounded-lg border border-[#21262d] space-y-2">
              <span className="text-xs text-[#8b949e]">Win Rate</span>
              <span className="block text-2xl font-bold text-[#26a69a]">68%</span>
              <span className="text-xs text-[#8b949e]">16/24 won</span>
            </div>
            <div className="bg-[#0d1117] p-4 rounded-lg border border-[#21262d] space-y-2">
              <span className="text-xs text-[#8b949e]">Daily Profit</span>
              <span className="block text-2xl font-bold text-[#26a69a]">+$1,240.50</span>
              <span className="text-xs text-[#8b949e]">+12.4%</span>
            </div>
            <div className="bg-[#0d1117] p-4 rounded-lg border border-[#21262d] space-y-2">
              <span className="text-xs text-[#8b949e]">Status</span>
              <span className="block text-2xl font-bold text-[#2962ff] animate-pulse">Active</span>
              <span className="text-xs text-[#8b949e]">Running smoothly</span>
            </div>
          </div>
        )}
      </div>

      {/* My Purchased Bots Section */}
      {purchasedBots.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white mb-2">My Purchased Bots</h3>
            <p className="text-[#8b949e]">Bots you own with real-time performance monitoring</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {purchasedBots.map((purchase) => (
              <div
                key={purchase.id}
                className="group relative bg-gradient-to-br from-[#161b22] via-[#161b22] to-[#0d1117] border border-[#21262d] rounded-2xl overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-2xl hover:shadow-blue-500/20"
              >
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#2962ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Top Accent Bar */}
                <div className="h-1.5 bg-gradient-to-r from-[#2962ff] to-blue-600" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 space-y-3 border-b border-[#21262d]">
                    <div className="space-y-1.5">
                      <h4 className="text-xl font-bold text-white">{purchase.botName}</h4>
                      <span
                        className={`inline-flex text-xs font-bold px-3 py-1.5 rounded-full border ${
                          purchase.status === 'ACTIVE'
                            ? 'bg-[#26a69a]/10 text-[#26a69a] border-[#26a69a]/30'
                            : purchase.status === 'APPROVED_FOR_ALLOCATION'
                            ? 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/30'
                            : purchase.status === 'PENDING_APPROVAL'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                            : purchase.status === 'PAUSED'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                            : 'bg-[#8b949e]/10 text-[#8b949e] border-[#8b949e]/30'
                        }`}
                      >
                        {purchase.status === 'PENDING_APPROVAL' ? '⏳ Pending Approval' : 
                         purchase.status === 'APPROVED_FOR_ALLOCATION' ? '✓ Approved - Allocate Capital' :
                         purchase.status === 'PAUSED' ? '⏸ Paused' :
                         purchase.status === 'ACTIVE' ? '✓ Active' :
                         purchase.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4 flex-1">
                    {(purchase.status === 'ACTIVE' || purchase.status === 'APPROVED_FOR_ALLOCATION') && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#0d1117] p-4 rounded-lg border border-[#21262d] space-y-1.5">
                            <span className="text-xs text-[#8b949e] font-medium">Allocated</span>
                            <span className="block text-lg font-bold text-white">
                              ${purchase.allocatedAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="bg-[#0d1117] p-4 rounded-lg border border-[#21262d] space-y-1.5">
                            <span className="text-xs text-[#8b949e] font-medium">Earned</span>
                            <span className="block text-lg font-bold text-[#26a69a]">
                              ${purchase.totalEarned.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {purchase.status === 'PENDING_APPROVAL' && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center space-y-2">
                        <p className="text-yellow-400 text-sm font-bold">⏳ Awaiting Admin Review</p>
                        <p className="text-xs text-[#8b949e]">Your bot will be reviewed and activated shortly</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 border-t border-[#21262d] bg-[#0d1117]/50 space-y-2">
                    {purchase.status === 'APPROVED_FOR_ALLOCATION' && purchase.allocatedAmount === 0 ? (
                      <button
                        onClick={() => setAllocationModal({ isOpen: true, botId: purchase.id, amount: '' })}
                        className="w-full py-2.5 bg-gradient-to-r from-[#2962ff] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                      >
                        <Plus className="h-4 w-4" /> Allocate Capital
                      </button>
                    ) : purchase.status === 'ACTIVE' && purchase.allocatedAmount > 0 ? (
                      <div className="space-y-2">
                        <div className="text-xs text-[#8b949e] text-center bg-[#161b22] p-2.5 rounded-lg border border-[#21262d]">
                          Trading with ${purchase.allocatedAmount.toFixed(2)}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => pauseBot(purchase.id)}
                            className="flex-1 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg font-bold text-sm transition-all border border-yellow-500/30"
                          >
                            ⏸ Pause
                          </button>
                          <button
                            onClick={() => terminateBot(purchase.id)}
                            className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold text-sm transition-all border border-red-500/30 flex items-center justify-center gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Stop
                          </button>
                        </div>
                      </div>
                    ) : purchase.status === 'PAUSED' ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => resumeBot(purchase.id)}
                          className="w-full py-2.5 bg-gradient-to-r from-[#26a69a] to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/20"
                        >
                          ▶ Resume Bot
                        </button>
                        <button
                          onClick={() => terminateBot(purchase.id)}
                          className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold text-sm transition-all border border-red-500/30 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" /> Terminate
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marketplace Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Available Bots</h3>
          <p className="text-[#8b949e]">Choose from our collection of high-performance trading algorithms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {allBots.map((bot) => (
            <div
              key={bot.id}
              className="group relative bg-gradient-to-br from-[#161b22] via-[#161b22] to-[#0d1117] border border-[#21262d] rounded-xl overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-2xl hover:shadow-blue-500/20"
            >
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#2962ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Top Accent Bar */}
              <div className={`h-1 bg-gradient-to-r ${bot.color}`} />

              {/* Premium Badge */}
              {bot.isTemplate && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-xs font-bold shadow-lg">
                    ★ SPECIAL
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 p-6 space-y-5">
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all">
                        {bot.name}
                      </h4>
                      <p className="text-sm text-[#8b949e] line-clamp-2">{bot.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-3 py-1 bg-[#2962ff]/20 text-[#2962ff] rounded-full font-semibold border border-[#2962ff]/30">
                      {bot.type}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                        bot.risk === 'High'
                          ? 'bg-[#ef5350]/10 text-[#ff6b6b] border-[#ef5350]/30'
                          : bot.risk === 'Medium'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          : 'bg-[#26a69a]/10 text-[#26a69a] border-[#26a69a]/30'
                      }`}
                    >
                      {bot.risk} Risk
                    </span>
                  </div>
                </div>

                {/* Stats Grid - Enhanced */}
                <div className="grid grid-cols-3 gap-3 py-4 border-y border-[#21262d]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-[#26a69a]" />
                      <span className="text-xs text-[#8b949e] font-medium">Return</span>
                    </div>
                    <span className="text-lg font-bold text-[#26a69a]">+{bot.return}%</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-[#2962ff]" />
                      <span className="text-xs text-[#8b949e] font-medium">Win Rate</span>
                    </div>
                    <span className="text-lg font-bold text-white">{bot.winRate}%</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1">
                      <Shield className="h-3.5 w-3.5 text-yellow-500/80" />
                      <span className="text-xs text-[#8b949e] font-medium">Drawdown</span>
                    </div>
                    <span className="text-lg font-bold text-white">{bot.maxDrawdown}%</span>
                  </div>
                </div>

                {/* Trades Info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#8b949e]">Trades executed</span>
                  <span className="font-bold text-white">{bot.trades.toLocaleString()}</span>
                </div>

                {/* CTA Section */}
                <div className="space-y-3 pt-2">
                  <div className="bg-[#0d1117]/50 rounded-lg p-3 border border-[#21262d] space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[#8b949e]">
                        {bot.price > 0 ? 'Monthly Price' : 'Offer'}
                      </span>
                      <span className={`text-2xl font-bold ${bot.price === 0 ? 'text-[#26a69a]' : 'text-white'}`}>
                        {bot.price === 0 ? 'FREE' : `$${bot.price}`}
                      </span>
                    </div>
                    {bot.price > 0 && <p className="text-xs text-[#8b949e]">Billed monthly</p>}
                    {bot.price === 0 && <p className="text-xs text-[#26a69a]">14-day free trial included</p>}
                  </div>
                  
                  <button
                    onClick={() => handleBuyBot(bot)}
                    className="w-full py-2.5 bg-gradient-to-r from-[#2962ff] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 transform group-hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {bot.price === 0 ? 'Try Bot' : 'Subscribe Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, bot: null, price: 0 })}
        amount={paymentModal.price}
        itemName={paymentModal.bot ? `${paymentModal.bot.name} Bot License` : ''}
        currentBalance={account.balance}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Capital Allocation Modal */}
      {allocationModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#21262d] rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl shadow-blue-500/10 animate-in scale-95 md:scale-100">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#2962ff] to-blue-400 bg-clip-text text-transparent">
                  Allocate Capital
                </h3>
                <p className="text-xs text-[#8b949e]">Fund your bot trading account</p>
              </div>
              <button
                onClick={() => setAllocationModal({ isOpen: false, botId: '', amount: '' })}
                className="text-[#8b949e] hover:text-white hover:bg-[#21262d] p-2 rounded-lg transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Balance Section */}
            <div className="bg-gradient-to-br from-[#0d1117] to-[#161b22] p-5 rounded-xl border border-[#21262d] space-y-2">
              <p className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">Available Balance</p>
              <p className="text-3xl font-bold text-white">${(user?.balance ?? 0).toFixed(2)}</p>
              <div className="w-full h-1 bg-[#21262d] rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full bg-gradient-to-r from-[#26a69a] to-cyan-500" 
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-white">Amount to Allocate</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8b949e] font-bold">$</span>
                <input
                  type="number"
                  value={allocationModal.amount}
                  onChange={(e) => setAllocationModal({ ...allocationModal, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg pl-8 pr-4 py-3 text-white placeholder-[#8b949e] focus:outline-none focus:border-[#2962ff] focus:ring-2 focus:ring-[#2962ff]/30 transition-all text-lg font-semibold"
                />
              </div>
              <p className="text-xs text-[#8b949e] flex items-center gap-1">
                <span>💡</span> The bot will trade with this amount and reinvest earnings
              </p>
            </div>

            {/* Info Banner */}
            <div className="bg-[#2962ff]/5 rounded-lg p-3.5 border border-[#2962ff]/20 space-y-1">
              <p className="text-xs font-bold text-[#2962ff] uppercase">Pro Tip</p>
              <p className="text-xs text-[#8b949e]">Start with a smaller amount and increase as you gain confidence in the bot's performance.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setAllocationModal({ isOpen: false, botId: '', amount: '' })}
                className="flex-1 py-3 border border-[#21262d] text-white rounded-lg hover:bg-[#21262d] transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocateCapital}
                disabled={!allocationModal.amount || parseFloat(allocationModal.amount) <= 0 || parseFloat(allocationModal.amount) > (user?.balance ?? 0)}
                className="flex-1 py-3 bg-gradient-to-r from-[#26a69a] to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-[#8b949e] disabled:to-[#8b949e] shadow-lg shadow-teal-500/20 disabled:shadow-none"
              >
                Allocate Capital
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}