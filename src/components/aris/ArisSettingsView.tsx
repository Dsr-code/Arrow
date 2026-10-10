import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, ExternalLink, Save, ArrowLeft, Check, Sparkles, Key } from 'lucide-react';
import {
  type ArisProvider,
  type ArisSettings,
  PROVIDER_PRESETS,
} from '../../types/aris';
import { saveArisSettings } from '../../utils/arisClient';

interface ArisSettingsViewProps {
  settings: ArisSettings;
  onSave: (updated: ArisSettings) => void;
  onBack: () => void;
}

export function ArisSettingsView({
  settings,
  onSave,
  onBack,
}: ArisSettingsViewProps) {
  const [provider, setProvider] = useState<ArisProvider>(settings.provider);
  const [model, setModel] = useState<string>(settings.model);
  const [apiKey, setApiKey] = useState<string>(settings.apiKey);
  const [baseUrl, setBaseUrl] = useState<string>(settings.baseUrl);
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentPreset = PROVIDER_PRESETS[provider];

  const handleProviderChange = (newProvider: ArisProvider) => {
    setProvider(newProvider);
    const preset = PROVIDER_PRESETS[newProvider];
    setBaseUrl(preset.baseUrl);

    // If model is empty or was the default of another preset, switch to new preset default
    const isCurrentModelADefault = Object.values(PROVIDER_PRESETS).some(
      (p) => p.defaultModel === model
    );
    if (!model.trim() || isCurrentModelADefault) {
      setModel(preset.defaultModel);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updated: ArisSettings = {
      provider,
      model: model.trim(),
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
    };
    saveArisSettings(updated);
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onBack();
    }, 900);
  };

  return (
    <div className="h-full flex flex-col justify-between p-4 sm:p-5 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Chat</span>
          </button>
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-sky-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Provider Config
          </span>
        </div>

        <form id="aris-settings-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Provider Dropdown */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as ArisProvider)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all cursor-pointer"
            >
              {Object.values(PROVIDER_PRESETS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Model Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Model ID
              </label>
              {currentPreset?.defaultModel && model !== currentPreset.defaultModel && (
                <button
                  type="button"
                  onClick={() => setModel(currentPreset.defaultModel)}
                  className="text-[10px] text-blue-600 dark:text-sky-400 hover:underline font-semibold"
                >
                  Reset to {currentPreset.defaultModel}
                </button>
              )}
            </div>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. llama-3.3-70b-versatile, gpt-4o-mini"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {currentPreset.hint}
            </p>
            {currentPreset.freeTierNote && (
              <p className="mt-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {currentPreset.freeTierNote}
              </p>
            )}
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
                <Key className="w-3 h-3 text-blue-500" />
                <span>API Key</span>
                {!currentPreset.keyRequired && (
                  <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
                )}
              </label>

              {currentPreset.keyUrl && (
                <a
                  href={currentPreset.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-sky-400 hover:underline"
                >
                  <span>Get free API key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  currentPreset.keyRequired
                    ? `Enter ${currentPreset.name} API key...`
                    : 'Optional for local Ollama'
                }
                className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
              Stored strictly on your local browser. Never uploaded to servers or backups.
            </p>
          </div>

          {/* Base URL Input */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 text-[11px]">
              Base URL
            </label>
            <input
              type="text"
              required
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.groq.com/openai/v1"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          </div>
        </form>
      </div>

      {/* Save Button */}
      <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="aris-settings-form"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
