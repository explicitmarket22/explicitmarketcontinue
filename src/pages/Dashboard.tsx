import React from 'react';
import { useStore } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import ForexListWidget from '../components/trading/ForexListWidget';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Activity,
  History,
  Play,
  TrendingUp,
  Bot,
  Zap,
  Copy
} from
'lucide-react';
interface DashboardProps {
  onNavigate: (page: string) => void;
}
export function Dashboard({ onNavigate }: DashboardProps) {
  const { account, trades, user, assets, history, purchasedBots, purchasedSignals, purchasedCopyTrades, purchasedFundedAccounts, convertFundedToBalance } = useStore();
  
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const botEarnings = purchasedBots.reduce((sum, b) => sum + b.totalEarned, 0);
  const signalEarnings = purchasedSignals.reduce((sum, s) => sum + s.earnings, 0);
  const copyTradingEarnings = purchasedCopyTrades
    .filter(ct => ct.status === 'ACTIVE' || ct.status === 'CLOSED')
    .reduce((sum, ct) => sum + ct.profit, 0);
  // funded account stats for this user
  const userFunded = purchasedFundedAccounts.filter(f => f.userId === user?.id);
  const activeFundedCount = userFunded.filter(f => f.status === 'ACTIVE').length;
  const pendingFundedCount = userFunded.filter(f => f.status === 'PENDING_APPROVAL').length;
  const fundedCapital = userFunded
    .filter(f => f.status === 'ACTIVE')
    .reduce((sum, f) => sum + f.capital, 0);
  const totalBalanceWithFunded = account.balance;
  
  // Debug logging
  React.useEffect(() => {
    console.log('📊 Dashboard Updated:');
    console.log('   Total Bot Earnings:', botEarnings.toFixed(2));
    console.log('   Active Bots:', purchasedBots.filter(b => b.status === 'ACTIVE').length);
    purchasedBots.forEach(b => {
      console.log(`   Bot: ${b.botName} | Status: ${b.status} | Allocated: $${b.allocatedAmount.toFixed(2)} | Earned: $${b.totalEarned.toFixed(2)}`);
    });
  }, [botEarnings, purchasedBots]);
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#8b949e]">
            Here's what's happening with your portfolio today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 dark:bg-[#26a69a]/10 text-green-700 dark:text-[#26a69a] border border-green-300 dark:border-[#26a69a]/20 rounded text-xs font-bold">
            {account.type} ACCOUNT
          </span>
          <span className="px-3 py-1 bg-gray-200 dark:bg-[#21262d] text-gray-700 dark:text-[#8b949e] border border-gray-300 dark:border-[#30363d] rounded text-xs font-bold">
            ID: {user?.id || '8829102'}
          </span>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => convertFundedToBalance()}
          disabled={fundedCapital <= 0}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold rounded disabled:opacity-50"
        >
          Convert Funded → Balance
        </button>
        {fundedCapital <= 0 && (
          <span className="text-xs text-gray-600 dark:text-[#8b949e] self-center">No funded capital</span>
        )}
      </div>

      {/* Top Bar Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gray-600 dark:text-[#8b949e] border-b border-gray-300 dark:border-[#21262d] pb-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <span>
            Leverage: <span className="text-gray-900 dark:text-white">1:{account.leverage}</span>
          </span>
          <span>
            Server: <span className="text-blue-600 dark:text-[#2962ff]">ExplicitMarket-Live</span>
          </span>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
        {
          label: 'Balance',
          value: formatCurrency(account.balance),
          color: 'text-gray-900 dark:text-white',
          highlight: true
        },
        {
          label: 'Equity',
          value: formatCurrency(account.equity),
          color:
          account.equity >= account.balance ?
          'text-green-600 dark:text-[#26a69a]' :
          'text-red-600 dark:text-[#ef5350]'
        },
        {
          label: 'Margin',
          value: formatCurrency(account.margin),
          color: 'text-gray-900 dark:text-white'
        },
        {
          label: 'Free Margin',
          value: formatCurrency(account.freeMargin),
          color: 'text-gray-900 dark:text-white'
        },
        {
          label: 'Open P/L',
          value: formatCurrency(totalProfit),
          color: totalProfit >= 0 ? 'text-green-600 dark:text-[#26a69a]' : 'text-red-600 dark:text-[#ef5350]'
        },
        {
          label: 'Funded Balance',
          value: formatCurrency(fundedCapital),
          color: fundedCapital > 0 ? 'text-blue-600 dark:text-[#2962ff]' : 'text-gray-600 dark:text-[#8b949e]'
        },
        {
          label: 'Open Trades',
          value: trades.length.toString(),
          color: 'text-gray-900 dark:text-white'
        },
        {
          label: 'Funded Accounts',
          value: userFunded.length.toString(),
          color: 'text-blue-600 dark:text-[#2962ff]'
        }].map((stat) =>
        <div
          key={stat.label}
          className={`bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] p-4 rounded-sm ${stat.highlight ? 'bg-gradient-to-br from-gray-100 dark:from-[#161b22] to-gray-200 dark:to-[#1c2128] border-l-2 border-l-blue-600 dark:border-l-[#2962ff]' : ''}`}>

            <span className="block text-xs text-gray-600 dark:text-[#8b949e] mb-1">
              {stat.label}
            </span>
            <span
            className={`block text-lg md:text-xl font-mono font-bold ${stat.color}`}>

              {stat.value}
            </span>
          </div>
        )}
      </div>

      {/* Earnings from Bots & Signals */}
      {(purchasedBots.length > 0 || purchasedSignals.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {purchasedBots.length > 0 && (
            <div className="bg-gradient-to-br from-gray-100 dark:from-[#161b22] to-gray-200 dark:to-[#1c2128] border border-gray-300 dark:border-[#21262d] p-4 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase font-bold">Bot Earnings</span>
                <Bot className="h-4 w-4 text-blue-600 dark:text-[#2962ff]" />
              </div>
              <span className="block text-2xl font-bold text-green-600 dark:text-[#26a69a]">${botEarnings.toFixed(2)}</span>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] mt-1">{purchasedBots.filter(b => b.status === 'ACTIVE').length} active bot(s)</p>
            </div>
          )}
          {userFunded.length > 0 && (
            <div className="bg-gradient-to-br from-gray-100 dark:from-[#161b22] to-gray-200 dark:to-[#1c2128] border border-gray-300 dark:border-[#21262d] p-4 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase font-bold">Funded Accounts</span>
                <Zap className="h-4 w-4 text-blue-600 dark:text-[#2962ff]" />
              </div>
              <span className="block text-2xl font-bold text-green-600 dark:text-[#26a69a]">{activeFundedCount} active</span>
              {pendingFundedCount > 0 && (
                <p className="text-xs text-amber-500 dark:text-yellow-500 mt-1">{pendingFundedCount} pending</p>
              )}
            </div>
          )}
          {purchasedSignals.length > 0 && (
            <div className="bg-gradient-to-br from-gray-100 dark:from-[#161b22] to-gray-200 dark:to-[#1c2128] border border-gray-300 dark:border-[#21262d] p-4 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase font-bold">Signal Earnings</span>
                <Zap className="h-4 w-4 text-blue-600 dark:text-[#2962ff]" />
              </div>
              <span className="block text-2xl font-bold text-green-600 dark:text-[#26a69a]">${signalEarnings.toFixed(2)}</span>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] mt-1">{purchasedSignals.filter(s => s.status === 'ACTIVE').length} active signal(s)</p>
            </div>
          )}
          {purchasedCopyTrades.length > 0 && (
            <div className="bg-gradient-to-br from-gray-100 dark:from-[#161b22] to-gray-200 dark:to-[#1c2128] border border-gray-300 dark:border-[#21262d] p-4 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase font-bold">Copy Trading</span>
                <Copy className="h-4 w-4 text-amber-500 dark:text-yellow-500" />
              </div>
              <span className="block text-2xl font-bold text-amber-500 dark:text-yellow-500">${copyTradingEarnings.toFixed(2)}</span>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] mt-1">{purchasedCopyTrades.filter(ct => ct.status === 'ACTIVE').length} active copy trade(s)</p>
            </div>
          )}
          {!purchasedCopyTrades.length && (
            <div className="bg-gradient-to-br from-gray-100 dark:from-[#161b22] to-gray-200 dark:to-[#1c2128] border border-gray-300 dark:border-[#21262d] p-4 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase font-bold">Copy Trading</span>
                <Copy className="h-4 w-4 text-amber-500 dark:text-yellow-500" />
              </div>
              <span className="block text-2xl font-bold text-amber-500 dark:text-yellow-500">$0.00</span>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] mt-1">Start copy trading to earn</p>
            </div>
          )}
          <div className="bg-gradient-to-br from-gray-100 dark:from-[#161b22] to-gray-200 dark:to-[#1c2128] border border-gray-300 dark:border-[#21262d] p-4 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 dark:text-[#8b949e] uppercase font-bold">Total Passive Income</span>
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-[#26a69a]" />
            </div>
            <span className="block text-2xl font-bold text-green-600 dark:text-[#26a69a]">${(botEarnings + signalEarnings + copyTradingEarnings).toFixed(2)}</span>
            <p className="text-xs text-gray-600 dark:text-[#8b949e] mt-1">This session</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Overview */}
        <div className="lg:col-span-2 bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-gray-300 dark:border-[#21262d]">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">📈 Forex Market Watch</h3>
          </div>
          <div className="flex-1 p-4">
            <ForexListWidget />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 content-start">
          <button
            onClick={() => onNavigate('wallet')}
            className="p-4 bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] hover:border-green-400 dark:hover:border-[#26a69a] rounded-sm flex flex-col items-center justify-center gap-2 transition-colors group">

            <div className="p-2 rounded-full bg-green-100 dark:bg-[#26a69a]/10 group-hover:bg-green-200 dark:group-hover:bg-[#26a69a]/20">
              <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-[#26a69a]" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">Fund Wallet</span>
          </button>

          <button
            onClick={() => onNavigate('wallet')}
            className="p-4 bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] hover:border-red-400 dark:hover:border-[#ef5350] rounded-sm flex flex-col items-center justify-center gap-2 transition-colors group">

            <div className="p-2 rounded-full bg-red-100 dark:bg-[#ef5350]/10 group-hover:bg-red-200 dark:group-hover:bg-[#ef5350]/20">
              <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-[#ef5350]" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">Withdraw</span>
          </button>

          <button
            onClick={() => onNavigate('signals')}
            className="p-4 bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] hover:border-blue-400 dark:hover:border-[#2962ff] rounded-sm flex flex-col items-center justify-center gap-2 transition-colors group">

            <div className="p-2 rounded-full bg-blue-100 dark:bg-[#2962ff]/10 group-hover:bg-blue-200 dark:group-hover:bg-[#2962ff]/20">
              <Activity className="h-5 w-5 text-blue-600 dark:text-[#2962ff]" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">Buy Signals</span>
          </button>

          <button
            onClick={() => onNavigate('bot')}
            className="p-4 bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] hover:border-purple-400 dark:hover:border-purple-500 rounded-sm flex flex-col items-center justify-center gap-2 transition-colors group">

            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-500/10 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20">
              <Activity className="h-5 w-5 text-purple-600 dark:text-purple-500" />
            </div>
            <span className="text-xs font-bold text-gray-900 dark:text-white">Buy Bot</span>
          </button>

          <button
            onClick={() => onNavigate('trade')}
            className="col-span-2 p-4 bg-gradient-to-r from-green-500 to-blue-600 dark:from-[#26a69a] dark:to-[#2962ff] rounded-sm flex items-center justify-center gap-3 hover:opacity-90 transition-opacity animate-pulse">

            <Play className="h-5 w-5 text-white fill-current" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Start Trading Terminal
            </span>
          </button>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-300 dark:border-[#21262d]">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Trade History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-white dark:bg-[#0d1117] text-gray-600 dark:text-[#8b949e] text-xs">
              <tr>
                <th className="px-4 py-2 text-left">Symbol</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-right">Volume</th>
                <th className="px-4 py-2 text-right">Entry</th>
                <th className="px-4 py-2 text-right">Close</th>
                <th className="px-4 py-2 text-right">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-[#21262d]">
              {history.length === 0 ?
              <tr>
                  <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-600 dark:text-[#8b949e]">

                    No trade history available
                  </td>
                </tr> :

              history.slice(0, 5).map((trade) =>
              <tr key={trade.id} className="hover:bg-gray-200 dark:hover:bg-[#1c2128]">
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                      {trade.symbol}
                    </td>
                    <td
                  className={`px-4 py-3 font-bold ${trade.type === 'BUY' ? 'text-green-600 dark:text-[#26a69a]' : 'text-red-600 dark:text-[#ef5350]'}`}>

                      {trade.type}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-[#c9d1d9]">
                      {trade.lots.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-[#c9d1d9]">
                      {trade.entryPrice}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-[#c9d1d9]">
                      {trade.currentPrice}
                    </td>
                    <td
                  className={`px-4 py-3 text-right font-mono font-bold ${trade.profit >= 0 ? 'text-green-600 dark:text-[#26a69a]' : 'text-red-600 dark:text-[#ef5350]'}`}>

                      {formatCurrency(trade.profit)}
                    </td>
                  </tr>
              )
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}