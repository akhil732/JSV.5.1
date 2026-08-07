import { 
  googleSignIn, 
  googleSignOut, 
  getCachedToken, 
  getOrCreateFolder, 
  listReportsInFolder, 
  saveReportToDrive, 
  downloadFileContent, 
  deleteFileFromDrive,
  User,
  DriveFile
} from './googleDrive';
import { BirthDetails, PastReport } from '../types';
import { safeSaveReportsToLocalStorage } from './storageUtils';

type SyncListener = (reports: PastReport[], syncing: boolean, error: string | null) => void;

export class DriveSyncService {
  private static listeners: Set<SyncListener> = new Set();
  private static isSyncing: boolean = false;
  private static lastError: string | null = null;
  private static cachedReports: PastReport[] = [];

  /**
   * Register a subscriber to receive real-time sync updates
   */
  static subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    // Notify immediately with current state
    listener(this.cachedReports, this.isSyncing, this.lastError);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Returns currently cached reports list
   */
  static getReports(): PastReport[] {
    return this.cachedReports;
  }

  private static notifyListeners(reports: PastReport[], syncing: boolean, error: string | null) {
    this.cachedReports = reports;
    this.isSyncing = syncing;
    this.lastError = error;
    this.listeners.forEach((listener) => listener(reports, syncing, error));
  }

  /**
   * Initializes Google Drive connection, verifies auth token, and returns active user and app folder ID
   */
  static async initializeDrive(): Promise<{ user: User | null; folderId: string | null }> {
    console.log('[DriveSyncService] initializeDrive() called');
    const token = getCachedToken();
    if (!token) {
      console.warn('[DriveSyncService] initializeDrive(): No valid OAuth token found.');
      return { user: null, folderId: null };
    }

    try {
      console.log('[DriveSyncService] initializeDrive(): Locating or creating app folder...');
      const folderId = await this.findOrCreateAppFolder();
      console.log('[DriveSyncService] initializeDrive(): Success! App folder ID:', folderId);
      return { user: null, folderId };
    } catch (err: any) {
      console.error('[DriveSyncService] initializeDrive() failed:', err);
      return { user: null, folderId: null };
    }
  }

  /**
   * Finds or creates the dedicated application folder in Google Drive
   */
  static async findOrCreateAppFolder(folderName: string = 'Jyothishya Sanathanam Reports'): Promise<string> {
    console.log(`[DriveSyncService] findOrCreateAppFolder('${folderName}')...`);
    try {
      const folderId = await getOrCreateFolder(folderName);
      console.log(`[DriveSyncService] App folder resolved: ${folderId}`);
      return folderId;
    } catch (err: any) {
      console.error(`[DriveSyncService] findOrCreateAppFolder Error:`, err);
      // Detailed error logging
      if (err.response) {
         console.error('[DriveSyncService] Error response:', await err.response.text());
      }
      throw err;
    }
  }

  /**
   * Uploads a report (birth details + horoscope data) to Google Drive
   */
  static async uploadReport(
    report: { birthDetails: BirthDetails; horoscopeData: any; timestamp?: number },
    folderName: string = 'Jyothishya Sanathanam Reports'
  ): Promise<DriveFile> {
    console.log('[DriveSyncService] uploadReport() initiated for:', report.birthDetails.name);
    try {
      this.notifyListeners(this.cachedReports, true, null);
      
      const folderId = await this.findOrCreateAppFolder(folderName);
      
      const dateClean = report.birthDetails.date ? report.birthDetails.date.replace(/[^a-zA-Z0-9]/g, '_') : 'date';
      const nameClean = report.birthDetails.name ? report.birthDetails.name.trim().replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_') : 'Report';
      const filename = `Jyothishya_Report_${nameClean}_${dateClean}.json`;
      
      const payload = {
        birthDetails: report.birthDetails,
        horoscopeData: report.horoscopeData,
        savedAt: new Date().toISOString(),
        app: 'Jyothishya Sanathanam'
      };

      console.log(`[DriveSyncService] Uploading file '${filename}' to Drive folder ${folderId}...`);
      const driveFile = await saveReportToDrive(folderId, filename, JSON.stringify(payload, null, 2));
      console.log(`[DriveSyncService] Upload successful! File ID: ${driveFile.id}`);

      // Refresh consultations from Drive immediately
      await this.refreshRecentConsultations();

      return driveFile;
    } catch (err: any) {
      console.error('[DriveSyncService] uploadReport() failed:', err);
      this.notifyListeners(this.cachedReports, false, err.message || 'Failed to upload report to Drive');
      throw err;
    }
  }

  /**
   * Lists all saved report files in the application folder
   */
  static async listReports(folderId?: string): Promise<DriveFile[]> {
    console.log('[DriveSyncService] listReports() requested...');
    try {
      const fId = folderId || await this.findOrCreateAppFolder();
      const files = await listReportsInFolder(fId);
      console.log(`[DriveSyncService] listReports(): Total files retrieved from Drive: ${files.length}`);
      files.forEach(f => console.log(`[DriveSyncService] Found file: ${f.name} (ID: ${f.id})`));
      
      const jsonFiles = files.filter(f => f.name.endsWith('.json'));
      console.log(`[DriveSyncService] listReports(): Retrieved ${jsonFiles.length} JSON file(s) from folder ${fId}`);
      return jsonFiles;
    } catch (err: any) {
      console.warn('[DriveSyncService] listReports() notice:', err.message || err);
      return [];
    }
  }

