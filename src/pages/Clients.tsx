import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Copy,
  Check,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  Circle,
  PauseCircle,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { api } from '../api/client';
import { Client } from '../types/api';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn, formatCurrency } from '../lib/utils';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
];

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteClient, setDeleteClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const limit = 10;
  const navigate = useNavigate();

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(loadClients, 300);
    return () => clearTimeout(t);
  }, [search, statusFilter, page]);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const response = await api.getClients(search, statusFilter, page, limit);
      setClients(response.data.clients);
      setTotal(response.data.total);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    setOpenMenuId(null);
    const newStatus = client.status === 'active' ? 'paused' : 'active';
    try {
      await api.updateClient(client.id, { status: newStatus });
      setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, status: newStatus } : c));
      toast.success(`Client ${newStatus === 'active' ? 'activated' : 'paused'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Address copied');
  };

  const handleDelete = async () => {
    if (!deleteClient) return;
    setIsDeleting(true);
    try {
      await api.deleteClient(deleteClient.id);
      setClients((prev) => prev.filter((c) => c.id !== deleteClient.id));
      setTotal((prev) => Math.max(0, prev - 1));
      toast.success('Client deleted');
    } catch {
      toast.error('Failed to delete client');
    } finally {
      setIsDeleting(false);
      setDeleteClient(null);
      setOpenMenuId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">Exchange Operations</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="text-slate-500 mt-1">Manage OTC settlement clients and their deposit wallets.</p>
        </div>
        <Link to="/clients/new" className="btn-primary self-start">
          <Plus className="w-4 h-4" />
          New Client
        </Link>
      </div>

      {/* Filters */}
      <div className="card rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="custom-input pl-9"
              placeholder="Search by name, account, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="custom-select sm:w-44"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-32 rounded" />
                  <div className="skeleton h-3 w-24 rounded" />
                </div>
              </div>
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      ) : clients.length === 0 ? (
        <div className="card rounded-2xl py-16 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No clients found</h3>
          <p className="text-sm text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
            {search ? 'Try a different search term.' : 'Get started by creating your first OTC settlement client.'}
          </p>
          {!search && (
            <Link to="/clients/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              New Client
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Client Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {clients.map((client) => (
              <div
                key={client.id}
                className="card rounded-2xl p-5 hover:shadow-md transition-all duration-200 group relative"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 flex items-center justify-center flex-shrink-0">
                      <Wallet className="w-6 h-6 text-teal" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{client.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {client.bankName}
                      </p>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === client.id ? null : client.id); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenuId === client.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 z-20 mt-1 w-44 origin-top-right rounded-xl bg-white shadow-lg border border-slate-200 py-1">
                          <button
                            onClick={() => { setOpenMenuId(null); navigate(`/clients/${client.id}`); }}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleToggleStatus(client)}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            {client.status === 'active' ? (
                              <><PauseCircle className="w-4 h-4" /> Pause Client</>
                            ) : (
                              <><Circle className="w-4 h-4" /> Resume Client</>
                            )}
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            onClick={() => { setOpenMenuId(null); setDeleteClient(client); }}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Client
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Deposit address */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Deposit Address</span>
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                      client.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10'
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/10'
                    )}>
                      {client.status === 'active' ? (
                        <><Circle className="w-1.5 h-1.5 fill-emerald-500 text-emerald-500" /> Active</>
                      ) : (
                        <><PauseCircle className="w-3 h-3" /> Paused</>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-slate-700 truncate flex-1">
                      {client.depositAddress || 'N/A'}
                    </span>
                    {client.depositAddress && (
                      <button
                        onClick={() => handleCopy(client.depositAddress, client.id)}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-teal transition-colors flex-shrink-0"
                        title="Copy address"
                      >
                        {copiedId === client.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Bottom metadata */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Total Sent</p>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(client.totalCrypto || 0, 'USDT')}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">Total Payout</p>
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(client.totalSettled || 0, client.fiatCurrency || 'GHS')}</p>
                  </div>
                </div>

                {/* Account / Asset row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500">Account</p>
                    <p className="font-mono text-slate-700">{client.accountNumber ? `****${client.accountNumber.slice(-4)}` : 'N/A'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs text-slate-500">Asset</p>
                    <p className="font-medium text-slate-700">{client.asset} <span className="text-slate-400">/</span> {client.network}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {client.createdAt ? formatDistanceToNow(new Date(client.createdAt), { addSuffix: true }) : 'Unknown date'}
                  </span>
                  <button
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="text-xs font-medium text-teal hover:text-teal-700 flex items-center gap-1"
                  >
                    View
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-700">{(page - 1) * limit + 1}</span>
              {'-'}
              <span className="font-medium text-slate-700">{Math.min(page * limit, total)}</span>
              {' '}of <span className="font-medium text-slate-700">{total}</span>
            </p>
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteClient(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Delete client?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  This will permanently remove <span className="font-medium text-slate-700">{deleteClient.name}</span> and all associated settlement history. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteClient(null)}
                disabled={isDeleting}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Client
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
