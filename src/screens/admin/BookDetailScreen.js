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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{'<'} Back</Text>
          </TouchableOpacity>
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
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
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
                <Text style={styles.buttonText}>Edit Information</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 8,
    paddingTop: 8,
    marginBottom: 0,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B4EFF',
    fontWeight: 'bold',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    alignItems: 'flex-start',
  },
  bookCover: {
    width: 120,
    height: 180,
    marginRight: 20,
  },
  bookInfo: {
    flex: 1,
    marginLeft: 20,
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
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
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