  /**
   * Downloads and parses a report's JSON content by file ID
   */
  static async downloadReport(fileId: string): Promise<{ birthDetails: BirthDetails; horoscopeData: any; savedAt?: string }> {
    console.log(`[DriveSyncService] downloadReport('${fileId}') requested...`);
    try {
      const text = await downloadFileContent(fileId);
      const parsed = JSON.parse(text);
      console.log(`[DriveSyncService] downloadReport('${fileId}') parsed successfully.`);
      return parsed;
    } catch (err: any) {
      console.error(`[DriveSyncService] downloadReport('${fileId}') failed:`, err);
      throw err;
    }
  }

  /**
   * Performs full synchronization from Google Drive:
   * 1. Locates app folder
   * 2. Lists all saved reports
   * 3. Downloads report contents & metadata
   * 4. Rebuilds local storage cache with Drive as source of truth
   */
  static async syncFromDrive(): Promise<PastReport[]> {
    console.log('[DriveSyncService] syncFromDrive(): Starting full Drive synchronization...');
    this.notifyListeners(this.cachedReports, true, null);

    const token = getCachedToken();
    if (!token) {
      console.warn('[DriveSyncService] syncFromDrive(): No OAuth token available. Returning local storage fallback.');
      let localFallback: PastReport[] = [];
      try {
        const stored = localStorage.getItem('sanathanam_reports');
        if (stored) localFallback = JSON.parse(stored);
      } catch (e) {}
      this.notifyListeners(localFallback, false, null);
      return localFallback;
    }

    try {
      console.log('[DriveSyncService] Step 1: Locating application folder...');
      const folderId = await this.findOrCreateAppFolder();

      console.log('[DriveSyncService] Step 2: Listing report files in folder:', folderId);
      const driveFiles = await this.listReports(folderId);
      console.log(`[DriveSyncService] Step 2.5: Found ${driveFiles.length} reports in Drive.`);
      
      console.log(`[DriveSyncService] Step 3: Downloading contents for ${driveFiles.length} file(s)...`);

      const syncedReports: PastReport[] = [];

      const downloadPromises = driveFiles.map(async (file) => {
        try {
          console.log(`[DriveSyncService] Downloading metadata/content for '${file.name}' (${file.id})...`);
          const content = await this.downloadReport(file.id);
          
          const rawTime = file.createdTime ? new Date(file.createdTime).getTime() : Date.now();
          const timestamp = isNaN(rawTime) ? Date.now() : rawTime;

          if (content && content.birthDetails && content.horoscopeData) {
            const report: PastReport = {
              id: file.id,
              timestamp,
              birthDetails: content.birthDetails,
              horoscopeData: content.horoscopeData,
              driveFileId: file.id,
              driveFileName: file.name
            };
            return report;
          } else if ((content as any).horoscope) {
            // Fallback parsing for legacy raw horoscopes
            const dummyBirthDetails: BirthDetails = {
              name: (content as any).horoscope.name || file.name.replace('.json', '').replace(/_/g, ' '),
              gender: "Male",
              date: (content as any).horoscope.calendar_info?.date_str || "1990-01-01",
              time: "12:00:00",
              approximateTime: false,
              place: "Saved Location",
              latitude: 13.0,
              longitude: 80.0,
              timezone: 5.5
            };
            return {
              id: file.id,
              timestamp,
              birthDetails: dummyBirthDetails,
              horoscopeData: content,
              driveFileId: file.id,
              driveFileName: file.name
            };
          }
          return null;
        } catch (err) {
          console.error(`[DriveSyncService] Failed to download/parse file ${file.id}:`, err);
          return null;
        }
      });

      const results = await Promise.all(downloadPromises);
      for (const res of results) {
        if (res) syncedReports.push(res);
      }

      // Sort reports by created timestamp descending
      syncedReports.sort((a, b) => b.timestamp - a.timestamp);

      console.log(`[DriveSyncService] Step 4: Sync complete! Downloaded ${syncedReports.length} report(s) from Drive.`);

      // Rebuild local storage cache from Drive (Drive is the single source of truth!)
      safeSaveReportsToLocalStorage(syncedReports);
      console.log('[DriveSyncService] Step 5: Local storage cache synchronized.');

      this.notifyListeners(syncedReports, false, null);
      return syncedReports;
    } catch (err: any) {
      console.warn('[DriveSyncService] syncFromDrive() drive sync notice:', err.message || err);
      let localFallback: PastReport[] = [];
      try {
        const stored = localStorage.getItem('sanathanam_reports');
        if (stored) localFallback = JSON.parse(stored);
      } catch (e) {}
      this.notifyListeners(localFallback, false, null);
      return localFallback;
    }
  }

  /**
   * Refreshes the recent consultations list directly from Google Drive
   */
  static async refreshRecentConsultations(): Promise<PastReport[]> {
    console.log('[DriveSyncService] refreshRecentConsultations() triggered.');
    return await this.syncFromDrive();
  }

  /**
   * Deletes a report file from Google Drive and updates cache
   */
  static async deleteReport(fileId: string): Promise<void> {
    console.log(`[DriveSyncService] deleteReport('${fileId}') initiated...`);
    try {
      this.notifyListeners(this.cachedReports, true, null);
      await deleteFileFromDrive(fileId);
      console.log(`[DriveSyncService] File ${fileId} deleted from Drive.`);
      
      // Remove from cached reports and update localStorage
      const updated = this.cachedReports.filter(r => r.driveFileId !== fileId && r.id !== fileId);
      safeSaveReportsToLocalStorage(updated);

      this.notifyListeners(updated, false, null);
    } catch (err: any) {
      console.error(`[DriveSyncService] deleteReport('${fileId}') failed:`, err);
      this.notifyListeners(this.cachedReports, false, err.message || 'Failed to delete report from Drive');
      throw err;
    }
  }
}
