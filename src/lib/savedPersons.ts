import { SavedPerson } from '../types/marriageMatch';
import { ProfileStorageService } from './profileStorageService';

export function getSavedPersons(): SavedPerson[] {
  return ProfileStorageService.getProfiles();
}

export function getSavedPersonById(id: string): SavedPerson | null {
  return ProfileStorageService.getProfiles().find((p) => p.id === id) || null;
}

export function getSavedPersonsByGender(gender: 'Male' | 'Female'): SavedPerson[] {
  return ProfileStorageService.getProfiles().filter((p) => p.gender === gender);
}

export function addSavedPerson(person: Omit<SavedPerson, 'id'>): SavedPerson {
  const newPerson: SavedPerson = {
    ...person,
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
    timestamp: Date.now()
  };

  ProfileStorageService.saveProfile(newPerson).catch((err) => {
    console.error('Error adding saved person via legacy proxy:', err);
  });

  return newPerson;
}

export function updateSavedPerson(id: string, updates: Partial<SavedPerson>): SavedPerson | null {
  const existing = getSavedPersonById(id);
  if (!existing) return null;

  const updated: SavedPerson = {
    ...existing,
    ...updates,
    id
  };

  ProfileStorageService.saveProfile(updated).catch((err) => {
    console.error('Error updating saved person via legacy proxy:', err);
  });

  return updated;
}

export function deleteSavedPerson(id: string): boolean {
  const profiles = ProfileStorageService.getProfiles();
  const exists = profiles.some((p) => p.id === id);
  if (!exists) return false;

  ProfileStorageService.deleteProfile(id).catch((err) => {
    console.error('Error deleting saved person via legacy proxy:', err);
  });

  return true;
}

export function clearAllSavedPersons(): void {
  const profiles = ProfileStorageService.getProfiles();
  for (const p of profiles) {
    ProfileStorageService.deleteProfile(p.id).catch(() => {});
  }
}
