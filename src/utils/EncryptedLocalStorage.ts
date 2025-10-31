
import CryptoJS from 'crypto-js';
export const EncryptedLocalStorage = {
  getItem(key: string): string | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      
      const bytes = CryptoJS.AES.decrypt(encrypted, import.meta.env.VITE_SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error(`Decryption error for ${key}:`, error);
      return null;
    }
  },

  setItem(key: string, value: string): void {
    try {
      const encrypted = CryptoJS.AES.encrypt(value, import.meta.env.VITE_SECRET_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error(`Encryption error for ${key}:`, error);
    }
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
};

