export type User = {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  country: string;
  password?: string;
  isVerified: boolean; // account active / email verified
  isAdmin?: boolean;
  balance?: number;
  lockedPages?: string[];
  tradeMode?: 'NORMAL' | 'PROFIT' | 'LOSS';
  // KYC related fields
  kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  kycData?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    country: string;
    state: string;
    city: string;
    zipCode: string;
    address: string;
    documentType: string;
    // file names or placeholders for uploaded images
    documentFrontName?: string;
    documentBackName?: string;
    selfieName?: string;
  };
  // Referral related fields
  referralCode?: string;
  referredBy?: string; // User ID who referred this user
  referralEarnings?: number;
  totalReferrals?: number;
};

export type ReferralRecord = {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserEmail: string;
  referredUserName: string;
  bonusAmount: number;
  status: 'PENDING' | 'COMPLETED'; // pending first deposit, completed when bonus given
  createdAt: number;
  completedAt?: number;
};

export type AccountType = 'DEMO' | 'LIVE';

export type Account = {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  leverage: number;
  type: AccountType;
  currency: string;
};

export type TradeType = 'BUY' | 'SELL';

export type TradeStatus = 'OPEN' | 'CLOSED';

export type Trade = {
  id: string;
  symbol: string;
  type: TradeType;
  lots: number;
  entryPrice: number;
  currentPrice: number;
  sl: number | null;
  tp: number | null;
  openTime: number;
  closeTime?: number;
  profit: number;
  status: TradeStatus;
  commission: number;
  swap: number;
};

export type Asset = {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  digits: number;
  change: number; // Daily change percentage
};

export type Signal = {
  id: string;
  symbol: string;
  type: TradeType;
  entry: number;
  sl: number;
  tp: number;
  confidence: number;
  time: number;
};

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL';
export type TransactionStatus =
'PENDING' |
'APPROVED' |
'COMPLETED' |
'REJECTED';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  method: string;
  status: TransactionStatus;
  date: number;
  userId?: string;
};

export type PurchasedBot = {
  id: string;
  userId: string;
  botId: string;
  botName: string;
  allocatedAmount: number;
  totalEarned: number;
  totalLost: number;
  status: 'PENDING_APPROVAL' | 'APPROVED_FOR_ALLOCATION' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  purchasedAt: number;
  approvedAt?: number;
  startedAt?: number; // When bot actually started running
  maxDurationMs?: number; // Total duration bot will run (in milliseconds)
  endDate?: number; // Calculated end date
  performance: number; // percentage: 64, 72, etc
  dailyReturn?: number; // 5-15% range
  durationDays?: number; // How many days admin set for bot to run
  durationValue?: string; // Duration value (e.g., "7")
  durationType?: 'hours' | 'days'; // Duration type
  maxDrawdown?: number; // Optional: max allowed loss % before auto-stop
  outcome?: 'win' | 'lose'; // Admin choice for bot behavior
};

export type PurchasedSignal = {
  id: string;
  userId: string;
  signalId: string;
  providerName: string;
  allocation: number; // capital locked for signal trading
  cost: number; // one-time subscription paid upfront
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED' | 'CLOSED';
  subscribedAt: number;
  approvedAt?: number;
  tradesFollowed: number; // total trades executed
  winRate: number; // e.g., 78 = 78%
  earnings: number; // fluctuating, converges to final by minute 21
  totalEarningsRealized: number; // sum of all completed trades
  activeTrades: Array<{
    id: string;
    startTime: number;
    expectedEndTime: number; // startTime + 15-21 min
    expectedProfit: number; // allocation * (winRate / 100)
    currentEarnings: number; // fluctuating
    completed: boolean;
  }>;
  outcome?: 'win' | 'lose'; // Admin choice for signal behavior
  durationValue?: string; // Duration value (e.g., "7")
  durationType?: 'hours' | 'days'; // Duration type
  endDate?: number; // When signal trading will auto-close
  startedAt?: number; // When signal trading actually started
};

export type CopyTrade = {
  id: string;
  userId: string;
  tradesId: number | string;
  traderName: string;
  allocation: number;
  status: 'ACTIVE' | 'CLOSED';
  copiedTrades: number;
  profit: number;
  startDate: number;
  endDate?: number;
  durationValue: string;
  durationType: 'hours' | 'days';
  winRate: string;
  risk: 'Low' | 'Medium' | 'High';
  performance?: number;
  traderReturn?: number;
};

export type FundedAccountPurchase = {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  capital: number;
  price: number;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED';
  purchasedAt: number;
  approvedAt?: number;
  profitTarget: number;
  maxDrawdown: number;
  creditedAt?: number;
};

export type BotTemplate = {
  id: string;
  name: string;
  description: string;
  price: number;
  performance: number;
  winRate: number;
  trades: number;
  type: string;
  risk: 'Low' | 'Medium' | 'High';
  maxDrawdown: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
};

export type SignalTemplate = {
  id: string;
  providerName: string;
  description: string;
  symbol: string;
  confidence: number;
  followers: number;
  cost: number;
  winRate: number;
  trades: number;
  avgReturn: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
};

export type CopyTradeTemplate = {
  id: string;
  name: string;
  description: string;
  winRate: number;
  return: number;
  followers: number;
  risk: 'Low' | 'Medium' | 'High';
  dailyReturn: number;
  trades: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
};

export type Wallet = {
  id: string;
  userId: string;
  address: string;
  label: string;
  type: 'DEPOSIT' | 'PURCHASE';
  currency: string;
  network?: string;
  createdAt: number;
};

export type BankAccount = {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  routingNumber: string;
  swiftCode?: string;
  iban?: string;
  accountType: 'CHECKING' | 'SAVINGS';
  currency: string;
  country: string;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
};

export type SystemWallet = {
  id: string;
  name: string;
  cryptoId: string;
  network: string;
  address: string;
  minDeposit: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
};

export type CreditCardDeposit = {
  id: string;
  userId: string;
  amount: number;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: number;
  approvedAt?: number;
  rejectedAt?: number;
  notes?: string;
};