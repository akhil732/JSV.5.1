import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { auth } from './auth/firebaseAuth';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  size?: string;
}

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive');

// In-memory token and user caching
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;
let isSigningIn = false;

interface AuthListeners {
  onSuccess: (user: User, token: string) => void;
  onFailure: () => void;
}
const authListeners = new Set<AuthListeners>();

const notifyAuthSuccess = (user: User, token: string) => {
  authListeners.forEach((listener) => {
    try {
      listener.onSuccess(user, token);
    } catch (e) {
      console.error('[OAuth] Error in auth success listener:', e);
    }
  });
};

const notifyAuthFailure = () => {
  authListeners.forEach((listener) => {
    try {
      listener.onFailure();
    } catch (e) {
      console.error('[OAuth] Error in auth failure listener:', e);
    }
  });
};

// Helper to safely escape single quotes in Drive search query values
const escapeQuery = (str: string) => str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/**
 * Returns the cached access token or restores it from localStorage if still valid
 */
export const getCachedToken = (): string | null => {
  try {
    const storedExpiry = localStorage.getItem('sanathanam_gd_token_expiry');
    if (storedExpiry) {
      const expiryMs = parseInt(storedExpiry, 10);
      if (isNaN(expiryMs) || Date.now() >= expiryMs) {
        console.warn('[OAuth] Access token has expired or is invalid.');
        cachedAccessToken = null;
        try {
          localStorage.removeItem('sanathanam_gd_access_token');
          localStorage.removeItem('sanathanam_gd_token_expiry');
        } catch (e) {}
        return null;
      }
    }

    if (cachedAccessToken) return cachedAccessToken;

    const storedToken = localStorage.getItem('sanathanam_gd_access_token');
    if (storedToken) {
      cachedAccessToken = storedToken;
      console.log('[OAuth] Restored active access token from localStorage');
      return cachedAccessToken;
    }
  } catch (e) {
    console.error('[OAuth] Error reading token from localStorage:', e);
  }
  return null;
};

// Initialize onAuthStateChanged listener
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    console.log('[OAuth] Firebase Auth state changed: Signed in as', firebaseUser.email);
    const mappedUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
    };
    cachedUser = mappedUser;

    const token = getCachedToken();
    if (token) {
      console.log('[OAuth] OAuth access token verified for session.');
      notifyAuthSuccess(mappedUser, token);
    } else {
      console.log('[OAuth] Firebase user present. Drive token optional.');
    }
  } else {
    console.log('[OAuth] Firebase Auth state changed: Signed out.');
    cachedAccessToken = null;
    cachedUser = null;
    try {
      localStorage.removeItem('sanathanam_gd_access_token');
      localStorage.removeItem('sanathanam_gd_token_expiry');
    } catch (e) {}

    notifyAuthFailure();
  }
});

/**
 * Listen for authentication state changes and manage cached token
 */
export const initAuthListener = (
  onSuccess: (user: User, token: string) => void,
  onFailure: () => void
) => {
  const listener = { onSuccess, onFailure };
  authListeners.add(listener);

  const token = getCachedToken();
  if (cachedUser && token) {
    onSuccess(cachedUser, token);
  } else {
    if (!isSigningIn) {
      onFailure();
    }
  }

  return () => {
    authListeners.delete(listener);
  };
};

/**
 * Initiates the Google Sign-In popup to authenticate the user and retrieve Drive tokens
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  console.log('[OAuth] Initiating googleSignIn() with Drive permissions...');
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth credential.');
    }

    const accessToken = credential.accessToken;
    cachedAccessToken = accessToken;
    try {
      localStorage.setItem('sanathanam_gd_access_token', accessToken);
      localStorage.setItem('sanathanam_gd_token_expiry', (Date.now() + 50 * 60 * 1000).toString());
    } catch (e) {
      console.error('[OAuth] Failed to store access token in localStorage:', e);
    }

    const mappedUser: User = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
    };
    cachedUser = mappedUser;

    console.log('[OAuth] Google Sign-In successful for:', mappedUser.email);
    console.log('[OAuth] Access token acquired:', accessToken.substring(0, 12) + '...');

    notifyAuthSuccess(mappedUser, accessToken);

    return { user: mappedUser, accessToken };
  } catch (error: any) {
    console.error('[OAuth] Google Sign-In failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out from and clear the session / in-memory cache
 */
export const googleSignOut = async () => {
  console.log('[OAuth] googleSignOut() executed');
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
  try {
    localStorage.removeItem('sanathanam_gd_access_token');
    localStorage.removeItem('sanathanam_gd_token_expiry');
  } catch (e) {}

  notifyAuthFailure();
};

/**
 * Helper to execute authorized Google Drive REST API requests
 */
async function driveFetch(url: string, options: RequestInit = {}) {
  const token = getCachedToken();
  if (!token) {
    console.warn('[Drive API] Access token is missing or expired.');
    throw new Error('User is not authenticated or access token has expired.');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`[Drive API] API Error (${response.status}):`, errorText);
      if (response.status === 401 || response.status === 403) {
        cachedAccessToken = null;
        try {
          localStorage.removeItem('sanathanam_gd_access_token');
          localStorage.removeItem('sanathanam_gd_token_expiry');
        } catch (e) {}
        notifyAuthFailure();
        throw new Error(`Google Drive session unauthorized (${response.status}). Please reconnect Google Drive.`);
      }
      throw new Error(`Drive API Error (${response.status}): ${errorText || response.statusText}`);
    }

    return response;
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
      console.warn('[Drive API] Network request failed (Google Drive unreachable).');
      throw new Error('Google Drive API unreachable');
    }
    throw err;
  }
}

