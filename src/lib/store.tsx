import React, {
  useEffect,
  useState,
  createContext,
  useContext } from
'react';
import {
  User,
  Account,
  Trade,
  Asset,
  Signal,
  Transaction,
  TradeType,
  PurchasedBot,
  PurchasedSignal,
  CopyTrade,
  FundedAccountPurchase,
  BotTemplate,
  SignalTemplate,
  CopyTradeTemplate,
  Wallet,
  BankAccount,
  SystemWallet,
  CreditCardDeposit } from
'./types';
import { generateId, randomPriceChange } from './utils';
import { supabase } from './supabaseClient';
// Initial Market Data (Extended with 80+ pairs)
const INITIAL_ASSETS: Asset[] = [
  // Forex
  { symbol: 'EURUSD', bid: 1.0850, ask: 1.0852, spread: 2, digits: 5, change: 0.12 },
  { symbol: 'GBPUSD', bid: 1.2640, ask: 1.2643, spread: 3, digits: 5, change: -0.05 },
  { symbol: 'USDJPY', bid: 150.20, ask: 150.22, spread: 2, digits: 3, change: 0.30 },
  { symbol: 'AUDUSD', bid: 0.6520, ask: 0.6522, spread: 2, digits: 5, change: -0.08 },
  { symbol: 'USDCAD', bid: 1.3520, ask: 1.3522, spread: 2, digits: 5, change: 0.05 },
  { symbol: 'USDCHF', bid: 0.8820, ask: 0.8822, spread: 2, digits: 5, change: -0.02 },
  { symbol: 'NZDUSD', bid: 0.6120, ask: 0.6122, spread: 2, digits: 5, change: 0.10 },
  { symbol: 'EURGBP', bid: 0.8580, ask: 0.8582, spread: 2, digits: 5, change: -0.01 },
  { symbol: 'EURJPY', bid: 162.80, ask: 162.83, spread: 3, digits: 3, change: 0.25 },
  { symbol: 'GBPJPY', bid: 189.90, ask: 189.94, spread: 4, digits: 3, change: 0.18 },
  { symbol: 'AUDJPY', bid: 98.20, ask: 98.23, spread: 3, digits: 3, change: 0.08 },
  { symbol: 'EURAUD', bid: 1.6620, ask: 1.6623, spread: 3, digits: 5, change: 0.15 },
  // Crypto
  { symbol: 'BTCUSD', bid: 64200.0, ask: 64250.0, spread: 5000, digits: 2, change: 2.10 },
  { symbol: 'ETHUSD', bid: 3450.0, ask: 3452.5, spread: 250, digits: 2, change: 1.50 },
  { symbol: 'BNBUSD', bid: 580.0, ask: 581.5, spread: 150, digits: 2, change: 0.85 },
  { symbol: 'SOLUSD', bid: 145.20, ask: 145.50, spread: 30, digits: 2, change: 3.20 },
  { symbol: 'ADAUSD', bid: 0.5820, ask: 0.5830, spread: 10, digits: 4, change: -1.20 },
  { symbol: 'XRPUSD', bid: 0.6240, ask: 0.6245, spread: 5, digits: 4, change: 0.45 },
  { symbol: 'DOTUSD', bid: 8.90, ask: 8.95, spread: 5, digits: 2, change: 1.10 },
  { symbol: 'DOGEUSD', bid: 0.1620, ask: 0.1625, spread: 5, digits: 4, change: 5.40 },
  { symbol: 'AVAXUSD', bid: 54.30, ask: 54.45, spread: 15, digits: 2, change: 2.15 },
  { symbol: 'MATICUSD', bid: 1.05, ask: 1.06, spread: 10, digits: 4, change: -0.80 },
  { symbol: 'LINKUSD', bid: 18.20, ask: 18.35, spread: 15, digits: 2, change: 1.40 },
  { symbol: 'UNIUSD', bid: 12.40, ask: 12.50, spread: 10, digits: 2, change: 0.90 },
  { symbol: 'LTCUSD', bid: 88.50, ask: 88.75, spread: 25, digits: 2, change: -0.30 },
  { symbol: 'BCHUSD', bid: 435.0, ask: 437.5, spread: 250, digits: 2, change: 1.80 },
  // Commodities
  { symbol: 'XAUUSD', bid: 2155.50, ask: 2156.10, spread: 60, digits: 2, change: 0.85 },
  { symbol: 'XAGUSD', bid: 24.80, ask: 24.83, spread: 3, digits: 3, change: 0.45 },
  { symbol: 'USOIL', bid: 78.40, ask: 78.44, spread: 4, digits: 2, change: -1.10 },
  { symbol: 'UKOIL', bid: 82.50, ask: 82.55, spread: 5, digits: 2, change: -0.95 },
  { symbol: 'NGAS', bid: 1.850, ask: 1.855, spread: 5, digits: 3, change: 2.30 },
  { symbol: 'COPPER', bid: 3.885, ask: 3.890, spread: 5, digits: 4, change: 0.15 },
  // Indices
  { symbol: 'SPX500', bid: 5120.0, ask: 5121.5, spread: 15, digits: 1, change: 0.45 },
  { symbol: 'NAS100', bid: 18250.0, ask: 18252.5, spread: 25, digits: 1, change: 0.65 },
  { symbol: 'US30', bid: 38900.0, ask: 38905.0, spread: 50, digits: 1, change: 0.25 },
  { symbol: 'GER40', bid: 17850.0, ask: 17853.0, spread: 30, digits: 1, change: 0.15 },
  { symbol: 'UK100', bid: 7650.0, ask: 7652.5, spread: 25, digits: 1, change: -0.10 },
  { symbol: 'JPN225', bid: 39500.0, ask: 39510.0, spread: 100, digits: 0, change: 0.80 },
  // Adding more pairs to reach 80+
  { symbol: 'AUDCAD', bid: 0.8850, ask: 0.8853, spread: 3, digits: 5, change: 0.05 },
  { symbol: 'AUDCHF', bid: 0.5750, ask: 0.5753, spread: 3, digits: 5, change: -0.08 },
  { symbol: 'AUDNZD', bid: 1.0650, ask: 1.0653, spread: 3, digits: 5, change: 0.02 },
  { symbol: 'CADCHF', bid: 0.6520, ask: 0.6523, spread: 3, digits: 5, change: 0.01 },
  { symbol: 'CADJPY', bid: 111.20, ask: 111.23, spread: 3, digits: 3, change: 0.15 },
  { symbol: 'CHFJPY', bid: 170.40, ask: 170.44, spread: 4, digits: 3, change: 0.20 },
  { symbol: 'EURSGD', bid: 1.4550, ask: 1.4554, spread: 4, digits: 5, change: -0.05 },
  { symbol: 'EURCAD', bid: 1.4650, ask: 1.4654, spread: 4, digits: 5, change: 0.03 },
  { symbol: 'EURCHF', bid: 0.9580, ask: 0.9583, spread: 3, digits: 5, change: 0.01 },
  { symbol: 'EURNZD', bid: 1.7720, ask: 1.7725, spread: 5, digits: 5, change: 0.12 },
  { symbol: 'GBPAUD', bid: 1.9380, ask: 1.9385, spread: 5, digits: 5, change: -0.05 },
  { symbol: 'GBPCAD', bid: 1.7080, ask: 1.7085, spread: 5, digits: 5, change: 0.08 },
  { symbol: 'GBPCHF', bid: 1.1150, ask: 1.1155, spread: 5, digits: 5, change: 0.02 },
  { symbol: 'GBPNZD', bid: 2.0650, ask: 2.0658, spread: 8, digits: 5, change: 0.05 },
  { symbol: 'NZDCAD', bid: 0.8280, ask: 0.8284, spread: 4, digits: 5, change: -0.02 },
  { symbol: 'NZDCHF', bid: 0.5420, ask: 0.5424, spread: 4, digits: 5, change: 0.01 },
  { symbol: 'NZDJPY', bid: 92.10, ask: 92.14, spread: 4, digits: 3, change: 0.18 },
  { symbol: 'SGDJPY', bid: 112.50, ask: 112.55, spread: 5, digits: 3, change: 0.05 },
  { symbol: 'USDHKD', bid: 7.8250, ask: 7.8255, spread: 5, digits: 4, change: 0.01 },
  { symbol: 'USDSGD', bid: 1.3420, ask: 1.3424, spread: 4, digits: 4, change: -0.02 },
  { symbol: 'USDMXN', bid: 16.8500, ask: 16.8550, spread: 50, digits: 4, change: 0.25 },
  { symbol: 'USDZAR', bid: 18.9500, ask: 18.9650, spread: 150, digits: 4, change: 0.45 },
  { symbol: 'USDSYS', bid: 2.0500, ask: 2.0520, spread: 20, digits: 4, change: 0.00 },
  { symbol: 'XPTUSD', bid: 925.50, ask: 926.80, spread: 130, digits: 2, change: -0.45 },
  { symbol: 'XPDUSD', bid: 1045.00, ask: 1048.50, spread: 350, digits: 2, change: 1.15 },
  { symbol: 'ATOMUSD', bid: 11.85, ask: 11.92, spread: 7, digits: 2, change: 2.45 },
  { symbol: 'LTCETH', bid: 0.0255, ask: 0.0256, spread: 1, digits: 4, change: -0.15 },
  { symbol: 'BTCEUR', bid: 59200.0, ask: 59250.0, spread: 5000, digits: 1, change: 2.05 },
  { symbol: 'BTCGBP', bid: 50800.0, ask: 50850.0, spread: 5000, digits: 1, change: 1.95 },
  { symbol: 'AAVEUSD', bid: 118.40, ask: 118.65, spread: 25, digits: 2, change: 4.15 },
  { symbol: 'ADAETH', bid: 0.000168, ask: 0.000169, spread: 1, digits: 6, change: -0.50 },
  { symbol: 'ALGOUSD', bid: 0.2450, ask: 0.2458, spread: 8, digits: 4, change: 1.05 },
  { symbol: 'BATUSD', bid: 0.3250, ask: 0.3265, spread: 15, digits: 4, change: -0.85 },
  { symbol: 'EOSUSD', bid: 1.1250, ask: 1.1275, spread: 25, digits: 4, change: 0.45 },
  { symbol: 'ETCUSD', bid: 32.40, ask: 32.55, spread: 15, digits: 2, change: 1.25 },
  { symbol: 'FILUSD', bid: 9.85, ask: 9.92, spread: 7, digits: 2, change: 3.15 },
  { symbol: 'ICPUSD', bid: 14.25, ask: 14.38, spread: 13, digits: 2, change: -2.10 },
  { symbol: 'NEOUSD', bid: 15.40, ask: 15.55, spread: 15, digits: 2, change: 0.85 },
  { symbol: 'VETUSD', bid: 0.04850, ask: 0.04875, spread: 25, digits: 5, change: 1.45 },
  { symbol: 'XLMUSD', bid: 0.1450, ask: 0.1458, spread: 8, digits: 4, change: -0.55 },
  { symbol: 'XMRUSD', bid: 148.50, ask: 149.25, spread: 75, digits: 2, change: 0.25 },
  { symbol: 'ZECUSD', bid: 28.40, ask: 28.65, spread: 25, digits: 2, change: -1.15 }
];

