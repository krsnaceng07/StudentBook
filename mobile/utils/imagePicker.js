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
    const filename = imageAsset.uri.split('/').pop() || 'upload.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append('file', {
      uri: imageAsset.uri,
      name: filename,
      type: type,
    });

    // Get Auth Token from storage
    const token = await TokenStorage.getItem('token');
    
    // Get Base URL from client config
    const client = require('../api/client').default;
    const uploadUrl = `${client.defaults.baseURL}${endpoint}`;

    console.log(`[Upload] Starting upload to ${uploadUrl}`);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        // IMPORTANT: DO NOT set 'Content-Type': 'multipart/form-data' manually here.
        // The fetch API will automatically set the Content-Type WITH the correct boundary string.
      },
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error("[Upload Error] Server returned:", result);
      throw new Error(result.message || 'Upload failed');
    }

    return result;
  } catch (error) {
    console.error("[Upload Network Error]:", error.message);
    throw error;
  }
};
