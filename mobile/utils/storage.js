import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * A platform-agnostic storage utility for authentication tokens.
 * Uses encrypted SecureStore on native platforms and standard localStorage on web.
 */
export const TokenStorage = {
  /**
   * Retrieves the token from storage.
   */
  async getItem(key) {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`TokenStorage: Failed to get item [${key}]`, error);
      return null;
    }
  },

  /**
   * Saves the token to storage.
   */
  async setItem(key, value) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
        return;
      }
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`TokenStorage: Failed to set item [${key}]`, error);
    }
  },

  /**
   * Deletes the token from storage.
   */
  async deleteItem(key) {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return;
      }
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`TokenStorage: Failed to delete item [${key}]`, error);
    }
  },
};
