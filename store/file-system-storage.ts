import * as FileSystem from 'expo-file-system/legacy';

const STORAGE_DIR = `${FileSystem.documentDirectory}zustand/`;

// Adapter per zustand persist (createJSONStorage si aspetta { getItem, setItem, removeItem })
export const fileSystemStorage = {
  setItem: async (name: string, value: string) => {
    const dir = STORAGE_DIR;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    await FileSystem.writeAsStringAsync(`${dir}${name}`, value);
  },
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await FileSystem.readAsStringAsync(`${STORAGE_DIR}${name}`);
      return value ?? null;
    } catch {
      return null;
    }
  },
  removeItem: async (name: string) => {
    try {
      await FileSystem.deleteAsync(`${STORAGE_DIR}${name}`, { idempotent: true });
    } catch {
      // Ignora se non esiste
    }
  },
};
