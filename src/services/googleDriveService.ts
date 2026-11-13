import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Provider with Google Drive scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
// Force Google to prompt account chooser so user can select / switch account
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory access token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const SYNC_FILE_NAME = 'sim_inventory_cloud_sync.json';

export interface CloudDriveFileMeta {
  id: string;
  name: string;
  modifiedTime?: string;
  size?: string;
  description?: string;
}

export interface InventorySyncPayload {
  appName: string;
  appVersion: string;
  schemaVersion: number;
  lastUpdated: string;
  updatedBy: string;
  userEmail: string;
  device: string;
  data: {
    users: any[];
    categories: any[];
    units: any[];
    locations: any[];
    suppliers: any[];
    departments: any[];
    items: any[];
    stockIns: any[];
    stockOuts: any[];
    adjustments: any[];
    stockOpnames: any[];
    auditLogs: any[];
    orderRequests?: any[];
    purchaseOrders?: any[];
  };
}

/**
 * Detect client device name for multi-device sync traceability
 */
export const getDeviceName = (): string => {
  if (typeof window === 'undefined' || !navigator) return 'Perangkat Browser';
  const ua = navigator.userAgent;
  let os = 'Perangkat Lain';
  if (ua.indexOf('Win') !== -1) os = 'Windows PC';
  else if (ua.indexOf('Mac') !== -1) os = 'Mac / Apple';
  else if (ua.indexOf('Android') !== -1) os = 'HP / Tablet Android';
  else if (ua.indexOf('iPhone') !== -1 || ua.indexOf('iPad') !== -1) os = 'iPhone / iPad';
  else if (ua.indexOf('Linux') !== -1) os = 'Linux';

  let browser = 'Browser';
  if (ua.indexOf('Chrome') !== -1 && ua.indexOf('Edg') === -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (ua.indexOf('Edg') !== -1) browser = 'Edge';

  return `${os} (${browser})`;
};

/**
 * Initialize Firebase Auth listener.
 */
export const initAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

/**
 * Google Sign In with Drive access token acquisition
 */
export const googleSignIn = async (forceAccountSelect = false): Promise<{ user: FirebaseUser; accessToken: string }> => {
  try {
    isSigningIn = true;
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    if (forceAccountSelect) {
      try {
        await signOut(auth);
      } catch {
        // ignore
      }
      cachedAccessToken = null;
    }

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Switch Google Account: explicitly sign out current user and open account chooser
 */
export const switchGoogleAccount = async (): Promise<{ user: FirebaseUser; accessToken: string }> => {
  return googleSignIn(true);
};

/**
 * Retrieve cached token in memory
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Set cached access token in memory
 */
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Logout from Firebase Auth and clear cached token
 */
export const logoutFromGoogle = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Search if the inventory backup file exists on the user's Google Drive
 */
export const findCloudSyncFile = async (
  token: string
): Promise<CloudDriveFileMeta | null> => {
  try {
    const query = encodeURIComponent(`name = '${SYNC_FILE_NAME}' and trashed = false`);
    const fields = encodeURIComponent('files(id, name, modifiedTime, size, description)');
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&spaces=drive`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Drive search error:', errText);
      throw new Error(`Google Drive API error: ${res.status}`);
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0] as CloudDriveFileMeta;
    }
    return null;
  } catch (err) {
    console.error('Error finding cloud sync file:', err);
    throw err;
  }
};

/**
 * Download inventory JSON content from Google Drive
 */
export const downloadCloudSyncFile = async (
  fileId: string,
  token: string
): Promise<InventorySyncPayload> => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Gagal mengunduh berkas dari Google Drive (Status: ${res.status})`);
    }

    const json = await res.json();
    return json as InventorySyncPayload;
  } catch (err) {
    console.error('Error downloading cloud sync file:', err);
    throw err;
  }
};

/**
 * Save inventory payload to Google Drive (create new or update existing file)
 */
export const saveCloudSyncFile = async (
  payload: InventorySyncPayload,
  token: string,
  existingFileId?: string | null
): Promise<{ fileId: string; modifiedTime: string }> => {
  try {
    const boundary = '-------sim_inv_boundary_' + Date.now();
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: SYNC_FILE_NAME,
      mimeType: 'application/json',
      description: `SIM Inventaris Data Sinkronisasi Multi-Device (Terakhir diperbarui oleh ${payload.updatedBy} di ${payload.device})`,
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(payload, null, 2) +
      closeDelimiter;

    let res: Response;

    if (existingFileId) {
      // Update existing file
      res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,modifiedTime`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );
    } else {
      // Create new file
      res = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gagal menyimpan ke Google Drive: ${res.status} - ${errText}`);
    }

    const result = await res.json();
    return {
      fileId: result.id,
      modifiedTime: result.modifiedTime || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Error saving to Google Drive:', err);
    throw err;
  }
};
