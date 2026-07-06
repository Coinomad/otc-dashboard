import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { api } from '../api/client';
import { Transaction } from '../types/api';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

const statusStyles: Record<string, string> = {
  completed: 'badge-success',
  pending: 'badge-warning',
  flagged: 'badge-info',
  failed: 'badge-danger',
};

export function TransactionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tx, setTx] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) load();
  }, [id]);

  const load = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await api.getTransaction(id!);
      setTx(res.data.transaction);
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-3xl">
        <div className="skeleton h-8 w-64" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="max-w-3xl mx-auto mt-12 bg-red-50 border border-red-100 rounded-xl p-8 text-center">
        <p className="text-red-700 font-medium mb-4">{error || 'Transaction not found'}</p>
        <button onClick={load} className="btn-primary">Retry</button>
      </div>
    );
  }

  const rows: [string, React.ReactNode][] = [
    ['Transaction ID', <span key="txid" className="font-mono text-xs">{tx.id}</span>],
    [
      'Client',
      <Link
        key="client"
        to={`/clients/${tx.clientId}`}
        className="text-teal hover:text-teal-700 font-medium inline-flex items-center gap-1"
      >
        {tx.clientName}
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>,
    ],
    ['USDT Amount', formatCurrency(tx.cryptoAmount, 'USDT')],
    ['Rate Applied', `₵${tx.rateApplied.toFixed(2)}`],
    ['Markup', `${tx.markupPercent.toFixed(2)}% (${formatCurrency(tx.markupAmount)})`],
    ['GHS Settled', <span key="ghs" className="font-semibold text-lg">{formatCurrency(tx.amountSettled)}</span>],
    ['Date', format(new Date(tx.createdAt), 'MMM d, yyyy h:mm a')],
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transaction Detail</h1>
          <p className="text-sm text-slate-500 mt-0.5 font-mono text-xs">{tx.id}</p>
        </div>
        <span className={`ml-auto ${statusStyles[tx.status] || 'badge-neutral'}`}>
          {tx.status}
        </span>
      </div>

      {/* Detail Card */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Settlement</h3>
        </div>
        <dl className="divide-y divide-slate-100">
          {rows.map(([label, value]) => (
            <div key={label} className="px-6 py-4 flex justify-between gap-6 items-center">
              <dt className="text-sm font-medium text-slate-500 min-w-[120px]">{label}</dt>
              <dd className="text-sm text-slate-900 text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
