import { useState } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import {
  Users,
  TrendingUp,
  Copy,
  DollarSign,
  Activity,
  CheckCircle,
  Pause
} from 'lucide-react';

const AVAILABLE_TRADERS = [
  { id: 1, name: 'Alex Thompson', winRate: '84%', return: '+124%', followers: 1205, risk: 'Low', dailyReturn: '9.2%', trades: 324 },
  { id: 2, name: 'Sarah Chen', winRate: '79%', return: '+89%', followers: 850, risk: 'Medium', dailyReturn: '7.8%', trades: 215 },
  { id: 3, name: 'Marco Rossi', winRate: '92%', return: '+215%', followers: 3400, risk: 'High', dailyReturn: '11.3%', trades: 512 },
  { id: 4, name: 'Elena Petrova', winRate: '81%', return: '+67%', followers: 420, risk: 'Low', dailyReturn: '7.5%', trades: 189 },
  { id: 5, name: 'James Wilson', winRate: '77%', return: '+45%', followers: 640, risk: 'Medium', dailyReturn: '8.6%', trades: 156 },
  { id: 6, name: 'Lisa Anderson', winRate: '88%', return: '+178%', followers: 2100, risk: 'High', dailyReturn: '10.9%', trades: 398 },
];

export function CopyTradingPage() {
  const { account, purchasedCopyTrades, followTrader, stopCopyTrading, copyTradeTemplates } = useStore();
  const [activeTab, setActiveTab] = useState<'browse' | 'active' | 'history'>('browse');
  const [selectedTrader, setSelectedTrader] = useState<any>(null);
  const [allocateAmount, setAllocateAmount] = useState('');
  const [durationValue, setDurationValue] = useState('24');
  const [durationType, setDurationType] = useState<'hours' | 'days'>('hours');
  const [filterRisk, setFilterRisk] = useState<'all' | 'Low' | 'Medium' | 'High'>('all');

  const handleFollowTrader = (trader: any) => {
    if (!allocateAmount || parseFloat(allocateAmount) < 100) {
      alert('Minimum allocation is $100');
      return;
    }

    const allocation = parseFloat(allocateAmount);
    if (allocation > account.freeMargin) {
      alert(`Insufficient funds. Available: ${formatCurrency(account.freeMargin)}`);
      return;
    }

    followTrader(trader, allocation, durationValue, durationType);
    setSelectedTrader(null);
    setAllocateAmount('');
    setDurationValue('24');
    setDurationType('hours');
  };

  const handleStopCopy = (copyId: string) => {
    stopCopyTrading(copyId);
  };

  const filteredTraders = AVAILABLE_TRADERS.filter(t =>
    filterRisk === 'all' ? true : t.risk === filterRisk
  );

  // Convert copy trade templates to trader format
  const specialTraders = copyTradeTemplates.map((template, idx) => ({
    id: template.id,
    name: template.name,
    winRate: `${template.winRate}%`,
    return: `+${template.return}%`,
    followers: template.followers,
    risk: template.risk,
    dailyReturn: `${template.dailyReturn}%`,
    trades: template.trades,
    isSpecial: true
  }));

  // Combine hardcoded and special traders
  const allTraders = [...filteredTraders, ...specialTraders.filter(t => filterRisk === 'all' || t.risk === filterRisk)];

  const activeCopies = purchasedCopyTrades.filter(c => c.status === 'ACTIVE');
  const tradeHistory = purchasedCopyTrades.filter(c => c.status === 'CLOSED');
  const activeCopiesCount = activeCopies.length;
  const totalAllocation = activeCopies.reduce((sum, c) => sum + c.allocation, 0);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Copy className="h-8 w-8 text-[#26a69a]" />
            Copy Trading
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#8b949e] mt-1">Mirror trades from expert traders in real-time</p>
        </div>
        <div className="grid grid-cols-3 gap-3 bg-gray-100 dark:bg-[#161b22] p-4 rounded-lg border border-gray-300 dark:border-[#21262d]">
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-[#8b949e] mb-1">Active</p>
            <p className="text-2xl font-mono font-bold text-[#26a69a]">{activeCopiesCount}</p>
          </div>
          <div className="w-[1px] bg-gray-300 dark:bg-[#21262d]" />
          <div className="text-center">
            <p className="text-xs text-gray-600 dark:text-[#8b949e] mb-1">Allocated</p>
            <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">${totalAllocation.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 dark:bg-[#161b22] p-1 rounded border border-gray-300 dark:border-[#21262d] overflow-x-auto no-scrollbar">
        {['browse', 'active', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 md:px-6 py-2 text-sm font-bold rounded capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#2962ff] text-white shadow-lg'
                : 'text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab} {tab === 'active' && activeCopiesCount > 0 && `(${activeCopiesCount})`}
          </button>
        ))}
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'Low', 'Medium', 'High'].map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk as any)}
                className={`px-4 py-2 rounded font-bold text-sm transition-all ${
                  filterRisk === risk
                    ? 'bg-[#26a69a] text-white'
                    : 'bg-[#161b22] text-[#8b949e] border border-[#21262d] hover:text-white'
                }`}
              >
                {risk === 'all' ? 'All Risk Levels' : `${risk} Risk`}
              </button>
            ))}
          </div>

          {/* Traders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTraders.map((trader) => (
              <div
                key={trader.id}
                className={`rounded-lg p-6 transition space-y-4 ${
                  (trader as any).isSpecial
                    ? 'bg-[#161b22] border border-cyan-500/30 hover:border-cyan-500/60'
                    : 'bg-[#161b22] border border-[#21262d] hover:border-[#26a69a]'
                }`}
              >
                {/* Trader Header */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    (trader as any).isSpecial
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
                      : 'bg-gradient-to-br from-[#26a69a] to-[#2962ff]'
                  }`}>
                    {trader.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{trader.name}</h3>
                      {(trader as any).isSpecial && (
                        <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded font-bold">
                          SPECIAL
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#8b949e]">
                      <Users className="h-3 w-3" />
                      {trader.followers.toLocaleString()} followers
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0d1117] p-3 rounded">
                    <p className="text-xs text-[#8b949e] mb-1">Win Rate</p>
                    <p className="text-lg font-bold text-white">{trader.winRate}</p>
                  </div>
                  <div className="bg-[#0d1117] p-3 rounded">
                    <p className="text-xs text-[#8b949e] mb-1">Return</p>
                    <p className="text-lg font-bold text-[#26a69a]">{trader.return}</p>
                  </div>
                  <div className="bg-[#0d1117] p-3 rounded">
                    <p className="text-xs text-[#8b949e] mb-1">Daily</p>
                    <p className="text-lg font-bold text-[#2962ff]">{trader.dailyReturn}</p>
                  </div>
                  <div className="bg-[#0d1117] p-3 rounded">
                    <p className="text-xs text-[#8b949e] mb-1">Trades</p>
                    <p className="text-lg font-bold text-white">{trader.trades}</p>
                  </div>
                </div>

                {/* Risk Level */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#8b949e]">Risk:</span>
                  <span
                    className={`font-bold ${
                      trader.risk === 'Low'
                        ? 'text-green-500'
                        : trader.risk === 'Medium'
                        ? 'text-yellow-500'
                        : 'text-red-500'
                    }`}
                  >
                    {trader.risk}
                  </span>
                </div>

                {/* Action Button */}
                {activeCopies.some(c => c.tradesId === trader.id) ? (
                  <div className="p-3 bg-[#26a69a]/10 border border-[#26a69a] rounded text-center">
                    <p className="text-xs text-[#26a69a] font-bold">✓ Already Following</p>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedTrader(trader)}
                    className="w-full py-2 bg-[#2962ff] hover:bg-blue-700 text-white font-bold rounded text-sm transition-colors"
                  >
                    Copy Strategy
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Copy Strategy Modal */}
          {selectedTrader && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-8 max-w-md w-full space-y-6">
                <h2 className="text-2xl font-bold text-white">Copy {selectedTrader.name}</h2>

                <div className="space-y-3">
                  <label className="block text-sm text-[#8b949e] font-bold">Allocation Amount (USD)</label>
                  <div className="space-y-2">
                    {[100, 250, 500, 1000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAllocateAmount(val.toString())}
                        className={`w-full p-2 text-sm font-mono font-bold rounded border transition-all ${
                          allocateAmount === val.toString()
                            ? 'border-[#26a69a] bg-[#26a69a]/10 text-[#26a69a]'
                            : 'border-[#21262d] bg-[#0d1117] text-white hover:border-[#8b949e]'
                        }`}
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={allocateAmount}
                    onChange={(e) => setAllocateAmount(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#21262d] rounded p-3 text-white font-mono text-lg focus:border-[#26a69a] focus:outline-none"
                    placeholder="Custom amount"
                    min="100"
                  />
                  <p className="text-xs text-[#8b949e]">
                    Available: {formatCurrency(account.freeMargin)} | Min: $100
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm text-[#8b949e] font-bold">Duration</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        value={durationValue}
                        onChange={(e) => setDurationValue(e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#21262d] rounded p-3 text-white font-mono text-lg focus:border-[#26a69a] focus:outline-none"
                        placeholder="24"
                        min="1"
                      />
                    </div>
                    <div className="flex gap-2">
                      {['hours', 'days'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setDurationType(type as 'hours' | 'days')}
                          className={`px-3 py-2 text-sm font-bold rounded border transition-all ${
                            durationType === type
                              ? 'border-[#26a69a] bg-[#26a69a]/10 text-[#26a69a]'
                              : 'border-[#21262d] bg-[#0d1117] text-white hover:border-[#8b949e]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['1h', '4h', '24h', '7d', '30d'].map((preset) => {
                      const [val, type] = preset === '24h' ? ['24', 'hours'] : 
                                         preset === '7d' ? ['7', 'days'] :
                                         preset === '30d' ? ['30', 'days'] :
                                         preset === '1h' ? ['1', 'hours'] :
                                         ['4', 'hours'];
                      return (
                        <button
                          key={preset}
                          onClick={() => {
                            setDurationValue(val);
                            setDurationType(type as 'hours' | 'days');
                          }}
                          className="px-2 py-1 text-xs bg-[#0d1117] border border-[#21262d] text-[#8b949e] rounded hover:text-white hover:border-[#8b949e] transition"
                        >
                          {preset}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-[#0d1117] p-4 rounded space-y-2">
                  <p className="text-sm text-[#8b949e]">Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8b949e]">Allocation:</span>
                    <span className="font-mono font-bold text-white">${allocateAmount || '0'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8b949e]">Duration:</span>
                    <span className="font-mono font-bold text-white">{durationValue} {durationType}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8b949e]">Expected Daily:</span>
                    <span className="font-mono font-bold text-[#2962ff]">
                      ${((parseFloat(allocateAmount) || 0) * (parseFloat(selectedTrader.dailyReturn) / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedTrader(null)}
                    className="flex-1 py-2 border border-[#21262d] text-white font-bold rounded hover:bg-[#21262d] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleFollowTrader(selectedTrader)}
                    className="flex-1 py-2 bg-[#26a69a] hover:bg-teal-600 text-white font-bold rounded transition"
                  >
                    Follow Trader
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Tab */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeCopies.length === 0 ? (
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-12 text-center">
              <Activity className="h-12 w-12 text-[#8b949e] mx-auto mb-4 opacity-50" />
              <p className="text-[#8b949e]">No active copy trades. Browse traders to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeCopies.map((copy) => (
                <div key={copy.id} className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{copy.traderName}</h3>
                      <p className="text-xs text-[#8b949e]">Started {new Date(copy.startDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#26a69a]/10 text-[#26a69a] rounded text-xs font-bold">
                        {copy.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-[#8b949e] mb-1">Allocated</p>
                      <p className="text-lg font-mono font-bold text-white">${copy.allocation.toFixed(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8b949e] mb-1">Profit/Loss</p>
                      <p className={`text-lg font-mono font-bold ${copy.profit >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
                        ${copy.profit?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8b949e] mb-1">Duration</p>
                      <p className="text-lg font-mono font-bold text-white">{copy.durationValue}{copy.durationType === 'hours' ? 'h' : 'd'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#8b949e] mb-1">Risk</p>
                      <p className={`text-lg font-bold ${
                        copy.risk === 'Low' ? 'text-green-500' : copy.risk === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {copy.risk}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStopCopy(copy.id)}
                    className="w-full py-2 bg-[#ef5350]/10 border border-[#ef5350]/30 text-[#ef5350] font-bold rounded hover:bg-[#ef5350]/20 transition flex items-center justify-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Stop Copying
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {tradeHistory.length === 0 ? (
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-12 text-center">
              <CheckCircle className="h-12 w-12 text-[#8b949e] mx-auto mb-4 opacity-50" />
              <p className="text-[#8b949e]">No closed copy trades yet</p>
            </div>
          ) : (
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-[#0d1117] text-[#8b949e] text-xs uppercase border-b border-[#21262d]">
                    <tr>
                      <th className="px-6 py-3 text-left font-bold">Trader</th>
                      <th className="px-6 py-3 text-right font-bold">Allocated</th>
                      <th className="px-6 py-3 text-right font-bold">P/L</th>
                      <th className="px-6 py-3 text-center font-bold">Performance</th>
                      <th className="px-6 py-3 text-left font-bold">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {tradeHistory.map((trade) => {
                      const durationMs = (trade.endDate || Date.now()) - trade.startDate;
                      const days = Math.floor(durationMs / (1000 * 60 * 60 * 24));

                      return (
                        <tr key={trade.id} className="hover:bg-[#1c2128] transition">
                          <td className="px-6 py-4 font-bold text-white">{trade.traderName}</td>
                          <td className="px-6 py-4 text-right font-mono text-white">${trade.allocation.toFixed(0)}</td>
                          <td className={`px-6 py-4 text-right font-mono font-bold ${trade.profit >= 0 ? 'text-[#26a69a]' : 'text-[#ef5350]'}`}>
                            ${trade.profit?.toFixed(2) || '0.00'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              (trade.performance || 0) > 0 ? 'bg-[#26a69a]/10 text-[#26a69a]' : 'bg-[#ef5350]/10 text-[#ef5350]'
                            }`}>
                              {((trade.performance || 0).toFixed(2))}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#8b949e] text-sm">{days} days</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* How it Works */}
      {activeTab === 'browse' && (
        <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 mt-8">
          <h2 className="text-lg font-bold text-white mb-6">How Copy Trading Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#26a69a]/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-[#26a69a]" />
              </div>
              <h4 className="font-bold text-white">1. Choose Trader</h4>
              <p className="text-sm text-[#8b949e]">Browse and select traders with proven track records</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#2962ff]/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-[#2962ff]" />
              </div>
              <h4 className="font-bold text-white">2. Allocate Funds</h4>
              <p className="text-sm text-[#8b949e]">Decide how much to invest (min $100)</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-[#26a69a]/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#26a69a]" />
              </div>
              <h4 className="font-bold text-white">3. Mirror Trades</h4>
              <p className="text-sm text-[#8b949e]">Automatically copy their trades in real-time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
