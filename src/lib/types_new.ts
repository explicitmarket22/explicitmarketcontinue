export type User = {
  id: string;
  email: string;
  name: string;
  country: string;
  password?: string;
  isVerified: boolean;
  isAdmin?: boolean;
  balance?: number;
  lockedPages?: string[];
  phoneNumber?: string;
  kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  kycData?: any;
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
  change: number;
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
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  method: string;
  status: TransactionStatus;
  date: number;
  userId?: string;
};

export type CreditCardDeposit = {
  id: string;
  userId: string;
  amount: number;
  cardNumber: string; // Masked for display
  cardHolder: string;
  expiryDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: number;
  approvedAt?: number;
  notes?: string;
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
  performance: number;
  dailyReturn?: number;
  durationValue?: string;
  durationType?: 'minutes' | 'hours' | 'days';
  maxDurationMs?: number;
  endDate?: number;
  outcome?: 'win' | 'lose';
};

export type PurchasedSignal = {
  id: string;
  userId: string;
  signalId: string;
  providerName: string;
  allocation: number;
  cost: number;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'EXPIRED';
  subscribedAt: number;
  approvedAt?: number;
  tradesFollowed: number;
  winRate: number;
  earnings: number;
  totalEarningsRealized?: number;
  durationValue?: string;
  durationType?: 'minutes' | 'hours' | 'days';
  endDate?: number;
  outcome?: 'win' | 'lose';
  activeTrades?: any[];
  startedAt?: number;
};

export type CopyTrade = {
  id: string;
  userId: string;
  tradesId: number;
  traderName: string;
  allocation: number;
  status: 'ACTIVE' | 'CLOSED';
  copiedTrades: number;
  profit: number;
  startDate: number;
  endDate?: number;
  durationValue: string;
  durationType: 'minutes' | 'hours' | 'days';
  winRate: string;
  risk: 'Low' | 'Medium' | 'High';
  performance?: number;
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
  cost: number;
  winRate: number;
  trades: number;
  avgReturn: number;
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
