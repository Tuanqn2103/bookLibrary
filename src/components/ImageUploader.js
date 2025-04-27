import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { storageService } from '../services/storage.service';

const ImageUploader = ({ onImageUploaded }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownloadAndUpload = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please enter an image URL');
      return;
    }

    try {
      setLoading(true);
      
      // Upload directly to Supabase Storage
      // The storage service will handle fetching the image from the URL
      const uploadedUrl = await storageService.uploadImage(imageUrl, 'book-cover.jpg');
      
      setUploadedImageUrl(uploadedUrl);
      
      // Call the callback function with the uploaded image URL
      if (onImageUploaded) {
        onImageUploaded(uploadedUrl);
      }
      
      Alert.alert('Success', 'Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Image from URL</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter image URL"
        value={imageUrl}
        onChangeText={setImageUrl}
        autoCapitalize="none"
      />
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleDownloadAndUpload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Download & Upload</Text>
        )}
      </TouchableOpacity>
      
      {uploadedImageUrl ? (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Uploaded Image:</Text>
          <Image
            source={{ uri: uploadedImageUrl }}
            style={styles.previewImage}
          />
          <Text style={styles.imageUrl} numberOfLines={1}>
            {uploadedImageUrl}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6B4EFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageUrl: {
    fontSize: 12,
    color: '#666',
  },
});

export default ImageUploader; 