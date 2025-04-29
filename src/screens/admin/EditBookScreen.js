import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookService } from '../../services/book.service';

const EditBookScreen = ({ route, navigation }) => {
  const { bookId, bookData } = route.params;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    isbn: '',
    published_date: '',
    total_copies: '',
    available_copies: '',
    status: '',
    cover_image: ''
  });

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        
        // Nếu có bookData, sử dụng nó
        if (bookData) {
          setFormData({
            title: bookData.title || '',
            author: bookData.author || '',
            description: bookData.description || '',
            category: bookData.category || '',
            isbn: bookData.isbn || '',
            published_date: bookData.published_date || '',
            total_copies: bookData.total_copies?.toString() || '0',
            available_copies: bookData.available_copies?.toString() || '0',
            status: bookData.status || 'available',
            cover_image: bookData.cover_image || ''
          });
        } 
        // Nếu không có bookData nhưng có bookId, fetch dữ liệu từ server
        else if (bookId) {
          const fetchedBook = await bookService.getBookById(bookId);
          if (fetchedBook) {
            setFormData({
              title: fetchedBook.title || '',
              author: fetchedBook.author || '',
              description: fetchedBook.description || '',
              category: fetchedBook.category || '',
              isbn: fetchedBook.isbn || '',
              published_date: fetchedBook.published_date || '',
              total_copies: fetchedBook.total_copies?.toString() || '0',
              available_copies: fetchedBook.available_copies?.toString() || '0',
              status: fetchedBook.status || 'available',
              cover_image: fetchedBook.cover_image || ''
            });
          } else {
            Alert.alert('Error', 'Book not found');
            navigation.goBack();
          }
        } else {
          Alert.alert('Error', 'No book data or ID provided');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Error', `Failed to load book data: ${error.message}`);
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [bookId, bookData, navigation]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Title is required');
      return false;
    }
    if (!formData.author.trim()) {
      Alert.alert('Error', 'Author is required');
      return false;
    }
    if (isNaN(formData.total_copies) || parseInt(formData.total_copies) < 0) {
      Alert.alert('Error', 'Total copies must be a positive number');
      return false;
    }
    if (isNaN(formData.available_copies) || parseInt(formData.available_copies) < 0) {
      Alert.alert('Error', 'Available copies must be a positive number');
      return false;
    }
    if (parseInt(formData.available_copies) > parseInt(formData.total_copies)) {
      Alert.alert('Error', 'Available copies cannot be greater than total copies');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const updatedData = {
        ...formData,
        total_copies: parseInt(formData.total_copies),
        available_copies: parseInt(formData.available_copies)
      };

      Alert.alert('Debug Info', `Updating book with data: ${JSON.stringify(updatedData, null, 2)}`);
      await bookService.updateBook(bookId, updatedData);
      
      Alert.alert(
        'Success',
        'Book updated successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', `Failed to update book: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4EFF" />
        <Text style={styles.loadingText}>Updating book...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Book</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
              placeholder="Enter book title"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Author *</Text>
            <TextInput
              style={styles.input}
              value={formData.author}
              onChangeText={(text) => handleInputChange('author', text)}
              placeholder="Enter author name"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              placeholder="Enter book description"
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={formData.category}
              onChangeText={(text) => handleInputChange('category', text)}
              placeholder="Enter book category"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ISBN</Text>
            <TextInput
              style={styles.input}
              value={formData.isbn}
              onChangeText={(text) => handleInputChange('isbn', text)}
              placeholder="Enter ISBN"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Published Date</Text>
            <TextInput
              style={styles.input}
              value={formData.published_date}
              onChangeText={(text) => handleInputChange('published_date', text)}
              placeholder="Enter published date"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Total Copies</Text>
            <TextInput
              style={styles.input}
              value={formData.total_copies}
              onChangeText={(text) => handleInputChange('total_copies', text)}
              placeholder="Enter total copies"
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Available Copies</Text>
            <TextInput
              style={styles.input}
              value={formData.available_copies}
              onChangeText={(text) => handleInputChange('available_copies', text)}
              placeholder="Enter available copies"
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <TextInput
              style={styles.input}
              value={formData.status}
              onChangeText={(text) => handleInputChange('status', text)}
              placeholder="Enter book status"
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cover Image URL</Text>
            <TextInput
              style={styles.input}
              value={formData.cover_image}
              onChangeText={(text) => handleInputChange('cover_image', text)}
              placeholder="Enter cover image URL"
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Updating...' : 'Update Book'}
            </Text>
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
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6B4EFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6B4EFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditBookScreen; 