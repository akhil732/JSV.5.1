import { describe, beforeEach, it, expect } from 'vitest';
import { 
  getSavedPersons, 
  getSavedPersonById, 
  getSavedPersonsByGender, 
  addSavedPerson, 
  updateSavedPerson, 
  deleteSavedPerson 
} from '../../lib/savedPersons';
import { ProfileStorageService } from '../../lib/profileStorageService';

// Polyfill localStorage & window for Node environment
let localStorageStore: Record<string, string> = {};

const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] || null,
  setItem: (key: string, value: string) => {
    localStorageStore[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete localStorageStore[key];
  },
  clear: () => {
    localStorageStore = {};
  }
};

(global as any).localStorage = localStorageMock;
(global as any).window = global;
(global as any).window.localStorage = localStorageMock;
if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: { randomUUID: () => Math.random().toString(36).substring(2, 15) },
    configurable: true
  });
} else if (!global.crypto.randomUUID) {
  Object.defineProperty(global.crypto, 'randomUUID', {
    value: () => Math.random().toString(36).substring(2, 15),
    configurable: true
  });
}

describe('savedPersons localStorage utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    localStorageMock.setItem('sanathanam_family_profiles_preloaded_v1', 'true');
    localStorageMock.setItem('sanathanam_saved_persons', JSON.stringify([]));
    ProfileStorageService.loadLocal();
  });

  const mockPerson = {
    name: 'John Doe',
    gender: 'Male' as const,
    date: '1990-01-01',
    time: '12:00:00',
    place: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    timezone: -5
  };

  it('getSavedPersons returns empty array when local storage is empty', () => {
    expect(getSavedPersons()).toEqual([]);
  });

  it('addSavedPerson generates an id and saves the person', () => {
    const saved = addSavedPerson(mockPerson);
    expect(saved.id).toBeDefined();
    expect(saved.name).toBe('John Doe');
    
    const all = getSavedPersons();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(saved.id);
  });

  it('getSavedPersonById retrieves the correct person', () => {
    const p1 = addSavedPerson(mockPerson);
    const p2 = addSavedPerson({ ...mockPerson, name: 'Jane Doe', gender: 'Female' });
    
    const found = getSavedPersonById(p2.id);
    expect(found).not.toBeNull();
    expect(found?.name).toBe('Jane Doe');
    expect(found?.gender).toBe('Female');
    
    expect(getSavedPersonById('non-existent')).toBeNull();
  });

  it('getSavedPersonsByGender filters by gender', () => {
    addSavedPerson(mockPerson);
    addSavedPerson({ ...mockPerson, name: 'Jane Doe', gender: 'Female' });
    addSavedPerson({ ...mockPerson, name: 'Jim Doe', gender: 'Male' });

    const males = getSavedPersonsByGender('Male');
    expect(males.length).toBe(2);
    
    const females = getSavedPersonsByGender('Female');
    expect(females.length).toBe(1);
    expect(females[0].name).toBe('Jane Doe');
  });

  it('updateSavedPerson updates fields without overwriting ID', () => {
    const saved = addSavedPerson(mockPerson);
    
    const updated = updateSavedPerson(saved.id, { place: 'Los Angeles', latitude: 34.0522 });
    expect(updated).not.toBeNull();
    expect(updated?.place).toBe('Los Angeles');
    expect(updated?.latitude).toBe(34.0522);
    expect(updated?.name).toBe('John Doe'); // Unchanged
    expect(updated?.id).toBe(saved.id); // ID shouldn't change
    
    // Verify in storage
    const fetched = getSavedPersonById(saved.id);
    expect(fetched?.place).toBe('Los Angeles');
  });

  it('deleteSavedPerson removes the person from storage', () => {
    const p1 = addSavedPerson(mockPerson);
    const p2 = addSavedPerson({ ...mockPerson, name: 'Jane Doe', gender: 'Female' });
    
    expect(getSavedPersons().length).toBe(2);
    
    const deleted = deleteSavedPerson(p1.id);
    expect(deleted).toBe(true);
    expect(getSavedPersons().length).toBe(1);
    expect(getSavedPersonById(p1.id)).toBeNull();
    
    const notDeleted = deleteSavedPerson('non-existent');
    expect(notDeleted).toBe(false);
  });
});
