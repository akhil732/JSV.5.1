import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cloud, 
  CloudRain, 
  Trash2, 
  LogOut, 
  RefreshCw, 
  FileJson, 
  Check, 
  Loader2, 
  UploadCloud
} from 'lucide-react';
import { 
  googleSignIn, 
  googleSignOut, 
  initAuthListener, 
  DriveFile,
  User
} from '../lib/googleDrive';
import { DriveSyncService } from '../lib/driveSyncService';
import { BirthDetails, PastReport } from '../types';

interface GoogleDriveSyncProps {
  language: 'en' | 'hi' | 'te';
  onReportLoaded: (birthDetails: BirthDetails, horoscopeData: any) => void;
  localReports: PastReport[];
  onLocalReportsImported: (importedReports: PastReport[]) => void;
}

const GD_TRANSLATIONS = {
  en: {
    title: "Google Drive Sync",
    subtitle: "Astral Cloud Storage",
    desc: "Connect your Google account to save reports in your private Drive, load them on other devices, and backup your local history.",
    signIn: "Sign in with Google",
    signOut: "Sign Out",
    connectedAs: "Connected as",
    cloudFiles: "Cloud Documents",
    backupHistory: "Backup Local History",
    backupSuccess: "Local history backed up to Google Drive!",
    refresh: "Refresh Files",
    loading: "Accessing Google Drive...",
    noFiles: "No cloud records found in your Drive folder.",
    deleteConfirm: "Are you sure you want to delete this astrological record from Google Drive? This action is permanent.",
    loadSuccess: "Report loaded from Google Drive!",
    savingToCloud: "Saving report...",
    errorGeneric: "Unable to sync with Google Drive. Please try again.",
    syncFolder: "Saves inside 'Jyothishya Sanathanam Reports' folder"
  },
  hi: {
    title: "गूगल ड्राइव सिंक",
    subtitle: "खगोलीय क्लाउड स्टोरेज",
    desc: "अपने निजी ड्राइव में ज्योतिष रिपोर्ट सहेजने, उन्हें अन्य उपकरणों पर लोड करने और अपने स्थानीय इतिहास का बैकअप लेने के लिए गूगल से जुड़ें।",
    signIn: "गूगल के साथ साइन-इन करें",
    signOut: "साइन आउट",
    connectedAs: "कनेक्टेड:",
    cloudFiles: "क्लाउड दस्तावेज़",
    backupHistory: "स्थानीय इतिहास का बैकअप लें",
    backupSuccess: "स्थानीय इतिहास गूगल ड्राइव में सहेजा गया!",
    refresh: "दस्तावेज़ ताज़ा करें",
    loading: "गूगल ड्राइव एक्सेस कर रहा है...",
    noFiles: "आपके ड्राइव फोल्डर में कोई क्लाउड रिकॉर्ड नहीं मिला।",
    deleteConfirm: "क्या आप वाकई इस ज्योतिष रिकॉर्ड को गूगल ड्राइव से हटाना चाहते हैं? यह स्थायी है।",
    loadSuccess: "गूगल ड्राइव से रिपोर्ट लोड हो गई!",
    savingToCloud: "रिपोर्ट सहेज रहा है...",
    errorGeneric: "गूगल ड्राइव से सिंक करने में असमर्थ। कृपया पुनः प्रयास करें।",
    syncFolder: "'Jyothishya Sanathanam Reports' फोल्डर में सहेजता है"
  },
  te: {
    title: "గూగుల్ డ్రైవ్ సింక్",
    subtitle: "జ్యోతిష్య క్లౌడ్ నిల్వ",
    desc: "మీ ప్రైవేట్ డ్రైవ్‌లో నివేదికలను సేవ్ చేయడానికి, ఇతర పరికరాలలో లోడ్ చేయడానికి మరియు మీ లోకల్ హిస్టరీని బ్యాకప్ చేయడానికి గూగుల్ అకౌంట్‌ను కనెక్ట్ చేయండి.",
    signIn: "గూగుల్ ద్వారా సైన్ ఇన్ చేయండి",
    signOut: "సైన్ అవుట్",
    connectedAs: "కనెక్ట్ చేయబడింది:",
    cloudFiles: "క్లౌడ్ పత్రాలు",
    backupHistory: "లోకల్ హిస్టరీ బ్యాకప్",
    backupSuccess: "లోకల్ హిస్టరీ గూగుల్ డ్రైవ్‌లో భద్రపరచబడింది!",
    refresh: "రిఫ్రెష్ చేయండి",
    loading: "గూగుల్ డ్రైవ్ యాక్సెస్ అవుతోంది...",
    noFiles: "మీ డ్రైవ్ ఫోల్డర్‌లో క్లౌడ్ పత్రాలు ఏవీ లేవు.",
    deleteConfirm: "గూగుల్ డ్రైవ్ నుండి ఈ జ్యోతిష్య నివేదికను తొలగించాలనుకుంటున్నారా? ఇది శాశ్వతమైనది.",
    loadSuccess: "గూగుల్ డ్రైవ్ నుండి నివేదిక లోడ్ చేయబడింది!",
    savingToCloud: "నివేదిక సేవ్ అవుతోంది...",
    errorGeneric: "గూగుల్ డ్రైవ్‌తో అనుసంధానం కుదరలేదు. మళ్లీ ప్రయత్నించండి.",
    syncFolder: "'Jyothishya Sanathanam Reports' ఫోల్డర్‌లో నిల్వ చేయబడుతుంది"
  }
};

