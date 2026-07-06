import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  AlertCircle,
  User,
  Building2,
  Network,
  ArrowLeft,
  ChevronDown,
  Search,
  Loader2,
  X,
  Zap,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../api/client';
import { Bank, BreetAsset } from '../types/api';
import { ChainLogo, AssetLogo } from '../components/ChainLogos';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface AssetOption {
  assetId: string;
  symbol: string;
  network: string;
  display: string;
}

export function NewClient() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    assetSymbol: 'USDT',
    network: 'Tron (TRC-20)',
  });

  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [bankQuery, setBankQuery] = useState('');
  const [showBankPanel, setShowBankPanel] = useState(false);

  const [settlementCurrency, setSettlementCurrency] = useState<'GHS' | 'NGN'>('GHS');

  const [accountError, setAccountError] = useState('');
  const [accountValid, setAccountValid] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState('');
  const [isVerifyingAccount, setIsVerifyingAccount] = useState(false);

  useEffect(() => {
    loadBanks();
    loadAssets();
  }, []);

  // Close panel on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowBankPanel(false);
    };
    if (showBankPanel) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [showBankPanel]);

  const loadBanks = async () => {
    try {
      const response = await api.getBanks();
      setBanks(response.data.banks);
    } catch {
      toast.error('Failed to load banks from Breet');
    } finally {
      setIsLoadingBanks(false);
    }
  };

  const loadAssets = async () => {
    try {
      const response = await api.getAssets();
      const options: AssetOption[] = response.data.assets
        .filter((a) => ['USDT', 'USDC'].includes(a.symbol?.toUpperCase() ?? ''))
        .map((a) => ({
          assetId: a.id,
          symbol: a.symbol.toUpperCase(),
          network: a.network ?? a.identifier ?? 'Unknown',
          display: `${a.symbol.toUpperCase()} ${a.network ? `on ${a.network}` : `(${a.identifier})`}`,
        }))
        .sort((a, b) => a.display.localeCompare(b.display));
      setAssets(options);

      // Default to USDT/Tron if available
      const usdtTron = options.find((o) => o.symbol === 'USDT' && o.network.toUpperCase().includes('TRON'));
      if (usdtTron) {
        setFormData((prev) => ({ ...prev, assetSymbol: 'USDT', network: usdtTron.network }));
      } else if (options.length > 0) {
        setFormData((prev) => ({ ...prev, assetSymbol: options[0].symbol, network: options[0].network }));
      }
    } catch {
      toast.error('Failed to load supported assets from Breet');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const filteredBanks = bankQuery
    ? banks.filter(
        (b) =>
          b.currency === settlementCurrency &&
          (b.name.toLowerCase().includes(bankQuery.toLowerCase()) ||
            (b.slug && b.slug.toLowerCase().includes(bankQuery.toLowerCase())))
      )
    : banks.filter((b) => b.currency === settlementCurrency);

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    setBankQuery('');
    setShowBankPanel(false);
    resetAccountVerification();
  };

  const resetAccountVerification = () => {
    setAccountValid(false);
    setAccountError('');
    setVerifiedAccountName('');
  };

  const handleAccountChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, accountNumber: digits }));
    if (accountError) setAccountError('');
    if (accountValid) resetAccountVerification();
  };

  const verifyAccount = async () => {
    const num = formData.accountNumber;
    if (!num) {
      setAccountError('Enter an account number');
      return;
    }
    if (num.length !== 10) {
      setAccountError('Must be exactly 10 digits');
      return;
    }
    if (!selectedBank) {
      setAccountError('Select a bank first');
      return;
    }

    setIsVerifyingAccount(true);
    setAccountError('');
    try {
      const result = await api.verifyBankAccount(selectedBank.id, num);
      setVerifiedAccountName(result.data.accountName);
      setAccountValid(true);
      toast.success(`Account verified: ${result.data.accountName}`);
    } catch (error: any) {
      setAccountValid(false);
      setVerifiedAccountName('');
      setAccountError(error.message || 'Account verification failed');
    } finally {
      setIsVerifyingAccount(false);
    }
  };

  const handleAccountBlur = () => {
    const num = formData.accountNumber;
    if (!num) {
      setAccountError('');
      return;
    }
    if (num.length !== 10) {
      setAccountError('Must be exactly 10 digits');
      return;
    }
    if (!selectedBank) {
      setAccountError('Select a bank first');
      return;
    }
    // Auto-verify when valid length is reached and bank is selected
    if (!accountValid && !isVerifyingAccount) {
      verifyAccount();
    }
  };

  const selectedAssetOption = assets.find(
    (a) => a.symbol === formData.assetSymbol && a.network.toUpperCase() === formData.network.toUpperCase()
  );

  const selectedAssetGroup = assets.filter(
    (a) => a.network.toUpperCase() === formData.network.toUpperCase()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Client name is required');
      return;
    }
    if (!selectedBank) {
      toast.error('Please select a bank');
      return;
    }
    if (formData.accountNumber.length !== 10) {
      setAccountError('Must be exactly 10 digits');
      return;
    }
    if (!accountValid) {
      toast.error('Please verify the bank account first');
      return;
    }
    if (!selectedAssetOption) {
      toast.error('Please select a supported asset and network');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.createClient({
        name: formData.name.trim(),
        bankName: selectedBank.name,
        bankCode: selectedBank.id,
        accountNumber: formData.accountNumber,
        asset: formData.assetSymbol,
        network: formData.network,
      });
      toast.success('Client onboarded successfully!');
      navigate(`/clients/${response.data.client.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create client');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Onboard New Client</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create a settlement profile linked to their bank via Breet
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Identity */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/50 to-transparent">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-teal" />
              Client Identity
            </h3>
          </div>
          <div className="p-6">
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name or Company Name
            </label>
            <input
              type="text"
              id="name"
              required
              placeholder="e.g. Kwame Mensah or Accra Trading Ltd"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="custom-input"
            />
            <p className="mt-1.5 text-xs text-slate-400">
              The client&apos;s name as it should appear in settlement records
            </p>
          </div>
        </div>

        {/* Bank Details */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/50 to-transparent">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Landmark className="w-4 h-4 text-teal" />
              Bank Details
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Destination bank account for {settlementCurrency} settlement — sourced from Breet
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Settlement Currency Toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Settlement Currency
              </label>
              <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setSettlementCurrency('GHS');
                    setSelectedBank(null);
                    setBankQuery('');
                    resetAccountVerification();
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    settlementCurrency === 'GHS'
                      ? 'bg-white text-teal shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  🇬🇭 Ghana (GHS)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSettlementCurrency('NGN');
                    setSelectedBank(null);
                    setBankQuery('');
                    resetAccountVerification();
                  }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    settlementCurrency === 'NGN'
                      ? 'bg-white text-teal shadow-sm border border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  🇳🇬 Nigeria (NGN)
                </button>
              </div>
            </div>

            {/* Bank Picker */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Destination Bank in {settlementCurrency === 'GHS' ? 'Ghana' : 'Nigeria'}
              </label>

              {isLoadingBanks ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="w-5 h-5 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin" />
                  <span className="text-sm text-slate-500">Fetching banks from Breet...</span>
                </div>
              ) : (
                <>
                  {/* Input trigger */}
                  <div
                    onClick={() => !selectedBank && setShowBankPanel(true)}
                    className={cn(
                      'flex items-center rounded-xl border bg-white shadow-sm transition-all duration-150 cursor-pointer',
                      showBankPanel && !selectedBank
                        ? 'border-teal-500 ring-1 ring-teal-500/30'
                        : 'border-slate-300 hover:border-slate-400'
                    )}
                  >
                    <div className="pl-4 pr-2 flex items-center">
                      {selectedBank ? (
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {selectedBank.hasLogo && selectedBank.avatar ? (
                            <img src={selectedBank.avatar} alt={selectedBank.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Landmark className="w-4 h-4 text-teal" />
                          )}
                        </div>
                      ) : (
                        <Search className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <input
                      type="text"
                      readOnly={!!selectedBank}
                      placeholder={
                        selectedBank
                          ? selectedBank.name
                          : `Click to choose a ${settlementCurrency === 'GHS' ? 'Ghanaian' : 'Nigerian'} bank...`
                      }
                      value={selectedBank ? selectedBank.name : bankQuery}
                      onChange={(e) => {
                        if (selectedBank) {
                          setSelectedBank(null);
                          resetAccountVerification();
                        }
                        setBankQuery(e.target.value);
                        setShowBankPanel(true);
                      }}
                      onFocus={() => {
                        if (!selectedBank) setShowBankPanel(true);
                      }}
                      className="flex-1 py-3.5 text-sm bg-transparent outline-none border-none placeholder:text-slate-400 cursor-pointer"
                    />
                    <div className="pr-3 flex items-center gap-1">
                      {selectedBank && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBank(null);
                            setBankQuery('');
                            resetAccountVerification();
                          }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronDown
                        className={cn('w-4 h-4 text-slate-400 transition-transform', showBankPanel && 'rotate-180')}
                      />
                    </div>
                  </div>

                  {/* ===== FLOATING BANK PANEL OVERLAY ===== */}
                  {showBankPanel && !selectedBank && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        onClick={() => setShowBankPanel(false)}
                      />

                      {/* Panel */}
                      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <div
                          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto flex flex-col"
                          style={{ maxHeight: '85vh', height: 'auto' }}
                        >
                          {/* Header */}
                          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                                <Landmark className="w-5 h-5 text-teal" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">
                                  Select a {settlementCurrency === 'GHS' ? 'Ghanaian' : 'Nigerian'} Bank
                                </h3>
                                <p className="text-xs text-slate-500">
                                  {filteredBanks.length} banks available via Breet
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowBankPanel(false)}
                              className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Search */}
                          <div className="px-5 py-3 border-b border-slate-100">
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-slate-400" />
                              </div>
                              <input
                                type="text"
                                autoFocus
                                placeholder="Search banks..."
                                value={bankQuery}
                                onChange={(e) => setBankQuery(e.target.value)}
                                className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                              />
                              {bankQuery && (
                                <button
                                  type="button"
                                  onClick={() => setBankQuery('')}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Bank list */}
                          <div className="overflow-y-auto flex-1" style={{ maxHeight: '55vh' }}>
                            {filteredBanks.length === 0 ? (
                              <div className="px-5 py-16 text-center">
                                <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500 font-medium">
                                  {bankQuery ? `No banks match "${bankQuery}"` : 'No banks loaded from Breet'}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                              </div>
                            ) : (
                              <div className="divide-y divide-slate-100">
                                {filteredBanks.map((bank) => (
                                  <button
                                    key={bank.id}
                                    type="button"
                                    onClick={() => handleSelectBank(bank)}
                                    className="flex items-center gap-4 w-full px-5 py-4 text-left hover:bg-teal-50/40 transition-colors group"
                                  >
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200">
                                      {bank.hasLogo && bank.avatar ? (
                                        <img
                                          src={bank.avatar}
                                          alt={bank.name}
                                          className="w-full h-full object-contain p-1.5"
                                        />
                                      ) : (
                                        <Landmark className="w-5 h-5 text-slate-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors truncate">
                                        {bank.name}
                                      </p>
                                      <p className="text-xs text-slate-400 truncate mt-0.5">
                                        {bank.slug
                                          ? bank.slug
                                              .replace(/-/g, ' ')
                                              .replace(/\b\w/g, (c) => c.toUpperCase())
                                          : bank.name}{' '}
                                        · {bank.currency}
                                      </p>
                                    </div>
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-teal-400 transition-colors flex-shrink-0">
                                      <div className="w-3 h-3 rounded-full bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          {filteredBanks.length > 0 && (
                            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
                              <p className="text-xs text-slate-400">
                                Showing {filteredBanks.length} {settlementCurrency} banks from Breet · Click a bank to
                                select
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label htmlFor="accountNumber" className="block text-sm font-medium text-slate-700 mb-1.5">
                Account Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="accountNumber"
                  required
                  placeholder="e.g. 0123456789"
                  value={formData.accountNumber}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  onBlur={handleAccountBlur}
                  className={cn(
                    'custom-input pr-24 font-mono tracking-wider',
                    accountError && 'error',
                    accountValid && 'border-emerald-400 ring-1 ring-emerald-400/30'
                  )}
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                  <button
                    type="button"
                    onClick={verifyAccount}
                    disabled={isVerifyingAccount || !selectedBank || formData.accountNumber.length !== 10}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                      accountValid
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {isVerifyingAccount ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : accountValid ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      'Verify'
                    )}
                  </button>
                </div>
              </div>
              {accountError && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {accountError}
                </p>
              )}
              {verifiedAccountName && accountValid && (
                <p className="mt-1.5 text-xs text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified account holder: <span className="font-semibold">{verifiedAccountName}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Settlement Configuration */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-50/50 to-transparent">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal" />
              Settlement Configuration
            </h3>
          </div>
          <div className="p-6 space-y-5">
            {/* Network-first asset selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-slate-400" />
                  Deposit Network
                </span>
              </label>
              {isLoadingAssets ? (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="w-5 h-5 rounded-full border-2 border-teal-500/30 border-t-teal-500 animate-spin" />
                  <span className="text-sm text-slate-500">Fetching supported networks from Breet...</span>
                </div>
              ) : assets.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                  No supported networks available from Breet. Check BREET_ENV configuration.
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Network grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from(new Map(assets.map((a) => [a.network, a])).values()).map((networkOption) => {
                      const isSelected = formData.network.toUpperCase() === networkOption.network.toUpperCase();
                      return (
                        <button
                          key={networkOption.network}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              network: networkOption.network,
                              assetSymbol: assets.find((a) => a.network === networkOption.network)?.symbol ?? prev.assetSymbol,
                            }))
                          }
                          className={cn(
                            'group relative flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 p-4 text-center transition-all duration-150',
                            isSelected
                              ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-white shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                          )}
                        >
                          <div
                            className={cn(
                              'w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-150',
                              isSelected ? 'scale-110' : 'group-hover:scale-105'
                            )}
                          >
                            <ChainLogo chain={networkOption.network} className="w-10 h-10" />
                          </div>
                          <div>
                            <p className={cn('text-sm font-semibold', isSelected ? 'text-teal-900' : 'text-slate-700')}>
                              {networkOption.network.replace(/_/g, ' ')}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {assets.filter((a) => a.network === networkOption.network).length} asset
                              {assets.filter((a) => a.network === networkOption.network).length > 1 ? 's' : ''}
                            </p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Asset chips for selected network */}
                  {selectedAssetGroup.length > 0 && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                        Choose asset on {formData.network.replace(/_/g, ' ')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAssetGroup.map((asset) => {
                          const isSelected =
                            formData.assetSymbol === asset.symbol &&
                            formData.network.toUpperCase() === asset.network.toUpperCase();
                          return (
                            <button
                              key={asset.assetId}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({ ...prev, assetSymbol: asset.symbol, network: asset.network }))
                              }
                              className={cn(
                                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all duration-150',
                                isSelected
                                  ? 'bg-white border-teal-500 text-teal-900 shadow-sm ring-1 ring-teal-500/20'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                              )}
                            >
                              <AssetLogo symbol={asset.symbol} className="w-5 h-5" />
                              {asset.symbol}
                              {isSelected && <Check className="w-3.5 h-3.5 text-teal" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Auto-Settlement is configured by default on the backend. */}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            <Check className="w-3 h-3 inline-block mr-1 text-teal" />
            Client created in active status with a Breet deposit wallet
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/clients')} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !accountValid || !selectedBank || !formData.name.trim() || !selectedAssetOption}
              className="btn-primary min-w-[140px]"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Client'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
