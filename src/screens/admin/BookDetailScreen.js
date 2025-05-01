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
  const { bookId } = route.params;
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookDetails();
  }, [bookId]);

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading book details for ID:', bookId);
      const data = await bookService.getBookById(bookId);
      console.log('Received book data:', data);
      if (data) {
        setBook(data);
      } else {
        setError('Book not found');
      }
    } catch (error) {
      console.error('Error loading book details:', error);
      setError('Failed to load book details');
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
              console.log('Deleting book with ID:', bookId);
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
    console.log('Loading state:', loading);
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
      </View>
    );
  }

  if (error) {
    console.log('Error state:', error);
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
    console.log('No book data available');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Book not found</Text>
      </View>
    );
  }

  console.log('Current book data:', book);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, styles.editButton]}
              onPress={() => {
                if (!book) {
                  Alert.alert('Error', 'Book data is not available');
                  return;
                }
                navigation.navigate('EditBook', { 
                  bookId: book.id,
                  bookData: book
                });
              }}
            >
              <Text style={styles.headerButtonText}>Edit Information</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles.headerButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#6B4EFF',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  headerButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#6B4EFF',
  },
  deleteButton: {
    backgroundColor: '#FF4B4B',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  bookCover: {
    width: '35%',
    aspectRatio: 0.67,
    borderRadius: 8,
    marginRight: 20,
    backgroundColor: '#F5F5F5',
  },
  bookInfo: {
    flex: 1,
    paddingVertical: 4,
  },
  bookTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  bookAuthor: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  bookCategory: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  bookStatus: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  bookCopies: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  detailsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    width: '35%',
    color: '#666666',
  },
  infoValue: {
    fontSize: 15,
    color: '#000000',
    flex: 1,
  },
});

export default BookDetailScreen; 