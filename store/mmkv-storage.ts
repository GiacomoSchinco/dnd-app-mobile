import * as FileSystem from 'expo-file-system/legacy';
import { StateStorage } from 'zustand/middleware';

const STORAGE_DIR = `${FileSystem.documentDirectory}zustand/`;

// Adapter per collegare expo-file-system al middleware persist di Zustand
export const mmkvStorage: StateStorage = {
  setItem: async (name, value) => {
    const dir = STORAGE_DIR;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    await FileSystem.writeAsStringAsync(`${dir}${name}`, value);
  },
  getItem: async (name) => {
    try {
      const value = await FileSystem.readAsStringAsync(`${STORAGE_DIR}${name}`);
      return value ?? null;
    } catch {
      return null;
    }
  },
  removeItem: async (name) => {
    try {
      await FileSystem.deleteAsync(`${STORAGE_DIR}${name}`, { idempotent: true });
    } catch {
      // Ignora se non esiste
    }
  },
};
