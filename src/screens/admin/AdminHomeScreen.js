import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { bookService } from '../../services/book.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../config/supabase';
import BookCover from '../../components/BookCover';

const AdminHomeScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(data || []);
    } catch (error) {
      console.error('Error loading books:', error);
      Alert.alert('Error', 'Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      loadBooks();
      return;
    }

    try {
      setLoading(true);
      const results = await bookService.searchBooks(query);
      setBooks(results || []);
    } catch (error) {
      console.error('Error searching books:', error);
      Alert.alert('Error', 'Failed to search books. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    { id: 1, name: 'Biography', icon: '👤' },
    { id: 2, name: 'Business', icon: '💼' },
    { id: 3, name: "Children's", icon: '🧸' },
    { id: 4, name: 'Novel', icon: '📚' },
    { id: 5, name: 'Sports', icon: '⚽' },
  ];

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [2, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        const fileName = `book-cover-${Date.now()}.jpg`;
        const destinationUri = FileSystem.documentDirectory + 'book-covers/' + fileName;
        
        await FileSystem.copyAsync({
          from: selectedImage.uri,
          to: destinationUri
        });
        
        return fileName; // Trả về tên file để lưu vào database
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleBookPress = (book) => {
    console.log('Navigating to book detail:', book);
    navigation.navigate('BookDetail', { 
      bookId: book.id,
      bookData: book // Truyền thêm dữ liệu sách để tránh phải load lại
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.storeName}>BOOKSTORE</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
        {categories.map(category => (
          <TouchableOpacity key={category.id} style={styles.categoryItem}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryName}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.totalBookContainer}>
        <Text style={styles.totalBookText}>Total of book</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddBook')}
        >
          <Text style={styles.addButtonText}>Add new book</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B4EFF" />
        </View>
      ) : (
        <ScrollView style={styles.bookList}>
          {filteredBooks.map((book) => (
            <TouchableOpacity
              key={book.id}
              style={styles.bookItem}
              onPress={() => handleBookPress(book)}
            >
              <BookCover 
                coverImage={book.cover_image} 
                title={book.title} 
              />
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                  {book.title}
                </Text>
                <Text style={styles.bookAuthor}>by {book.author}</Text>
                <Text style={styles.bookCategory}>{book.category}</Text>
                <Text style={styles.bookStatus}>Status: {book.status}</Text>
                <Text style={styles.bookCopies}>
                  Copies: {book.available_copies}/{book.total_copies}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 16,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4EFF',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  categoryContainer: {
    paddingLeft: 16,
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 24,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
  },
  totalBookContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  totalBookText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookList: {
    padding: 16,
  },
  bookItem: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookCoverContainer: {
    width: 100,
    height: 150,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    position: 'relative',
  },
  bookCover: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookInfo: {
    flex: 1,
    padding: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bookStatus: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  bookCopies: {
    fontSize: 12,
    color: '#666',
  },
  imageLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default AdminHomeScreen; 