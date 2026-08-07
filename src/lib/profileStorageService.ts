import { 
  getCachedToken, 
  getOrCreateNestedFolder, 
  saveReportToDrive, 
  listReportsInFolder, 
  downloadFileContent, 
  deleteFileFromDrive,
  DriveFile
} from './googleDrive';
import { SavedPerson } from '../types/marriageMatch';
import { safeSetLocalStorageItem } from './storageUtils';

type ProfileListener = (profiles: SavedPerson[], syncing: boolean, error: string | null) => void;

const STORAGE_KEY = 'sanathanam_saved_persons';

export class ProfileStorageService {
  private static listeners: Set<ProfileListener> = new Set();
  private static isSyncing: boolean = false;
  private static lastError: string | null = null;
  private static cachedProfiles: SavedPerson[] = [];

  /**
   * Preloads the 20 family profiles from the Satyam family Excel sheet
   */
  private static preloadFamilyProfiles(): void {
    try {
      const preloadedKey = 'sanathanam_family_profiles_preloaded_v1';
      if (localStorage.getItem(preloadedKey) === 'true') {
        return;
      }

      console.log('[ProfileStorageService] Preloading Satyam family profiles...');
      const existingData = localStorage.getItem(STORAGE_KEY);
      let existingProfiles: SavedPerson[] = [];
      if (existingData) {
        try {
          const parsed = JSON.parse(existingData);
          if (Array.isArray(parsed)) {
            existingProfiles = parsed;
          }
        } catch (e) {
          console.error('[ProfileStorageService] Error parsing existing profiles:', e);
        }
      }

      const now = Date.now();
      const preloaded: SavedPerson[] = [
        {
          id: "satyam-family-0",
          name: "I. SATYAM",
          gender: "Male",
          date: "1945-01-07",
          time: "01:26:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 0 * 60000
        },
        {
          id: "satyam-family-1",
          name: "I. MEENAKSHI",
          gender: "Female",
          date: "1949-08-08",
          time: "11:00:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 1 * 60000
        },
        {
          id: "satyam-family-2",
          name: "CH.VALLI",
          gender: "Female",
          date: "1969-02-06",
          time: "07:50:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 2 * 60000
        },
        {
          id: "satyam-family-3",
          name: "I KesavaViswanadh",
          gender: "Male",
          date: "1979-09-16",
          time: "11:00:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 3 * 60000
        },
        {
          id: "satyam-family-4",
          name: "I. Meenakshi (Rani)",
          gender: "Female",
          date: "1988-08-07",
          time: "09:01:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 4 * 60000
        },
        {
          id: "satyam-family-5",
          name: "I.Sarvani",
          gender: "Female",
          date: "2006-01-02",
          time: "07:40:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 5 * 60000
        },
        {
          id: "satyam-family-6",
          name: "I.Sarnaya",
          gender: "Female",
          date: "2010-03-06",
          time: "06:25:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 6 * 60000
        },
        {
          id: "satyam-family-7",
          name: "Ch. Vijaya",
          gender: "Female",
          date: "1991-04-25",
          time: "03:36:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 7 * 60000
        },
        {
          id: "satyam-family-8",
          name: "I. Gopal",
          gender: "Male",
          date: "1972-02-14",
          time: "09:50:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 8 * 60000
        },
        {
          id: "satyam-family-9",
          name: "I. KALYANI",
          gender: "Female",
          date: "1977-02-24",
          time: "11:00:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 9 * 60000
        },
        {
          id: "satyam-family-10",
          name: "I. Akhil",
          gender: "Male",
          date: "1996-11-11",
          time: "13:50:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 10 * 60000
        },
        {
          id: "satyam-family-11",
          name: "I.Meghana",
          gender: "Female",
          date: "1998-01-20",
          time: "03:05:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 11 * 60000
        },
        {
          id: "satyam-family-12",
          name: "S. Sushma",
          gender: "Female",
          date: "2001-06-10",
          time: "18:40:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 12 * 60000
        },
        {
          id: "satyam-family-13",
          name: "I. VISWANADH",
          gender: "Male",
          date: "1974-01-10",
          time: "15:41:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 13 * 60000
        },
        {
          id: "satyam-family-14",
          name: "I. Sridevi",
          gender: "Female",
          date: "1981-08-02",
          time: "09:00:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 14 * 60000
        },
        {
          id: "satyam-family-15",
          name: "D. Amruta",
          gender: "Female",
          date: "2001-12-13",
          time: "08:40:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 15 * 60000
        },
        {
          id: "satyam-family-16",
          name: "I .Aditya",
          gender: "Male",
          date: "2003-03-19",
          time: "11:56:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 16 * 60000
        },
        {
          id: "satyam-family-17",
          name: "CH.BHASKARA SARMA",
          gender: "Male",
          date: "1969-07-13",
          time: "00:00:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 17 * 60000
        },
        {
          id: "satyam-family-18",
          name: "CH. VATSALA",
          gender: "Female",
          date: "1978-05-03",
          time: "11:20:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 18 * 60000
        },
        {
          id: "satyam-family-19",
          name: "CH.Lakshman",
          gender: "Male",
          date: "1996-06-14",
          time: "01:12:00",
          place: "Jaggampeta",
          latitude: 17.17,
          longitude: 82.0611,
          timezone: 5.5,
          timestamp: now - 19 * 60000
        }
      ];

      const mergedList = [...existingProfiles];
      for (const p of preloaded) {
        const isDup = mergedList.some(emp => 
          emp.name.toLowerCase() === p.name.toLowerCase() && 
          emp.date === p.date
        );
        if (!isDup) {
          mergedList.push(p);
        }
      }

      // Sort by recency
      mergedList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      safeSetLocalStorageItem(STORAGE_KEY, JSON.stringify(mergedList));
      localStorage.setItem(preloadedKey, 'true');
      console.log('[ProfileStorageService] Satyam family profiles preloaded successfully into localStorage.');
    } catch (e) {
      console.error('[ProfileStorageService] Error preloading family profiles:', e);
    }
  }