interface StoreContextType {
  user: User | null;
  allUsers: User[];
  account: Account;
  assets: Asset[];
  trades: Trade[];
  history: Trade[];
  transactions: Transaction[];
  signals: Signal[];
  purchasedBots: PurchasedBot[];
  purchasedSignals: PurchasedSignal[];
  purchasedCopyTrades: CopyTrade[];
  purchasedFundedAccounts: FundedAccountPurchase[];
  recentTrades: Array<{
    id: string;
    userId: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    volume: number;
    entryPrice: number;
    closePrice: number;
    profit: number;
    openedAt: number;
    closedAt?: number;
    status: 'OPEN' | 'CLOSED';
  }>;
  botTemplates: BotTemplate[];
  signalTemplates: SignalTemplate[];
  copyTradeTemplates: CopyTradeTemplate[];
  wallets: Wallet[];
  bankAccounts: BankAccount[];
  isAuthenticated: boolean;
  theme: 'light' | 'dark';
  botActive: boolean;
  login: (email: string, password?: string, signupData?: { fullName: string; phone: string; country: string; password: string; referralCode?: string }) => Promise<{ success: boolean; isAdmin?: boolean; error?: string }>;
  logout: () => void;
  executeTrade: (
    symbol: string,
    type: TradeType,
    lots: number,
    sl?: number,
    tp?: number
  ) => void;
  closeTrade: (tradeId: string) => void;
  modifyTradeSLTP: (
    tradeId: string,
    sl: number | null,
    tp: number | null
  ) => void;
  deposit: (amount: number, method: string) => void;
  withdraw: (amount: number, method: string) => void;
  toggleBot: (active: boolean) => void;
  recordTrade: (symbol: string, type: 'BUY' | 'SELL', volume: number, entryPrice: number, closePrice: number) => void;
  // Bot/Signal Purchase Methods
  purchaseBot: (botId: string, botName: string, price: number, performance: number) => void;
  purchaseSignal: (signalId: string, providerName: string, allocation: number, winRate: number) => void;
  approveBotPurchase: (botPurchaseId: string) => void; // First approval - just approve purchase
  approveBotActivation: (botPurchaseId: string, durationValue: string, durationType: 'minutes' | 'hours' | 'days', outcome: 'win' | 'lose') => void; // Second approval - activate with settings
  approveSignalPurchase: (signalPurchaseId: string) => void; // First approval - just approve purchase
  allocateSignalCapital: (signalPurchaseId: string, amount: number) => void;
  approveSignalSubscription: (signalSubId: string, durationValue: string, durationType: 'minutes' | 'hours' | 'days', outcome: 'win' | 'lose') => void; // Second approval - activate with settings
  allocateBotCapital: (botPurchaseId: string, amount: number) => void;
  setBotDuration: (botPurchaseId: string, durationDays: number) => void;
  pauseBot: (botPurchaseId: string) => void;
  resumeBot: (botPurchaseId: string) => void;
  terminateBot: (botPurchaseId: string) => void;
  terminateSignal: (signalSubId: string) => void;
  continueSignalTrading: (signalSubId: string) => void;
  // Copy Trading Methods
  followTrader: (trader: any, allocation: number, durationValue: string, durationType: 'minutes' | 'hours' | 'days') => void;
  adminCreateCopyTrade: (userId: string, traderName: string, allocation: number, durationValue: string, durationType: 'minutes' | 'hours' | 'days', risk: 'Low' | 'Medium' | 'High', performance?: number) => void;
  stopCopyTrading: (copyTradeId: string) => void;
  closeCopyTrade: (copyTradeId: string, profit: number) => void;
  // Funded Account Methods
  purchaseFundedAccount: (planId: string, planName: string, capital: number, price: number, profitTarget: number, maxDrawdown: number) => void;
  approveFundedAccount: (accountId: string) => void;
  rejectFundedAccount: (accountId: string) => void;
  // Bot Template Methods
  addBotTemplate: (name: string, description: string, price: number, performance: number, winRate: number, trades: number, type: string, risk: 'Low' | 'Medium' | 'High', maxDrawdown: number) => void;
  editBotTemplate: (botId: string, updates: Partial<BotTemplate>) => void;
  deleteBotTemplate: (botId: string) => void;
  // Signal Template Methods
  addSignalTemplate: (providerName: string, description: string, symbol: string, confidence: number, followers: number, cost: number, winRate: number, trades: number, avgReturn: number) => void;
  editSignalTemplate: (signalId: string, updates: Partial<SignalTemplate>) => void;
  deleteSignalTemplate: (signalId: string) => void;
  // Copy Trade Template Methods
  addCopyTradeTemplate: (name: string, description: string, winRate: number, return_: number, followers: number, risk: 'Low' | 'Medium' | 'High', dailyReturn: number, trades: number) => void;
  editCopyTradeTemplate: (copyTradeId: string, updates: Partial<CopyTradeTemplate>) => void;
  deleteCopyTradeTemplate: (copyTradeId: string) => void;
  // Wallet Methods
  addWallet: (userId: string, address: string, label: string, type: 'DEPOSIT' | 'PURCHASE', currency: string, network?: string) => void;
  editWallet: (walletId: string, updates: Partial<Wallet>) => void;
  removeWallet: (walletId: string) => void;
  // Bank Account Methods
  addBankAccount: (accountName: string, accountNumber: string, bankName: string, routingNumber: string, accountType: 'CHECKING' | 'SAVINGS', currency: string, country: string, type: 'DEPOSIT' | 'WITHDRAWAL', swiftCode?: string, iban?: string) => void;
  editBankAccount: (accountId: string, updates: Partial<BankAccount>) => void;
  removeBankAccount: (accountId: string) => void;
  toggleBankAccountStatus: (accountId: string) => void;
  // Admin Methods
  addBalance: (userId: string, amount: number) => void;
  removeBalance: (userId: string, amount: number) => void;
  togglePageLock: (userId: string, page: string) => void;
  toggleUserLock: (userId: string) => void;
    setUserTradeMode: (userId: string, mode: 'NORMAL' | 'PROFIT' | 'LOSS') => void;
  approveTransaction: (transactionId: string) => void;
  rejectTransaction: (transactionId: string) => void;
  getUserById: (userId: string) => User | undefined;
  getUserTransactions: (userId: string) => Transaction[];
  convertFundedToBalance: (userId?: string) => void;
  adminCreateBot: (userId: string, botName: string, allocatedAmount: number, performance: number, totalEarned?: number) => void;
  adminCreateSignal: (userId: string, providerName: string, allocation: number, winRate: number, cost?: number) => void;
  approveKYC: (userId: string) => void;
  rejectKYC: (userId: string) => void;
  submitKYC: (userId: string, data: any) => void;
  // Profile & Theme Management
  updateUserProfile: (name: string) => void;
  updatePassword: (email: string, currentPassword: string, newPassword: string) => { success: boolean; message: string };
  toggleTheme: () => void;
  getTheme: () => 'light' | 'dark';
  // System Wallet Management Methods
  systemWallets: SystemWallet[];
  addSystemWallet: (name: string, cryptoId: string, network: string, address: string, minDeposit: number) => void;
  editSystemWallet: (walletId: string, updates: Partial<SystemWallet>) => void;
  removeSystemWallet: (walletId: string) => void;
  toggleSystemWalletStatus: (walletId: string) => void;
  // Credit Card Deposit Methods
  creditCardDeposits: CreditCardDeposit[];
  submitCreditCardDeposit: (userId: string, amount: number, cardNumber: string, cardHolder: string, expiryDate: string) => void;
  approveCreditCardDeposit: (depositId: string, notes?: string) => void;
  rejectCreditCardDeposit: (depositId: string, notes?: string) => void;
  // Referral Methods
  referralRecords: any[];
  completeReferralReward: (referralId: string) => void;
  getReferralStats: (userId: string) => { totalReferrals: number; totalEarnings: number; pendingEarnings: number };
  // Admin Referral Management
  approveReferral: (referralId: string) => void;
  rejectReferral: (referralId: string) => void;
  manuallyAddReferral: (userId: string, referrerUserId: string, bonusAmount?: number) => void;
  adjustReferralBonus: (referralId: string, newBonusAmount: number) => void;
}
const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: {children: React.ReactNode;}) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('allUsers');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [botActive, setBotActive] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return (savedTheme as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });
  const [purchasedBots, setPurchasedBots] = useState<PurchasedBot[]>([]);
  const [purchasedSignals, setPurchasedSignals] = useState<PurchasedSignal[]>([]);
  const [purchasedCopyTrades, setPurchasedCopyTrades] = useState<CopyTrade[]>([]);
  const [purchasedFundedAccounts, setPurchasedFundedAccounts] = useState<FundedAccountPurchase[]>([]);
  // Recent Trades for History
  const [recentTrades, setRecentTrades] = useState<Array<{
    id: string;
    userId: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    volume: number;
    entryPrice: number;
    closePrice: number;
    profit: number;
    openedAt: number;
    closedAt?: number;
    status: 'OPEN' | 'CLOSED';
  }>>([]);
  const [botTemplates, setBotTemplates] = useState<BotTemplate[]>([]);
  const [signalTemplates, setSignalTemplates] = useState<SignalTemplate[]>([]);
  const [copyTradeTemplates, setCopyTradeTemplates] = useState<CopyTradeTemplate[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [systemWallets, setSystemWallets] = useState<SystemWallet[]>([]);
  const [creditCardDeposits, setCreditCardDeposits] = useState<CreditCardDeposit[]>([]);
  // Referral Tracking
  const [referralRecords, setReferralRecords] = useState<Array<{
    id: string;
    referrerId: string;
    referredUserId: string;
    referredUserEmail: string;
    referredUserName: string;
    bonusAmount: number;
    status: 'PENDING' | 'COMPLETED' | 'REJECTED';
    createdAt: number;
    completedAt?: number;
  }>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('referralRecords');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  // Account State
  const [account, setAccount] = useState<Account>({
    balance: 10000,
    equity: 10000,
    margin: 0,
    freeMargin: 10000,
    marginLevel: 0,
    leverage: 100,
    type: 'LIVE',
    currency: 'USD'
  });

  // Apply theme to document on mount and whenever theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  // Initialize admin user in allUsers on app startup
  useEffect(() => {
    setAllUsers((prev) => {
      const adminExists = prev.some(u => u.id === 'admin-1');
      if (!adminExists) {
        const adminUser: User = {
          id: 'admin-1',
          email: 'admin@work.com',
          name: 'Admin',
          country: 'Global',
          isVerified: true,
          isAdmin: true,
          balance: 0,
          lockedPages: [],
          referralCode: 'ADMIN_MASTER',  // Admin's own referral code
          referralEarnings: 0,
          totalReferrals: 0,
          password: 'admin' // Store for admin view
        };
        return [...prev, adminUser];
      }
      return prev;
    });
  }, []);

  // Persist allUsers to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('allUsers', JSON.stringify(allUsers));
    }
  }, [allUsers]);

  // Persist referralRecords to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('referralRecords', JSON.stringify(referralRecords));
    }
  }, [referralRecords]);

  // whenever the logged-in user changes, mirror their balance in account
  useEffect(() => {
    if (user) {
      setAccount((prev) => ({
        ...prev,
        balance: user.balance || 0,
        equity: user.balance || 0,
        freeMargin: user.balance || 0
      }));
    }
  }, [user]);

  // Real-time signal earning simulation - updates every 1 second
  useEffect(() => {
    const interval = setInterval(() => {
      setPurchasedSignals((prev) =>
        prev.map((sig) => {
          if (sig.status !== 'ACTIVE' || !sig.activeTrades || sig.activeTrades.length === 0) {
            return sig;
          }
          
          const now = Date.now();
          const updatedTrades = sig.activeTrades.map((trade) => {
            if (trade.completed) return trade;
            
            const elapsed = now - trade.startTime;
            const totalDuration = trade.expectedEndTime - trade.startTime;
            const progress = Math.min(elapsed / totalDuration, 1);
            
            // Fluctuate earnings: use sine wave to make it look natural
            const fluctuation = Math.sin(progress * Math.PI * 3) * 0.15;
            let baseEarnings = trade.expectedProfit * (progress * 0.85 + 0.15 + fluctuation);
            
            // Apply outcome: if 'lose', negate the earnings
            const currentEarnings = sig.outcome === 'lose' ? -baseEarnings * 0.5 : baseEarnings;
            
            if (progress >= 1) {
              // Trade completed - lock in final earnings
              const finalEarnings = sig.outcome === 'lose' ? -trade.expectedProfit * 0.5 : trade.expectedProfit;
              return {
                ...trade,
                currentEarnings: finalEarnings,
                completed: true
              };
            }
            
            return { ...trade, currentEarnings: currentEarnings };
          });
          
          // Check if any trades just completed
          const completedCount = updatedTrades.filter((t) => t.completed).length;
          const previousCompletedCount = sig.activeTrades.filter((t) => t.completed).length;
          
          if (completedCount > previousCompletedCount) {
            // New trade completed - add to realized earnings
            const newlyCompleted = updatedTrades.filter(
              (t) => t.completed && !sig.activeTrades.find((st) => st.id === t.id && st.completed)
            );
            const newEarnings = newlyCompleted.reduce((sum, t) => sum + t.expectedProfit, 0);
            
            return {
              ...sig,
              activeTrades: updatedTrades,
              earnings: updatedTrades.reduce((sum, t) => sum + t.currentEarnings, 0),
              totalEarningsRealized: sig.totalEarningsRealized + newEarnings
            };
          }
          
          return {
            ...sig,
            activeTrades: updatedTrades,
            earnings: updatedTrades.reduce((sum, t) => sum + t.currentEarnings, 0)
          };
        })
      );
    }, 1000); // update every 1 second
    
    return () => clearInterval(interval);
  }, []);

  // Real-time copy trade profit simulation - updates every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPurchasedCopyTrades((prev) =>
        prev.map((copy) => {
          if (copy.status !== 'ACTIVE') return copy;
          
          const now = Date.now();
          
          // Calculate end date based on duration
          const durationMs = copy.durationType === 'minutes'
            ? parseInt(copy.durationValue) * 60 * 1000
            : copy.durationType === 'hours' 
            ? parseInt(copy.durationValue) * 60 * 60 * 1000
            : parseInt(copy.durationValue) * 24 * 60 * 60 * 1000;
          
          const endDate = copy.startDate + durationMs;
          const elapsed = now - copy.startDate;
          const progress = Math.min(elapsed / durationMs, 1);
          
          // Expected profit = allocation × (traderReturn / 100)
          const expectedProfit = copy.allocation * ((copy.traderReturn || 0) / 100);
          
          // Calculate incremental profit for this 20-second period
          const totalExpectedProfit = expectedProfit;
          const profitPerPeriod = totalExpectedProfit / (durationMs / 20000); // Divide total profit by number of 20-second periods
          
          // Add natural fluctuation using sine wave (±15%)
          const fluctuation = Math.sin(progress * Math.PI * 3) * 0.15;
          const currentPeriodProfit = profitPerPeriod * (1 + fluctuation);
          
          // Update user's balance with this period's profit
          setAllUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.id === copy.userId
                ? { ...u, balance: (u.balance || 0) + currentPeriodProfit }
                : u
            )
          );
          
          // Update current user's balance if they're logged in
          if (user && user.id === copy.userId) {
            const newBal = (user.balance || 0) + currentPeriodProfit;
            setUser({ ...user, balance: newBal });
            setAccount((prev) => ({ ...prev, balance: newBal }));
          }
          
          const newProfit = copy.profit + currentPeriodProfit;
          
          if (progress >= 1) {
            // Copy trade completed - just close it without returning allocation
            // Allocation will only be returned when user manually terminates
            return {
              ...copy,
              profit: newProfit,
              status: 'CLOSED',
              endDate: Date.now()
            };
          }
          
          return {
            ...copy,
            profit: Math.max(0, newProfit),
            endDate
          };
        })
      );
    }, 20000); // update every 20 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [history, setHistory] = useState<Trade[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // Mock Signals
  const [signals] = useState<Signal[]>([
  {
    id: '1',
    symbol: 'EURUSD',
    type: 'BUY',
    entry: 1.084,
    sl: 1.081,
    tp: 1.09,
    confidence: 85,
    time: Date.now()
  },
  {
    id: '2',
    symbol: 'XAUUSD',
    type: 'SELL',
    entry: 2040.0,
    sl: 2050.0,
    tp: 2020.0,
    confidence: 78,
    time: Date.now() - 3600000
  },
  {
    id: '3',
    symbol: 'GBPUSD',
    type: 'BUY',
    entry: 1.263,
    sl: 1.259,
    tp: 1.27,
    confidence: 82,
    time: Date.now() - 7200000
  },
  {
    id: '4',
    symbol: 'USDJPY',
    type: 'SELL',
    entry: 150.5,
    sl: 151.2,
    tp: 149.5,
    confidence: 71,
    time: Date.now() - 10800000
  },
  {
    id: '5',
    symbol: 'BTCUSD',
    type: 'BUY',
    entry: 51000,
    sl: 49500,
    tp: 54000,
    confidence: 88,
    time: Date.now() - 1800000
  },
  {
    id: '6',
    symbol: 'AUDUSD',
    type: 'BUY',
    entry: 0.651,
    sl: 0.647,
    tp: 0.658,
    confidence: 75,
    time: Date.now() - 5400000
  },
  {
    id: '7',
    symbol: 'ETHUSD',
    type: 'SELL',
    entry: 2960,
    sl: 3020,
    tp: 2880,
    confidence: 68,
    time: Date.now() - 9000000
  },
  {
    id: '8',
    symbol: 'XAUUSD',
    type: 'BUY',
    entry: 2030,
    sl: 2015,
    tp: 2060,
    confidence: 91,
    time: Date.now() - 14400000
  }]
  );
  // Simulation Loop (The "Broker Engine")
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update Prices
      setAssets((prev) =>
      prev.map((asset) => {
        const newBid = randomPriceChange(asset.bid, 0.00005);
        const spreadVal = asset.spread * Math.pow(10, -asset.digits);
        return {
          ...asset,
          bid: newBid,
          ask: newBid + spreadVal
        };
      })
      );
      // 2. Update Open Trades P/L & Account Equity
      setTrades((currentTrades) => {
        if (currentTrades.length === 0) return [];
        return currentTrades.map((trade) => {
          const currentAsset = assets.find((a) => a.symbol === trade.symbol);
          if (!currentAsset) return trade;
          const currentPrice =
          trade.type === 'BUY' ? currentAsset.bid : currentAsset.ask;
          const multiplier = trade.type === 'BUY' ? 1 : -1;
          // Simplified P/L calculation: (Current - Entry) * Lots * ContractSize (assumed 100000 for forex)
          // For MVP simplicity, we'll just use a standard multiplier based on price diff
          const pipDiff = (currentPrice - trade.entryPrice) * multiplier;
          const currentUser = allUsers.find(u => u.id === (user?.id)); // Simplified for current user
            let profit = pipDiff * trade.lots * 100000;
            if (user?.tradeMode === 'PROFIT') profit = Math.abs(profit) || 10;
            if (user?.tradeMode === 'LOSS') profit = -Math.abs(profit) || -10;
          return {
            ...trade,
            currentPrice,
            profit
          };
        });
      });
    }, 1000); // Update every second
    return () => clearInterval(interval);
  }, [assets]); // Dependency on assets to get latest prices for trade calc
  // Recalculate Equity/Margin whenever trades or balance changes
  useEffect(() => {
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
    const usedMargin = trades.reduce(
      (sum, t) => sum + t.entryPrice * t.lots * 100000 / account.leverage,
      0
    );
    setAccount((prev) => ({
      ...prev,
      equity: prev.balance + totalProfit,
      margin: usedMargin,
      freeMargin: prev.balance + totalProfit - usedMargin,
      marginLevel:
      usedMargin > 0 ? (prev.balance + totalProfit) / usedMargin * 100 : 0
    }));
  }, [trades, account.balance, account.leverage]);
  // Bot Logic Simulation
  useEffect(() => {
    if (!botActive || !user) return;
    const botInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance to trade every 5s
        const randomAsset = assets[Math.floor(Math.random() * assets.length)];
        const type: TradeType = Math.random() > 0.5 ? 'BUY' : 'SELL';
        executeTrade(randomAsset.symbol, type, 0.1);
      }
    }, 5000);
    return () => clearInterval(botInterval);
  }, [botActive, user, assets]);

  // Bot Earnings Automation - Every 3 seconds with performance-based calculation
  useEffect(() => {
    const botEarningsInterval = setInterval(() => {
      setPurchasedBots((prev) =>
        prev.map((bot) => {
          // Skip if bot not active or no allocation
          if (bot.status !== 'ACTIVE' || bot.allocatedAmount === 0) return bot;
          
          const now = Date.now();
          
          // Check if bot duration has expired
          if (bot.endDate && now >= bot.endDate) {
            // Auto-close bot - duration expired
            // Refund allocated amount + total earnings to user
            const totalRefund = bot.allocatedAmount + bot.totalEarned;
            
            setAllUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.id === bot.userId
                  ? { ...u, balance: (u.balance || 0) + totalRefund }
                  : u
              )
            );
            
            // Update current user's balance if they're logged in
            if (user && user.id === bot.userId) {
              const newBal = (user.balance || 0) + totalRefund;
              setUser({ ...user, balance: newBal });
              setAccount((prev) => ({ ...prev, balance: newBal }));
            }
            
            console.log(`✅ Bot CLOSED: "${bot.botName}" refunded $${totalRefund.toFixed(2)} (Alloc: $${bot.allocatedAmount.toFixed(2)} + Earnings: $${bot.totalEarned.toFixed(2)})`);
            
            return {
              ...bot,
              status: 'CLOSED'
            };
          }
          
          // Calculate earnings based on performance spread over 3-second intervals
          // performance: bot's win rate (e.g., 64%)
          // Calculate total earning potential: allocation * (performance / 100)
          const performancePercent = (bot.performance || bot.dailyReturn || 10) / 100;
          const totalEarningPotential = bot.allocatedAmount * performancePercent;
          
          // Calculate total intervals based on actual duration (endDate - startedAt)
          const durationMs = bot.endDate && bot.startedAt ? (bot.endDate - bot.startedAt) : 24 * 60 * 60 * 1000;
          const totalIntervals = Math.max(1, durationMs / 3000); // How many 3-second intervals
          
          // Per 3-second interval: totalEarningPotential / totalIntervals
          const baseEarning = totalEarningPotential / totalIntervals;
          
          // Apply win/loss outcome
          let profitOrLoss: number;
          if (bot.outcome === 'win') {
            // WIN: Full earning
            profitOrLoss = baseEarning;
          } else if (bot.outcome === 'lose') {
            // LOSE: No earning (break even)
            profitOrLoss = 0;
          } else {
            // RANDOM: 70% chance of win, 30% chance of no earning
            profitOrLoss = Math.random() > 0.3 ? baseEarning : 0;
          }
          
          // Update totals
          const newTotalEarned = bot.totalEarned + profitOrLoss;
          const newTotalLost = bot.totalLost; // No losses in this model
          
          // Check drawdown limit
          const currentValue = bot.allocatedAmount + newTotalEarned;
          
          // Update user balance in allUsers
          setAllUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.id === bot.userId
                ? { ...u, balance: (u.balance || 0) + profitOrLoss }
                : u
            )
          );
          
          // Update current user's account if they own this bot
          if (user && user.id === bot.userId) {
            setAccount((prev) => ({
              ...prev,
              balance: prev.balance + profitOrLoss
            }));
          }
          
          return {
            ...bot,
            totalEarned: newTotalEarned,
            totalLost: newTotalLost
            // DO NOT update allocatedAmount - keep it as the original allocation
          };
        })
      );
    }, 3000); // Every 3 seconds
    
    return () => clearInterval(botEarningsInterval);
  }, [user]);

  // Sync bot earnings to Supabase (debounced every 10 seconds)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (!user) return; // Only sync if user is logged in
      
      for (const bot of purchasedBots) {
        if (bot.status === 'ACTIVE') {
          // Sync earnings to Supabase for all active bots
          const { data, error } = await supabase
            .from('purchased_bots')
            .update({
              total_earned: bot.totalEarned,
              total_lost: bot.totalLost,
              updated_at: new Date().toISOString()
            })
            .eq('id', bot.id)
            .eq('user_id', user.id); // Important for RLS policies
          
          if (error) {
            console.error('❌ Error syncing bot earnings for', bot.botName, ':', error.message);
          } else {
            console.log('✅ Bot earnings synced:', bot.botName, 'Earned: $' + bot.totalEarned.toFixed(2));
          }
        }
      }
    }, 10000); // Sync every 10 seconds
    
    return () => clearInterval(syncInterval);
  }, [purchasedBots, user]);

  // Signal Earnings Simulation (every 5 seconds with win rate-based spread calculation)
  useEffect(() => {
    const signalEarningsInterval = setInterval(() => {
      setPurchasedSignals((prev) =>
        prev.map((signal) => {
          if (signal.status !== 'ACTIVE' || !signal.allocation || !signal.endDate || !signal.startedAt) return signal;
          
          const now = Date.now();
          
          // Check if signal duration has expired
          if (now >= signal.endDate) {
            // Auto-close signal - duration expired
            // Refund allocation + final earnings to user
            const finalRefund = signal.allocation + signal.earnings;
            
            setAllUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.id === signal.userId
                  ? { ...u, balance: (u.balance || 0) + finalRefund }
                  : u
              )
            );
            
            // Update current user's balance if they're logged in
            if (user && user.id === signal.userId) {
              const newBal = (user.balance || 0) + finalRefund;
              setUser({ ...user, balance: newBal });
              setAccount((prev) => ({ ...prev, balance: newBal }));
            }
            
            console.log(`✅ Signal CLOSED: "${signal.providerName}" refunded $${finalRefund.toFixed(2)} (Alloc: $${signal.allocation.toFixed(2)} + Earnings: $${signal.earnings.toFixed(2)})`);
            
            return {
              ...signal,
              status: 'CLOSED',
              endDate: now
            };
          }
          
          // Calculate total duration and number of 5-second intervals
          const totalDurationMs = signal.endDate - signal.startedAt;
          const totalIntervals = Math.ceil(totalDurationMs / 5000); // Total 5-second intervals in duration
          
          // Calculate per-interval earning/loss based on allocation * winRate
          const winRatePercent = signal.winRate / 100; // Convert to decimal (e.g., 75 -> 0.75)
          let perIntervalEarning: number;
          
          if (signal.outcome === 'win') {
            // WIN: earning = allocation * winRate%, spread across duration
            // Example: $1000 allocation * 0.75 = $750 total spread across all intervals
            const totalEarning = signal.allocation * winRatePercent;
            perIntervalEarning = totalEarning / totalIntervals;
          } else if (signal.outcome === 'lose') {
            // LOSE: loss = allocation * winRate%, spread across duration
            // Example: $1000 allocation * 0.75 = $750 total loss spread across all intervals
            const totalLoss = signal.allocation * winRatePercent;
            perIntervalEarning = -totalLoss / totalIntervals;
          } else {
            // RANDOM: use winRate% probability each interval
            // If profit interval: earning = allocation * winRate% / totalIntervals
            // If loss interval: loss = allocation * winRate% / totalIntervals
            const shouldProfit = Math.random() > (1 - winRatePercent);
            if (shouldProfit) {
              const totalEarning = signal.allocation * winRatePercent;
              perIntervalEarning = totalEarning / totalIntervals;
            } else {
              const totalLoss = signal.allocation * winRatePercent;
              perIntervalEarning = -totalLoss / totalIntervals;
            }
          }
          
          // Update user's balance in allUsers
          setAllUsers((prevUsers) =>
            prevUsers.map((u) =>
              u.id === signal.userId
                ? { ...u, balance: (u.balance || 0) + perIntervalEarning }
                : u
            )
          );
          
          // Also update current user's account if they subscribe to this signal
          if (user && user.id === signal.userId) {
            setAccount((prev) => ({
              ...prev,
              balance: prev.balance + perIntervalEarning
            }));
          }
          
          return {
            ...signal,
            earnings: signal.earnings + perIntervalEarning,
            tradesFollowed: signal.tradesFollowed + 1
          };
        })
      );
    }, 5000); // Every 5 seconds
    
    return () => clearInterval(signalEarningsInterval);
  }, [user]);

  // Sync signal earnings to Supabase (debounced every 10 seconds)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (!user) return; // Only sync if user is logged in
      
      for (const signal of purchasedSignals) {
        if (signal.status === 'ACTIVE') {
          // Sync earnings to Supabase for all active signals
          const { data, error } = await supabase
            .from('purchased_signals')
            .update({
              earnings: signal.earnings,
              total_earnings_realized: signal.totalEarningsRealized,
              updated_at: new Date().toISOString()
            })
            .eq('id', signal.id)
            .eq('user_id', user.id); // Important for RLS policies
          
          if (error) {
            console.error('❌ Error syncing signal earnings for', signal.providerName, ':', error.message);
          } else {
            console.log('✅ Signal earnings synced:', signal.providerName, 'Earnings: $' + signal.earnings.toFixed(2));
          }
        }
      }
    }, 10000); // Sync every 10 seconds
    
    return () => clearInterval(syncInterval);
  }, [purchasedSignals, user]);

  // Sync copy trade profit to Supabase (debounced every 10 seconds)
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      if (!user) return; // Only sync if user is logged in
      
      for (const copyTrade of purchasedCopyTrades) {
        if (copyTrade.status === 'ACTIVE') {
          // Sync profit to Supabase for all active copy trades
          const { data, error } = await supabase
            .from('purchased_copy_trades')
            .update({
              profit: copyTrade.profit,
              copied_trades: copyTrade.copiedTrades,
              updated_at: new Date().toISOString()
            })
            .eq('id', copyTrade.id)
            .eq('user_id', user.id); // Important for RLS policies
          
          if (error) {
            console.error('❌ Error syncing copy trade profit for', copyTrade.traderName, ':', error.message);
          } else {
            console.log('✅ Copy trade profit synced:', copyTrade.traderName, 'Profit: $' + copyTrade.profit.toFixed(2));
          }
        }
      }
    }, 10000); // Sync every 10 seconds
    
    return () => clearInterval(syncInterval);
  }, [purchasedCopyTrades, user]);

  // Sync recent trades to Supabase (new trades are added via recordTrade function)
  useEffect(() => {
    // Note: Recent trades are synced individually via recordTrade function
    // This effect can be used for periodic updates if needed
    return () => {};
  }, [recentTrades, user]);

  // ============ SYNC FUNCTIONS FOR SUPABASE ============
  
  // Sync user balance to Supabase
  const syncUserBalance = async (userId: string, newBalance: number) => {
    try {
      const { error } = await supabase
        .from('user_balances')
        .update({ balance: newBalance })
        .eq('user_id', userId);
      
      if (error) console.error('Error syncing balance:', error);
    } catch (err) {
      console.error('Error in syncUserBalance:', err);
    }
  };

  // Sync transaction (trade, deposit, withdrawal) to Supabase
  const syncTransaction = async (transaction: Transaction) => {
    try {
      console.log('💾 Syncing transaction:', transaction);
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: transaction.userId,
          transaction_type: transaction.type,
          amount: transaction.amount,
          method: transaction.method,
          status: transaction.status,
          description: `${transaction.type} transaction`,
          created_at: new Date(transaction.date).toISOString()
        })
        .select();
      
      if (error) {
        console.error('❌ Error syncing transaction:', error.code, '-', error.message);
      } else {
        console.log('✅ Transaction synced successfully:', data);
      }
    } catch (err: any) {
      console.error('❌ Error in syncTransaction:', err.message);
    }
  };

  // Load all user data from Supabase on login
  const loadUserDataFromSupabase = async (userId: string, isAdmin: boolean = false) => {
    try {
      console.log('🔄 Loading data from Supabase... (Admin:', isAdmin, ')');
      
      if (isAdmin) {
        // ===== ADMIN: Load ALL data from all users =====
        console.log('👑 Admin login detected - loading ALL user data');
        
        // 0. Load all users first
        console.log('👥 Loading all users...');
        const { data: allUsersData, error: usersError } = await supabase
          .from('user_profiles')
          .select('*');

        if (usersError) {
          console.error('❌ Error loading users:', usersError.message);
        } else if (allUsersData && allUsersData.length > 0) {
          console.log('✅ Loaded', allUsersData.length, 'users from database');
          
          // Load balance for each user from user_balances table
          const convertedUsers: User[] = await Promise.all(
            allUsersData.map(async (u: any) => {
              const { data: balanceData } = await supabase
                .from('user_balances')
                .select('balance')
                .eq('user_id', u.id)
                .single();
              
              return {
                id: u.id,
                email: u.email,
                name: u.full_name,
                phoneNumber: u.phone_number,
                country: u.country,
                password: u.password,
                isVerified: u.is_verified,
                isAdmin: u.is_admin,
                balance: balanceData?.balance || 4000,
                lockedPages: u.locked_pages || [],
                referralCode: u.referral_code,
                referralEarnings: u.referral_earnings || 0,
                totalReferrals: u.total_referrals || 0,
                referredBy: u.referred_by,
                kycStatus: u.kyc_status || 'PENDING'
              };
            })
          );
          
          setAllUsers(convertedUsers);
          console.log('✅ AllUsers state updated with', convertedUsers.length, 'users with actual balances');
          convertedUsers.forEach(u => {
            console.log(`  📊 ${u.email}: $${u.balance}`);
          });
        } else {
          console.log('ℹ️ No users found');
        }
        
        // 1. Load all transactions (deposits, withdrawals, trades)
        console.log('📊 Loading all transactions...');
        const { data: allTransactions, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (txError) {
          console.error('❌ Error loading transactions:', txError.message);
        } else if (allTransactions && allTransactions.length > 0) {
          console.log('✅ Loaded', allTransactions.length, 'transactions');
          const depositCount = allTransactions.filter((t: any) => t.transaction_type === 'DEPOSIT').length;
          const withdrawalCount = allTransactions.filter((t: any) => t.transaction_type === 'WITHDRAWAL').length;
          console.log(`  💳 Deposits: ${depositCount}, 💸 Withdrawals: ${withdrawalCount}`);
          
          const convertedTransactions: Transaction[] = allTransactions.map((t: any) => ({
            id: t.id,
            userId: t.user_id,
            type: t.transaction_type,
            amount: t.amount,
            method: t.method,
            status: t.status,
            date: new Date(t.created_at).getTime()
          }));
          setTransactions(convertedTransactions);
        } else {
          console.log('ℹ️ No transactions found');
        }

        // 2. Load all funded accounts
        console.log('🎯 Loading funded accounts...');
        const { data: allFunded, error: fundError } = await supabase
          .from('user_funded_accounts')
          .select('*')
          .order('created_at', { ascending: false });

        if (fundError) {
          console.error('❌ Error loading funded accounts:', fundError.message);
        } else if (allFunded && allFunded.length > 0) {
          console.log('✅ Loaded', allFunded.length, 'funded accounts');
          const convertedFunded: FundedAccountPurchase[] = allFunded.map((f: any) => ({
            id: f.id,
            userId: f.user_id,
            planId: f.plan_id,
            planName: f.plan_name,
            capital: f.capital,
            price: f.price,
            profitTarget: f.profit_target,
            maxDrawdown: f.max_drawdown,
            status: f.status,
            purchasedAt: new Date(f.created_at).getTime()
          }));
          setPurchasedFundedAccounts(convertedFunded);
        } else {
          console.log('ℹ️ No funded accounts found');
        }

        // 3. Load all credit card deposits
        console.log('Loading credit card deposits...');
        const { data: allDeposits, error: depError } = await supabase
          .from('credit_card_deposits')
          .select('*')
          .order('created_at', { ascending: false });

        if (depError) {
          console.error('❌ Error loading deposits:', depError.message);
        } else if (allDeposits && allDeposits.length > 0) {
          console.log('✅ Loaded', allDeposits.length, 'credit card deposits');
          const convertedDeposits: CreditCardDeposit[] = allDeposits.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            amount: d.amount,
            cardNumber: d.card_number,
            cardHolder: d.cardholder_name,
            expiryDate: d.expiry_date,
            status: d.status,
            submittedAt: new Date(d.created_at).getTime(),
            approvedAt: d.processed_at ? new Date(d.processed_at).getTime() : undefined,
            notes: d.approval_notes
          }));
          setCreditCardDeposits(convertedDeposits);
        } else {
          console.log('ℹ️ No credit card deposits found');
        }

      } else {
        // ===== REGULAR USER: Load only THEIR data =====
        console.log('👤 User login - loading their data for user:', userId);
        
        // 1. Load user transactions
        console.log('Loading user transactions...');
        const { data: userTransactions, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (txError) {
          console.error('❌ Error loading transactions:', txError.message);
        } else if (userTransactions && userTransactions.length > 0) {
          console.log('✅ Loaded', userTransactions.length, 'transactions for user');
          const convertedTransactions: Transaction[] = userTransactions.map((t: any) => ({
            id: t.id,
            userId: t.user_id,
            type: t.transaction_type,
            amount: t.amount,
            method: t.method,
            status: t.status,
            date: new Date(t.created_at).getTime()
          }));
          setTransactions(convertedTransactions);
        } else {
          console.log('ℹ️ No transactions found for user');
        }

        // 2. Load user funded accounts
        console.log('Loading user funded accounts...');
        const { data: userFunded, error: fundError } = await supabase
          .from('user_funded_accounts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (fundError) {
          console.error('❌ Error loading funded accounts:', fundError.message);
        } else if (userFunded && userFunded.length > 0) {
          console.log('✅ Loaded', userFunded.length, 'funded accounts for user');
          const convertedFunded: FundedAccountPurchase[] = userFunded.map((f: any) => ({
            id: f.id,
            userId: f.user_id,
            planId: f.plan_id,
            planName: f.plan_name,
            capital: f.capital,
            price: f.price,
            profitTarget: f.profit_target,
            maxDrawdown: f.max_drawdown,
            status: f.status,
            purchasedAt: new Date(f.created_at).getTime()
          }));
          setPurchasedFundedAccounts(convertedFunded);
        } else {
          console.log('ℹ️ No funded accounts found for user');
        }

        // 3. Load user credit card deposits
        console.log('Loading user credit card deposits...');
        const { data: userDeposits, error: depError } = await supabase
          .from('credit_card_deposits')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (depError) {
          console.error('❌ Error loading deposits:', depError.message);
        } else if (userDeposits && userDeposits.length > 0) {
          console.log('✅ Loaded', userDeposits.length, 'credit card deposits for user');
          const convertedDeposits: CreditCardDeposit[] = userDeposits.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            amount: d.amount,
            cardNumber: d.card_number,
            cardHolder: d.cardholder_name,
            expiryDate: d.expiry_date,
            status: d.status,
            submittedAt: new Date(d.created_at).getTime(),
            approvedAt: d.processed_at ? new Date(d.processed_at).getTime() : undefined,
            notes: d.approval_notes
          }));
          setCreditCardDeposits(convertedDeposits);
        } else {
          console.log('ℹ️ No credit card deposits found for user');
        }

        // 4. Load user purchased bots
        console.log('Loading user purchased bots...');
        const { data: userBots, error: botsError } = await supabase
          .from('purchased_bots')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (botsError) {
          console.error('❌ Error loading bots:', botsError.message);
        } else if (userBots && userBots.length > 0) {
          console.log('✅ Loaded', userBots.length, 'purchased bots for user');
          const convertedBots: PurchasedBot[] = userBots.map((b: any) => ({
            id: b.id,
            userId: b.user_id,
            botId: b.bot_id,
            botName: b.bot_name,
            allocatedAmount: b.allocated_amount || 0,
            totalEarned: b.total_earned || 0,
            totalLost: b.total_lost || 0,
            status: b.status,
            purchasedAt: new Date(b.created_at).getTime(),
            approvedAt: b.approved_at ? new Date(b.approved_at).getTime() : undefined,
            performance: b.performance,
            dailyReturn: b.daily_return,
            durationValue: b.duration_value,
            durationType: b.duration_type,
            maxDurationMs: b.max_duration_ms,
            endDate: b.end_date ? new Date(b.end_date).getTime() : undefined,
            outcome: b.outcome,
            startedAt: b.started_at ? new Date(b.started_at).getTime() : undefined
          }));
          setPurchasedBots(convertedBots);
        } else {
          console.log('ℹ️ No purchased bots found for user');
        }

        // 5. Load user purchased signals
        console.log('Loading user purchased signals...');
        const { data: userSignals, error: signalsError } = await supabase
          .from('purchased_signals')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (signalsError) {
          console.error('❌ Error loading signals:', signalsError.message);
        } else if (userSignals && userSignals.length > 0) {
          console.log('✅ Loaded', userSignals.length, 'purchased signals for user');
          const convertedSignals: PurchasedSignal[] = userSignals.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            signalId: s.signal_id,
            providerName: s.provider_name,
            allocation: s.allocation || 0,
            cost: s.cost || 0,
            status: s.status,
            subscribedAt: new Date(s.created_at).getTime(),
            approvedAt: s.approved_at ? new Date(s.approved_at).getTime() : undefined,
            tradesFollowed: s.trades_followed || 0,
            winRate: s.win_rate || 0,
            earnings: s.earnings || 0,
            totalEarningsRealized: s.total_earnings_realized || 0,
            durationValue: s.duration_value,
            durationType: s.duration_type,
            endDate: s.end_date ? new Date(s.end_date).getTime() : undefined,
            outcome: s.outcome,
            activeTrades: s.active_trades || [],
            startedAt: s.started_at ? new Date(s.started_at).getTime() : undefined
          }));
          setPurchasedSignals(convertedSignals);
        } else {
          console.log('ℹ️ No purchased signals found for user');
        }

        // 6. Load user copy trades
        console.log('Loading user copy trades...');
        const { data: userCopyTrades, error: copyTradesError } = await supabase
          .from('purchased_copy_trades')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (copyTradesError) {
          console.error('❌ Error loading copy trades:', copyTradesError.message);
        } else if (userCopyTrades && userCopyTrades.length > 0) {
          console.log('✅ Loaded', userCopyTrades.length, 'copy trades for user');
          const convertedCopyTrades: CopyTrade[] = userCopyTrades.map((ct: any) => ({
            id: ct.id,
            userId: ct.user_id,
            tradesId: ct.trades_id,
            traderName: ct.trader_name,
            allocation: ct.allocation,
            status: ct.status,
            copiedTrades: ct.copied_trades || 0,
            profit: ct.profit || 0,
            startDate: new Date(ct.created_at).getTime(),
            endDate: ct.end_date ? new Date(ct.end_date).getTime() : undefined,
            durationValue: ct.duration_value,
            durationType: ct.duration_type,
            winRate: ct.win_rate || '0%',
            risk: ct.risk,
            performance: ct.performance,
            traderReturn: ct.trader_return || 0
          }));
          setPurchasedCopyTrades(convertedCopyTrades);
        } else {
          console.log('ℹ️ No copy trades found for user');
        }

        // 7. Load recent trades history
        console.log('Loading recent trades...');
        const { data: userRecentTrades, error: tradesError } = await supabase
          .from('recent_trades')
          .select('*')
          .eq('user_id', userId)
          .order('closed_at', { ascending: false })
          .limit(100); // Load last 100 trades

        if (tradesError) {
          console.log('ℹ️ No recent trades table or data:', tradesError.message);
          setRecentTrades([]);
        } else if (userRecentTrades && userRecentTrades.length > 0) {
          console.log('✅ Loaded', userRecentTrades.length, 'recent trades for user');
          const convertedTrades = userRecentTrades.map((t: any) => ({
            id: t.id,
            userId: t.user_id,
            symbol: t.symbol,
            type: t.type,
            volume: t.volume,
            entryPrice: t.entry_price,
            closePrice: t.close_price,
            profit: t.profit,
            openedAt: new Date(t.opened_at).getTime(),
            closedAt: t.closed_at ? new Date(t.closed_at).getTime() : undefined,
            status: t.status
          }));
          setRecentTrades(convertedTrades);
        } else {
          console.log('ℹ️ No recent trades found for user');
          setRecentTrades([]);
        }
      }

      console.log('✅ Data loading complete');
    } catch (err: any) {
      console.error('❌ Error loading user data:', err.message);
    }
  };

  const login = async (email: string, password?: string, signupData?: { fullName: string; phone: string; country: string; password: string; referralCode?: string }) => {
    // Admin authentication
    if (email === 'admin@work.com' && password === 'admin') {
      const adminUser = allUsers.find(u => u.id === 'admin-1') || {
        id: 'admin-1',
        email: 'admin@work.com',
        name: 'Admin',
        country: 'Global',
        isVerified: true,
        isAdmin: true,
        balance: 0,
        lockedPages: [],
        referralCode: 'ADMIN_MASTER',
        referralEarnings: 0,
        totalReferrals: 0,
        password: 'admin'
      };
      setUser(adminUser as User);
      
      // Ensure admin is in allUsers
      setAllUsers((prev) => {
        const exists = prev.some(u => u.id === 'admin-1');
        return exists ? prev : [...prev, adminUser];
      });
      
      // Load all admin data from Supabase
      console.log('👑 Admin login initiated - loading data from Supabase...');
      await loadUserDataFromSupabase('admin-1', true);
      console.log('✅ Admin data loaded successfully');
      return { success: true, isAdmin: true };
    }

    // Regular user login - create or update
    if (email) {
      const existingUser = allUsers.find(u => u.email === email);
      let loginUser: User;

      if (existingUser) {
        // User exists in localStorage
        if (!signupData) {
          // Login attempt - check password
          if (existingUser.password !== password) {
            return { success: false, error: 'Invalid email or password' };
          }
          loginUser = existingUser;
        } else {
          // This shouldn't happen - signup with existing email
          return { success: false, error: 'Email already exists' };
        }
      } else {
        // User not in localStorage - check Supabase for cross-device login
        if (!signupData) {
          // This is a login attempt, not signup
          try {
            // Query Supabase for user by email
            const { data: supabaseUsers, error: queryError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('email', email)
              .single();

            if (queryError || !supabaseUsers) {
              // User not found in Supabase
              return { success: false, error: 'Account not found. Please sign up first.' };
            }

            // User found in Supabase - verify password
            if (supabaseUsers.password !== password) {
              return { success: false, error: 'Invalid email or password' };
            }

            // Password correct - fetch user's balance from Supabase
            const { data: balanceData } = await supabase
              .from('user_balances')
              .select('balance')
              .eq('user_id', supabaseUsers.id)
              .single();

            const userBalance = balanceData?.balance || 4000;

            // Build loginUser object from Supabase data
            loginUser = {
              id: supabaseUsers.id,
              email: supabaseUsers.email,
              name: supabaseUsers.full_name,
              phoneNumber: supabaseUsers.phone_number,
              country: supabaseUsers.country,
              password: supabaseUsers.password,
              isVerified: supabaseUsers.is_verified,
              isAdmin: supabaseUsers.is_admin,
              balance: userBalance,
              lockedPages: supabaseUsers.locked_pages || [],
              referralCode: supabaseUsers.referral_code,
              referralEarnings: supabaseUsers.referral_earnings || 0,
              totalReferrals: supabaseUsers.total_referrals || 0,
              referredBy: supabaseUsers.referred_by
            };

            // Add to localStorage so future logins on this device are instant
            setAllUsers((prev) => {
              const exists = prev.some(u => u.id === loginUser.id);
              return exists ? prev : [...prev, loginUser];
            });

          } catch (err: any) {
            console.error('Error querying Supabase for login:', err);
            return { success: false, error: 'Login failed. Please try again.' };
          }
        } else {
          // Create new user for signup
          const newUserId = generateId();
          // Generate unique referral code (format: USER_XXXX)
          const referralCode = `USER_${newUserId.substring(0, 8).toUpperCase()}`;
          
          loginUser = {
            id: newUserId,
            email,
            name: signupData.fullName,
            phoneNumber: signupData.phone,
            country: signupData.country,
            password: signupData.password, // Store password for admin view
            isVerified: false,
            isAdmin: false,
            balance: 4000,
            lockedPages: [],
            referralCode,
            referralEarnings: 0,
            totalReferrals: 0,
            referredBy: signupData.referralCode || undefined
          };
          
          // Write new user to Supabase user_profiles table
          try {
            const { data: insertedUser, error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                email,
                full_name: signupData.fullName,
                phone_number: signupData.phone,
                country: signupData.country,
                password: signupData.password,
                is_verified: false,
                is_admin: false,
                referral_code: referralCode,
                referral_earnings: 0,
                total_referrals: 0,
                referred_by: signupData.referralCode || null,
                is_active: true
              })
              .select();

            if (profileError) {
              console.error('Error creating user profile:', JSON.stringify(profileError, null, 2));
              console.error('Full error details:', profileError.details);
              return { success: false, error: `Failed to create account: ${profileError.message}` };
            }

            console.log('User created successfully:', insertedUser);
            // Use the ID returned from Supabase if available
            if (insertedUser && insertedUser.length > 0) {
              const createdUser = insertedUser[0];
              loginUser.id = createdUser.id;
            }

            // Write user balance to Supabase user_balances table
            const { error: balanceError } = await supabase
              .from('user_balances')
              .insert({
                user_id: loginUser.id,
                balance: 4000,
                equity: 4000,
                free_margin: 4000
              });

            if (balanceError) {
              console.error('Error creating user balance:', JSON.stringify(balanceError, null, 2));
              // Don't fail - user was created, just balance wasn't recorded
            }
          } catch (err: any) {
            console.error('Supabase error:', JSON.stringify(err, null, 2));
            // Continue with local storage even if Supabase fails
          }
          
          // If this user was referred by someone, validate & track it
          if (signupData.referralCode && signupData.referralCode.trim()) {
            const referrer = allUsers.find(u => u.referralCode === signupData.referralCode.trim());
            if (referrer) {
              // Valid referral code found
              const referralRecord = {
                id: generateId(),
                referrerId: referrer.id,
                referredUserId: loginUser.id,
                referredUserEmail: email,
                referredUserName: signupData.fullName,
                bonusAmount: 25,
                status: 'PENDING' as const,
                createdAt: Date.now()
              };
              
              // Write referral record to Supabase
              try {
                await supabase
                  .from('referral_records')
                  .insert({
                    id: referralRecord.id,
                    referrer_id: referrer.id,
                    referred_user_id: loginUser.id,
                    referred_user_email: email,
                    referred_user_name: signupData.fullName,
                    bonus_amount: 25,
                    status: 'PENDING',
                    created_at: new Date().toISOString()
                  });
              } catch (err) {
                console.error('Error recording referral:', err);
              }
              
              setReferralRecords(prev => [...prev, referralRecord]);
              
              // Update referrer's stats
              setAllUsers(prev => 
                prev.map(u => 
                  u.id === referrer.id
                    ? { 
                        ...u, 
                        totalReferrals: (u.totalReferrals || 0) + 1
                      }
                    : u
                )
              );
            }
            // If referral code invalid, just skip it (don't error)
          }
          
          setAllUsers((prev) => [...prev, loginUser]);
        }
      }

      setUser(loginUser);
      // initialize account for this user
      setAccount((prev) => ({
        ...prev,
        balance: loginUser.balance || 0,
        equity: loginUser.balance || 0,
        freeMargin: loginUser.balance || 0
      }));
      
      // Load all user data from Supabase (trades, transactions, funded accounts, etc.)
      await loadUserDataFromSupabase(loginUser.id, loginUser.isAdmin || false);
      
      return { success: true, isAdmin: false };
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const getTheme = () => theme;

  const updateUserProfile = (name: string) => {
    if (user) {
      const updatedUser = { ...user, name };
      setUser(updatedUser);

      // Update in allUsers
      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? updatedUser : u))
      );
    }
  };

  const updatePassword = (email: string, currentPassword: string, newPassword: string): { success: boolean; message: string } => {
    // Find user by email
    const targetUser = allUsers.find((u) => u.email === email);
    if (!targetUser) {
      return { success: false, message: 'User not found' };
    }

    // Verify current password
    if (targetUser.password !== currentPassword) {
      return { success: false, message: 'Current password is incorrect' };
    }

    // Update password
    const updatedUser = { ...targetUser, password: newPassword };
    setAllUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? updatedUser : u))
    );

    // Update current user if they're the one changing password
    if (user && user.id === targetUser.id) {
      setUser(updatedUser);
    }

    return { success: true, message: 'Password updated successfully' };
  };

  // Admin Methods
  const addBalance = (userId: string, amount: number) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, balance: (u.balance || 0) + amount } : u
      )
    );
    // update current user/account if matches
    if (user && user.id === userId) {
      const newBal = (user.balance || 0) + amount;
      setUser({ ...user, balance: newBal });
      setAccount((prev) => ({ ...prev, balance: newBal }));
    }
    // also record a transaction so it appears in history and admin dashboard
    const tx: Transaction = {
      id: generateId(),
      userId,
      type: 'DEPOSIT',
      amount,
      method: 'admin',
      status: 'COMPLETED',
      date: Date.now()
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const removeBalance = (userId: string, amount: number) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, balance: Math.max(0, (u.balance || 0) - amount) } : u
      )
    );
    if (user && user.id === userId) {
      const newBal = Math.max(0, (user.balance || 0) - amount);
      setUser({ ...user, balance: newBal });
      setAccount((prev) => ({ ...prev, balance: newBal }));
    }
    const tx: Transaction = {
      id: generateId(),
      userId,
      type: 'WITHDRAWAL',
      amount,
      method: 'admin',
      status: 'COMPLETED',
      date: Date.now()
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  const togglePageLock = (userId: string, page: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const locked = (u.lockedPages || []).includes(page);
          return {
            ...u,
            lockedPages: locked
              ? (u.lockedPages || []).filter((p) => p !== page)
              : [...(u.lockedPages || []), page]
          };
        }
        return u;
      })
    );
  };

    const setUserTradeMode = (userId: string, mode: 'NORMAL' | 'PROFIT' | 'LOSS') => {
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, tradeMode: mode } : u))
      );
      if (user && user.id === userId) {
        setUser((prev) => prev ? { ...prev, tradeMode: mode } : null);
      }
    };

  const toggleUserLock = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return { ...u, isVerified: !u.isVerified };
        }
        return u;
      })
    );
  };

  const approveTransaction = async (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    console.log('✅ Approving transaction:', transactionId, 'Type:', tx.type);

    // Update local state
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId ? { ...t, status: 'COMPLETED' as const } : t
      )
    );

    // If it's a DEPOSIT, add balance to user
    if (tx.type === 'DEPOSIT' && tx.userId) {
      console.log('💰 Processing DEPOSIT approval');
      
      // Fetch CURRENT balance from database for accuracy (not stale local data)
      const { data: dbBalance } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', tx.userId)
        .single();

      const currentBalance = dbBalance?.balance || 0;
      const newBalance = currentBalance + tx.amount;
      
      console.log(`   Current Balance: $${currentBalance} + Deposit: $${tx.amount} = New: $${newBalance}`);

      // Update local state with CORRECT calculated balance
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === tx.userId
            ? { ...u, balance: newBalance }
            : u
        )
      );

      // Update current user if logged in
      if (user && user.id === tx.userId) {
        setUser({ ...user, balance: newBalance });
        setAccount((prev) => ({ ...prev, balance: newBalance }));
      }

      // Sync CORRECT new balance to Supabase (THIS WAS THE BUG - was syncing wrong amount)
      await syncUserBalance(tx.userId, newBalance);
      console.log('✅ User balance updated: $' + newBalance);
    }

    // If it's a WITHDRAWAL approval, balance was already deducted when created
    if (tx.type === 'WITHDRAWAL') {
      console.log('💸 Withdrawal approved - no balance change (deducted on creation)');
    }

    // Update transaction status in Supabase
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'COMPLETED' })
      .eq('id', transactionId);

    if (error) {
      console.error('❌ Error updating transaction in DB:', error.message);
    } else {
      console.log('💾 Transaction approved in Supabase');
    }
  };

  const rejectTransaction = async (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (!tx) return;

    console.log('❌ Rejecting transaction:', transactionId, 'Type:', tx.type);

    // Update local state
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId ? { ...t, status: 'REJECTED' as const } : t
      )
    );

    // If it's a WITHDRAWAL that was rejected, restore the balance (it was deducted when created)
    if (tx.type === 'WITHDRAWAL' && tx.userId) {
      console.log('💸 Rejecting withdrawal - restoring balance');
      
      // Fetch current balance and restore the withdrawn amount
      const { data: dbBalance } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', tx.userId)
        .single();

      const currentBalance = dbBalance?.balance || 0;
      const newBalance = currentBalance + tx.amount; // Add back the withdrawal amount
      
      console.log(`   Current Balance: $${currentBalance} + Refund: $${tx.amount} = New: $${newBalance}`);

      // Update local state with restored balance
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === tx.userId
            ? { ...u, balance: newBalance }
            : u
        )
      );

      // Update current user if logged in
      if (user && user.id === tx.userId) {
        setUser({ ...user, balance: newBalance });
        setAccount((prev) => ({ ...prev, balance: newBalance }));
      }

      // Sync restored balance to Supabase
      await syncUserBalance(tx.userId, newBalance);
      console.log('✅ Withdrawal rejected - balance restored: $' + newBalance);
    }

    // Update transaction status in Supabase
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'REJECTED' })
      .eq('id', transactionId);

    if (error) {
      console.error('❌ Error updating transaction in DB:', error.message);
    } else {
      console.log('💾 Transaction rejected in Supabase');
    }
  };

  // KYC related helpers
  const submitKYC = (userId: string, data: any) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              kycStatus: 'PENDING',
              kycData: {
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth,
                country: data.country,
                state: data.state,
                city: data.city,
                zipCode: data.zipCode,
                address: data.address,
                documentType: data.documentType,
                documentFrontName: data.documentFront?.name,
                documentBackName: data.documentBack?.name,
                selfieName: data.faceSelfie?.name
              }
            }
          : u
      )
    );
    if (user && user.id === userId) {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              kycStatus: 'PENDING',
              kycData: {
                firstName: data.firstName,
                lastName: data.lastName,
                dateOfBirth: data.dateOfBirth,
                country: data.country,
                state: data.state,
                city: data.city,
                zipCode: data.zipCode,
                address: data.address,
                documentType: data.documentType,
                documentFrontName: data.documentFront?.name,
                documentBackName: data.documentBack?.name,
                selfieName: data.faceSelfie?.name
              }
            }
          : null
      );
    }
  };

  const approveKYC = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, kycStatus: 'APPROVED', isVerified: true }
          : u
      )
    );
    if (user && user.id === userId) {
      setUser({ ...user, kycStatus: 'APPROVED', isVerified: true });
    }
  };

  const rejectKYC = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, kycStatus: 'REJECTED' } : u))
    );
    if (user && user.id === userId) {
      setUser({ ...user, kycStatus: 'REJECTED' });
    }
  };

  const getUserById = (userId: string): User | undefined => {
    return allUsers.find((u) => u.id === userId);
  };

  // Bot Purchase Methods
  const purchaseBot = (botId: string, botName: string, price: number, performance: number) => {
    if (!user || user.balance === undefined || user.balance < price) {
      alert('Insufficient balance');
      return;
    }
    const newBot: PurchasedBot = {
      id: generateId(),
      userId: user.id,
      botId,
      botName,
      allocatedAmount: 0,
      totalEarned: 0,
      totalLost: 0,
      status: 'PENDING_APPROVAL',
      purchasedAt: Date.now(),
      performance,
      dailyReturn: performance // Use the bot's actual performance as earning rate
    };
    setPurchasedBots((prev) => [...prev, newBot]);
    
    // Save to Supabase
    supabase.from('purchased_bots').insert({
      id: newBot.id,
      user_id: newBot.userId,
      bot_id: botId,
      bot_name: botName,
      allocated_amount: 0,
      total_earned: 0,
      total_lost: 0,
      status: 'PENDING_APPROVAL',
      performance,
      daily_return: performance
    }).then(({error}) => {
      if (error) console.error('❌ Error saving bot to Supabase:', error.message);
    });
    
    // Deduct from balance AND update all user states
    const newBal = user.balance - price;
    setAccount((prev) => ({
      ...prev,
      balance: newBal
    }));
    setUser({ ...user, balance: newBal });
    setAllUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, balance: newBal } : u))
    );
    
    alert('✅ Bot purchase request sent. Awaiting admin approval.');
  };


  const purchaseSignal = (signalId: string, providerName: string, price: number, winRate: number) => {
    if (!user || user.balance === undefined || user.balance < price) {
      alert('Insufficient balance for signal subscription');
      return;
    }
    
    // Create the signal with 0 allocation (user allocates capital later)
    const newSignal: PurchasedSignal = {
      id: generateId(),
      userId: user?.id || '',
      signalId,
      providerName,
      allocation: 0,  // Allocation is set later by user, not at purchase time
      cost: price,    // Store the purchase price separately
      status: 'PENDING_APPROVAL',
      subscribedAt: Date.now(),
      approvedAt: undefined,
      tradesFollowed: 0,
      winRate,
      earnings: 0,
      totalEarningsRealized: 0,
      activeTrades: []
    };
    
    setPurchasedSignals((prev) => [...prev, newSignal]);
    
    // Save to Supabase
    supabase.from('purchased_signals').insert({
      id: newSignal.id,
      user_id: newSignal.userId,
      signal_id: signalId,
      provider_name: providerName,
      allocation: 0,
      cost: price,
      status: 'PENDING_APPROVAL',
      win_rate: winRate,
      trades_followed: 0,
      earnings: 0,
      total_earnings_realized: 0,
      active_trades: []
    }).then(({error}) => {
      if (error) console.error('❌ Error saving signal to Supabase:', error.message);
    });
    
    // Deduct signal subscription price from user balance
    setAccount((prev) => ({
      ...prev,
      balance: prev.balance - price
    }));
    
    // Update user balance in allUsers
    const newBal = (user.balance || 0) - price;
    setUser({ ...user, balance: newBal });
    setAllUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, balance: newBal } : u))
    );
    
    alert(`✅ Signal subscription purchased for $${price.toFixed(2)}. Awaiting admin approval to allocate capital.`);
  };


  const approveSignalPurchase = (signalPurchaseId: string) => {
    // First approval - just approve the purchase, user can now allocate capital
    setPurchasedSignals((prev) =>
      prev.map((s) =>
        s.id === signalPurchaseId
          ? { ...s, status: 'APPROVED_FOR_ALLOCATION', approvedAt: Date.now() }
          : s
      )
    );
    alert('✅ Signal purchase approved. User can now allocate capital.');
  };

  const allocateSignalCapital = (signalPurchaseId: string, amount: number) => {
    if (!user || user.balance === undefined || user.balance < amount) {
      alert('Insufficient balance');
      return;
    }
    
    // Update signal allocation
    setPurchasedSignals((prev) =>
      prev.map((signal) =>
        signal.id === signalPurchaseId
          ? { ...signal, allocation: amount }
          : signal
      )
    );
    
    // Deduct allocation from user balance immediately (like bots)
    const newBal = user.balance - amount;
    setUser({ ...user, balance: newBal });
    setAccount((prev) => ({ ...prev, balance: newBal }));
    setAllUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, balance: newBal } : u))
    );
    
    alert(`✅ Allocated $${amount.toFixed(2)} for signal. Awaiting admin activation approval.`);
  };

  const approveBotPurchase = (botPurchaseId: string) => {
    // First approval - just approve the purchase, user can now allocate capital
    setPurchasedBots((prev) =>
      prev.map((b) =>
        b.id === botPurchaseId
          ? { ...b, status: 'APPROVED_FOR_ALLOCATION', approvedAt: Date.now() }
          : b
      )
    );
    alert('✅ Bot purchase approved. User can now allocate capital.');
  };

  const approveBotActivation = (botPurchaseId: string, durationValue: string = '7', durationType: 'minutes' | 'hours' | 'days' = 'days', outcome: 'win' | 'lose' = 'win') => {
    const bot = purchasedBots.find(b => b.id === botPurchaseId);
    if (!bot) return;

    // Check that capital has been allocated
    if (!bot.allocatedAmount || bot.allocatedAmount <= 0) {
      alert('❌ Bot must have capital allocated before activation. User must allocate funds first.');
      return;
    }

    // Check if user has sufficient balance
    const targetUser = allUsers.find(u => u.id === bot.userId);
    if (!targetUser || (targetUser.balance || 0) < bot.allocatedAmount) {
      alert('❌ Insufficient balance for bot allocation');
      return;
    }

    const now = Date.now();
    const durationNum = parseInt(durationValue);
    const durationMs = durationType === 'minutes'
      ? durationNum * 60 * 1000
      : durationType === 'hours'
      ? durationNum * 60 * 60 * 1000
      : durationNum * 24 * 60 * 60 * 1000;
    const endDate = now + durationMs;

    // Subtract allocation from user's balance
    setAllUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === bot.userId
          ? { ...u, balance: Math.max(0, (u.balance || 0) - bot.allocatedAmount) }
          : u
      )
    );

    // Update current user's balance if they're logged in
    if (user && user.id === bot.userId) {
      const newBal = Math.max(0, (user.balance || 0) - bot.allocatedAmount);
      setUser({ ...user, balance: newBal });
      setAccount((prev) => ({ ...prev, balance: newBal }));
    }

    setPurchasedBots((prev) =>
      prev.map((b) =>
        b.id === botPurchaseId
          ? {
              ...b,
              status: 'ACTIVE',
              startedAt: now,
              durationValue,
              durationType,
              maxDurationMs: durationMs,
              endDate,
              outcome
            }
          : b
      )
    );
    
    // Update in Supabase
    const endDateStr = new Date(endDate).toISOString();
    supabase.from('purchased_bots').update({
      status: 'ACTIVE',
      started_at: endDateStr,
      duration_value: durationValue,
      duration_type: durationType,
      max_duration_ms: durationMs,
      end_date: endDateStr,
      outcome
    }).eq('id', botPurchaseId).then(({error}) => {
      if (error) console.error('❌ Error updating bot in Supabase:', error.message);
    });
  };

  const approveSignalSubscription = (signalSubId: string, durationValue: string = '7', durationType: 'minutes' | 'hours' | 'days' = 'days', outcome: 'win' | 'lose' = 'win') => {
    const signal = purchasedSignals.find(s => s.id === signalSubId);
    if (!signal) return;
    
    // Check that capital has been allocated
    if (!signal.allocation || signal.allocation <= 0) {
      alert('❌ Signal must have capital allocated before activation. User must allocate funds first.');
      return;
    }

    // Check if user has sufficient balance (should be deducted already, but verify)
    const targetUser = allUsers.find(u => u.id === signal.userId);
    if (!targetUser || (targetUser.balance || 0) < signal.allocation) {
      alert('❌ Insufficient balance for signal allocation');
      return;
    }
    
    setPurchasedSignals((prev) =>
      prev.map((sig) => {
        if (sig.id === signalSubId) {
          // Calculate end date based on duration
          const now = Date.now();
          const durationMs = durationType === 'minutes'
            ? parseInt(durationValue) * 60 * 1000
            : durationType === 'hours' 
            ? parseInt(durationValue) * 60 * 60 * 1000
            : parseInt(durationValue) * 24 * 60 * 60 * 1000;
          const endDate = now + durationMs;
          
          // Update in Supabase
          const endDateStr = new Date(endDate).toISOString();
          supabase.from('purchased_signals').update({
            status: 'ACTIVE',
            started_at: endDateStr,
            duration_value: durationValue,
            duration_type: durationType,
            end_date: endDateStr,
            outcome,
            active_trades: []
          }).eq('id', signalSubId).then(({error}) => {
            if (error) console.error('❌ Error updating signal:', error.message);
          });
          
          return {
            ...sig,
            status: 'ACTIVE',
            startedAt: now,
            durationValue,
            durationType,
            endDate,
            outcome,
            activeTrades: []
          };
        }
        return sig;
      })
    );
    alert(`✅ Signal activated! Duration: ${durationValue} ${durationType}. Earnings will spread across this period.`);
  };

  const allocateBotCapital = (botPurchaseId: string, amount: number) => {
    if (!user || user.balance === undefined || user.balance < amount) {
      alert('Insufficient balance');
      return;
    }
    
    // Update bot allocation (does NOT deduct balance - that happens at activation)
    setPurchasedBots((prev) =>
      prev.map((bot) =>
        bot.id === botPurchaseId
          ? { ...bot, allocatedAmount: amount }
          : bot
      )
    );
    
    alert(`✅ Allocated $${amount.toFixed(2)} to bot. This will be deducted when admin activates.`);
  };

  const terminateBot = (botPurchaseId: string) => {
    const bot = purchasedBots.find((b) => b.id === botPurchaseId);
    if (!bot) return;
    
    // credit back net funds: allocation + totalEarned - totalLost
    const netRefund = bot.allocatedAmount + bot.totalEarned - bot.totalLost;
    
    setPurchasedBots((prev) =>
      prev.map((b) =>
        b.id === botPurchaseId ? { ...b, status: 'CLOSED' } : b
      )
    );
    
    // add net funds to user balance
    if (bot.userId) {
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === bot.userId
            ? { ...u, balance: (u.balance ?? 0) + netRefund }
            : u
        )
      );
      if (user && user.id === bot.userId) {
        const newBal = (user.balance ?? 0) + netRefund;
        setUser({ ...user, balance: newBal });
        setAccount((prev) => ({ ...prev, balance: newBal }));
      }
    }
    alert(
      `✅ Bot terminated. Net refund: $${netRefund.toFixed(2)} (Allocation: $${bot.allocatedAmount.toFixed(2)} + Earned: $${bot.totalEarned.toFixed(2)} - Lost: $${bot.totalLost.toFixed(2)})`
    );
  };

  const terminateSignal = (signalSubId: string) => {
    const signal = purchasedSignals.find((s) => s.id === signalSubId);
    if (!signal) return;
    
    // credit back: allocation + totalEarningsRealized
    const totalRefund = signal.allocation + signal.totalEarningsRealized;
    
    setPurchasedSignals((prev) =>
      prev.map((sig) =>
        sig.id === signalSubId ? { ...sig, status: 'CLOSED', activeTrades: [] } : sig
      )
    );
    
    if (signal.userId) {
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === signal.userId
            ? { ...u, balance: (u.balance ?? 0) + totalRefund }
            : u
        )
      );
      if (user && user.id === signal.userId) {
        const newBal = (user.balance ?? 0) + totalRefund;
        setUser({ ...user, balance: newBal });
        setAccount((prev) => ({ ...prev, balance: newBal }));
      }
    }
    alert(
      `✅ Signal terminated. Refund: $${totalRefund.toFixed(2)} (Allocation: $${signal.allocation.toFixed(2)} + Realized Earnings: $${signal.totalEarningsRealized.toFixed(2)})`
    );
  };

  const continueSignalTrading = (signalSubId: string) => {
    // after a trade completes, start next one
    setPurchasedSignals((prev) =>
      prev.map((sig) => {
        if (sig.id === signalSubId && sig.status === 'ACTIVE') {
          const now = Date.now();
          const durationMs = (15 + Math.random() * 6) * 60 * 1000; // random 15-21 min
          const expectedProfit = sig.allocation * (sig.winRate / 100);
          const newTrade = {
            id: generateId(),
            startTime: now,
            expectedEndTime: now + durationMs,
            expectedProfit,
            currentEarnings: 0,
            completed: false
          };
          return {
            ...sig,
            activeTrades: [...(sig.activeTrades || []).filter((t) => !t.completed), newTrade],
            tradesFollowed: sig.tradesFollowed + 1
          };
        }
        return sig
      })
    );
  };

  const executeTrade = (
  symbol: string,
  type: TradeType,
  lots: number,
  sl?: number,
  tp?: number) =>
  {
    if (!user) return;
    const asset = assets.find((a) => a.symbol === symbol);
    if (!asset) return;
    
    // Calculate margin required
    const entryPrice = type === 'BUY' ? asset.ask : asset.bid;
    const marginRequired = entryPrice * lots * 100000 / account.leverage;
    
    // Validate margin before executing trade
    if (marginRequired > account.freeMargin) {
      alert(`❌ Insufficient margin. Required: $${marginRequired.toFixed(2)}, Available: $${account.freeMargin.toFixed(2)}`);
      return;
    }
    
    const newTrade: Trade = {
      id: generateId(),
      symbol,
      type,
      lots,
      entryPrice,
      currentPrice: entryPrice,
      sl: sl || null,
      tp: tp || null,
      openTime: Date.now(),
      profit: 0,
      status: 'OPEN',
      commission: 0,
      swap: 0
    };
    setTrades((prev) => [newTrade, ...prev]);
    // Sync trade as transaction to Supabase
    const tx: Transaction = {
      id: newTrade.id,
      userId: user.id,
      type: 'TRADE',
      amount: lots,
      method: symbol,
      status: 'OPEN',
      date: Date.now()
    };
    syncTransaction(tx);
  };
  const closeTrade = (tradeId: string) => {
    if (!user) return;
    const trade = trades.find((t) => t.id === tradeId);
    if (!trade) return;
    const closedTrade: Trade = {
      ...trade,
      status: 'CLOSED',
      closeTime: Date.now()
    };
    setHistory((prev) => [closedTrade, ...prev]);
    setTrades((prev) => prev.filter((t) => t.id !== tradeId));
    setAccount((prev) => ({
      ...prev,
      balance: prev.balance + trade.profit
    }));
    // Update user balance
    const newBalance = (user.balance || 0) + trade.profit;
    setUser({ ...user, balance: newBalance });
    setAllUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, balance: newBalance } : u))
    );
    // Sync balance update to Supabase
    syncUserBalance(user.id, newBalance);
  };

  // Record a closed trade to recent trades history (persisted to Supabase)
  const recordTrade = (symbol: string, type: 'BUY' | 'SELL', volume: number, entryPrice: number, closePrice: number) => {
    if (!user) return;
    
    const profit = (type === 'BUY' ? closePrice - entryPrice : entryPrice - closePrice) * volume;
    const newTrade = {
      id: generateId(),
      userId: user.id,
      symbol,
      type,
      volume,
      entryPrice,
      closePrice,
      profit,
      openedAt: Date.now(),
      closedAt: Date.now(),
      status: 'CLOSED' as const
    };
    
    // Add to recent trades
    setRecentTrades((prev) => [newTrade, ...prev]);
    
    // Sync to Supabase
    supabase.from('recent_trades').insert({
      id: newTrade.id,
      user_id: newTrade.userId,
      symbol: newTrade.symbol,
      type: newTrade.type,
      volume: newTrade.volume,
      entry_price: newTrade.entryPrice,
      close_price: newTrade.closePrice,
      profit: newTrade.profit,
      opened_at: new Date(newTrade.openedAt).toISOString(),
      closed_at: new Date(newTrade.closedAt!).toISOString(),
      status: 'CLOSED'
    }).then(({ error }) => {
      if (error) {
        console.error('❌ Error recording trade:', error.message);
      } else {
        console.log('✅ Trade recorded:', symbol, 'Profit: $' + profit.toFixed(2));
      }
    });
  };

  const modifyTradeSLTP = (
  tradeId: string,
  sl: number | null,
  tp: number | null) =>
  {
    setTrades((prev) =>
    prev.map((t) => {
      if (t.id === tradeId) {
        return {
          ...t,
          sl,
          tp
        };
      }
      return t;
    })
    );
  };
  // record a deposit request; always pending until admin approval
  const deposit = async (amount: number, method: string) => {
    if (!user) return;
    const tx: Transaction = {
      id: generateId(),
      userId: user.id,
      type: 'DEPOSIT',
      amount,
      method,
      status: 'PENDING',
      date: Date.now()
    };
    setTransactions((prev) => [tx, ...prev]);
    // Sync to Supabase and wait for completion
    await syncTransaction(tx);
    console.log('✅ Deposit request synced to Supabase');
  };
  const withdraw = async (amount: number, method: string) => {
    if (!user) return;
    const tx: Transaction = {
      id: generateId(),
      userId: user.id,
      type: 'WITHDRAWAL',
      amount,
      method,
      status: 'PENDING',
      date: Date.now()
    };
    setTransactions((prev) => [tx, ...prev]);
    // Sync to Supabase and wait for completion
    await syncTransaction(tx);
    console.log('✅ Withdrawal request synced to Supabase');
    
    // Balance deduction usually happens on approval, but for MVP we can deduct immediately or wait
    // Let's deduct immediately for "Free Margin" impact
    setAccount((prev) => ({
      ...prev,
      balance: prev.balance - amount
    }));
    const newBal = Math.max(0, (user.balance || 0) - amount);
    setUser({ ...user, balance: newBal });
    setAllUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, balance: newBal } : u))
    );
    // Sync balance to Supabase
    await syncUserBalance(user.id, newBal);
    console.log('✅ Balance updated in Supabase after withdrawal');
  };
  const toggleBot = (active: boolean) => setBotActive(active);

  // Funded Account Methods
  const purchaseFundedAccount = (planId: string, planName: string, capital: number, price: number, profitTarget: number, maxDrawdown: number) => {
    if (!user || (user.balance ?? 0) < price) return;
    // deduct cost if applicable
    if (price > 0) {
      setAccount((prev) => ({ ...prev, balance: prev.balance - price }));
      const newBalance = (user.balance || 0) - price;
      setUser({ ...user, balance: newBalance });
      setAllUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, balance: newBalance } : u))
      );
      // Sync balance to Supabase
      syncUserBalance(user.id, newBalance);
    }
    const accountObj: FundedAccountPurchase = {
      id: generateId(),
      userId: user.id,
      planId,
      planName,
      capital,
      price,
      profitTarget,
      maxDrawdown,
      status: 'PENDING_APPROVAL',
      purchasedAt: Date.now(),
      approvedAt: undefined
    };
    setPurchasedFundedAccounts((prev) => [...prev, accountObj]);
    
    // Sync to Supabase
    (async () => {
      try {
        await supabase
          .from('user_funded_accounts')
          .insert({
            id: accountObj.id,
            user_id: accountObj.userId,
            plan_id: accountObj.planId,
            plan_name: accountObj.planName,
            capital: accountObj.capital,
            price: accountObj.price,
            profit_target: accountObj.profitTarget,
            max_drawdown: accountObj.maxDrawdown,
            status: accountObj.status,
            current_balance: accountObj.capital,
            purchased_at: new Date(accountObj.purchasedAt).toISOString()
          })
          .select();
        
        if (error) {
          console.error('❌ Error syncing funded account:', error.code, '-', error.message);
        } else {
          console.log('✅ Funded account synced:', data);
        }
      } catch (err: any) {
        console.error('❌ Error syncing funded account:', err.message);
      }
    })();
    
    alert('✅ Funded account purchase request submitted');
  };

  const approveFundedAccount = (accountId: string) => {
    // find account first then update state so we have the data
    let approved: FundedAccountPurchase | undefined;
    setPurchasedFundedAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId) {
          approved = { ...acc, status: 'ACTIVE', approvedAt: Date.now() };
          return approved;
        }
        return acc;
      })
    );
    if (approved) {
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === approved!.userId
            ? { ...u, balance: (u.balance ?? 0) + approved!.capital }
            : u
        )
      );
      // update current user/account if applicable
      if (user && user.id === approved.userId) {
        const newBal = (user.balance ?? 0) + approved.capital;
        setUser({ ...user, balance: newBal });
        setAccount((prev) => ({ ...prev, balance: newBal }));
        // Sync balance to Supabase
        syncUserBalance(user.id, newBal);
      }
      
      // Sync approval to Supabase
      (async () => {
        try {
          await supabase
            .from('user_funded_accounts')
            .update({
              status: 'ACTIVE',
              approved_at: new Date().toISOString()
            })
            .eq('id', accountId);
        } catch (err) {
          console.error('Error approving funded account:', err);
        }
      })();
    }
    alert('✅ Funded account approved and capital credited');
  };

  const rejectFundedAccount = (accountId: string) => {
    setPurchasedFundedAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, status: 'REJECTED' } : acc
      )
    );
    
    // Sync rejection to Supabase
    (async () => {
      try {
        await supabase
          .from('user_funded_accounts')
          .update({ status: 'REJECTED' })
          .eq('id', accountId);
      } catch (err) {
        console.error('Error rejecting funded account:', err);
      }
    })();
    
    // Refund the platform fee
    const account = purchasedFundedAccounts.find((a) => a.id === accountId);
    if (account) {
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === account.userId
            ? { ...u, balance: (u.balance ?? 0) + account.price }
            : u
        )
      );
    }
    alert('✅ Funded account rejected and fee refunded');
  };


  // Bot Template Methods
  const addBotTemplate = (name: string, description: string, price: number, performance: number, winRate: number, trades: number, type: string, risk: 'Low' | 'Medium' | 'High', maxDrawdown: number) => {
    if (!user) return;
    const newBot: BotTemplate = {
      id: generateId(),
      name,
      description,
      price,
      performance,
      winRate,
      trades,
      type,
      risk,
      maxDrawdown,
      createdBy: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setBotTemplates((prev) => [...prev, newBot]);
    alert('✅ Bot template created successfully');
  };

  const editBotTemplate = (botId: string, updates: Partial<BotTemplate>) => {
    setBotTemplates((prev) =>
      prev.map((bot) =>
        bot.id === botId
          ? { ...bot, ...updates, updatedAt: Date.now() }
          : bot
      )
    );
    alert('✅ Bot template updated');
  };

  const deleteBotTemplate = (botId: string) => {
    setBotTemplates((prev) => prev.filter((bot) => bot.id !== botId));
    alert('✅ Bot template deleted');
  };

  // Signal Template Methods
  const addSignalTemplate = (providerName: string, description: string, symbol: string, confidence: number, followers: number, cost: number, winRate: number, trades: number, avgReturn: number) => {
    if (!user) return;
    const newSignal: SignalTemplate = {
      id: generateId(),
      providerName,
      description,
      symbol,
      confidence,
      followers,
      cost,
      winRate,
      trades,
      avgReturn,
      createdBy: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSignalTemplates((prev) => [...prev, newSignal]);
    alert('✅ Signal template created successfully');
  };

  const editSignalTemplate = (signalId: string, updates: Partial<SignalTemplate>) => {
    setSignalTemplates((prev) =>
      prev.map((signal) =>
        signal.id === signalId
          ? { ...signal, ...updates, updatedAt: Date.now() }
          : signal
      )
    );
    alert('✅ Signal template updated');
  };

  const deleteSignalTemplate = (signalId: string) => {
    setSignalTemplates((prev) => prev.filter((signal) => signal.id !== signalId));
    alert('✅ Signal template deleted');
  };

  // Copy Trade Template Methods
  const addCopyTradeTemplate = (name: string, description: string, winRate: number, return_: number, followers: number, risk: 'Low' | 'Medium' | 'High', dailyReturn: number, trades: number) => {
    if (!user) return;
    const newCopyTrade: CopyTradeTemplate = {
      id: generateId(),
      name,
      description,
      winRate,
      return: return_,
      followers,
      risk,
      dailyReturn,
      trades,
      createdBy: user.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setCopyTradeTemplates((prev) => [...prev, newCopyTrade]);
    alert('✅ Copy trade template created');
  };

  const editCopyTradeTemplate = (copyTradeId: string, updates: Partial<CopyTradeTemplate>) => {
    setCopyTradeTemplates((prev) =>
      prev.map((ct) =>
        ct.id === copyTradeId
          ? { ...ct, ...updates, updatedAt: Date.now() }
          : ct
      )
    );
    alert('✅ Copy trade template updated');
  };

  const deleteCopyTradeTemplate = (copyTradeId: string) => {
    setCopyTradeTemplates((prev) => prev.filter((ct) => ct.id !== copyTradeId));
    alert('✅ Copy trade template deleted');
  };

  // Wallet Methods
  const addWallet = (userId: string, address: string, label: string, type: 'DEPOSIT' | 'PURCHASE', currency: string, network?: string) => {
    const newWallet: Wallet = {
      id: generateId(),
      userId,
      address,
      label,
      type,
      currency,
      network,
      createdAt: Date.now()
    };
    setWallets((prev) => [...prev, newWallet]);
    alert('✅ Wallet added successfully');
  };

  const editWallet = (walletId: string, updates: Partial<Wallet>) => {
    setWallets((prev) =>
      prev.map((wallet) =>
        wallet.id === walletId
          ? { ...wallet, ...updates }
          : wallet
      )
    );
    alert('✅ Wallet updated successfully');
  };

  const removeWallet = (walletId: string) => {
    setWallets((prev) => prev.filter((w) => w.id !== walletId));
    alert('✅ Wallet removed');
  };

  // Bank Account Methods
  const addBankAccount = (accountName: string, accountNumber: string, bankName: string, routingNumber: string, accountType: 'CHECKING' | 'SAVINGS', currency: string, country: string, type: 'DEPOSIT' | 'WITHDRAWAL', swiftCode?: string, iban?: string) => {
    const newAccount: BankAccount = {
      id: generateId(),
      accountName,
      accountNumber,
      bankName,
      routingNumber,
      swiftCode,
      iban,
      accountType,
      currency,
      country,
      type,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setBankAccounts((prev) => [...prev, newAccount]);
    alert('✅ Bank account added successfully');
  };

  const editBankAccount = (accountId: string, updates: Partial<BankAccount>) => {
    setBankAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId
          ? { ...account, ...updates, updatedAt: Date.now() }
          : account
      )
    );
    alert('✅ Bank account updated successfully');
  };

  const removeBankAccount = (accountId: string) => {
    setBankAccounts((prev) => prev.filter((a) => a.id !== accountId));
    alert('✅ Bank account removed');
  };

  const toggleBankAccountStatus = (accountId: string) => {
    setBankAccounts((prev) =>
      prev.map((account) =>
        account.id === accountId
          ? { ...account, isActive: !account.isActive, updatedAt: Date.now() }
          : account
      )
    );
  };

  // System Wallet Methods (Admin - Global Deposit Address Management)
  const addSystemWallet = (name: string, cryptoId: string, network: string, address: string, minDeposit: number) => {
    const newSystemWallet: SystemWallet = {
      id: generateId(),
      name,
      cryptoId,
      network,
      address,
      minDeposit,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setSystemWallets((prev) => [...prev, newSystemWallet]);
    alert('✅ System wallet added successfully');
  };

  const editSystemWallet = (walletId: string, updates: Partial<SystemWallet>) => {
    setSystemWallets((prev) =>
      prev.map((wallet) =>
        wallet.id === walletId
          ? { ...wallet, ...updates, updatedAt: Date.now() }
          : wallet
      )
    );
    alert('✅ System wallet updated successfully');
  };

  const removeSystemWallet = (walletId: string) => {
    setSystemWallets((prev) => prev.filter((w) => w.id !== walletId));
    alert('✅ System wallet removed');
  };

  const toggleSystemWalletStatus = (walletId: string) => {
    setSystemWallets((prev) =>
      prev.map((wallet) =>
        wallet.id === walletId
          ? { ...wallet, isActive: !wallet.isActive, updatedAt: Date.now() }
          : wallet
      )
    );
  };

  // Credit Card Deposit Methods
  const submitCreditCardDeposit = async (userId: string, amount: number, cardNumber: string, cardHolder: string, expiryDate: string) => {
    const newDeposit: CreditCardDeposit = {
      id: generateId(),
      userId,
      amount,
      cardNumber: cardNumber.slice(-4).padStart(cardNumber.length, '*'), // Mask card number
      cardHolder,
      expiryDate,
      status: 'PENDING',
      submittedAt: Date.now(),
    };
    setCreditCardDeposits((prev) => [...prev, newDeposit]);
    
    // Sync to Supabase
    try {
      console.log('💾 Syncing credit card deposit...');
      const { data, error } = await supabase
        .from('credit_card_deposits')
        .insert({
          user_id: userId,
          amount,
          card_number: cardNumber.slice(-4).padStart(cardNumber.length, '*'),
          cardholder_name: cardHolder,
          expiry_date: expiryDate,
          status: 'PENDING',
          created_at: new Date(newDeposit.submittedAt).toISOString()
        })
        .select();
      
      if (error) {
        console.error('❌ Error syncing credit card deposit:', error.code, '-', error.message);
        throw error;
      } else {
        console.log('✅ Credit card deposit synced:', data);
      }
    } catch (err: any) {
      console.error('❌ Error syncing credit card deposit:', err.message);
      throw err;
    }
  };

  const approveCreditCardDeposit = async (depositId: string, notes?: string) => {
    setCreditCardDeposits((prev) =>
      prev.map((deposit) =>
        deposit.id === depositId
          ? { ...deposit, status: 'APPROVED', approvedAt: Date.now(), notes }
          : deposit
      )
    );
    
    try {
      // Sync approval to Supabase
      console.log('💾 Updating credit card deposit approval...');
      const { data, error } = await supabase
        .from('credit_card_deposits')
        .update({
          status: 'COMPLETED',
          processed_at: new Date().toISOString(),
          approval_notes: notes || null
        })
        .eq('id', depositId)
        .select();
      
      if (error) {
        console.error('❌ Error approving deposit:', error.code, '-', error.message);
        throw error;
      } else {
        console.log('✅ Deposit approved:', data);
      }

      // Add balance to user
      const deposit = creditCardDeposits.find((d) => d.id === depositId);
      if (deposit && deposit.userId) {
        console.log('💰 Processing credit card deposit approval');
        
        // Fetch CURRENT balance from database for accuracy
        const { data: dbBalance } = await supabase
          .from('user_balances')
          .select('balance')
          .eq('user_id', deposit.userId)
          .single();

        const currentBalance = dbBalance?.balance || 0;
        const newBalance = currentBalance + deposit.amount;
        
        console.log(`   Current Balance: $${currentBalance} + Deposit: $${deposit.amount} = New: $${newBalance}`);

        // Update local state with CORRECT calculated balance
        setAllUsers((prev) =>
          prev.map((u) =>
            u.id === deposit.userId
              ? { ...u, balance: newBalance }
              : u
          )
        );
        
        // Update current user if logged in
        if (user && user.id === deposit.userId) {
          setUser({ ...user, balance: newBalance });
          setAccount((prev) => ({ ...prev, balance: newBalance }));
        }

        // Sync CORRECT new balance to Supabase
        await syncUserBalance(deposit.userId, newBalance);
        console.log('✅ User balance updated: $' + newBalance);
      }
    } catch (err: any) {
      console.error('❌ Error approving deposit:', err.message);
      throw err;
    }
  };

  const rejectCreditCardDeposit = async (depositId: string, notes?: string) => {
    setCreditCardDeposits((prev) =>
      prev.map((deposit) =>
        deposit.id === depositId
          ? { ...deposit, status: 'REJECTED', notes }
          : deposit
      )
    );
    
    try {
      // Sync rejection to Supabase
      console.log('💾 Updating credit card deposit rejection...');
      const { data, error } = await supabase
        .from('credit_card_deposits')
        .update({
          status: 'REJECTED',
          rejection_reason: notes || null
        })
        .eq('id', depositId)
        .select();
      
      if (error) {
        console.error('❌ Error rejecting deposit:', error.code, '-', error.message);
        throw error;
      } else {
        console.log('✅ Deposit rejected:', data);
      }
    } catch (err: any) {
      console.error('❌ Error rejecting deposit:', err.message);
      throw err;
    }
  };

  // Copy Trading Methods
  const followTrader = (trader: any, allocation: number, durationValue: string, durationType: 'minutes' | 'hours' | 'days') => {
    if (!user) return;
    
    // Check if user has sufficient balance
    if ((user.balance || 0) < allocation) {
      alert('❌ Insufficient balance for copy trade allocation');
      return;
    }
    
    // Parse trader return (e.g., "+124%" -> 124)
    const returnStr = trader?.return || '+0%';
    const traderReturn = parseFloat(returnStr.replace(/[^0-9.-]/g, '')) || 0;
    
    const newCopy: CopyTrade = {
      id: generateId(),
      userId: user.id,
      tradesId: trader?.id || Date.now(),
      traderName: trader?.name || 'Unknown',
      allocation,
      status: 'ACTIVE',
      copiedTrades: 0,
      profit: 0,
      startDate: Date.now(),
      durationValue,
      durationType,
      winRate: '0%',
      risk: (trader && trader.risk) || 'Medium',
      performance: trader?.performance,
      traderReturn // Store the return percentage (e.g., 124 for "+124%")
    };
    
    // Subtract allocation from user's balance
    setAllUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === user.id
          ? { ...u, balance: (u.balance || 0) - allocation }
          : u
      )
    );
    
    // Update current user's balance
    const newBal = (user.balance || 0) - allocation;
    setUser({ ...user, balance: newBal });
    setAccount((prev) => ({ ...prev, balance: newBal }));
    
    setPurchasedCopyTrades((prev) => [...prev, newCopy]);
    
    // Save to Supabase
    supabase.from('purchased_copy_trades').insert({
      id: newCopy.id,
      user_id: newCopy.userId,
      trades_id: newCopy.tradesId,
      trader_name: newCopy.traderName,
      allocation: newCopy.allocation,
      status: 'ACTIVE',
      copied_trades: 0,
      profit: 0,
      duration_value: durationValue,
      duration_type: durationType,
      win_rate: '0%',
      risk: newCopy.risk,
      performance: newCopy.performance,
      trader_return: traderReturn
    }).then(({error}) => {
      if (error) console.error('❌ Error saving copy trade to Supabase:', error.message);
    });
    
    alert('✅ Now copying trader');
  };

  // admin helper: directly create active copy trade for user
  const adminCreateCopyTrade = (
    userId: string,
    traderName: string,
    allocation: number,
    durationValue: string,
    durationType: 'minutes' | 'hours' | 'days',
    risk: 'Low' | 'Medium' | 'High',
    traderReturn: number = 0,
    performance?: number
  ) => {
    // Check if user has sufficient balance
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser || (targetUser.balance || 0) < allocation) {
      alert('❌ Insufficient balance for copy trade allocation');
      return;
    }

    const newCopy: CopyTrade = {
      id: generateId(),
      userId,
      tradesId: Date.now(),
      traderName,
      allocation,
      status: 'ACTIVE',
      copiedTrades: 0,
      profit: 0,
      startDate: Date.now(),
      durationValue,
      durationType,
      winRate: '0%',
      risk,
      performance,
      traderReturn
    };
    
    // Subtract allocation from user's balance
    setAllUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId
          ? { ...u, balance: (u.balance || 0) - allocation }
          : u
      )
    );
    
    // Update current user's balance if they're logged in
    if (user && user.id === userId) {
      const newBal = (user.balance || 0) - allocation;
      setUser({ ...user, balance: newBal });
      setAccount((prev) => ({ ...prev, balance: newBal }));
    }
    
    setPurchasedCopyTrades((prev) => [...prev, newCopy]);
    alert('✅ Admin created copy trade for user');
  };

  const stopCopyTrading = (copyTradeId: string) => {
    setPurchasedCopyTrades((prev) =>
      prev.map((ct) => (ct.id === copyTradeId ? { ...ct, status: 'CLOSED', endDate: Date.now() } : ct))
    );
    alert('✅ Stopped copy trading');
  };

  const closeCopyTrade = (copyTradeId: string, profit: number) => {
    setPurchasedCopyTrades((prev) =>
      prev.map((ct) => (ct.id === copyTradeId ? { ...ct, status: 'CLOSED', profit, endDate: Date.now() } : ct))
    );
    
    // Update in Supabase
    supabase.from('purchased_copy_trades').update({
      status: 'CLOSED',
      profit,
      end_date: new Date().toISOString()
    }).eq('id', copyTradeId).then(({error}) => {
      if (error) console.error('❌ Error updating copy trade:', error.message);
    });
  };

  // Pause/Resume Bot
  const setBotDuration = (botPurchaseId: string, durationDays: number) => {
    const bot = purchasedBots.find((b) => b.id === botPurchaseId);
    if (!bot || bot.status !== 'ACTIVE') {
      alert('Can only set duration for active bots');
      return;
    }
    
    const durationMs = durationDays * 24 * 60 * 60 * 1000;
    const endDate = (bot.startedAt || Date.now()) + durationMs;
    
    setPurchasedBots((prev) =>
      prev.map((b) =>
        b.id === botPurchaseId
          ? { ...b, durationDays, maxDurationMs: durationMs, endDate }
          : b
      )
    );
    alert(`✅ Bot duration set to ${durationDays} days. Will auto-terminate at ${new Date(endDate).toLocaleString()}`);
  };


  const pauseBot = (botPurchaseId: string) => {
    setPurchasedBots((prev) =>
      prev.map((bot) =>
        bot.id === botPurchaseId ? { ...bot, status: 'PAUSED' } : bot
      )
    );
    alert('✅ Bot paused');
  };

  const resumeBot = (botPurchaseId: string) => {
    setPurchasedBots((prev) =>
      prev.map((bot) =>
        bot.id === botPurchaseId ? { ...bot, paused: false } : bot
      )
    );
    alert('✅ Bot resumed');
  };

  // Get user transactions
  const getUserTransactions = (userId: string): Transaction[] => {
    return transactions.filter((t) => t.userId === userId);
  };

  // Admin methods to manually create bots, signals, and copy trades
  const adminCreateBot = (userId: string, botName: string, allocatedAmount: number, performance: number, totalEarned: number = 0) => {
    const newBot: PurchasedBot = {
      id: generateId(),
      userId,
      botId: generateId(),
      botName,
      allocatedAmount,
      totalEarned,
      totalLost: 0,
      status: 'ACTIVE',
      purchasedAt: Date.now(),
      approvedAt: Date.now(),
      performance,
      dailyReturn: Math.random() * (15 - 5) + 5
    };
    setPurchasedBots((prev) => [...prev, newBot]);
    // Deduct allocated amount from user balance
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, balance: (u.balance ?? 0) - allocatedAmount } : u
      )
    );
    if (user && user.id === userId) {
      const newBal = (user.balance ?? 0) - allocatedAmount;
      setUser({ ...user, balance: newBal });
      setAccount((prev) => ({ ...prev, balance: newBal }));
    }
    alert(`✅ Bot created for user and auto-activated`);
  };

  const adminCreateSignal = (userId: string, providerName: string, allocation: number, winRate: number, cost: number = 0) => {
    const now = Date.now();
    const durationMs = (15 + Math.random() * 6) * 60 * 1000;
    const expectedProfit = allocation * (winRate / 100);
    const newSignal: PurchasedSignal = {
      id: generateId(),
      userId,
      signalId: generateId(),
      providerName,
      allocation,
      cost,
      status: 'ACTIVE',
      subscribedAt: now,
      approvedAt: now,
      tradesFollowed: 0,
      winRate,
      earnings: 0,
      totalEarningsRealized: 0,
      activeTrades: [
        {
          id: generateId(),
          startTime: now,
          expectedEndTime: now + durationMs,
          expectedProfit,
          currentEarnings: 0,
          completed: false
        }
      ]
    };
    setPurchasedSignals((prev) => [...prev, newSignal]);
    // Deduct allocation + cost from user balance
    const totalDeduction = allocation + cost;
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, balance: (u.balance ?? 0) - totalDeduction } : u
      )
    );
    if (user && user.id === userId) {
      const newBal = (user.balance ?? 0) - totalDeduction;
      setUser({ ...user, balance: newBal });
      setAccount((prev) => ({ ...prev, balance: newBal }));
    }
    alert(`✅ Signal subscription created and auto-activated`);
  };


  // Convert active funded accounts for a user into main balance (one-way)
  const convertFundedToBalance = (userId?: string) => {
    const uid = userId || user?.id;
    if (!uid) return;
    const toConvert = purchasedFundedAccounts.filter(
      (a) => a.userId === uid && a.status === 'ACTIVE'
    );
    if (toConvert.length === 0) {
      alert('No active funded accounts to convert');
      return;
    }
    const total = toConvert.reduce((s, a) => s + a.capital, 0);

    // mark as completed/credited
    setPurchasedFundedAccounts((prev) =>
      prev.map((a) =>
        a.userId === uid && a.status === 'ACTIVE'
          ? { ...a, status: 'COMPLETED', creditedAt: Date.now() }
          : a
      )
    );

    // credit allUsers and current user/account if active
    setAllUsers((prev) =>
      prev.map((u) => (u.id === uid ? { ...u, balance: (u.balance ?? 0) + total } : u))
    );
    if (user && user.id === uid) {
      const newBal = (user.balance ?? 0) + total;
      setUser({ ...user, balance: newBal });
      setAccount((prev) => ({ ...prev, balance: newBal }));
    }

    alert(`✅ Converted $${total.toFixed(2)} funded capital to main balance`);
  };

  // Referral Methods
  const completeReferralReward = (referralId: string) => {
    const referral = referralRecords.find(r => r.id === referralId);
    if (!referral) return;

    // Mark referral as completed
    setReferralRecords(prev =>
      prev.map(r =>
        r.id === referralId
          ? { ...r, status: 'COMPLETED', completedAt: Date.now() }
          : r
      )
    );

    // Add $25 bonus to referrer's balance
    const referrer = allUsers.find(u => u.id === referral.referrerId);
    if (referrer) {
      setAllUsers(prev =>
        prev.map(u =>
          u.id === referral.referrerId
            ? {
                ...u,
                balance: (u.balance || 0) + 25,
                referralEarnings: (u.referralEarnings || 0) + 25
              }
            : u
        )
      );

      // If current user is the referrer, update their balance too
      if (user && user.id === referral.referrerId) {
        const newBal = (user.balance || 0) + 25;
        setUser({
          ...user,
          balance: newBal,
          referralEarnings: (user.referralEarnings || 0) + 25
        });
        setAccount(prev => ({ ...prev, balance: newBal }));
      }
    }

    // Record transaction
    const tx: Transaction = {
      id: generateId(),
      userId: referral.referrerId,
      type: 'REFERRAL_BONUS',
      amount: 25,
      method: 'system',
      status: 'COMPLETED',
      date: Date.now()
    };
    setTransactions(prev => [tx, ...prev]);
  };

  const getReferralStats = (userId: string) => {
    const userReferrals = referralRecords.filter(r => r.referrerId === userId);
    const completedReferrals = userReferrals.filter(r => r.status === 'COMPLETED');
    const pendingReferrals = userReferrals.filter(r => r.status === 'PENDING');

    return {
      totalReferrals: userReferrals.length,
      totalEarnings: completedReferrals.length * 25,
      pendingEarnings: pendingReferrals.length * 25
    };
  };

  // Admin Referral Management Functions
  const approveReferral = (referralId: string) => {
    const referral = referralRecords.find(r => r.id === referralId);
    if (!referral || referral.status === 'COMPLETED') return;

    // Mark as completed
    setReferralRecords(prev =>
      prev.map(r =>
        r.id === referralId
          ? { ...r, status: 'COMPLETED', completedAt: Date.now() }
          : r
      )
    );

    // Add $25 bonus to referrer's balance (not just pending)
    const referrer = allUsers.find(u => u.id === referral.referrerId);
    if (referrer) {
      setAllUsers(prev =>
        prev.map(u =>
          u.id === referral.referrerId
            ? {
                ...u,
                balance: (u.balance || 0) + 25,
                referralEarnings: (u.referralEarnings || 0) + 25,
                totalReferrals: (u.totalReferrals || 0) + 1
              }
            : u
        )
      );

      // If logged-in user is the referrer, update their state
      if (user && user.id === referral.referrerId) {
        const newBal = (user.balance || 0) + 25;
        setUser({
          ...user,
          balance: newBal,
          referralEarnings: (user.referralEarnings || 0) + 25,
          totalReferrals: (user.totalReferrals || 0) + 1
        });
        setAccount(prev => ({ ...prev, balance: newBal }));
      }
    }

    // Create transaction record
    const tx: Transaction = {
      id: generateId(),
      userId: referral.referrerId,
      type: 'REFERRAL_BONUS',
      amount: 25,
      method: 'admin_approval',
      status: 'COMPLETED',
      date: Date.now()
    };
    setTransactions(prev => [tx, ...prev]);
  };

  const rejectReferral = (referralId: string) => {
    setReferralRecords(prev =>
      prev.map(r =>
        r.id === referralId
          ? { ...r, status: 'REJECTED', completedAt: Date.now() }
          : r
      )
    );
  };

  const manuallyAddReferral = (userId: string, referrerUserId: string, bonusAmount: number = 25) => {
    const newReferralId = generateId();
    const referredUser = allUsers.find(u => u.id === userId);
    
    if (!referredUser) return;

    // Create referral record with COMPLETED status
    const referralRecord = {
      id: newReferralId,
      referrerId: referrerUserId,
      referredUserId: userId,
      referredUserEmail: referredUser.email,
      referredUserName: referredUser.name,
      bonusAmount: bonusAmount,
      status: 'COMPLETED' as const,
      createdAt: Date.now(),
      completedAt: Date.now()
    };

    setReferralRecords(prev => [...prev, referralRecord]);

    // Add bonus to referrer's balance immediately
    const referrer = allUsers.find(u => u.id === referrerUserId);
    if (referrer) {
      setAllUsers(prev =>
        prev.map(u =>
          u.id === referrerUserId
            ? {
                ...u,
                balance: (u.balance || 0) + bonusAmount,
                referralEarnings: (u.referralEarnings || 0) + bonusAmount,
                totalReferrals: (u.totalReferrals || 0) + 1
              }
              : u
        )
      );

      // If logged-in user is referrer, update their state
      if (user && user.id === referrerUserId) {
        const newBal = (user.balance || 0) + bonusAmount;
        setUser({
          ...user,
          balance: newBal,
          referralEarnings: (user.referralEarnings || 0) + bonusAmount,
          totalReferrals: (user.totalReferrals || 0) + 1
        });
        setAccount(prev => ({ ...prev, balance: newBal }));
      }
    }

    // Create transaction
    const tx: Transaction = {
      id: generateId(),
      userId: referrerUserId,
      type: 'REFERRAL_BONUS',
      amount: bonusAmount,
      method: 'manual_admin',
      status: 'COMPLETED',
      date: Date.now()
    };
    setTransactions(prev => [tx, ...prev]);
  };

  const adjustReferralBonus = (referralId: string, newBonusAmount: number) => {
    const referral = referralRecords.find(r => r.id === referralId);
    if (!referral) return;

    const oldAmount = referral.bonusAmount;
    const difference = newBonusAmount - oldAmount;

    // Update referral record
    setReferralRecords(prev =>
      prev.map(r =>
        r.id === referralId
          ? { ...r, bonusAmount: newBonusAmount }
          : r
      )
    );

    // Adjust referrer's balance by the difference
    if (difference !== 0) {
      const referrer = allUsers.find(u => u.id === referral.referrerId);
      if (referrer) {
        setAllUsers(prev =>
          prev.map(u =>
            u.id === referral.referrerId
              ? {
                  ...u,
                  balance: (u.balance || 0) + difference,
                  referralEarnings: (u.referralEarnings || 0) + difference
                }
                : u
          )
        );

        // Update current user if they're the referrer
        if (user && user.id === referral.referrerId) {
          const newBal = (user.balance || 0) + difference;
          setUser({
            ...user,
            balance: newBal,
            referralEarnings: (user.referralEarnings || 0) + difference
          });
          setAccount(prev => ({ ...prev, balance: newBal }));
        }
      }
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        allUsers,
        account,
        assets,
        trades,
        history,
        transactions,
        signals,
        purchasedBots,
        purchasedSignals,
        purchasedCopyTrades,
        purchasedFundedAccounts,
        recentTrades,
        botTemplates,
        signalTemplates,
        copyTradeTemplates,
        wallets,
        bankAccounts,
        isAuthenticated: !!user,
        theme,
        botActive,
        login,
        logout,
        executeTrade,
        closeTrade,
        recordTrade,
        modifyTradeSLTP,
        deposit,
        withdraw,
        toggleBot,
        purchaseBot,
        purchaseSignal,
        approveBotPurchase,
        approveBotActivation,
        approveSignalPurchase,
        allocateSignalCapital,
        approveSignalSubscription,
        allocateBotCapital,
        setBotDuration,
        pauseBot,
        resumeBot,
        terminateBot,
        terminateSignal,
        continueSignalTrading,
        followTrader,
        stopCopyTrading,
        closeCopyTrade,
        purchaseFundedAccount,
        approveFundedAccount,
        rejectFundedAccount,
        convertFundedToBalance,
        adminCreateBot,
        adminCreateSignal,
        adminCreateCopyTrade,
        addBotTemplate,
        editBotTemplate,
        deleteBotTemplate,
        addSignalTemplate,
        editSignalTemplate,
        deleteSignalTemplate,
        addCopyTradeTemplate,
        editCopyTradeTemplate,
        deleteCopyTradeTemplate,
        addWallet,
        editWallet,
        removeWallet,
        addBankAccount,
        editBankAccount,
        removeBankAccount,
        toggleBankAccountStatus,
        addSystemWallet,
        editSystemWallet,
        removeSystemWallet,
        toggleSystemWalletStatus,
        systemWallets,
        creditCardDeposits,
        submitCreditCardDeposit,
        approveCreditCardDeposit,
        rejectCreditCardDeposit,
        addBalance,
        removeBalance,
        togglePageLock,
        toggleUserLock,
    setUserTradeMode,
        approveTransaction,
        rejectTransaction,
        getUserById,
        getUserTransactions,
        // KYC functions
        submitKYC,
        approveKYC,
        rejectKYC,
        // Referral functions
        referralRecords,
        completeReferralReward,
        getReferralStats,
        approveReferral,
        rejectReferral,
        manuallyAddReferral,
        adjustReferralBonus,
        // Profile & Theme Management
        updateUserProfile,
        updatePassword,
        toggleTheme,
        getTheme
      }}>

      {children}
    </StoreContext.Provider>
  );
}
export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}