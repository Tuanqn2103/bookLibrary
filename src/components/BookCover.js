import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { supabaseUrl } from '../config/supabase';

const BookCover = ({ coverImage, title, style }) => {
  const [hasError, setHasError] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    console.log('BookCover mounted with:', { coverImage, title });
    const url = getImageUrl(coverImage);
    console.log('Generated image URL:', url);
    setImageUrl(url);
  }, [coverImage]);

  const getImageUrl = (url) => {
    if (!url) {
      console.log('No cover image URL provided');
      return null;
    }

    // Nếu là URL đầy đủ từ Supabase
    if (url.includes('/storage/v1/object/public/')) {
      console.log('Using full Supabase URL');
      return url;
    }

    // Nếu chỉ có tên file, thêm public URL
    // Loại bỏ 'book-covers/' nếu đã có trong url
    const cleanUrl = url.replace('book-covers/', '');
    const generatedUrl = `${supabaseUrl}/storage/v1/object/public/book-covers/${cleanUrl}`;
    console.log('Generated URL from filename:', generatedUrl);
    return generatedUrl;
  };

  const handleImageError = (error) => {
    console.log('Image load error for', title, ':', error.nativeEvent);
    setHasError(true);
  };

  return (
    <View style={[styles.bookCoverContainer, style]}>
      {imageUrl && !hasError ? (
        <Image
          source={{ 
            uri: imageUrl,
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          }}
          style={styles.bookCover}
          onError={handleImageError}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText} numberOfLines={2}>{title || 'No Image'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bookCoverContainer: {
    aspectRatio: 0.67,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  bookCover: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  errorText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default BookCover; 