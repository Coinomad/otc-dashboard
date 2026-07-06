export interface Client {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  depositAddress: string;
  network: string;
  asset?: string;
  accountName?: string;
  accountVerified?: boolean;
  markupPercent: number;
  autoSettlement: boolean;
  status: 'active' | 'paused';
  createdAt: string;
  totalCrypto?: number;
  totalSettled?: number;
  fiatCurrency?: 'GHS' | 'NGN';
  minimumDeposit?: number | null;
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  cryptoAmount: number;
  amountUsd: number;
  rateApplied: number;
  markupPercent: number;
  markupAmount: number;
  amountSettled: number;
  fiatCurrency?: string;
  status: 'pending' | 'completed' | 'flagged' | 'failed';
  createdAt: string;
}

export interface OverviewData {
  totalClients: number;
  activeClients: number;
  volumeToday: number;
  volumeTodayGhs: number;
  volumeTodayNgn: number;
  volumeThisWeek: number;
  volumeThisWeekGhs: number;
  volumeThisWeekNgn: number;
  volumeThisWeekUsdt: number;
  recentTransactions: Transaction[];
}

export interface RateData {
  usdtToGhs: number;
  usdtToNgn: number;
  lastUpdated: string;
}

export interface SettingsData {
  defaultMarkup: number;
  exchangeName: string;
  webhookStatus: string;
}

export interface Bank {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  hasLogo?: boolean;
  currency?: string;
  country?: string;
}

export interface BreetAsset {
  id: string;
  name: string;
  symbol: string;
  identifier?: string;
  network?: string;
  minimum?: number;
  minDeposit?: number;
  testnet?: boolean;
  rate?: Record<string, number>;
}