export const GoogleDriveSync: React.FC<GoogleDriveSyncProps> = ({
  language,
  onReportLoaded,
  localReports,
  onLocalReportsImported
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [backingUp, setBackingUp] = useState<boolean>(false);

  const labels = GD_TRANSLATIONS[language] || GD_TRANSLATIONS.en;

  // Load files from Google Drive using DriveSyncService
  const fetchCloudFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const driveFiles = await DriveSyncService.listReports();
      setFiles(driveFiles);
    } catch (err: any) {
      console.error(err);
      setError(`${labels.errorGeneric} (${err.message || err})`);
    } finally {
      setLoading(false);
    }
  }, [labels.errorGeneric]);

  // Handle auth callback success
  const handleAuthSuccess = useCallback(async (firebaseUser: User, token: string) => {
    setUser(firebaseUser);
    setError(null);
    if (!token) return;
    setLoading(true);
    try {
      await fetchCloudFiles();
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError(`${labels.errorGeneric} (${err.message || err})`);
    } finally {
      setLoading(false);
    }
  }, [fetchCloudFiles, labels.errorGeneric]);

  // Handle auth callback failure
  const handleAuthFailure = useCallback(() => {
    setUser(null);
    setFiles([]);
  }, []);

  // Set up authentication observer
  useEffect(() => {
    const unsubscribe = initAuthListener(handleAuthSuccess, handleAuthFailure);
    return () => unsubscribe();
  }, [handleAuthSuccess, handleAuthFailure]);

  const handleSignIn = async () => {
    setError(null);
    try {
      // Initiate sign-in synchronously inside the user-gesture click handler thread to prevent popup blocking
      const result = await googleSignIn();
      setLoading(true);
      if (result) {
        await handleAuthSuccess(result.user, result.accessToken);
        const synced = await DriveSyncService.syncFromDrive();
        if (onLocalReportsImported) {
          onLocalReportsImported(synced);
        }
      }
    } catch (err: any) {
      console.error('Sign in failed:', err);
      if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked by your browser. Please allow popups for this site, or open the app in a new tab using the button at the top-right of the AI Studio preview.");
      } else if (err.code === 'auth/web-storage-unsupported') {
        setError("Third-party cookies/storage are restricted in this preview frame. Please open the app in a new tab (click the 'Open in new tab' button at the top-right of the AI Studio preview) to sign in successfully.");
      } else {
        setError(`${labels.errorGeneric} (${err.message || err})`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await googleSignOut();
      handleAuthFailure();
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchCloudFiles();
  };

  const handleLoadFile = async (fileId: string) => {
    setLoading(true);
    setError(null);
    try {
      const parsed = await DriveSyncService.downloadReport(fileId);
      
      if (parsed.birthDetails && parsed.horoscopeData) {
        onReportLoaded(parsed.birthDetails, parsed.horoscopeData);
        setSuccessMsg(labels.loadSuccess);
        setTimeout(() => setSuccessMsg(null), 3500);
      } else if ((parsed as any).horoscope) {
        const birthDetailsDummy: BirthDetails = {
          name: (parsed as any).horoscope.name || "Cloud Saved Report",
          gender: "Male",
          date: (parsed as any).horoscope.calendar_info?.date_str || "1990-01-01",
          time: "12:00:00",
          approximateTime: false,
          place: "Unknown Location",
          latitude: 13.0,
          longitude: 80.0,
          timezone: 5.5
        };
        onReportLoaded(birthDetailsDummy, parsed);
        setSuccessMsg(labels.loadSuccess);
        setTimeout(() => setSuccessMsg(null), 3500);
      } else {
        throw new Error("Invalid chart data structure");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to parse astrological file from Google Drive.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Explicit User Confirmation before deleting a Google Drive file (MANDATORY)
    const confirmed = window.confirm(`${labels.deleteConfirm}\n\nFile: ${filename}`);
    if (!confirmed) return;

    setLoading(true);
    setError(null);
    try {
      await DriveSyncService.deleteReport(fileId);
      setFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete file from Google Drive.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackupHistory = async () => {
    if (localReports.length === 0) return;

    const confirmed = window.confirm(`Do you want to upload all ${localReports.length} local reports to Google Drive?`);
    if (!confirmed) return;

    setBackingUp(true);
    setError(null);
    try {
      let count = 0;
      for (const report of localReports) {
        await DriveSyncService.uploadReport({
          birthDetails: report.birthDetails,
          horoscopeData: report.horoscopeData,
          timestamp: report.timestamp
        });
        count++;
      }
      
      setSuccessMsg(`Uploaded ${count} report(s) to Google Drive!`);
      setTimeout(() => setSuccessMsg(null), 4000);
      await fetchCloudFiles();
    } catch (err) {
      console.error(err);
      setError("Error during cloud backup operation.");
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="rounded-ds-xl border border-ds-outline bg-ds-surface p-6 shadow-ds-lg space-y-5">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ds-outline pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-ds-md bg-ds-primary/10 flex items-center justify-center border border-ds-primary/20" aria-hidden="true">
            <Cloud className="w-4 h-4 text-ds-primary" />
          </div>
          <div>
            <h3 className="text-base font-semibold font-serif text-ds-on-surface">{labels.title}</h3>
            <p className="text-[9px] font-mono tracking-widest text-ds-on-surface-variant uppercase">{labels.subtitle}</p>
          </div>
        </div>

        {user && (
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-1.5 rounded-ds-md border border-ds-outline bg-ds-surface-variant/40 hover:bg-ds-surface-variant text-ds-on-surface-variant hover:text-ds-on-surface transition-all cursor-pointer disabled:opacity-50 focus-ring"
            title={labels.refresh}
            aria-label={labels.refresh}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading && !backingUp ? 'animate-spin text-ds-primary' : ''}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Success or Error states */}
      {successMsg && (
        <div className="p-3 bg-ds-success-green/10 border border-ds-success-green/25 rounded-ds-lg text-xs text-ds-success-green flex items-center gap-2 font-mono" role="status">
          <Check className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-ds-error-crimson/10 border border-ds-error-crimson/25 rounded-ds-lg text-xs text-ds-error-crimson font-mono" role="alert">
          {error}
        </div>
      )}

      {/* Unauthenticated State */}
      {!user ? (
        <div className="space-y-4">
          <p className="text-xs text-ds-on-surface-variant leading-relaxed">
            {labels.desc}
          </p>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-ds-on-surface text-ds-surface hover:bg-ds-on-surface/90 font-semibold py-2.5 px-4 rounded-ds-lg transition-all cursor-pointer shadow-ds-md disabled:opacity-50 text-xs font-mono focus-ring"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-ds-surface" aria-hidden="true" />
            ) : (
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4" aria-hidden="true">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
            )}
            <span>{labels.signIn}</span>
          </button>

          <div className="text-[10px] text-center text-ds-on-surface-variant/80 font-mono italic">
            * {labels.syncFolder}
          </div>
        </div>
      ) : (
        /* Authenticated State */
        <div className="space-y-4">
          
          {/* User profile & Sign Out */}
          <div className="flex items-center justify-between p-3 rounded-ds-lg bg-ds-surface-variant/60 border border-ds-outline gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Google user'} 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full border border-ds-primary/30"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-ds-primary/20 flex items-center justify-center font-bold text-ds-primary text-xs font-mono" aria-hidden="true">
                  {(user.displayName || user.email || 'G')[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-ds-on-surface truncate">{user.displayName || 'Authenticated User'}</p>
                <p className="text-[10px] text-ds-on-surface-variant font-mono truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-ds-md text-ds-on-surface-variant hover:text-ds-error-crimson hover:bg-ds-error-crimson/10 transition-all cursor-pointer shrink-0 focus-ring"
              title={labels.signOut}
              aria-label={labels.signOut}
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Backup Action Bar (if local records exist) */}
          {localReports.length > 0 && (
            <button
              onClick={handleBackupHistory}
              disabled={backingUp || loading}
              className="w-full py-2 px-3 border border-dashed border-ds-primary/30 hover:border-ds-primary hover:bg-ds-primary/5 rounded-ds-lg transition-all flex items-center justify-center gap-2 text-xs font-mono text-ds-primary cursor-pointer disabled:opacity-50 focus-ring"
            >
              {backingUp ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: '3s' }} aria-hidden="true" />
              )}
              <span>{labels.backupHistory} ({localReports.length})</span>
            </button>
          )}

          {/* Cloud documents title */}
          <div className="text-[11px] font-mono tracking-wider uppercase text-ds-on-surface-variant font-bold pb-1 flex items-center justify-between">
            <span>{labels.cloudFiles}</span>
            <span className="text-[10px] text-ds-primary font-semibold">{files.length}</span>
          </div>

          {/* Cloud Documents List */}
          {loading && files.length === 0 ? (
            <div className="py-8 text-center text-xs text-ds-on-surface-variant font-mono flex flex-col items-center justify-center gap-2" role="status">
              <Loader2 className="w-5 h-5 text-ds-primary animate-spin" aria-hidden="true" />
              <span>{labels.loading}</span>
            </div>
          ) : files.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-ds-outline rounded-ds-lg bg-ds-surface-variant/40">
              <CloudRain className="w-8 h-8 text-ds-on-surface-variant mx-auto mb-2" aria-hidden="true" />
              <p className="text-xs text-ds-on-surface-variant leading-relaxed">{labels.noFiles}</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1" role="list">
              {files.map((file) => {
                let displayName = file.name;
                if (displayName.startsWith('Jyothishya_Report_')) {
                  displayName = displayName.replace('Jyothishya_Report_', '').replace('.json', '').replace(/_/g, ' ');
                }

                return (
                  <div
                    key={file.id}
                    onClick={() => handleLoadFile(file.id)}
                    className="group p-2.5 bg-ds-surface-variant/80 hover:bg-ds-surface-container border border-ds-outline hover:border-ds-primary/35 rounded-ds-lg transition-all cursor-pointer flex items-center justify-between gap-3 focus-ring"
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleLoadFile(file.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <FileJson className="w-4 h-4 text-ds-primary/80 shrink-0" aria-hidden="true" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-ds-on-surface group-hover:text-ds-primary transition-colors truncate">
                          {displayName}
                        </h4>
                        <p className="text-[9px] font-mono text-ds-on-surface-variant/70">
                          {new Date(file.createdTime).toLocaleDateString(undefined, { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleDeleteFile(file.id, file.name, e)}
                        className="p-1 text-ds-on-surface-variant hover:text-ds-error-crimson hover:bg-ds-error-crimson/10 rounded-ds-sm transition-all cursor-pointer focus-ring"
                        title="Delete from cloud"
                        aria-label={`Delete ${displayName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-[10px] text-center text-ds-on-surface-variant/80 font-mono">
            Files stored securely in Drive directory.
          </div>
        </div>
      )}
    </div>
  );
};