  /**
   * Initializes the service by reading from local storage
   */
  static loadLocal(): SavedPerson[] {
    // Run preloading first to ensure Satyam family is initialized on first boot
    this.preloadFamilyProfiles();

    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.cachedProfiles = [];
        return [];
      }
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Sort by recency if timestamp exists, otherwise by name
        this.cachedProfiles = parsed.sort((a, b) => {
          const tA = a.timestamp || 0;
          const tB = b.timestamp || 0;
          if (tA && tB) return tB - tA; // newer first
          return a.name.localeCompare(b.name);
        });
        return this.cachedProfiles;
      }
      this.cachedProfiles = [];
      return [];
    } catch (error) {
      console.error('[ProfileStorageService] Error reading from localStorage:', error);
      this.cachedProfiles = [];
      return [];
    }
  }

  /**
   * Subscribe to real-time changes of profiles
   */
  static subscribe(listener: ProfileListener): () => void {
    this.listeners.add(listener);
    // If cache is empty, load it once
    if (this.cachedProfiles.length === 0) {
      this.loadLocal();
    }
    // Notify immediately with current state
    listener(this.cachedProfiles, this.isSyncing, this.lastError);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get all currently loaded profiles
   */
  static getProfiles(): SavedPerson[] {
    if (this.cachedProfiles.length === 0) {
      this.loadLocal();
    }
    return this.cachedProfiles;
  }

  private static notifyListeners(profiles: SavedPerson[], syncing: boolean, error: string | null) {
    this.cachedProfiles = profiles;
    this.isSyncing = syncing;
    this.lastError = error;
    this.listeners.forEach((listener) => listener(profiles, syncing, error));
  }

  /**
   * Check if a profile is a duplicate based on name, date, time, and place
   */
  private static findDuplicate(profiles: SavedPerson[], newProfile: Omit<SavedPerson, 'id'>): SavedPerson | null {
    const norm = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');
    const newName = norm(newProfile.name);
    const newDate = newProfile.date;
    const newTime = newProfile.time;
    const newPlace = norm(newProfile.place);

    for (const p of profiles) {
      if (
        norm(p.name) === newName &&
        p.date === newDate &&
        p.time === newTime &&
        norm(p.place) === newPlace
      ) {
        return p;
      }
    }
    return null;
  }

  /**
   * Saves a profile (creates or updates), performs duplicate detection, and uploads to Drive if connected
   */
  static async saveProfile(person: Omit<SavedPerson, 'id'> & { id?: string }): Promise<SavedPerson> {
    console.log('[ProfileStorageService] saveProfile() initiated for:', person.name);
    this.loadLocal();

    const timestamp = Date.now();
    let updatedPerson: SavedPerson;

    // Check for duplicate or update existing
    const duplicate = person.id ? null : this.findDuplicate(this.cachedProfiles, person);
    if (person.id) {
      // Direct update by ID or insert with specified ID
      updatedPerson = {
        ...person,
        id: person.id,
        timestamp
      } as SavedPerson;
      const exists = this.cachedProfiles.some(p => p.id === person.id);
      if (exists) {
        this.cachedProfiles = this.cachedProfiles.map(p => p.id === person.id ? updatedPerson : p);
      } else {
        this.cachedProfiles = [updatedPerson, ...this.cachedProfiles];
      }
    } else if (duplicate) {
      // Automatic duplicate detection - update existing
      console.log(`[ProfileStorageService] Duplicate detected for '${person.name}' (${duplicate.id}). Updating existing profile...`);
      updatedPerson = {
        ...person,
        id: duplicate.id,
        timestamp
      } as SavedPerson;
      this.cachedProfiles = this.cachedProfiles.map(p => p.id === duplicate.id ? updatedPerson : p);
    } else {
      // Create new
      const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9);
      updatedPerson = {
        ...person,
        id: newId,
        timestamp
      };
      this.cachedProfiles = [updatedPerson, ...this.cachedProfiles];
    }

    // Sort by recency
    this.cachedProfiles.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Save locally
    safeSetLocalStorageItem(STORAGE_KEY, JSON.stringify(this.cachedProfiles));
    this.notifyListeners(this.cachedProfiles, false, null);

    // Google Drive Backup (in background, non-blocking)
    const token = getCachedToken();
    if (token) {
      this.uploadProfileToDrive(updatedPerson).catch(err => {
        console.error('[ProfileStorageService] Failed to upload profile to Google Drive:', err);
      });
    }

    return updatedPerson;
  }

  /**
   * Helper to upload a profile to Google Drive
   */
  private static async uploadProfileToDrive(profile: SavedPerson): Promise<DriveFile | null> {
    try {
      console.log(`[ProfileStorageService] Uploading profile ${profile.name} (${profile.id}) to Drive...`);
      const folderId = await getOrCreateNestedFolder(['Astrology', 'Profiles']);
      const filename = `Profile_${profile.id}.json`;
      const content = JSON.stringify(profile, null, 2);
      
      const driveFile = await saveReportToDrive(folderId, filename, content);
      console.log(`[ProfileStorageService] Profile uploaded successfully! Drive File ID: ${driveFile.id}`);
      return driveFile;
    } catch (err) {
      console.error('[ProfileStorageService] uploadProfileToDrive error:', err);
      return null;
    }
  }

  /**
   * Deletes a profile locally and on Google Drive if connected
   */
  static async deleteProfile(id: string): Promise<boolean> {
    console.log(`[ProfileStorageService] deleteProfile('${id}') initiated...`);
    this.loadLocal();

    const initialLength = this.cachedProfiles.length;
    this.cachedProfiles = this.cachedProfiles.filter(p => p.id !== id);

    if (this.cachedProfiles.length === initialLength) {
      return false; // not found
    }

    // Save locally
    safeSetLocalStorageItem(STORAGE_KEY, JSON.stringify(this.cachedProfiles));
    this.notifyListeners(this.cachedProfiles, false, null);

    // Delete from Drive (non-blocking background)
    const token = getCachedToken();
    if (token) {
      this.deleteProfileFromDrive(id).catch(err => {
        console.error('[ProfileStorageService] Failed to delete profile from Google Drive:', err);
      });
    }

    return true;
  }

  /**
   * Helper to delete a profile from Google Drive
   */
  private static async deleteProfileFromDrive(profileId: string) {
    try {
      const folderId = await getOrCreateNestedFolder(['Astrology', 'Profiles']);
      const filename = `Profile_${profileId}.json`;
      
      // Find the file first
      const driveFiles = await listReportsInFolder(folderId);
      const targetFile = driveFiles.find(f => f.name === filename);
      if (targetFile) {
        console.log(`[ProfileStorageService] Deleting profile file ${targetFile.name} (${targetFile.id}) from Drive...`);
        await deleteFileFromDrive(targetFile.id);
        console.log('[ProfileStorageService] Deleted profile from Drive.');
      } else {
        console.log(`[ProfileStorageService] Profile file '${filename}' not found in Drive. Skipping deletion.`);
      }
    } catch (err) {
      console.error('[ProfileStorageService] deleteProfileFromDrive error:', err);
    }
  }

  /**
   * Full Synchronization with Google Drive (Bi-directional/Merge with Drive as Source of Truth)
   */
  static async syncFromDrive(): Promise<SavedPerson[]> {
    console.log('[ProfileStorageService] syncFromDrive() initiated.');
    this.loadLocal();

    const token = getCachedToken();
    if (!token) {
      console.warn('[ProfileStorageService] No active OAuth token. Skipping Drive sync.');
      return this.cachedProfiles;
    }

    this.notifyListeners(this.cachedProfiles, true, null);

    try {
      const folderId = await getOrCreateNestedFolder(['Astrology', 'Profiles']);
      console.log('[ProfileStorageService] Listing profiles from Drive folder...');
      const driveFiles = await listReportsInFolder(folderId);
      const jsonFiles = driveFiles.filter(f => f.name.startsWith('Profile_') && f.name.endsWith('.json'));
      console.log(`[ProfileStorageService] Found ${jsonFiles.length} profile file(s) on Drive.`);

      const driveProfiles: SavedPerson[] = [];

      // Download all files in parallel
      const downloadPromises = jsonFiles.map(async (file) => {
        try {
          const contentStr = await downloadFileContent(file.id);
          const parsed = JSON.parse(contentStr) as SavedPerson;
          if (parsed && parsed.id && parsed.name) {
            return parsed;
          }
          return null;
        } catch (err) {
          console.error(`[ProfileStorageService] Failed to download profile file ${file.id}:`, err);
          return null;
        }
      });

      const downloaded = await Promise.all(downloadPromises);
      for (const p of downloaded) {
        if (p) driveProfiles.push(p);
      }

      // Merge local and remote profiles
      // Use duplicate/id mapping to resolve duplicates
      const mergedMap: Record<string, SavedPerson> = {};

      // 1. Load drive profiles first
      for (const dp of driveProfiles) {
        mergedMap[dp.id] = dp;
      }

      // 2. Merge local profiles
      for (const lp of this.cachedProfiles) {
        // Check duplicate by details
        const dupInDrive = driveProfiles.find(dp => {
          const norm = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');
          return norm(dp.name) === norm(lp.name) &&
                 dp.date === lp.date &&
                 dp.time === lp.time &&
                 norm(dp.place) === norm(lp.place);
        });

        if (dupInDrive) {
          // If already exists in Drive (by details or id), keep the one with the newer timestamp
          const driveTimestamp = dupInDrive.timestamp || 0;
          const localTimestamp = lp.timestamp || 0;
          if (localTimestamp > driveTimestamp) {
            // Local is newer: update in mergedMap
            mergedMap[dupInDrive.id] = {
              ...lp,
              id: dupInDrive.id // preserve the drive ID
            };
            // Also upload the newer local version in background
            this.uploadProfileToDrive(mergedMap[dupInDrive.id]).catch(() => {});
          }
        } else {
          // Unique to local: add to map and upload in background
          mergedMap[lp.id] = lp;
          this.uploadProfileToDrive(lp).catch(() => {});
        }
      }

      const mergedList = Object.values(mergedMap);
      // Sort by recency (newer first)
      mergedList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      console.log(`[ProfileStorageService] Sync complete. Merged list contains ${mergedList.length} profile(s).`);

      // Save merged list locally
      safeSetLocalStorageItem(STORAGE_KEY, JSON.stringify(mergedList));
      this.notifyListeners(mergedList, false, null);

      return mergedList;
    } catch (err: any) {
      console.error('[ProfileStorageService] syncFromDrive failed:', err);
      const errMsg = err.message || 'Google Drive profile synchronization failed';
      this.notifyListeners(this.cachedProfiles, false, errMsg);
      return this.cachedProfiles;
    }
  }
}
