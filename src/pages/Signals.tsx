import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Card } from '../components/ui/Card';
import { CheckCircle, TrendingUp, Users, Star, Filter, Zap, Award, X, Trash2, Plus } from 'lucide-react';
import { PaymentModal } from '../components/PaymentModal';

// Exact signal pricing
const SIGNAL_PRICES = [500, 750, 1050, 3000, 4500, 2300, 650, 1500];

export function SignalsPage() {
  const { signals, executeTrade, account, purchasedSignals, purchaseSignal, user, signalTemplates, terminateSignal, allocateSignalCapital } = useStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    signal: null as any,
    trader: null as any,
    price: 0
  });
  const [allocationModal, setAllocationModal] = useState({
    isOpen: false,
    signalId: '',
    amount: ''
  });

  const handleAllocateCapital = () => {
    if (allocationModal.signalId && allocationModal.amount) {
      const amount = parseFloat(allocationModal.amount);
      if (amount > 0 && (user?.balance ?? 0) >= amount) {
        allocateSignalCapital(allocationModal.signalId, amount);
        setAllocationModal({ isOpen: false, signalId: '', amount: '' });
      }
    }
  };

  const traders = [
    {
      name: 'AlphaTrader',
      winRate: 87,
      return: 24.5,
      followers: 1240,
      avatar: 'bg-blue-500',
      verified: true,
      totalSignals: 342,
      monthlyAccuracy: 92.4
    },
    {
      name: 'FX_Master',
      winRate: 76,
      return: 18.2,
      followers: 890,
      avatar: 'bg-purple-500',
      verified: true,
      totalSignals: 218,
      monthlyAccuracy: 87.1
    },
    {
      name: 'CryptoKing',
      winRate: 92,
      return: 45.8,
      followers: 3100,
      avatar: 'bg-orange-500',
      verified: true,
      totalSignals: 521,
      monthlyAccuracy: 94.2
    },
    {
      name: 'GoldRush_Pro',
      winRate: 81,
      return: 21.0,
      followers: 650,
      avatar: 'bg-yellow-500',
      verified: false,
      totalSignals: 156,
      monthlyAccuracy: 85.3
    }
  ];

  // Convert signal templates to trader format
  const customTraders = signalTemplates.map((template, idx) => ({
    id: template.id,
    name: template.providerName,
    winRate: template.winRate,
    return: template.avgReturn,
    followers: template.followers,
    avatar: ['bg-cyan-500', 'bg-emerald-500', 'bg-rose-500', 'bg-indigo-500'][idx % 4],
    verified: true,
    totalSignals: template.trades,
    monthlyAccuracy: template.winRate,
    cost: template.cost,
    description: template.description,
    symbol: template.symbol,
    confidence: template.confidence,
    isSpecial: true
  }));

  // Combine hardcoded and custom traders
  const allTraders = [...traders, ...customTraders];

  const handleBuySignal = (signal: any, trader: any, price: number) => {
    setPaymentModal({
      isOpen: true,
      signal,
      trader,
      price
    });
  };

  const handlePaymentComplete = () => {
    if (paymentModal.signal && paymentModal.trader) {
      purchaseSignal(
        `signal_${Date.now()}`,
        paymentModal.trader.name,
        paymentModal.price,
        paymentModal.trader.winRate
      );
      setPaymentModal({ isOpen: false, signal: null, trader: null, price: 0 });
    }
  };

  // Filter logic
  const filteredSignals = signals.filter((s) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Forex')
      return (
        !s.symbol.includes('BTC') &&
        !s.symbol.includes('ETH') &&
        !s.symbol.includes('XAU')
      );
    if (activeFilter === 'Crypto')
      return s.symbol.includes('BTC') || s.symbol.includes('ETH');
    if (activeFilter === 'Commodities') return s.symbol.includes('XAU');
    if (activeFilter === 'Premium') return s.confidence > 85;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-20 md:pb-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] border border-[#21262d] rounded-lg overflow-hidden p-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#2962ff] rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-6 w-6 text-[#2962ff]" />
            <span className="text-[#2962ff] font-bold text-sm">Premium Signal Marketplace</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Trade Smarter with Expert Signals</h1>
          <p className="text-gray-600 dark:text-[#8b949e] max-w-2xl mx-auto">
            Copy verified signals from top-performing traders and execute trades with confidence
          </p>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Total Signals</span>
            <Zap className="h-4 w-4 text-blue-600 dark:text-[#2962ff]" />
          </div>
          <span className="block text-2xl font-bold text-gray-900 dark:text-white">{signals.length}</span>
          <span className="text-xs text-gray-600 dark:text-[#8b949e]">Available to trade</span>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Active Now</span>
            <Award className="h-4 w-4 text-green-600 dark:text-[#26a69a]" />
          </div>
          <span className="block text-2xl font-bold text-green-600 dark:text-[#26a69a]">12</span>
          <span className="text-xs text-[#8b949e]">Signals in progress</span>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Avg Win Rate</span>
            <TrendingUp className="h-4 w-4 text-[#26a69a]" />
          </div>
          <span className="block text-2xl font-bold text-[#2962ff]">89%</span>
          <span className="text-xs text-gray-600 dark:text-[#8b949e]">Success rate</span>
        </div>
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase">Top Trader</span>
            <Star className="h-4 w-4 text-yellow-500" />
          </div>
          <span className="block text-lg font-bold text-gray-900 dark:text-white">{allTraders.reduce((a, b) => (a.winRate > b.winRate ? a : b)).name}</span>
          <span className="text-xs text-yellow-500">{allTraders.reduce((a, b) => (a.winRate > b.winRate ? a : b)).winRate}% accuracy</span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-600 dark:text-[#8b949e] uppercase">Filter Signals</h3>
        <div className="flex flex-wrap gap-2">
          {['All', 'Forex', 'Crypto', 'Commodities', 'Premium'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-blue-600 dark:bg-[#2962ff] text-white border-blue-600 dark:border-[#2962ff] shadow-lg shadow-blue-500/20'
                  : 'bg-gray-100 dark:bg-[#161b22] border-gray-300 dark:border-[#21262d] text-gray-600 dark:text-[#8b949e] hover:border-blue-600 dark:hover:border-[#2962ff] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Signal Performance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#26a69a]/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-[#26a69a]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Recent Performance</h3>
              <p className="text-xs text-gray-600 dark:text-[#8b949e]">Last 24 hours</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-[#8b949e]">Signal Accuracy</span>
              <span className="font-bold text-[#26a69a]">92.4%</span>
            </div>
            <div className="w-full h-2 bg-gray-300 dark:bg-[#0d1117] rounded-full overflow-hidden">
              <div className="h-full w-[92.4%] bg-gradient-to-r from-[#26a69a] to-[#2962ff]" />
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#2962ff]/20 rounded-lg">
              <Zap className="h-6 w-6 text-[#2962ff]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Profit Potential</h3>
              <p className="text-xs text-gray-600 dark:text-[#8b949e]">Average per trade</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-[#8b949e]">Monthly Return</span>
            <span className="font-bold text-[#26a69a] text-lg">+1,450 pips</span>
          </div>
        </div>
      </div>

      {/* My Purchased Signals Section */}
      {purchasedSignals.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">My Signal Subscriptions</h3>
            <p className="text-gray-600 dark:text-[#8b949e]">Active signals with real-time trading performance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {purchasedSignals.map((signal) => (
              <div
                key={signal.id}
                className="group relative bg-gradient-to-br from-gray-50 dark:from-[#161b22] via-gray-100 dark:via-[#161b22] to-white dark:to-[#0d1117] border border-gray-300 dark:border-[#21262d] rounded-2xl overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-2xl hover:shadow-teal-500/20"
              >
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#26a69a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Top Accent Bar */}
                <div className="h-1.5 bg-gradient-to-r from-[#26a69a] via-cyan-500 to-blue-500" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Header */}
                  <div className="p-6 space-y-3 border-b border-gray-300 dark:border-[#21262d]">
                    <div className="space-y-1.5">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">{signal.providerName}</h4>
                      <span
                        className={`inline-flex text-xs font-bold px-3 py-1.5 rounded-full border ${
                          signal.status === 'ACTIVE'
                            ? 'bg-[#26a69a]/10 text-[#26a69a] border-[#26a69a]/30'
                            : signal.status === 'APPROVED_FOR_ALLOCATION'
                            ? 'bg-[#2962ff]/10 text-[#2962ff] border-[#2962ff]/30'
                            : signal.status === 'PENDING_APPROVAL'
                            ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                            : 'bg-[#8b949e]/10 text-[#8b949e] border-[#8b949e]/30'
                        }`}
                      >
                        {signal.status === 'PENDING_APPROVAL' ? '⏳ Pending Approval' : 
                         signal.status === 'APPROVED_FOR_ALLOCATION' ? '✓ Approved - Allocate' :
                         signal.status === 'ACTIVE' ? '✓ Active' :
                         signal.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4 flex-1">
                    {(signal.status === 'ACTIVE' || signal.status === 'APPROVED_FOR_ALLOCATION') && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-100 dark:bg-[#0d1117] p-4 rounded-lg border border-gray-300 dark:border-[#21262d] space-y-1.5">
                            <span className="text-xs text-gray-600 dark:text-[#8b949e] font-medium">Win Rate</span>
                            <span className="block text-lg font-bold text-[#26a69a]">{signal.winRate}%</span>
                          </div>
                          <div className="bg-gray-100 dark:bg-[#0d1117] p-4 rounded-lg border border-gray-300 dark:border-[#21262d] space-y-1.5">
                            <span className="text-xs text-gray-600 dark:text-[#8b949e] font-medium">Allocated</span>
                            <span className="block text-lg font-bold text-gray-900 dark:text-white">${signal.allocation.toFixed(2)}</span>
                          </div>
                        </div>

                        {signal.status === 'ACTIVE' && (
                          <div className="bg-gray-100 dark:bg-[#0d1117] p-4 rounded-lg border border-gray-300 dark:border-[#21262d] space-y-1.5">
                            <span className="text-xs text-gray-600 dark:text-[#8b949e] font-medium">Earnings</span>
                            <span className={`block text-lg font-bold ${signal.earnings >= 0 ? 'text-[#26a69a]' : 'text-red-400'}`}>
                              {signal.earnings >= 0 ? '+' : ''} ${signal.earnings.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {signal.status === 'PENDING_APPROVAL' && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center space-y-2">
                        <p className="text-yellow-400 text-sm font-bold">⏳ Awaiting Admin Review</p>
                        <p className="text-xs text-[#8b949e]">Your signal will be verified and activated shortly</p>
                      </div>
                    )}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-4 border-t border-gray-300 dark:border-[#21262d] bg-gray-50 dark:bg-[#0d1117]/50 space-y-2">
                    {signal.status === 'ACTIVE' && (
                      <div className="space-y-2">
                        <div className="text-xs text-gray-600 dark:text-[#8b949e] text-center bg-gray-100 dark:bg-[#161b22] p-2.5 rounded-lg border border-gray-300 dark:border-[#21262d]">
                          Following {signal.providerName}'s signals in real-time
                        </div>
                        <button
                          onClick={() => terminateSignal(signal.id)}
                          className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-bold text-sm transition-all border border-red-500/30 flex items-center justify-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" /> Terminate
                        </button>
                      </div>
                    )}

                    {signal.status === 'APPROVED_FOR_ALLOCATION' && signal.allocation === 0 && (
                      <button
                        onClick={() => setAllocationModal({ isOpen: true, signalId: signal.id, amount: '' })}
                        className="w-full py-2.5 bg-gradient-to-r from-[#2962ff] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                      >
                        <Plus className="h-4 w-4" /> Allocate Capital
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Special Signals Section */}
      {customTraders.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Special Signals</h3>
            <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-bold">SPECIAL</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customTraders.map((trader) => {
              const signalType = trader.confidence > 75 ? 'BUY' : 'SELL';
              const basePrice = Math.random() * 2 + 1;
              const entryPrice = (basePrice).toFixed(4);
              const slPrice = (basePrice * 0.98).toFixed(4);
              const tpPrice = (basePrice * 1.02).toFixed(4);
              const price = trader.cost || 0;

              return (
                <div
                  key={trader.id}
                  className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-lg overflow-hidden hover:border-cyan-500 dark:hover:border-cyan-500 transition-all group hover:shadow-lg hover:shadow-cyan-500/10"
                >
                  {/* Top Gradient Bar */}
                  <div className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />

                  {/* Trader Header */}
                  <div className="p-4 border-b border-gray-300 dark:border-[#21262d] bg-white dark:bg-[#0d1117] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full ${trader.avatar} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                          {trader.name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">{trader.name}</span>
                            <CheckCircle className="h-4 w-4 text-cyan-400" />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-[#8b949e]">{trader.totalSignals} signals sent</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-[#8b949e]">Win Rate</p>
                        <p className="text-lg font-bold text-green-600 dark:text-[#26a69a]">{trader.winRate}%</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-gray-200 dark:bg-[#161b22] p-2 rounded border border-gray-300 dark:border-[#21262d]">
                        <p className="text-gray-600 dark:text-[#8b949e]">Followers</p>
                        <p className="font-bold text-gray-900 dark:text-white">{trader.followers.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-200 dark:bg-[#161b22] p-2 rounded border border-gray-300 dark:border-[#21262d]">
                        <p className="text-gray-600 dark:text-[#8b949e]">Confidence</p>
                        <p className="font-bold text-cyan-500 dark:text-cyan-400">{trader.confidence}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Signal Details */}
                  <div className="p-6 space-y-4">
                    {/* Symbol and Type */}
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{trader.symbol}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${signalType === 'BUY' ? 'bg-[#26a69a]/20 text-[#26a69a]' : 'bg-[#ef5350]/20 text-[#ef5350]'}`}>
                        {signalType}
                      </span>
                    </div>

                    {/* Price Levels */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white dark:bg-[#0d1117] p-3 rounded border border-gray-300 dark:border-[#21262d] space-y-1">
                        <p className="text-xs text-gray-600 dark:text-[#8b949e]">Entry</p>
                        <p className="font-mono font-bold text-gray-900 dark:text-white text-sm">{entryPrice}</p>
                      </div>
                      <div className="bg-white dark:bg-[#0d1117] p-3 rounded border border-gray-300 dark:border-[#21262d] space-y-1">
                        <p className="text-xs text-gray-600 dark:text-[#8b949e]">Stop Loss</p>
                        <p className="font-mono font-bold text-red-600 dark:text-[#ef5350] text-sm">{slPrice}</p>
                      </div>
                      <div className="bg-white dark:bg-[#0d1117] p-3 rounded border border-gray-300 dark:border-[#21262d] space-y-1">
                        <p className="text-xs text-gray-600 dark:text-[#8b949e]">Take Profit</p>
                        <p className="font-mono font-bold text-green-600 dark:text-[#26a69a] text-sm">{tpPrice}</p>
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-[#8b949e]">Confidence Level</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{trader.confidence}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-[#0d1117] rounded-full overflow-hidden border border-gray-300 dark:border-[#21262d]">
                        <div
                          className={`h-full transition-all ${trader.confidence > 85 ? 'bg-[#26a69a]' : trader.confidence > 70 ? 'bg-[#2962ff]' : 'bg-yellow-500'}`}
                          style={{ width: `${trader.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-300 dark:border-[#21262d] flex items-center justify-between bg-white dark:bg-[#0d1117]">
                    <div>
                      {price === 0 ? (
                        <span className="text-lg font-bold text-[#26a69a]">FREE</span>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">${price.toFixed(2)}</span>
                          <p className="text-xs text-gray-600 dark:text-[#8b949e]">One-time</p>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleBuySignal({} as any, trader, price)}
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold rounded-lg transition-all hover:shadow-lg hover:shadow-cyan-500/30"
                    >
                      {price === 0 ? 'Copy Signal' : 'Buy Signal'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Signals Grid */}
      <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Available Signals ({filteredSignals.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredSignals.map((signal, idx) => {
            const trader = allTraders[idx % allTraders.length];
            const priceValue = SIGNAL_PRICES[idx % SIGNAL_PRICES.length];
            const price = `$${priceValue}`;

            return (
              <div
                key={signal.id}
                className="group relative bg-gradient-to-br from-gray-50 dark:from-[#161b22] via-gray-100 dark:via-[#161b22] to-white dark:to-[#0d1117] border border-gray-300 dark:border-[#21262d] rounded-2xl overflow-hidden transition-all duration-300 hover:border-transparent hover:shadow-2xl hover:shadow-teal-500/20"
              >
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#26a69a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Top Accent Bar */}
                <div className="h-1.5 bg-gradient-to-r from-[#2962ff] via-[#26a69a] to-cyan-500" />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Trader Header */}
                  <div className="p-4 border-b border-gray-300 dark:border-[#21262d] bg-white dark:bg-[#0d1117]/50 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-full ${trader.avatar} flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-gray-300 dark:ring-[#21262d]`}
                      >
                        {trader.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-gray-900 dark:text-white truncate">{trader.name}</span>
                          {trader.verified && <CheckCircle className="h-4 w-4 text-[#2962ff] flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-[#8b949e]">{trader.totalSignals} signals</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-100 dark:bg-[#161b22] p-2.5 rounded-lg border border-gray-300 dark:border-[#21262d] space-y-0.5">
                        <p className="text-[10px] text-gray-600 dark:text-[#8b949e] font-medium">Win Rate</p>
                        <p className="font-bold text-[#26a69a] text-sm">{trader.winRate}%</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-[#161b22] p-2.5 rounded-lg border border-gray-300 dark:border-[#21262d] space-y-0.5">
                        <p className="text-[10px] text-gray-600 dark:text-[#8b949e] font-medium">Followers</p>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{(trader.followers / 1000).toFixed(1)}k</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-[#161b22] p-2.5 rounded-lg border border-gray-300 dark:border-[#21262d] space-y-0.5">
                        <p className="text-[10px] text-gray-600 dark:text-[#8b949e] font-medium">Accuracy</p>
                        <p className="font-bold text-cyan-400 text-sm">{trader.monthlyAccuracy}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Signal Details */}
                  <div className="p-5 space-y-4 flex-1">
                    {/* Symbol and Type */}
                    <div className="flex justify-between items-start gap-3">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{signal.symbol}</span>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                          signal.type === 'BUY'
                            ? 'bg-[#26a69a]/20 text-[#26a69a] border border-[#26a69a]/30'
                            : 'bg-[#ef5350]/20 text-red-400 border border-[#ef5350]/30'
                        }`}
                      >
                        {signal.type}
                      </span>
                    </div>

                    {/* Price Levels */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-100 dark:bg-[#0d1117] p-3 rounded-lg border border-gray-300 dark:border-[#21262d] space-y-1">
                        <p className="text-xs text-gray-600 dark:text-[#8b949e] font-medium">Entry</p>
                        <p className="font-mono font-bold text-white text-sm">{signal.entry}</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-[#0d1117] p-3 rounded-lg border border-gray-300 dark:border-[#21262d] space-y-1">
                        <p className="text-xs text-gray-600 dark:text-[#8b949e] font-medium">SL</p>
                        <p className="font-mono font-bold text-red-400 text-sm">{signal.sl}</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-[#0d1117] p-3 rounded-lg border border-gray-300 dark:border-[#21262d] space-y-1">
                        <p className="text-xs text-gray-600 dark:text-[#8b949e] font-medium">TP</p>
                        <p className="font-mono font-bold text-[#26a69a] text-sm">{signal.tp}</p>
                      </div>
                    </div>

                    {/* Confidence Meter */}
                    <div className="space-y-2 py-2 border-y border-gray-300 dark:border-[#21262d]">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600 dark:text-[#8b949e] font-medium">Confidence</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{signal.confidence}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 dark:bg-[#0d1117] rounded-full overflow-hidden border border-gray-300 dark:border-[#21262d]">
                        <div
                          className={`h-full transition-all ${
                            signal.confidence > 85
                              ? 'bg-gradient-to-r from-[#26a69a] to-cyan-400'
                              : signal.confidence > 70
                              ? 'bg-gradient-to-r from-[#2962ff] to-blue-500'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-400'
                          }`}
                          style={{ width: `${signal.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="p-4 border-t border-gray-300 dark:border-[#21262d] bg-gray-50 dark:bg-[#0d1117]/50 space-y-3">
                    <div className="rounded-lg p-3 border bg-gray-100 dark:bg-white/5 border-gray-300 dark:border-white/10">
                      <p className="text-xs text-gray-600 dark:text-[#8b949e] mb-1">Price</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {price}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-[#8b949e] mt-1">One-time access</p>
                    </div>
                    <button
                      onClick={() => handleBuySignal(signal, trader, priceValue)}
                      className="w-full py-2.5 font-bold rounded-lg transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-r from-[#2962ff] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20"
                    >
                      <Plus className="h-4 w-4" /> Buy Signal
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, signal: null, trader: null, price: 0 })}
        amount={paymentModal.price}
        itemName={
          paymentModal.signal
            ? `${paymentModal.signal.symbol} ${paymentModal.signal.type} Signal from ${paymentModal.trader?.name}`
            : ''
        }
        currentBalance={account.balance}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Signal Allocation Modal */}
      {allocationModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-gradient-to-b from-[#161b22] to-[#0d1117] border border-[#21262d] rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl shadow-teal-500/10 animate-in scale-95 md:scale-100">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#26a69a] to-cyan-400 bg-clip-text text-transparent">
                  Allocate Capital
                </h3>
                <p className="text-xs text-[#8b949e]">Fund your signal trading account</p>
              </div>
              <button
                onClick={() => setAllocationModal({ isOpen: false, signalId: '', amount: '' })}
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
                  className="w-full bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#21262d] rounded-lg pl-8 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#8b949e] focus:outline-none focus:border-green-500 dark:focus:border-[#26a69a] focus:ring-2 focus:ring-green-500/30 dark:focus:ring-[#26a69a]/30 transition-all text-lg font-semibold"
                />
              </div>
              <p className="text-xs text-[#8b949e] flex items-center gap-1">
                <span>💡</span> The signal provider will trade with this amount and reinvest profits
              </p>
            </div>

            {/* Info Banner */}
            <div className="bg-[#26a69a]/5 rounded-lg p-3.5 border border-[#26a69a]/20 space-y-1">
              <p className="text-xs font-bold text-[#26a69a] uppercase">Pro Tip</p>
              <p className="text-xs text-[#8b949e]">Start with a smaller amount to evaluate the signal provider's performance before increasing your allocation.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setAllocationModal({ isOpen: false, signalId: '', amount: '' })}
                className="flex-1 py-3 border border-gray-300 dark:border-[#21262d] text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#21262d] transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAllocateCapital}
                disabled={!allocationModal.amount || parseFloat(allocationModal.amount) <= 0 || parseFloat(allocationModal.amount) > (user?.balance ?? 0)}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 dark:from-[#26a69a] dark:to-cyan-500 hover:from-green-600 dark:hover:from-teal-600 hover:to-teal-600 dark:hover:to-cyan-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 dark:disabled:from-[#8b949e] disabled:to-gray-400 dark:disabled:to-[#8b949e] shadow-lg shadow-teal-500/dark:20 disabled:shadow-none"
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