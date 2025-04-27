import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookService } from '../../services/book.service';
import BookCover from '../../components/BookCover';

const BookDetailScreen = ({ route, navigation }) => {
  const { bookId, bookData } = route.params;
  const [book, setBook] = useState(bookData || null);
  const [loading, setLoading] = useState(!bookData);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('BookDetailScreen mounted with:', { bookId, bookData });
    if (!bookData) {
      loadBookDetails();
    }
  }, [bookId]);

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading book details for ID:', bookId);
      
      const data = await bookService.getBookById(bookId);
      console.log('Received book data:', data);
      
      if (!data) {
        console.log('No book data found for ID:', bookId);
        setError('Book not found');
        return;
      }

      // Kiểm tra dữ liệu trước khi set
      if (!data.cover_image) {
        console.log('Book data missing cover_image:', data);
        data.cover_image = ''; // Set giá trị mặc định
      }

      setBook(data);
    } catch (error) {
      console.error('Error loading book details:', error);
      setError('Failed to load book details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      Alert.alert(
        'Delete Book',
        'Are you sure you want to delete this book?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await bookService.deleteBook(bookId);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting book:', error);
      Alert.alert('Error', 'Failed to delete book. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={loadBookDetails}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  console.log('Rendering book details:', book);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <BookCover 
            coverImage={book.cover_image || ''} 
            title={book.title || ''} 
            style={styles.bookCover}
          />
          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{book.title || 'No Title'}</Text>
            <Text style={styles.bookAuthor}>by {book.author || 'Unknown Author'}</Text>
            <Text style={styles.bookCategory}>{book.category || 'Uncategorized'}</Text>
            <Text style={styles.bookStatus}>Status: {book.status || 'Unknown'}</Text>
            <Text style={styles.bookCopies}>
              Copies: {book.available_copies || 0}/{book.total_copies || 0}
            </Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{book.description || 'No description available'}</Text>
        </View>

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Book Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ISBN:</Text>
            <Text style={styles.infoValue}>{book.isbn || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Published Date:</Text>
            <Text style={styles.infoValue}>{book.published_date || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => navigation.navigate('EditBook', { bookId: book.id })}
          >
            <Text style={styles.buttonText}>Edit Book</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonText}>Delete Book</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
  },
  bookCover: {
    width: 120,
    height: 180,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 16,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  bookCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bookCopies: {
    fontSize: 14,
    color: '#666',
  },
  detailsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    width: 120,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#6B4EFF',
  },
  deleteButton: {
    backgroundColor: '#FF4B4B',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BookDetailScreen; 