/**
 * Finds or creates a dedicated application folder on Google Drive
 */
export const getOrCreateFolder = async (folderName: string = 'Jyothishya Sanathanam Reports'): Promise<string> => {
  console.log(`[Drive API] Looking up folder '${folderName}'...`);
  const safeName = escapeQuery(folderName);
  const query = encodeURIComponent(`mimeType='application/vnd.google-apps.folder' and name='${safeName}' and trashed=false`);
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=100`;
  
  const listRes = await driveFetch(listUrl);
  const listData = await listRes.json();
  
  if (listData.files && listData.files.length > 0) {
    const existingId = listData.files[0].id;
    console.log(`[Drive API] Reusing existing folder ID: ${existingId}`);
    return existingId;
  }

  console.log(`[Drive API] Folder not found. Creating new folder '${folderName}'...`);
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const createRes = await driveFetch(createUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });
  
  const folder = await createRes.json();
  console.log(`[Drive API] Folder created. ID: ${folder.id}`);
  return folder.id;
};

/**
 * Finds or creates a nested path of folders on Google Drive
 */
export const getOrCreateNestedFolder = async (path: string[]): Promise<string> => {
  console.log(`[Drive API] Resolving nested folder path: ${path.join('/')}...`);
  let parentId: string | undefined = undefined;

  for (const folderName of path) {
    const safeName = escapeQuery(folderName);
    let query = `mimeType='application/vnd.google-apps.folder' and name='${safeName}' and trashed=false`;
    if (parentId) {
      query += ` and '${parentId}' in parents`;
    } else {
      query += ` and 'root' in parents`;
    }

    const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&pageSize=100`;
    const listRes = await driveFetch(listUrl);
    const listData = await listRes.json();

    if (listData.files && listData.files.length > 0) {
      parentId = listData.files[0].id;
      console.log(`[Drive API] Found existing folder '${folderName}' with ID: ${parentId}`);
    } else {
      console.log(`[Drive API] Folder '${folderName}' not found under parent ${parentId || 'root'}. Creating...`);
      const createUrl = 'https://www.googleapis.com/drive/v3/files';
      const metadata: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder'
      };
      if (parentId) {
        metadata.parents = [parentId];
      }

      const createRes = await driveFetch(createUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      });
      const folder = await createRes.json();
      parentId = folder.id;
      console.log(`[Drive API] Created folder '${folderName}' with ID: ${parentId}`);
    }
  }

  if (!parentId) {
    throw new Error('Failed to resolve or create nested folder path');
  }
  return parentId;
};

/**
 * Lists astrological reports (.json files) inside the application folder
 */
export const listReportsInFolder = async (folderId: string): Promise<DriveFile[]> => {
  console.log(`[Drive API] Listing files in folder ${folderId}...`);
  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,createdTime,size)&orderBy=createdTime desc&pageSize=1000`;
  
  const res = await driveFetch(url);
  const data = await res.json();
  const files = data.files || [];
  console.log(`[Drive API] Retrieved ${files.length} file(s) from Drive folder.`);
  return files;
};

/**
 * Saves a report inside the specified Google Drive folder (updates if existing to avoid duplicates)
 */
export const saveReportToDrive = async (
  folderId: string,
  filename: string,
  content: string,
  mimeType: string = 'application/json'
): Promise<DriveFile> => {
  console.log(`[Drive API] Checking if file '${filename}' already exists in folder '${folderId}'...`);
  const safeFilename = escapeQuery(filename);
  const query = encodeURIComponent(`'${folderId}' in parents and name='${safeFilename}' and trashed=false`);
  const checkUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&pageSize=10`;
  
  const checkRes = await driveFetch(checkUrl);
  const checkData = await checkRes.json();

  const boundary = 'jyothishya_boundary_delimiter';
  const firstBoundary = `--${boundary}\r\n`;
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  if (checkData.files && checkData.files.length > 0) {
    const existingFileId = checkData.files[0].id;
    console.log(`[Drive API] File '${filename}' exists (ID: ${existingFileId}). Updating content...`);

    const metadata = { name: filename, mimeType };
    const body = 
      firstBoundary +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelimiter;

    const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,mimeType,createdTime,size`;
    const res = await driveFetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: body
    });

    const updated = await res.json();
    console.log(`[Drive API] Updated file ID: ${updated.id}`);
    return updated;
  } else {
    console.log(`[Drive API] Uploading new file '${filename}' to folder '${folderId}'...`);
    const metadata = {
      name: filename,
      mimeType: mimeType,
      parents: [folderId]
    };

    const body = 
      firstBoundary +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelimiter;

    const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,createdTime,size';
    const res = await driveFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`
      },
      body: body
    });

    const created = await res.json();
    console.log(`[Drive API] Created new file ID: ${created.id}`);
    return created;
  }
};

/**
 * Retrieves the textual/json content of a file by its ID
 */
export const downloadFileContent = async (fileId: string): Promise<string> => {
  console.log(`[Drive API] Downloading file content for ID: ${fileId}...`);
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await driveFetch(url);
  const text = await res.text();
  console.log(`[Drive API] Downloaded ${text.length} bytes for file ID: ${fileId}`);
  return text;
};

/**
 * Deletes a file from Google Drive by its ID
 */
export const deleteFileFromDrive = async (fileId: string): Promise<void> => {
  console.log(`[Drive API] Deleting file ID: ${fileId}...`);
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  await driveFetch(url, {
    method: 'DELETE'
  });
  console.log(`[Drive API] Successfully deleted file ID: ${fileId}`);
};
