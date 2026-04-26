import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import { TokenStorage } from './storage';

export const pickImage = async (options = {}) => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload images.');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: options.allowsEditing || false,
      aspect: options.allowsEditing ? (options.aspect || [1, 1]) : undefined,
      quality: options.quality || 0.8,
      ...options
    });

    if (!result.canceled) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error("Error picking image:", error);
    Alert.alert('Error', 'Failed to pick image');
    return null;
  }
};

/**
 * Uploads a file using native fetch to avoid Axios interceptor/boundary issues.
 * This is the most reliable way to upload files in React Native.
 */
export const uploadFile = async (imageAsset, endpoint) => {
  try {
    const formData = new FormData();
    
    // Get file extension and type
    const filename = imageAsset.fileName || (imageAsset.uri.split('/').pop() || 'upload.jpg');
    const type = imageAsset.mimeType || 'image/jpeg';

    // Android URI fix: Ensure it starts with file:// if it's a local path
    let uri = imageAsset.uri;
    if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')) {
      uri = `file://${uri}`;
    }

    formData.append('file', {
      uri: uri,
      name: filename,
      type: type,
    });

    // Get client instance (already has baseURL and interceptors)
    const client = require('../api/client').default;
    const uploadUrl = endpoint; // Axios uses relative paths if baseURL is set

    console.log(`[Upload] Starting upload to ${client.defaults.baseURL}${uploadUrl}`);

    const response = await client.post(uploadUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Increase timeout for uploads
      timeout: 60000, 
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
        console.log(`[Upload Progress] ${percentCompleted}%`);
      }
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("[Upload Error] Server returned:", error.response.status, error.response.data);
      throw new Error(error.response.data?.message || 'Upload failed');
    } else if (error.request) {
      console.error("[Upload Network Error] No response received. Check server connectivity.");
      throw new Error('Network error. Could not connect to server.');
    } else {
      console.error("[Upload Logic Error]:", error.message);
      throw error;
    }
  }
};
