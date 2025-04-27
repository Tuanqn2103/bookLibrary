import { supabase } from '../config/supabase';

class StorageService {
  constructor() {
    this.bucketName = 'book-covers';
  }

  async uploadImage(uri, fileName) {
    try {
      // For React Native, we need to handle the URI differently
      // If it's a local file URI or a remote URL
      let fileData;
      
      if (uri.startsWith('http')) {
        // If it's a remote URL, fetch it first
        const response = await fetch(uri);
        fileData = await response.blob();
      } else {
        // If it's a local file URI
        // In React Native, we need to use a different approach
        // This is a simplified version - in a real app, you might need
        // to use react-native-fs or similar libraries for more complex file handling
        const response = await fetch(uri);
        fileData = await response.blob();
      }

      // Generate unique file name
      const fileExt = fileName.split('.').pop();
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${this.bucketName}/${uniqueFileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .upload(filePath, fileData);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl) {
    try {
      // Extract file path from URL
      const filePath = imageUrl.split(`${this.bucketName}/`)[1];
      if (!filePath) return;

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  async updateImage(oldImageUrl, newImageUri, fileName) {
    try {
      // Delete old image if exists
      if (oldImageUrl) {
        await this.deleteImage(oldImageUrl);
      }

      // Upload new image
      const newImageUrl = await this.uploadImage(newImageUri, fileName);
      return newImageUrl;
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService(); 