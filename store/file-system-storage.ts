import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const STORAGE_DIR = `${FileSystem.documentDirectory}zustand/`;

// Su web expo-file-system NON è disponibile (makeDirectoryAsync/writeAsStringAsync
// lanciano UnavailabilityError): si ripiega su localStorage del browser.
// Su nativo si continua a usare FileSystem.
const isWeb = Platform.OS === 'web';
const webStorage =
  isWeb && typeof localStorage !== 'undefined' ? localStorage : null;

// Adapter per zustand persist (createJSONStorage si aspetta { getItem, setItem, removeItem })
export const fileSystemStorage = {
  setItem: async (name: string, value: string) => {
    if (webStorage) {
      webStorage.setItem(name, value);
      return;
    }
    const dir = STORAGE_DIR;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    await FileSystem.writeAsStringAsync(`${dir}${name}`, value);
  },
  getItem: async (name: string): Promise<string | null> => {
    if (webStorage) return webStorage.getItem(name);
    try {
      const value = await FileSystem.readAsStringAsync(`${STORAGE_DIR}${name}`);
      return value ?? null;
    } catch {
      return null;
    }
  },
  removeItem: async (name: string) => {
    if (webStorage) {
      webStorage.removeItem(name);
      return;
    }
    try {
      await FileSystem.deleteAsync(`${STORAGE_DIR}${name}`, { idempotent: true });
    } catch {
      // Ignora se non esiste
    }
  },
};
