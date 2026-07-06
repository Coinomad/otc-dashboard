import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  ArrowRightLeft,
  Plus,
  RefreshCw,
  Wallet,
  Calculator,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../api/client';
import { OverviewData } from '../types/api';
import { formatCurrency, formatNumber } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const statusStyles: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10',
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10',
  flagged: 'bg-sky-50 text-sky-700 ring-1 ring-sky-600/10',
  failed: 'bg-red-50 text-red-700 ring-1 ring-red-600/10',
};

const statusDot: Record<string, string> = {
  completed: 'bg-emerald-500',
  pending: 'bg-amber-500',
  flagged: 'bg-sky-500',
  failed: 'bg-red-500',
};

export function Dashboard() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [rates, setRates] = useState({ usdtToGhs: 0, usdtToNgn: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Rate calculator state
  const [calcAmount, setCalcAmount] = useState<string>('100');
  const [calcCurrency, setCalcCurrency] = useState<'GHS' | 'NGN'>('GHS');

  useEffect(() => { loadDashboard(); loadRates(); }, []);

  const loadRates = async () => {
    try {
      const response = await api.getRates();
      setRates(response.data);
    } catch {
      // silent
    }
  };

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await api.getOverview();
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const calcRate = calcCurrency === 'GHS' ? rates.usdtToGhs : rates.usdtToNgn;
  const calcResult = parseFloat(calcAmount || '0') * calcRate;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-10 w-56 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-36 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 skeleton h-96 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center max-w-md shadow-sm">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity className="w-7 h-7 text-red-600" />
          </div>
          <p className="text-red-700 font-semibold mb-1">Failed to load dashboard</p>
          <p className="text-red-500 text-sm mb-6">{error}</p>
          <button onClick={loadDashboard} className="btn-primary">
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const volumeTodayParts: string[] = [];
  if (data.volumeTodayGhs > 0) volumeTodayParts.push(formatCurrency(data.volumeTodayGhs, 'GHS'));
  if (data.volumeTodayNgn > 0) volumeTodayParts.push(formatCurrency(data.volumeTodayNgn, 'NGN'));
  const volumeTodayDisplay = volumeTodayParts.join(' / ') || '₵0.00';

  const volumeWeekParts: string[] = [];
  if (data.volumeThisWeekGhs > 0) volumeWeekParts.push(formatCurrency(data.volumeThisWeekGhs, 'GHS'));
  if (data.volumeThisWeekNgn > 0) volumeWeekParts.push(formatCurrency(data.volumeThisWeekNgn, 'NGN'));
  const volumeWeekDisplay = volumeWeekParts.join(' / ') || '₵0.00';

  const stats = [
    {
      label: 'Total Clients',
      value: formatNumber(data.totalClients),
      icon: Users,
      gradient: 'from-navy to-navy-800',
      iconColor: 'text-teal-300',
      subtext: 'OTC settlement profiles',
    },
    {
      label: 'Volume This Week (USDT)',
      value: formatCurrency(data.volumeThisWeekUsdt, 'USDT'),
      icon: Activity,
      gradient: 'from-teal-600 to-teal-700',
      iconColor: 'text-teal-100',
      subtext: 'Total USDT settled',
    },
    {
      label: 'Volume Today',
      value: volumeTodayDisplay,
      icon: DollarSign,
      gradient: 'from-sky-600 to-sky-700',
      iconColor: 'text-sky-100',
      subtext: 'Settled in the last 24h',
    },
    {
      label: 'Volume This Week',
      value: volumeWeekDisplay,
      icon: TrendingUp,
      gradient: 'from-navy-700 to-navy-900',
      iconColor: 'text-teal-300',
      subtext: '7-day settlement total',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Exchange Operations</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Track clients, settlements, and live rates at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadDashboard} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link to="/clients/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Client
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${stat.gradient} text-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{stat.label}</p>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-white/70 mt-1">{stat.subtext}</p>
              </div>
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mb-10" />
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Settlements */}
        <div className="xl:col-span-2 card rounded-2xl">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Settlements</h3>
              <p className="text-sm text-slate-500 mt-0.5">Latest client settlement activity</p>
            </div>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-sm font-medium text-teal hover:text-teal-700 transition-colors"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {data.recentTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowRightLeft className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No settlements yet</h3>
              <p className="text-sm text-slate-500 mt-1 mb-5">Once Breet webhooks arrive, they&apos;ll appear here.</p>
              <Link to="/clients/new" className="btn-primary">
                <Plus className="w-4 h-4" />
                Onboard First Client
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-slate-50/70">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">USDT</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Settled</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => navigate(`/transactions/${tx.id}`)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                            <Wallet className="w-4 h-4 text-teal" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{tx.clientName || 'Unknown Client'}</p>
                            <p className="text-xs text-slate-500">{tx.eventType || 'Settlement'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{formatCurrency(tx.cryptoAmount, 'USDT')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">{formatNumber(tx.rateApplied || 0)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">{formatCurrency(tx.amountSettled, (tx.fiatCurrency as 'GHS' | 'NGN') || 'GHS')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusStyles[tx.status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-400/10'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[tx.status] || 'bg-slate-400'}`} />
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {tx.createdAt ? formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Rate Calculator */}
          <div className="card rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-teal" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Rate Calculator</h3>
                <p className="text-sm text-slate-500">Estimate USDT settlement value</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (USDT)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    className="custom-input pr-16"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">USDT</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Settlement Currency</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['GHS', 'NGN'] as const).map((currency) => (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => setCalcCurrency(currency)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                        calcCurrency === currency
                          ? 'bg-teal text-white border-teal shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-teal-300'
                      }`}
                    >
                      {currency === 'GHS' ? '🇬🇭 Ghana Cedi' : '🇳🇬 Nigerian Naira'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mt-2">
                <p className="text-xs text-slate-500 mb-1">Estimated payout</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(calcResult, calcCurrency)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Rate: 1 USDT = {formatNumber(calcRate)} {calcCurrency}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Quick Actions</h3>
            <p className="text-sm text-slate-500 mb-5">Common tasks to keep operations moving</p>
            <div className="space-y-3">
              <Link to="/clients/new" className="btn-primary w-full justify-between group">
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  New Client
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link to="/clients" className="btn-secondary w-full justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  View All Clients
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link to="/transactions" className="btn-ghost w-full justify-between">
                <span className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  Browse Transactions
                </span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
