import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

class ImageUploader {
  async requestPermissions() {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  async pickImage(options = {}) {
    try {
      await this.requestPermissions();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        ...options
      });

      if (!result.canceled) {
        return result.assets[0];
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  }

  async compressImage(uri, options = {}) {
    try {
      const result = await ImagePicker.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImagePicker.SaveFormat.JPEG, ...options }
      );
      return result.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }

  getFileInfo(uri) {
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image';
    return {
      uri,
      name: filename,
      type
    };
  }
}

export const imageUploader = new ImageUploader(); 