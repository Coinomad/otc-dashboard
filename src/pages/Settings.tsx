import { useEffect, useState } from 'react';
import { Save, CheckCircle2, XCircle, Percent, Globe, Webhook } from 'lucide-react';
import { api } from '../api/client';
import { SettingsData } from '../types/api';
import { toast } from 'sonner';

export function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [markup, setMarkup] = useState('');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const response = await api.getSettings();
      setSettings(response.data);
      setMarkup(response.data.defaultMarkup.toString());
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMarkup = async () => {
    setIsSaving(true);
    try {
      const res = await api.updateMarkup(parseFloat(markup) || 0);
      setSettings((prev) => prev ? { ...prev, defaultMarkup: res.data.markupPercent } : prev);
      toast.success('Default markup updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update markup');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-2xl">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-32 rounded-xl" />
        <div className="skeleton h-32 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage system preferences</p>
      </div>

      {/* Default Markup */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <Percent className="w-5 h-5 text-slate-400" />
          <div>
            <h3 className="text-base font-semibold text-slate-900">Default Markup</h3>
            <p className="text-xs text-slate-500 mt-0.5">Applied to new clients unless overridden.</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-[200px]">
              <label htmlFor="defaultMarkup" className="block text-sm font-medium text-slate-700 mb-1.5">
                Markup Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="defaultMarkup"
                  step="0.01"
                  min="0"
                  value={markup}
                  onChange={(e) => setMarkup(e.target.value)}
                  className="custom-input pr-8"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm">%</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSaveMarkup}
              disabled={isSaving || markup === settings?.defaultMarkup.toString()}
              className="btn-primary"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Webhook Status */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <Webhook className="w-5 h-5 text-slate-400" />
          <div>
            <h3 className="text-base font-semibold text-slate-900">Webhook Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">Breet settlement event integration.</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 p-4 rounded-lg border bg-emerald-50 border-emerald-200/50">
            {settings?.webhookStatus === 'Connected' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium text-sm text-emerald-800">{settings?.webhookStatus}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Last received: Just now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Info */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <Globe className="w-5 h-5 text-slate-400" />
          <div>
            <h3 className="text-base font-semibold text-slate-900">Integration Details</h3>
            <p className="text-xs text-slate-500 mt-0.5">Your Coinomad OTC configuration.</p>
          </div>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Exchange Name</label>
          <input
            type="text"
            defaultValue={settings?.exchangeName}
            className="custom-input bg-slate-50 text-slate-500 max-w-sm"
            readOnly
          />
          <p className="mt-2 text-xs text-slate-400">Contact support to change your exchange name.</p>
        </div>
      </div>
    </div>
  );
}
