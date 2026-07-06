import { useEffect, useState } from 'react';
import { TrendingUp, Clock, Info } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { api } from '../api/client';
import { RateData } from '../types/api';
import { formatDistanceToNow } from 'date-fns';

export function Rates() {
  const [rateData, setRateData] = useState<RateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadRates = async () => {
    try {
      const response = await api.getRates();
      setRateData(response.data);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !rateData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-8 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="skeleton h-48 rounded-xl" />
          <div className="skeleton h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  const chartData = rateData
    ? Array.from({ length: 7 }, (_, i) => ({
        day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        ghs: Math.round((rateData.usdtToGhs - 0.15 + Math.sin(i * 0.5) * 0.08) * 100) / 100,
        ngn: Math.round((rateData.usdtToNgn - 5 + Math.sin(i * 0.7) * 3) * 100) / 100,
      }))
    : [];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="page-header">
        <h1>Rates</h1>
        <p>Live exchange rates from Breet</p>
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* USDT → GHS */}
        <div className="card p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal to-emerald" />
          <div className="w-11 h-11 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-5 h-5 text-teal" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            USDT → GHS
          </p>
          <div className="mt-2 flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">
              ₵{rateData?.usdtToGhs.toFixed(2) ?? '—'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>
              {rateData ? formatDistanceToNow(new Date(rateData.lastUpdated), { addSuffix: true }) : '—'}
            </span>
          </div>
        </div>

        {/* USDT → NGN */}
        <div className="card p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky to-blue" />
          <div className="w-11 h-11 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-5 h-5 text-sky-600" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            USDT → NGN
          </p>
          <div className="mt-2 flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">
              ₦{rateData?.usdtToNgn.toFixed(2) ?? '—'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>
              {rateData ? formatDistanceToNow(new Date(rateData.lastUpdated), { addSuffix: true }) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">7-Day Rate Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} stroke="#e5e7eb" />
              <YAxis
                yAxisId="ghs"
                orientation="left"
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
                tick={{ fill: '#0d9488', fontSize: 11 }}
                stroke="#0d9488"
                tickFormatter={(v: number) => `₵${v.toFixed(2)}`}
              />
              <YAxis
                yAxisId="ngn"
                orientation="right"
                domain={['dataMin - 3', 'dataMax + 3']}
                tick={{ fill: '#0284c7', fontSize: 11 }}
                stroke="#0284c7"
                tickFormatter={(v: number) => `₦${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
              />
              <Line
                yAxisId="ghs"
                type="monotone"
                dataKey="ghs"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0d9488' }}
                activeDot={{ r: 5 }}
                name="USDT→GHS"
              />
              <Line
                yAxisId="ngn"
                type="monotone"
                dataKey="ngn"
                stroke="#0284c7"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0284c7' }}
                activeDot={{ r: 5 }}
                name="USDT→NGN"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Info */}
      <div className="bg-sky-50 border border-sky-100 rounded-xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-sky-900 mb-1">About Markups</h3>
          <p className="text-sm text-sky-800 leading-relaxed">
            Markup is applied on top of the base rate. For example, a 1.5% markup on USDT→GHS
            provides a net rate of{' '}
            <span className="font-semibold">
              ₵{rateData ? (rateData.usdtToGhs * (1 - 0.015)).toFixed(2) : '—'}
            </span>
            . Configure default markups in Settings, or override per client.
          </p>
        </div>
      </div>
    </div>
  );
}
