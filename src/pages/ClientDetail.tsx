import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Copy, Check, ArrowLeft, QrCode, Building2, Percent,
  Circle, PauseCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { Client, Transaction } from '../types/api';
import { cn, formatCurrency } from '../lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

const txStatusStyles: Record<string, string> = {
  completed: 'badge-success',
  pending: 'badge-warning',
  flagged: 'badge-info',
  failed: 'badge-danger',
};

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      setIsLoading(true);
      const response = await api.getClient(id!);
      setClient(response.data.client);
      setTransactions(response.data.transactions);
    } catch {
      toast.error('Failed to load client details');
      navigate('/clients');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (client) {
      navigator.clipboard.writeText(client.depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Address copied');
    }
  };

  const toggleStatus = async () => {
    if (!client) return;
    const newStatus = client.status === 'active' ? 'paused' : 'active';
    try {
      const res = await api.updateClient(client.id, { status: newStatus });
      setClient(res.data.client);
      toast.success(`Client ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const toggleAutoSettlement = async () => {
    if (!client) return;
    const newAuto = !client.autoSettlement;
    try {
      const res = await api.toggleAutoSettlement(client.id, newAuto);
      setClient(res.data.client);
      toast.success(`Auto-settlement ${newAuto ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update auto-settlement');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-48 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="space-y-6">
      {/* Back + Name Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
            <span className={client.status === 'active' ? 'badge-success' : 'badge-warning'}>
              {client.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Onboarded {format(new Date(client.createdAt), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Deposit Address Card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="flex-1 w-full min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Deposit Address</h3>
            <div className="flex items-center gap-2">
              <code className="flex-1 block p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-slate-800 break-all">
                {client.depositAddress}
              </code>
              <button
                onClick={handleCopy}
                className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-teal rounded-lg transition-colors flex-shrink-0"
                title="Copy address"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="badge-neutral">{client.network}</span>
              <p className="text-xs text-slate-400">Share this address with the client</p>
            </div>
            {client.minimumDeposit != null && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Minimum deposit: <strong>{client.minimumDeposit} {client.asset || 'USDT'}</strong> — smaller deposits may be flagged by Breet
              </p>
            )}
          </div>
          <div className="hidden sm:flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 w-28 h-28 flex-shrink-0">
            <QrCode className="w-8 h-8 text-slate-400 mb-1" />
            <span className="text-[10px] text-slate-400 text-center leading-tight">QR in production</span>
          </div>
        </div>
      </div>

      {/* Client Details Grid */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Client Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="px-6 py-4 space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Bank</p>
            <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              {client.bankName}
            </p>
          </div>
          <div className="px-6 py-4 space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Number</p>
            <p className="text-sm font-mono text-slate-900">{client.accountNumber}</p>
          </div>
          <div className="px-6 py-4 space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Name</p>
            <p className="text-sm text-slate-900 flex items-center gap-2">
              {client.accountName || client.name}
              <span className={client.accountVerified !== false ? 'badge-success' : 'badge-warning'}>
                {client.accountVerified !== false ? 'Verified' : 'Unverified'}
              </span>
            </p>
          </div>
          <div className="px-6 py-4 space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Markup</p>
            <p className="text-sm text-slate-900 font-medium flex items-center gap-1">
              <Percent className="w-4 h-4 text-slate-400" />
              {(client.markupPercent ?? 0).toFixed(2)}%
            </p>
          </div>
          <div className="px-6 py-4 space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Auto-Settlement</p>
            <div className="flex items-center justify-between">
              <span className={client.autoSettlement ? 'badge-success' : 'badge-neutral'}>
                {client.autoSettlement ? 'ON' : 'OFF'}
              </span>
              <button onClick={toggleAutoSettlement} className="text-xs font-medium text-teal hover:text-teal-700 transition-colors">
                Toggle
              </button>
            </div>
          </div>
          <div className="px-6 py-4 space-y-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {client.status === 'active' ? (
                  <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                ) : (
                  <PauseCircle className="w-2.5 h-2.5 text-amber-500" />
                )}
                <span className="text-sm capitalize text-slate-900">{client.status}</span>
              </div>
              <button
                onClick={toggleStatus}
                className={cn(
                  'text-xs font-medium transition-colors',
                  client.status === 'active' ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700',
                )}
              >
                {client.status === 'active' ? 'Pause' : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Recent Transactions</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">
            No transactions found for this client.
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="desktop-table">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="table-header">ID</th>
                    <th className="table-header">USDT</th>
                    <th className="table-header">Rate</th>
                    <th className="table-header">GHS</th>
                    <th className="table-header">Markup</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => navigate(`/transactions/${tx.id}`)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="table-cell font-mono text-xs text-slate-400">{tx.id.slice(0, 8)}...</td>
                      <td className="table-cell font-medium text-slate-900">{formatCurrency(tx.cryptoAmount ?? 0, 'USDT')}</td>
                      <td className="table-cell text-slate-500">{(tx.rateApplied ?? 0).toFixed(2)}</td>
                      <td className="table-cell font-medium text-slate-900">{formatCurrency(tx.amountSettled ?? 0)}</td>
                      <td className="table-cell text-slate-500">{formatCurrency(tx.markupAmount ?? 0)}</td>
                      <td className="table-cell">
                        <span className={txStatusStyles[tx.status] || 'badge-neutral'}>{tx.status}</span>
                      </td>
                      <td className="table-cell text-xs text-slate-500">
                        {format(new Date(tx.createdAt), 'MMM d, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile */}
            <div className="mobile-cards divide-y divide-slate-100">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => navigate(`/transactions/${tx.id}`)}
                  className="px-4 py-4 hover:bg-slate-50 cursor-pointer transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-400">{tx.id.slice(0, 8)}...</span>
                    <span className={txStatusStyles[tx.status] || 'badge-neutral'}>{tx.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>{formatCurrency(tx.cryptoAmount ?? 0, 'USDT')}</span>
                    <span className="font-medium">{formatCurrency(tx.amountSettled ?? 0)}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Rate: ₵{(tx.rateApplied ?? 0).toFixed(2)} • {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
