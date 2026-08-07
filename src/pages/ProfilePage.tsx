import React, { useState, useEffect } from 'react';
import { 
  User, Cloud, RefreshCw, Plus, Search, Edit3, Trash2, Eye, Download, 
  ShieldCheck, Globe, Settings, AlertTriangle, CheckCircle2, LogOut, Lock, 
  FileText, Shield
} from 'lucide-react';
import { SavedPerson } from '../types/marriageMatch';
import { ProfileStorageService } from '../lib/profileStorageService';
import { useAuth } from '../context/AuthContext';
import { googleSignIn, googleSignOut } from '../lib/googleDrive';

interface ProfilePageProps {
  savedProfiles: SavedPerson[];
  activeProfile: SavedPerson | null;
  onSelectActiveProfile: (profile: SavedPerson) => void;
  onCreateNewProfile: () => void;
  onEditProfile: (profile: SavedPerson) => void;
  onDeleteProfile: (id: string) => void;
  onNavigatePage: (page: 'home' | 'birth-chart' | 'marriage-match' | 'ai-consultation' | 'profile') => void;
  language: 'en' | 'hi' | 'te';
  onLanguageChange: (lang: 'en' | 'hi' | 'te') => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  savedProfiles,
  activeProfile,
  onSelectActiveProfile,
  onCreateNewProfile,
  onEditProfile,
  onDeleteProfile,
  onNavigatePage,
  language,
  onLanguageChange,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'degraded' | 'idle'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const [defaultChartStyle, setDefaultChartStyle] = useState<'south-indian' | 'north-indian'>(
    (localStorage.getItem('sanathanam_chart_style') as any) || 'south-indian'
  );

  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Sync Handler
  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncError(null);
    try {
      await ProfileStorageService.syncFromDrive();
      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error(err);
      setSyncStatus('degraded');
      setSyncError('Connected, but sync is delayed. Tap to retry.');
    } finally {
      setSyncing(false);
    }
  };

  const handleChartStyleChange = (style: 'south-indian' | 'north-indian') => {
    setDefaultChartStyle(style);
    localStorage.setItem('sanathanam_chart_style', style);
  };

  // Export all data as JSON file
  const handleExportAllData = () => {
    const backupObj = {
      exportDate: new Date().toISOString(),
      activeProfile,
      savedProfiles,
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Jyothishya_Sanathanam_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  // Delete Account Confirmation
  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear your local saved profiles and reset app data? This action cannot be undone."
    );
    if (confirmed) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const filteredProfiles = savedProfiles.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.place.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = genderFilter === 'All' || p.gender === genderFilter;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto px-3 sm:px-4 pt-3">
      
      {/* 1. USER ACCOUNT CARD */}
      <div className="bg-ds-surface border border-ds-secondary/15 rounded-ds-xl p-4 sm:p-5 shadow-ds-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-ds-xl border-2 border-ds-primary/30 object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-ds-xl bg-ds-secondary text-ds-on-secondary flex items-center justify-center font-bold text-lg font-serif shrink-0">
                {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
              </div>
            )}

            <div>
              <h2 className="font-serif font-bold text-lg text-ds-secondary">
                {user?.displayName || 'Jyothishya Sanathanam User'}
              </h2>
              <p className="text-xs text-ds-on-surface-variant">
                {user?.email || 'Local Offline Mode (Google Login Available)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {isAuthenticated ? (
              <button
                onClick={() => googleSignOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-ds-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => googleSignIn()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-ds-lg bg-ds-secondary hover:brightness-110 text-ds-on-secondary text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-ds-tertiary" />
                <span>Google Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CLOUD SYNC CARD (SINGLE SOURCE OF TRUTH FOR SYNC) */}
      <div className="bg-ds-surface border border-ds-secondary/15 rounded-ds-xl p-4 sm:p-5 shadow-ds-sm space-y-3">
        <div className="flex items-center justify-between border-b border-ds-secondary/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-ds-lg bg-ds-primary/10 text-ds-primary">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-ds-secondary">
                Google Drive Cloud Sync
              </h3>
              <p className="text-xs text-ds-on-surface-variant">
                Centralized sync status for all saved birth charts & reports
              </p>
            </div>
          </div>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-ds-primary hover:brightness-110 text-ds-on-primary rounded-ds-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>

        {/* Sync Status Readout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {syncStatus === 'degraded' ? (
              <span className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded-ds-md border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{syncError || 'Sync degraded - Click Sync Now to retry'}</span>
              </span>
            ) : syncStatus === 'synced' ? (
              <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded-ds-md border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Connected & Up to Date ({savedProfiles.length} Charts Synced)</span>
              </span>
            ) : (
              <span className="text-ds-on-surface-variant font-medium">
                Connected to Google Drive · {savedProfiles.length} Charts Available
              </span>
            )}
          </div>

          {lastSyncTime && (
            <span className="text-[11px] text-ds-on-surface-variant font-mono">
              Last synced: {lastSyncTime}
            </span>
          )}
        </div>
      </div>

      {/* 3. SAVED CHARTS (LIST & MANAGEMENT) */}
      <div className="bg-ds-surface border border-ds-secondary/15 rounded-ds-xl p-4 sm:p-5 shadow-ds-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-base text-ds-secondary flex items-center gap-2">
              <span>Saved Birth Charts</span>
              <span className="bg-ds-primary/10 text-ds-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {savedProfiles.length}
              </span>
            </h3>
            <p className="text-xs text-ds-on-surface-variant">Manage, view, edit, or delete saved chart profiles</p>
          </div>

          <button
            onClick={onCreateNewProfile}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-ds-primary hover:brightness-110 text-ds-on-primary rounded-ds-lg text-xs font-semibold transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Chart</span>
          </button>
        </div>

        {/* Search & Gender Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-ds-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by name or place..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-ds-surface-container border border-ds-secondary/20 rounded-ds-lg text-ds-secondary focus:border-ds-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-ds-surface-container p-1 rounded-ds-lg border border-ds-secondary/15 self-start sm:self-auto">
            {(['All', 'Male', 'Female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`px-3 py-1 text-xs font-semibold rounded-ds-md transition-colors cursor-pointer ${
                  genderFilter === g
                    ? 'bg-ds-secondary text-ds-on-secondary'
                    : 'text-ds-on-surface-variant hover:bg-ds-surface'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Profiles Table / List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {filteredProfiles.length === 0 ? (
            <div className="text-center py-8 text-xs text-ds-on-surface-variant">
              No saved birth charts match your query.
            </div>
          ) : (
            filteredProfiles.map((p) => {
              const isActive = activeProfile?.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-ds-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-ds-primary/10 border-ds-primary/40 shadow-2xs'
                      : 'bg-ds-surface-container border-ds-secondary/10 hover:border-ds-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-ds-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                      isActive ? 'bg-ds-primary text-ds-on-primary' : 'bg-ds-secondary/10 text-ds-secondary'
                    }`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-ds-secondary truncate">{p.name}</span>
                        {isActive && (
                          <span className="text-[10px] font-bold text-ds-primary bg-ds-surface px-1.5 py-0.2 rounded border border-ds-primary/30">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ds-on-surface-variant truncate">
                        {p.date} · {p.time.substring(0, 5)} · {p.place}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        onSelectActiveProfile(p);
                        onNavigatePage('birth-chart');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-ds-surface border border-ds-secondary/20 rounded-ds-md text-xs font-semibold text-ds-secondary hover:border-ds-primary cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-ds-primary" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => onEditProfile(p)}
                      className="p-1.5 bg-ds-surface border border-ds-secondary/20 rounded-ds-md text-xs font-semibold text-ds-secondary hover:border-ds-primary cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-ds-on-surface-variant" />
                    </button>

                    <button
                      onClick={() => onDeleteProfile(p.id)}
                      className="p-1.5 bg-ds-surface border border-rose-200 rounded-ds-md text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. PREFERENCES */}
      <div className="bg-ds-surface border border-ds-secondary/15 rounded-ds-xl p-4 sm:p-5 shadow-ds-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-ds-secondary border-b border-ds-secondary/10 pb-2 flex items-center gap-2">
          <Settings className="w-4 h-4 text-ds-primary" />
          <span>App Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Language Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ds-on-surface-variant uppercase tracking-wider block">
              Default Language
            </label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as any)}
              className="w-full text-xs bg-ds-surface-container border border-ds-secondary/20 rounded-ds-lg p-2 font-semibold text-ds-secondary focus:border-ds-primary"
            >
              <option value="en">English (EN)</option>
              <option value="te">తెలుగు (TE)</option>
              <option value="hi">हिंदी (HI)</option>
            </select>
          </div>

          {/* Chart Style Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ds-on-surface-variant uppercase tracking-wider block">
              Default Chart Style
            </label>
            <select
              value={defaultChartStyle}
              onChange={(e) => handleChartStyleChange(e.target.value as any)}
              className="w-full text-xs bg-ds-surface-container border border-ds-secondary/20 rounded-ds-lg p-2 font-semibold text-ds-secondary focus:border-ds-primary"
            >
              <option value="south-indian">South Indian Style</option>
              <option value="north-indian">North Indian Style</option>
            </select>
          </div>

          {/* Ayanamsha Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ds-on-surface-variant uppercase tracking-wider block">
              Ayanamsha Calculation
            </label>
            <input
              type="text"
              readOnly
              value="Lahiri (Chitrapaksha)"
              className="w-full text-xs bg-ds-surface-container border border-ds-secondary/20 rounded-ds-lg p-2 font-mono font-semibold text-ds-secondary cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* 5. DATA & PRIVACY */}
      <div className="bg-ds-surface border border-ds-secondary/15 rounded-ds-xl p-4 sm:p-5 shadow-ds-sm space-y-4">
        <h3 className="font-serif font-bold text-base text-ds-secondary border-b border-ds-secondary/10 pb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-ds-primary" />
          <span>Data Management & Privacy</span>
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={handleExportAllData}
            className="flex items-center gap-2 px-4 py-2 bg-ds-surface-container hover:bg-ds-surface border border-ds-secondary/20 text-ds-secondary text-xs font-semibold rounded-ds-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-ds-primary" />
            <span>Export All My Data (JSON)</span>
          </button>

          <button
            onClick={() => setShowPrivacyPolicy(!showPrivacyPolicy)}
            className="text-xs font-semibold text-ds-secondary hover:underline cursor-pointer"
          >
            Privacy Policy
          </button>

          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-ds-lg transition-colors cursor-pointer ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset / Clear Local Data</span>
          </button>
        </div>

        {/* Privacy Policy Accordion */}
        {showPrivacyPolicy && (
          <div className="p-4 bg-ds-surface-container rounded-ds-lg border border-ds-secondary/10 space-y-2 text-xs text-ds-on-surface-variant animate-in fade-in duration-150">
            <h4 className="font-serif font-bold text-sm text-ds-secondary">Privacy Policy & Data Security</h4>
            <p>
              Jyothishya Sanathanam respects user privacy. Your birth coordinates and personal details are stored directly on your device and optionally backed up to your personal Google Drive account.
            </p>
            <p>
              We do not track or sell your personal astrological data to third parties.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
