import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebaseAuth';
import { clearSessionToken, setSessionToken } from '../storage/authStorage';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive');

export const signInWithGoogle = async () => {
    try {
        console.log('[authService] Attempting Google sign-in with popup...');
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
            try {
                localStorage.setItem('sanathanam_gd_access_token', credential.accessToken);
                localStorage.setItem('sanathanam_gd_token_expiry', (Date.now() + 50 * 60 * 1000).toString());
            } catch (e) {
                console.error('[authService] Failed to store access token in localStorage:', e);
            }
        }
        if (result.user) {
            const token = await result.user.getIdToken();
            setSessionToken(token);
        }
        console.log('[authService] Sign-in successful:', result.user.email);
        return result;
    } catch (error) {
        console.error('[authService] Error signing in:', error);
        throw error;
    }
};

export const signOutUser = async () => {
    try {
        await signOut(auth);
        clearSessionToken();
        try {
            localStorage.removeItem('sanathanam_gd_access_token');
            localStorage.removeItem('sanathanam_gd_token_expiry');
        } catch (e) {}
    } catch (error) {
        console.error('[authService] Error signing out:', error);
        throw error;
    }
};

