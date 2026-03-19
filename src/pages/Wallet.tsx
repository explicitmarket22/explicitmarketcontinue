import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { formatCurrency, formatDate } from '../lib/utils';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  CreditCard,
  Landmark,
  Bitcoin,
  CheckCircle,
  Clock,
  XCircle,
  Coins,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign,
  Wallet,
  BarChart3,
} from 'lucide-react';

export function WalletPage() {
  const { account, deposit, withdraw, transactions, user, getUserTransactions, systemWallets, bankAccounts, submitCreditCardDeposit } = useStore();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history' | 'overview'>('overview');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('crypto');
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const [showBalance, setShowBalance] = useState(true);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [searchTx, setSearchTx] = useState('');
  
  // Credit card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');

  // Get crypto icons for system wallets
  const getCryptoIcon = (cryptoId: string) => {
    const icons: { [key: string]: string } = {
      'BTC': '₿',
      'ETH': 'Ξ',
      'USDT-TRC20': '₮',
      'USDT-ERC20': '₮',
      'LTC': 'Ł',
      'XRP': '✕',
    };
    return icons[cryptoId] || '◉';
  };

  // Filter only active wallets
  const activeWallets = systemWallets.filter((w) => w.isActive);

  // Set default selected wallet if not set and wallets exist
  React.useEffect(() => {
    if (!selectedWalletId && activeWallets.length > 0) {
      setSelectedWalletId(activeWallets[0].id);
    }
  }, [activeWallets, selectedWalletId]);

  // Fallback hardcoded crypto options if no system wallets are configured
  const fallbackCryptoOptions = [
    {
      id: 'BTC',
      name: 'Bitcoin',
      network: 'Bitcoin',
      address: 'bc1q7x2d3f9g8h2j5k7l9m0n1p3q5r7s9t',
      min: 0.001,
      icon: '₿'
    },
    {
      id: 'ETH',
      name: 'Ethereum',
      network: 'ERC-20',
      address: '0x3f9a1d2e5f8g9h0k2l4m6n7p9q1s3t5u',
      min: 0.01,
      icon: 'Ξ'
    },
    {
      id: 'USDT-TRC20',
      name: 'Tether',
      network: 'TRC-20',
      address: 'TQ8x3f9g8h2j5k7l9m0n1p3q5r7s9t',
      min: 10,
      icon: '₮'
    },
    {
      id: 'USDT-ERC20',
      name: 'Tether',
      network: 'ERC-20',
      address: '0x3f9a1d2e5f8g9h0k2l4m6n7p9q1s3t5u',
      min: 10,
      icon: '₮'
    },
    {
      id: 'LTC',
      name: 'Litecoin',
      network: 'Litecoin',
      address: 'ltc1m4k9l7n2p5q8r1s3t6u9v0w2x4z',
      min: 0.1,
      icon: 'Ł'
    },
    {
      id: 'XRP',
      name: 'Ripple',
      network: 'XRP Ledger',
      address: 'rN7n3pQ2m5l8k9j2h0g3d4f5s6x7z',
      tag: '12345',
      min: 20,
      icon: '✕'
    }
  ];

  const bankMethods = [
    { id: 'swift', name: 'SWIFT Transfer', time: '1-3 days', fee: '0.5%' },
    { id: 'sepa', name: 'SEPA Transfer', time: '1-2 days', fee: '0.3%' },
    { id: 'ach', name: 'ACH Transfer', time: '2-3 days', fee: '0.2%' },
  ];

  // Use system wallets if available, otherwise use fallback
  const currentWallet = selectedWalletId
    ? activeWallets.find((w) => w.id === selectedWalletId)
    : activeWallets.length > 0
    ? activeWallets[0]
    : null;

  // For backward compatibility with UI that expects cryptoOptions format
  const cryptoOptions = activeWallets.length > 0
    ? activeWallets.map((w) => ({
        id: w.cryptoId,
        name: w.name,
        network: w.network,
        address: w.address,
        min: w.minDeposit,
        icon: getCryptoIcon(w.cryptoId),
        walletId: w.id,
      }))
    : fallbackCryptoOptions;

  const currentCrypto = cryptoOptions.find((c) => {
    if (currentWallet) {
      return c.id === currentWallet.cryptoId;
    }
    return false;
  }) || (cryptoOptions.length > 0 ? cryptoOptions[0] : null);

  // Get current user's transactions only
  const userTransactions = user ? getUserTransactions(user.id) : [];

  // Calculate statistics
  const totalDeposited = userTransactions
    .filter(tx => tx.type === 'DEPOSIT' && tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawn = userTransactions
    .filter(tx => tx.type === 'WITHDRAWAL' && tx.status === 'COMPLETED')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pendingWithdrawals = userTransactions
    .filter(tx => tx.type === 'WITHDRAWAL' && tx.status === 'PENDING')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Filter transactions
  const filteredTransactions = userTransactions.filter(tx => {
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    if (searchTx && !tx.method.toLowerCase().includes(searchTx.toLowerCase())) return false;
    return true;
  });

  // called when user confirms payment
  const submitDeposit = async () => {
    if (!amount || !user) return;
    
    try {
      if (method === 'card') {
        // Submit credit card deposit
        if (!cardNumber || !cardHolder || !cardExpiry) {
          alert('Please fill in all card details');
          return;
        }
        await submitCreditCardDeposit(user.id, parseFloat(amount), cardNumber, cardHolder, cardExpiry);
        // Reset form
        setCardNumber('');
        setCardHolder('');
        setCardExpiry('');
      } else {
        // Submit other deposit methods
        await deposit(parseFloat(amount), method);
      }
      // show in history and return to overview
      setActiveTab('history');
      setStep(1);
      setAmount('');
    } catch (error) {
      alert('❌ Deposit request failed. Please try again.');
    }
  };

  const handleWithdraw = async () => {
    if (!amount || !withdrawAddress) {
      alert('Please enter amount and address');
      return;
    }
    const withdrawAmount = parseFloat(amount);
    const commission = withdrawAmount * 0.20;
    const totalDeduction = withdrawAmount + commission;
    
    if (totalDeduction > account.freeMargin) {
      alert(
        `Insufficient funds. Total deduction including 20% commission: ${formatCurrency(
          totalDeduction
        )}`
      );
      return;
    }
    
    try {
      await withdraw(withdrawAmount, method);
      setStep(3);
      setTimeout(() => {
        setStep(1);
        setAmount('');
        setWithdrawAddress('');
      }, 2000);
    } catch (error) {
      alert('❌ Withdrawal request failed. Please try again.');
    }
  };

  const handleCopyAddress = (address: string, id: string) => {
    navigator.clipboard.writeText(address);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };


  return (
    <div className="min-h-screen bg-white dark:bg-[#0d1117] text-gray-900 dark:text-white p-4 md:p-6 space-y-6 pb-20 md:pb-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Wallet className="h-8 w-8 text-[#26a69a]" />
            Wallet & Funds
          </h1>
          <p className="text-sm text-gray-600 dark:text-[#8b949e] mt-1">Manage your trading account funds</p>
        </div>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded hover:border-gray-400 dark:hover:border-[#8b949e] transition"
        >
          {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {showBalance ? 'Hide' : 'Show'} Balance
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 dark:bg-[#161b22] p-1 rounded border border-gray-300 dark:border-[#21262d] overflow-x-auto no-scrollbar">
        {['overview', 'deposit', 'withdraw', 'history'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as any);
              setStep(1);
            }}
            className={`px-4 md:px-6 py-2 text-sm font-bold rounded capitalize transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#2962ff] text-white shadow-lg'
                : 'text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Balance Card */}
            <div className="bg-gradient-to-br from-gray-50 dark:from-[#161b22] to-white dark:to-[#0d1117] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 hover:border-[#26a69a] transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-[#8b949e] font-bold uppercase">Balance</span>
                <DollarSign className="h-4 w-4 text-[#26a69a]" />
              </div>
              <p className="text-2xl md:text-3xl font-mono font-bold text-gray-900 dark:text-white">
                {showBalance ? formatCurrency(account.balance) : '••••••'}
              </p>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] mt-2">Available for trading</p>
            </div>

            {/* Equity Card */}
            <div className="bg-gradient-to-br from-gray-50 dark:from-[#161b22] to-white dark:to-[#0d1117] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 hover:border-[#2962ff] transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-[#8b949e] font-bold uppercase">Equity</span>
                <TrendingUp className="h-4 w-4 text-[#2962ff]" />
              </div>
              <p className={`text-2xl md:text-3xl font-mono font-bold ${
                account.equity >= account.balance ? 'text-[#26a69a]' : 'text-[#ef5350]'
              }`}>
                {showBalance ? formatCurrency(account.equity) : '••••••'}
              </p>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] mt-2">Balance + Open P/L</p>
            </div>

            {/* Free Margin Card */}
            <div className="bg-gradient-to-br from-gray-50 dark:from-[#161b22] to-white dark:to-[#0d1117] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 hover:border-yellow-500 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-[#8b949e] font-bold uppercase">Free Margin</span>
                <Coins className="h-4 w-4 text-yellow-500" />
              </div>
              <p className="text-2xl md:text-3xl font-mono font-bold text-gray-900 dark:text-white">
                {showBalance ? formatCurrency(account.freeMargin) : '••••••'}
              </p>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] mt-2">Available to trade</p>
            </div>

            {/* Margin Level Card */}
            <div className="bg-gradient-to-br from-gray-50 dark:from-[#161b22] to-white dark:to-[#0d1117] border border-gray-300 dark:border-[#21262d] rounded-lg p-6 hover:border-purple-500 transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-[#8b949e] font-bold uppercase">Margin Level</span>
                <BarChart3 className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-2xl md:text-3xl font-mono font-bold text-gray-900 dark:text-white">
                {account.marginLevel.toFixed(0)}%
              </p>
              <p className="text-xs text-gray-600 dark:text-[#8b949e] mt-2">
                {account.marginLevel > 100 ? 'Healthy' : 'Watch out'}
              </p>
            </div>
          </div>

          {/* Statistics & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Statistics */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded p-4">
                  <p className="text-sm text-gray-600 dark:text-[#8b949e] mb-2">Total Deposited</p>
                  <p className="text-xl font-mono font-bold text-[#26a69a]">
                    {formatCurrency(totalDeposited)}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded p-4">
                  <p className="text-sm text-gray-600 dark:text-[#8b949e] mb-2">Total Withdrawn</p>
                  <p className="text-xl font-mono font-bold text-[#ef5350]">
                    {formatCurrency(totalWithdrawn)}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded p-4">
                  <p className="text-sm text-gray-600 dark:text-[#8b949e] mb-2">Pending Withdrawals</p>
                  <p className="text-xl font-mono font-bold text-yellow-500">
                    {formatCurrency(pendingWithdrawals)}
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded p-4">
                  <p className="text-sm text-gray-600 dark:text-[#8b949e] mb-2">Leverage</p>
                  <p className="text-xl font-mono font-bold text-gray-900 dark:text-white">1:{account.leverage}</p>
                </div>
                <div className="bg-gray-100 dark:bg-[#161b22] border border-gray-300 dark:border-[#21262d] rounded p-4">
                  <p className="text-sm text-gray-600 dark:text-[#8b949e] mb-2">Account Type</p>
                  <p className="text-xl font-mono font-bold text-[#2962ff]">{account.type}</p>
                </div>
                <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
                  <p className="text-sm text-[#8b949e] mb-2">Currency</p>
                  <p className="text-xl font-mono font-bold text-white">{account.currency}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('deposit')}
                  className="w-full px-4 py-3 bg-[#26a69a] hover:bg-teal-600 text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowDownLeft className="h-4 w-4" />
                  Deposit Funds
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className="w-full px-4 py-3 bg-[#ef5350] hover:bg-red-600 text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Withdraw Funds
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className="w-full px-4 py-3 bg-[#2962ff] hover:bg-blue-700 text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  View History
                </button>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
            <h4 className="font-bold text-white mb-3">Important Information</h4>
            <ul className="space-y-2 text-sm text-[#8b949e]">
              <li>• Minimum deposit is \$100 USD equivalent</li>
              <li>• Crypto deposits require 1 network confirmation</li>
              <li>• Bank transfers take 1-3 business days</li>
              <li>• Withdrawals include 20% commission</li>
              <li>• Funds are protected and verified</li>
            </ul>
          </div>
        </div>
      )}

      {/* Deposit Tab */}
      {activeTab === 'deposit' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Indicator */}
            {step < 3 && (
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        step >= s
                          ? 'bg-[#26a69a] text-white'
                          : 'bg-[#21262d] text-[#8b949e]'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          step > s ? 'bg-[#26a69a]' : 'bg-[#21262d]'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 1: Amount Selection */}
            {step === 1 && (
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6">
                <h3 className="text-lg font-bold text-white mb-4">Select Deposit Amount</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[100, 250, 500, 1000, 5000, 10000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val.toString())}
                      className={`p-3 border rounded font-mono font-bold text-sm transition-all ${
                        amount === val.toString()
                          ? 'border-[#26a69a] bg-[#26a69a]/10 text-[#26a69a]'
                          : 'border-[#21262d] bg-[#0d1117] text-white hover:border-[#8b949e]'
                      }`}
                    >
                      \${val}
                    </button>
                  ))}
                </div>
                <div className="mb-6">
                  <label className="block text-xs text-[#8b949e] mb-2 font-bold">
                    Custom Amount (USD)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#21262d] rounded p-4 text-white font-mono text-lg focus:border-[#26a69a] focus:outline-none"
                    placeholder="0.00"
                    min="100"
                  />
                  <p className="text-xs text-[#8b949e] mt-2">Minimum deposit: \$100</p>
                </div>
                <button
                  onClick={() => amount && parseFloat(amount) >= 100 && setStep(2)}
                  disabled={!amount || parseFloat(amount) < 100}
                  className="w-full py-4 bg-[#26a69a] hover:bg-teal-600 disabled:bg-[#21262d] disabled:text-[#8b949e] text-white font-bold rounded transition-colors"
                >
                  Continue to Payment Method
                </button>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 2 && (
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-6">
                <h3 className="text-lg font-bold text-white">Select Payment Method</h3>

                {/* Payment Methods */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'crypto', label: 'Cryptocurrency', icon: Bitcoin },
                    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                    { id: 'bank', label: 'Bank Transfer', icon: Landmark }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center gap-3 transition-all ${
                        method === m.id
                          ? 'border-[#26a69a] bg-[#26a69a]/10 text-white'
                          : 'border-[#21262d] bg-[#0d1117] text-[#8b949e] hover:border-[#8b949e]'
                      }`}
                    >
                      <m.icon className="h-8 w-8" />
                      <span className="font-bold text-sm">{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Crypto Options */}
                {method === 'crypto' && (
                  <div className="space-y-4">
                    <label className="block text-sm text-[#8b949e] font-bold">
                      Select Cryptocurrency
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {cryptoOptions.map((crypto) => (
                        <button
                          key={crypto.id}
                          onClick={() => {
                            if ('walletId' in crypto) {
                              setSelectedWalletId((crypto as any).walletId);
                            }
                          }}
                          className={`p-3 border-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                            currentCrypto?.id === crypto.id
                              ? 'border-[#26a69a] bg-[#26a69a]/10 text-white'
                              : 'border-[#21262d] bg-[#0d1117] text-[#8b949e]'
                          }`}
                        >
                          <span className="text-2xl">{crypto.icon}</span>
                          <span className="text-xs font-bold">{crypto.id}</span>
                          <span className="text-[10px]">{crypto.network}</span>
                        </button>
                      ))}
                    </div>

                    {currentCrypto && (
                      <div className="bg-[#0d1117] p-4 rounded-lg border border-[#21262d] space-y-3">
                        <p className="text-sm text-[#8b949e]">
                          Send {currentCrypto.name} ({currentCrypto.network}) to:
                        </p>
                        <div className="flex items-center gap-2 bg-[#161b22] p-3 rounded border border-[#21262d]">
                          <code className="flex-1 text-[#26a69a] font-mono text-xs break-all">
                            {currentCrypto.address}
                          </code>
                          <button
                            onClick={() => handleCopyAddress(currentCrypto.address, 'crypto')}
                            className="flex-shrink-0 p-2 hover:bg-[#21262d] rounded transition"
                          >
                            {copied === 'crypto' ? (
                              <CheckCircle className="h-4 w-4 text-[#26a69a]" />
                            ) : (
                              <Copy className="h-4 w-4 text-[#8b949e]" />
                            )}
                          </button>
                        </div>
                        {currentCrypto.tag && (
                          <div className="bg-[#161b22] p-3 rounded border border-[#21262d]">
                            <p className="text-xs text-[#8b949e] mb-2">Destination Tag:</p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-white font-mono text-sm">
                                {currentCrypto.tag}
                              </code>
                              <button
                                onClick={() => handleCopyAddress(currentCrypto.tag!, 'tag')}
                                className="flex-shrink-0 p-2 hover:bg-[#21262d] rounded transition"
                              >
                                {copied === 'tag' ? (
                                  <CheckCircle className="h-4 w-4 text-[#26a69a]" />
                                ) : (
                                  <Copy className="h-4 w-4 text-[#8b949e]" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-[#8b949e] flex justify-between pt-2 border-t border-[#21262d]">
                          <span>Min: {currentCrypto.min} {currentCrypto.id}</span>
                          <span>Est. Time: ~10 mins</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Credit Card */}
                {method === 'card' && (
                  <div className="space-y-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-3">
                      <p className="text-sm font-bold text-yellow-500">⚠️ Credit Card Deposit</p>
                      <p className="text-xs text-[#8b949e]">
                        Credit card payments are currently being processed. Enter your card details below and your payment will be reviewed by our team.
                      </p>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Card Number (e.g., 4532-1234-5678-9999)"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-[#0d1117] border border-[#21262d] rounded p-3 text-white placeholder-[#8b949e] focus:border-[#26a69a] focus:outline-none text-sm"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Card Holder Name"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="bg-[#0d1117] border border-[#21262d] rounded p-3 text-white placeholder-[#8b949e] focus:border-[#26a69a] focus:outline-none text-sm"
                          />
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="bg-[#0d1117] border border-[#21262d] rounded p-3 text-white placeholder-[#8b949e] focus:border-[#26a69a] focus:outline-none text-sm"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="CVV"
                          className="w-full bg-[#0d1117] border border-[#21262d] rounded p-3 text-white placeholder-[#8b949e] focus:border-[#26a69a] focus:outline-none text-sm"
                        />
                      </div>
                      <p className="text-xs text-[#ef5350]">Processing Fee: 2.5%</p>
                    </div>
                  </div>
                )}

                {/* Bank Methods */}
                {method === 'bank' && (
                  <div className="space-y-3">
                    <label className="block text-sm text-[#8b949e] font-bold">
                      Select Bank Account
                    </label>
                    {bankAccounts && bankAccounts.length > 0 && bankAccounts.some(b => b.isActive) ? (
                      <div className="space-y-2">
                        {bankAccounts
                          .filter((account) => account.isActive)
                          .map((account) => (
                            <div
                              key={account.id}
                              className="p-4 border border-[#21262d] rounded-lg bg-[#0d1117] hover:border-[#8b949e] transition"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-bold text-white text-sm">{account.accountName}</p>
                                    <p className="text-xs text-[#8b949e] mt-1">
                                      Bank: {account.bankName}
                                    </p>
                                  </div>
                                  <Landmark className="h-5 w-5 text-[#26a69a]" />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-4 border border-[#ef5350]/30 bg-[#ef5350]/5 rounded-lg">
                        <p className="text-sm text-[#ef5350] font-bold">⚠️ Bank Transfer Not Available</p>
                        <p className="text-xs text-[#8b949e] mt-2">
                          Bank transfer is currently not available. Please use cryptocurrency deposit instead.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-[#21262d] text-white font-bold rounded hover:bg-[#21262d] transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 bg-[#26a69a] hover:bg-teal-600 text-white font-bold rounded transition-colors"
                  >
                    Proceed (\${amount})
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-12 text-center space-y-4">
                <h3 className="text-2xl font-bold text-white">Confirm Deposit</h3>
                <p className="text-white">Amount: ${amount}</p>
                <p className="text-white">Method: {method === 'crypto' ? (currentCrypto?.id || 'Selected Crypto') : method === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'}</p>
                
                {method === 'card' && (
                  <div className="bg-[#0d1117] p-4 rounded-lg border border-[#21262d] space-y-3">
                    <p className="text-sm text-yellow-500 font-bold">Credit Card Deposit</p>
                    <p className="text-xs text-[#8b949e]">
                      Your credit card information has been received. Our team will review it shortly.
                    </p>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3">
                      <p className="text-xs text-yellow-500">Processing Fee (2.5%): ${(parseFloat(amount) * 0.025).toFixed(2)}</p>
                      <p className="text-xs text-yellow-500 mt-1">Total Amount: ${(parseFloat(amount) * 1.025).toFixed(2)}</p>
                    </div>
                  </div>
                )}
                
                {method === 'crypto' && currentCrypto && (
                  <div className="bg-[#0d1117] p-4 rounded-lg border border-[#21262d] space-y-3">
                    <p className="text-sm text-[#8b949e]">
                      Send {currentCrypto.name} ({currentCrypto.network}) to:
                    </p>
                    <div className="flex items-center gap-2 bg-[#161b22] p-3 rounded border border-[#21262d]">
                      <code className="flex-1 text-[#26a69a] font-mono text-xs break-all">
                        {currentCrypto.address}
                      </code>
                      <button
                        onClick={() => handleCopyAddress(currentCrypto.address, 'crypto')}
                        className="flex-shrink-0 p-2 hover:bg-[#21262d] rounded transition"
                      >
                        {copied === 'crypto' ? (
                          <CheckCircle className="h-4 w-4 text-[#26a69a]" />
                        ) : (
                          <Copy className="h-4 w-4 text-[#8b949e]" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 border border-[#21262d] text-white font-bold rounded hover:bg-[#21262d] transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitDeposit}
                    className="px-6 py-3 bg-[#26a69a] hover:bg-teal-600 text-white font-bold rounded transition"
                  >
                    {method === 'card' ? 'Payment Processing' : 'I have paid'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#21262d] rounded-lg p-6">
              <p className="text-sm text-[#8b949e] mb-1">Deposit Amount</p>
              <p className="text-3xl font-mono font-bold text-[#26a69a]">
                \${amount || '0.00'}
              </p>
              <div className="flex gap-2 mt-4">
                <span className="px-2 py-1 bg-[#26a69a]/10 text-[#26a69a] rounded text-xs font-bold">
                  Active
                </span>
                <span className="px-2 py-1 bg-[#21262d] text-[#8b949e] rounded text-xs font-bold">
                  Verified
                </span>
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-4">
              <h4 className="font-bold text-white mb-3 text-sm">Deposit Benefits</h4>
              <ul className="space-y-2 text-xs text-[#8b949e]">
                <li className="flex items-start gap-2">
                  <span className="text-[#26a69a] mt-0.5">✓</span>
                  <span>Instant access to funds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#26a69a] mt-0.5">✓</span>
                  <span>Multiple payment methods</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#26a69a] mt-0.5">✓</span>
                  <span>Secure transactions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#26a69a] mt-0.5">✓</span>
                  <span>Low fees</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Tab */}
      {activeTab === 'withdraw' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
          <div className="lg:col-span-2">
            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-bold text-white">Request Withdrawal</h3>

              {/* Amount Input */}
              <div>
                <label className="block text-xs text-[#8b949e] mb-2 font-bold">
                  Withdrawal Amount (USD)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#21262d] rounded p-4 text-white font-mono text-lg focus:border-[#ef5350] focus:outline-none"
                    placeholder="0.00"
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    {[25, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        onClick={() =>
                          setAmount(((account.freeMargin * (pct / 100)) / 1.2).toFixed(2))
                        }
                        className="px-2 py-1 text-xs bg-[#21262d] text-white rounded hover:bg-[#30363d] transition"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-xs text-[#8b949e]">
                  <span>Available: {formatCurrency(account.freeMargin)}</span>
                  {amount && (
                    <span className="text-[#ef5350] font-bold">
                      Commission (20%): +{formatCurrency(parseFloat(amount) * 0.2)}
                    </span>
                  )}
                </div>
                {amount && (
                  <div className="mt-2 p-3 bg-[#0d1117] border border-[#21262d] rounded">
                    <p className="text-xs text-[#8b949e]">Total deduction:</p>
                    <p className="text-lg font-mono font-bold text-white">
                      {formatCurrency(parseFloat(amount) * 1.2)}
                    </p>
                  </div>
                )}
              </div>

              {/* Withdrawal Method */}
              <div>
                <label className="block text-xs text-[#8b949e] mb-2 font-bold">
                  Withdrawal Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'crypto', label: 'Cryptocurrency', icon: Bitcoin },
                    { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                    { id: 'bank', label: 'Bank Transfer', icon: Landmark }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                        method === m.id
                          ? 'border-[#ef5350] bg-[#ef5350]/10 text-white'
                          : 'border-[#21262d] bg-[#0d1117] text-[#8b949e]'
                      }`}
                    >
                      <m.icon className="h-6 w-6" />
                      <span className="font-bold text-xs">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Address */}
              <div>
                <label className="block text-xs text-[#8b949e] mb-2 font-bold">
                  Destination Address / IBAN
                </label>
                <input
                  type="text"
                  value={withdrawAddress}
                  onChange={(e) => setWithdrawAddress(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded p-4 text-white focus:border-[#ef5350] focus:outline-none text-sm"
                  placeholder={
                    method === 'crypto'
                      ? 'Wallet address (bc1q... or 0x...)'
                      : 'IBAN or Account Number'
                  }
                />
              </div>

              {/* Confirmation */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4">
                <p className="text-sm text-yellow-500 font-bold mb-2">⚠️ Important</p>
                <p className="text-xs text-[#8b949e]">
                  Please verify the address carefully. Withdrawals to incorrect addresses cannot be reversed.
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleWithdraw}
                disabled={!amount || !withdrawAddress || parseFloat(amount) * 1.2 > account.freeMargin}
                className="w-full py-4 bg-[#ef5350] hover:bg-red-600 disabled:bg-[#21262d] disabled:text-[#8b949e] text-white font-bold rounded transition-colors"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>

          {/* Withdrawal Summary */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#161b22] to-[#0d1117] border border-[#21262d] rounded-lg p-6">
              <p className="text-xs text-[#8b949e] mb-1">Free Margin</p>
              <p className="text-2xl md:text-3xl font-mono font-bold text-white">
                {formatCurrency(account.freeMargin)}
              </p>
            </div>

            <div className="bg-[#161b22] border border-[#21262d] rounded-lg p-4">
              <h4 className="font-bold text-white mb-3 text-sm">Withdrawal Info</h4>
              <ul className="space-y-2 text-xs text-[#8b949e]">
                <li className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Processing time: 1-2 hours
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3" />
                  20% commission applied
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  Minimum: \$50 USD
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <input
              type="text"
              value={searchTx}
              onChange={(e) => setSearchTx(e.target.value)}
              placeholder="Search by method..."
              className="flex-1 bg-[#161b22] border border-[#21262d] rounded px-4 py-2 text-white text-sm focus:border-[#26a69a] focus:outline-none"
            />
            <div className="flex gap-2 flex-wrap">
              {['all', 'completed', 'pending', 'failed'].map((status) => (
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

          {/* Transaction Table */}
          <div className="bg-[#161b22] border border-[#21262d] rounded-lg overflow-hidden">
            {filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-[#0d1117] text-[#8b949e] text-xs uppercase border-b border-[#21262d]">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold">Type</th>
                      <th className="px-6 py-4 text-right font-bold">Amount</th>
                      <th className="px-6 py-4 text-left font-bold">Method</th>
                      <th className="px-6 py-4 text-left font-bold">Date</th>
                      <th className="px-6 py-4 text-right font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262d]">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#1c2128] transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {tx.type === 'DEPOSIT' ? (
                              <ArrowDownLeft className="h-4 w-4 text-[#26a69a]" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-[#ef5350]" />
                            )}
                            <span className="font-bold text-white text-sm">{tx.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-white text-right">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 text-[#8b949e] capitalize text-sm">
                          {tx.method}
                        </td>
                        <td className="px-6 py-4 text-[#8b949e] text-sm">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`px-3 py-1 rounded text-xs font-bold inline-block ${
                              tx.status === 'COMPLETED'
                                ? 'bg-[#26a69a]/10 text-[#26a69a]'
                                : tx.status === 'PENDING'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-[#ef5350]/10 text-[#ef5350]'
                            }`}
                          >
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-[#8b949e] text-sm">No transactions found</p>
              </div>
            )}
          </div>

          {/* Summary */}
          {filteredTransactions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
                <p className="text-xs text-[#8b949e] mb-2">Total Shown</p>
                <p className="text-xl font-mono font-bold text-white">
                  {formatCurrency(
                    filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0)
                  )}
                </p>
              </div>
              <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
                <p className="text-xs text-[#8b949e] mb-2">Transactions</p>
                <p className="text-xl font-mono font-bold text-white">
                  {filteredTransactions.length}
                </p>
              </div>
              <div className="bg-[#161b22] border border-[#21262d] rounded p-4">
                <p className="text-xs text-[#8b949e] mb-2">Date Range</p>
                <p className="text-xs font-mono text-white">
                  {filteredTransactions.length > 0
                    ? ` Last \${Math.floor(
                        (Date.now() - filteredTransactions[filteredTransactions.length - 1].date) / (1000 * 60 * 60 * 24)
                      )} days`
                    : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
