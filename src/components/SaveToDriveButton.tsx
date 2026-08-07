import React, { useState, useEffect } from 'react';
import { Check, Loader2, Save } from 'lucide-react';
import { 
  googleSignIn, 
  initAuthListener, 
  User
} from '../lib/googleDrive';
import { DriveSyncService } from '../lib/driveSyncService';
import { BirthDetails } from '../types';
import { Button } from './design-system/Button';

interface SaveToDriveButtonProps {
  birthDetails: BirthDetails;
  horoscopeData: any;
  language: 'en' | 'hi' | 'te';
  onReportSaved?: () => void;
  onSaveLocally?: () => void;
}

const SAVE_TRANSLATIONS = {
  en: {
    saveBtn: "Save",
    saveSuccess: "Saved!",
    saving: "Saving...",
    signInSave: "Sign In & Save",
    confirmMsg: "Would you like to save the astrological chart of {name} ({date})?",
    errorMsg: "Save failed. Please try again."
  },
  hi: {
    saveBtn: "सहेजें",
    saveSuccess: "सहेजा गया!",
    saving: "सहेजा जा रहा है...",
    signInSave: "साइन इन और सहेजें",
    confirmMsg: "क्या आप {name} ({date}) के ज्योतिष चार्ट को सहेजना चाहते हैं?",
    errorMsg: "सहेजना विफल रहा। कृपया पुन: प्रयास करें।"
  },
  te: {
    saveBtn: "సేవ్ చేయి",
    saveSuccess: "సేవ్ అయింది!",
    saving: "సేవ్ అవుతోంది...",
    signInSave: "సైన్ ఇన్ & సేవ్ చేయి",
    confirmMsg: "మీరు {name} ({date}) జ్యోతిష్య చార్ట్‌ను సేవ్ చేయాలనుకుంటున్నారా?",
    errorMsg: "సేవ్ చేయడం విఫలమైంది. మళ్లీ ప్రయత్నించండి."
  }
};

export const SaveToDriveButton: React.FC<SaveToDriveButtonProps> = ({
  birthDetails,
  horoscopeData,
  language,
  onReportSaved,
  onSaveLocally
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const labels = SAVE_TRANSLATIONS[language] || SAVE_TRANSLATIONS.en;

  useEffect(() => {
    const unsubscribe = initAuthListener(
      (firebaseUser) => setUser(firebaseUser),
      () => setUser(null)
    );
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setStatus('idle');
    
    // Explicit user confirmation before saving user data (MANDATORY)
    const formattedConfirm = labels.confirmMsg
      .replace('{name}', birthDetails.name)
      .replace('{date}', birthDetails.date);
      
    const confirmed = window.confirm(formattedConfirm);
    if (!confirmed) return;

    setLoading(true);
    setStatus('saving');
    try {
      let activeUser = user;
      
      // If not logged in, trigger Google Sign-In inline
      if (!activeUser) {
        const result = await googleSignIn();
        if (result) {
          activeUser = result.user;
          setUser(activeUser);
        } else {
          throw new Error("Authentication failed");
        }
      }

      // Upload report to Google Drive via DriveSyncService
      await DriveSyncService.uploadReport({ birthDetails, horoscopeData });
      
      // Trigger local save if callback provided
      if (onSaveLocally) {
        onSaveLocally();
      }
      
      setStatus('success');
      if (onReportSaved) {
        onReportSaved();
      }
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      console.error('Error saving to drive:', err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    } finally {
      setLoading(false);
    }
  };

  const getButtonProps = () => {
    if (status === 'success') return { variant: 'secondary' as const, className: 'border-ds-success-green text-ds-success-green hover:bg-ds-success-green/10' };
    if (status === 'error') return { variant: 'secondary' as const, className: 'border-ds-error-crimson text-ds-error-crimson hover:bg-ds-error-crimson/10' };
    return { variant: 'secondary' as const, className: '' };
  };

  const { variant, className } = getButtonProps();

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleSave}
      isLoading={loading}
      className={className}
      icon={status === 'success' ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
      title={user ? labels.saveBtn : labels.signInSave}
    />
  );
};
