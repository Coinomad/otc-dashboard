import { useEffect, useMemo, useState } from 'react';
import { Search, X, Globe, ChevronDown } from 'lucide-react';
import { COUNTRIES, Country } from '../data/countries';
import { cn } from '../lib/utils';

interface CountryPickerProps {
  value: string;
  onChange: (countryName: string) => void;
}

export function CountryPicker({ value, onChange }: CountryPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = useMemo(() => COUNTRIES.find((c) => c.name === value), [value]);

  const filtered = useMemo(() => {
    if (!query.trim()) return COUNTRIES;
    const q = query.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [query]);

  const grouped = useMemo(() => {
    const groups: Record<string, Country[]> = {};
    filtered.forEach((c) => {
      const letter = c.name[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(c);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const handleSelect = (country: Country) => {
    onChange(country.name);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <div
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-3 rounded-xl border bg-white shadow-sm transition-all duration-150 cursor-pointer px-4 py-3',
          open ? 'border-teal-500 ring-1 ring-teal-500/30' : 'border-slate-300 hover:border-slate-400'
        )}
      >
        <div className="flex-shrink-0">
          {selected ? (
            <span className="text-2xl leading-none">{selected.flag}</span>
          ) : (
            <Globe className="w-5 h-5 text-slate-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {selected ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">{selected.name}</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                {selected.code}
              </span>
            </div>
          ) : (
            <span className="text-sm text-slate-400">Select your country</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(''); }}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', open && 'rotate-180')} />
        </div>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-auto flex flex-col"
              style={{ maxHeight: '85vh' }}
            >
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-xl">
                    🌍
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Select Your Country</h3>
                    <p className="text-xs text-slate-500">{filtered.length} countries available</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-3 border-b border-slate-100">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search countries..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto flex-1" style={{ maxHeight: '55vh' }}>
                {filtered.length === 0 ? (
                  <div className="px-5 py-16 text-center">
                    <Globe className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">No countries match "{query}"</p>
                    <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {grouped.map(([letter, countries]) => (
                      <div key={letter}>
                        <div className="sticky top-0 bg-slate-50/90 backdrop-blur-sm border-b border-slate-100 px-5 py-1.5">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {letter}
                          </span>
                        </div>
                        <div className="divide-y divide-slate-50/50">
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => handleSelect(country)}
                              className={cn(
                                'flex items-center gap-3 w-full px-5 py-3 text-left transition-colors group',
                                selected?.code === country.code
                                  ? 'bg-teal-50'
                                  : 'hover:bg-teal-50/40'
                              )}
                            >
                              <span className="text-2xl flex-shrink-0 w-10 text-center">{country.flag}</span>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  'text-sm font-medium transition-colors truncate',
                                  selected?.code === country.code ? 'text-teal-700' : 'text-slate-900 group-hover:text-teal-700'
                                )}>
                                  {country.name}
                                </p>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded flex-shrink-0">
                                {country.code}
                              </span>
                              <div className={cn(
                                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                                selected?.code === country.code
                                  ? 'border-teal-500 bg-teal-500'
                                  : 'border-slate-200 group-hover:border-teal-400'
                              )}>
                                {selected?.code === country.code && (
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {filtered.length > 0 && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-xs text-slate-400">
                    {filtered.length} countries arranged alphabetically · Click to select
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
