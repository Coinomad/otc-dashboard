import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ArrowRightLeft } from 'lucide-react';
import { api } from '../api/client';
import { Transaction } from '../types/api';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'failed', label: 'Failed' },
];

const txStatusStyles: Record<string, string> = {
  completed: 'badge-success',
  pending: 'badge-warning',
  flagged: 'badge-info',
  failed: 'badge-danger',
};

export function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(loadTransactions, 300);
    return () => clearTimeout(t);
  }, [statusFilter, search]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await api.getTransactions(undefined, statusFilter, 1, 100);
      const q = search.trim().toLowerCase();
      const filtered = q
        ? response.data.transactions.filter((t: Transaction) =>
            t.clientName.toLowerCase().includes(q),
          )
        : response.data.transactions;
      setTransactions(filtered);
      setTotal(filtered.length);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1>Settlement History</h1>
        <p>View all OTC transactions</p>
      </div>

      {/* Filters + Table Card */}
      <div className="card overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="custom-input pl-9"
              placeholder="Search client name..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="custom-select sm:w-44"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="p-6 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-10 rounded-lg" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No transactions found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {search ? 'Try a different search.' : 'No settlement activity yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="desktop-table">
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="table-header">Client</th>
                    <th className="table-header">USDT</th>
                    <th className="table-header">Rate</th>
                    <th className="table-header">Settled</th>
                    <th className="table-header">Currency</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="table-cell">
                        <Link
                          to={`/clients/${tx.clientId}`}
                          className="text-sm font-medium text-teal hover:text-teal-700 transition-colors"
                        >
                          {tx.clientName}
                        </Link>
                      </td>
                      <td className="table-cell text-slate-900">{formatCurrency(tx.cryptoAmount, 'USDT')}</td>
                      <td className="table-cell text-slate-500">{tx.rateApplied}</td>
                      <td className="table-cell font-medium text-slate-900">{formatCurrency(tx.amountSettled, (tx.fiatCurrency as 'GHS' | 'NGN') || 'GHS')}</td>
                      <td className="table-cell">
                        <span className="badge-neutral">{tx.fiatCurrency || 'GHS'}</span>
                      </td>
                      <td className="table-cell">
                        <span className={txStatusStyles[tx.status] || 'badge-neutral'}>{tx.status}</span>
                      </td>
                      <td className="table-cell text-xs text-slate-500">
                        {format(new Date(tx.createdAt), 'MMM d, yyyy h:mm a')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-cards divide-y divide-slate-100">
              {transactions.map((tx) => (
                <Link
                  key={tx.id}
                  to={`/transactions/${tx.id}`}
                  className="block px-4 py-4 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-teal">{tx.clientName}</span>
                    <span className={txStatusStyles[tx.status] || 'badge-neutral'}>{tx.status}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{formatCurrency(tx.cryptoAmount, 'USDT')}</span>
                    <span className="font-medium text-slate-900">{formatCurrency(tx.amountSettled)}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Rate: ₵{tx.rateApplied.toFixed(2)} • {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Summary */}
        {!isLoading && transactions.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{transactions.length}</span> of{' '}
              <span className="font-medium text-slate-700">{total}</span> transactions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
