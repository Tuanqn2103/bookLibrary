import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { bookService } from '../../services/book.service';
import { storageService } from '../../services/storage.service';
import { authorService } from '../../services/author.service';
import { categoryService } from '../../services/category.service';
import { imageUploader } from '../../utils/ImageUploader';
import CustomDropdown from '../../components/CustomDropdown';

const EditBookScreen = ({ route, navigation }) => {
  const { bookId, bookData } = route.params;
  const [title, setTitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publishedDate, setPublishedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [coverImage, setCoverImage] = useState('');
  const [totalCopies, setTotalCopies] = useState('1');
  const [availableCopies, setAvailableCopies] = useState('1');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [selectedAuthorName, setSelectedAuthorName] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  useEffect(() => {
    fetchCategoriesAndAuthors();
    initializeForm();
  }, []);

  useEffect(() => {
    // Find and set author name when authorId or authors change
    if (authorId && authors.length > 0) {
      const author = authors.find(a => a.id.toString() === authorId.toString());
      if (author) {
        setSelectedAuthorName(author.authorname || author.name || 'Unknown Author');
      }
    }

    // Find and set category name when categoryId or categories change
    if (categoryId && categories.length > 0) {
      const category = categories.find(c => c.id.toString() === categoryId.toString());
      if (category) {
        setSelectedCategoryName(category.categoryname || category.name || 'Unknown Category');
      }
    }
  }, [authorId, categoryId, authors, categories]);

  const fetchCategoriesAndAuthors = async () => {
    try {
      setLoading(true);
      const [categoriesData, authorsData] = await Promise.all([
        categoryService.getAllCategories(),
        authorService.getAllAuthors()
      ]);
      
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      }
      
      if (authorsData && authorsData.length > 0) {
        setAuthors(authorsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load categories and authors');
    } finally {
      setLoading(false);
    }
  };

  const initializeForm = async () => {
    try {
      setLoading(true);
      
      if (bookData) {
        setTitle(bookData.title || '');
        setAuthorId(bookData.author_id?.toString() || bookData.author?.id?.toString() || '');
        setDescription(bookData.description || '');
        setCategoryId(bookData.category_id?.toString() || bookData.category?.id?.toString() || '');
        setIsbn(bookData.isbn || '');
        setPublishedDate(bookData.published_date || '');
        setTotalCopies(bookData.total_copies?.toString() || '1');
        setAvailableCopies(bookData.available_copies?.toString() || '1');
        setStatus(bookData.status || 'active');
        setCoverImage(bookData.cover_image || '');
        setImageUri(bookData.cover_image || null);
        
        if (bookData.published_date) {
          setDate(new Date(bookData.published_date));
        }
      } else if (bookId) {
        const fetchedBook = await bookService.getBookById(bookId);
        if (fetchedBook) {
          setTitle(fetchedBook.title || '');
          setAuthorId(fetchedBook.author_id?.toString() || fetchedBook.author?.id?.toString() || '');
          setDescription(fetchedBook.description || '');
          setCategoryId(fetchedBook.category_id?.toString() || fetchedBook.category?.id?.toString() || '');
          setIsbn(fetchedBook.isbn || '');
          setPublishedDate(fetchedBook.published_date || '');
          setTotalCopies(fetchedBook.total_copies?.toString() || '1');
          setAvailableCopies(fetchedBook.available_copies?.toString() || '1');
          setStatus(fetchedBook.status || 'active');
          setCoverImage(fetchedBook.cover_image || '');
          setImageUri(fetchedBook.cover_image || null);
          
          if (fetchedBook.published_date) {
            setDate(new Date(fetchedBook.published_date));
          }
        } else {
          Alert.alert('Error', 'Book not found');
          navigation.goBack();
        }
      }

      // Fetch categories and authors after setting the initial values
      const [categoriesData, authorsData] = await Promise.all([
        categoryService.getAllCategories(),
        authorService.getAllAuthors()
      ]);
      
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
      }
      
      if (authorsData && authorsData.length > 0) {
        setAuthors(authorsData);
      }
    } catch (error) {
      Alert.alert('Error', `Failed to load book data: ${error.message}`);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await imageUploader.pickImage();
      if (result) {
        setImageUri(result.uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
      setPublishedDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleUpdateBook = async () => {
    if (!title || !authorId || !categoryId || !isbn) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (parseInt(availableCopies) > parseInt(totalCopies)) {
      Alert.alert('Error', 'Available copies cannot be greater than total copies');
      return;
    }

    try {
      setLoading(true);

      let coverImageUrl = coverImage;
      if (imageUri && imageUri !== coverImage) {
        coverImageUrl = await storageService.uploadImage(imageUri, `book-covers/${Date.now()}.jpg`);
      }

      const bookData = {
        title,
        author_id: parseInt(authorId),
        description,
        category_id: parseInt(categoryId),
        isbn,
        published_date: publishedDate,
        cover_image: coverImageUrl,
        total_copies: parseInt(totalCopies),
        available_copies: parseInt(availableCopies),
        status
      };

      await bookService.updateBook(bookId, bookData);
      Alert.alert('Success', 'Book updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating book:', error);
      Alert.alert('Error', 'Failed to update book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'lost', label: 'Lost' },
    { value: 'damaged', label: 'Damaged' }
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit book</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Book information</Text>

          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Book name here"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Author *</Text>
          <CustomDropdown
            value={authorId}
            options={authors.map(author => ({
              label: author.authorname || author.name || 'Unknown Author',
              value: author.id
            }))}
            onSelect={(value) => {
              setAuthorId(value);
              const selectedAuthor = authors.find(a => a.id.toString() === value.toString());
              if (selectedAuthor) {
                setSelectedAuthorName(selectedAuthor.authorname || selectedAuthor.name || 'Unknown Author');
              }
            }}
            placeholder={selectedAuthorName || "Select from list"}
          />

          <Text style={styles.label}>Category *</Text>
          <CustomDropdown
            value={categoryId}
            options={categories.map(category => ({
              label: category.categoryname || category.name || 'Unknown Category',
              value: category.id
            }))}
            onSelect={(value) => {
              setCategoryId(value);
              const selectedCategory = categories.find(c => c.id.toString() === value.toString());
              if (selectedCategory) {
                setSelectedCategoryName(selectedCategory.categoryname || selectedCategory.name || 'Unknown Category');
              }
            }}
            placeholder={selectedCategoryName || "Choose a category"}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter a description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>ISBN *</Text>
          <TextInput
            style={styles.input}
            value={isbn}
            onChangeText={setIsbn}
            placeholder="ISBN here"
          />

          <Text style={styles.label}>Published Date</Text>
          <TouchableOpacity 
            style={styles.input} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>
              {publishedDate ? publishedDate : 'Select published date'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Total Copies *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter total number of copies"
            value={totalCopies}
            onChangeText={setTotalCopies}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Available Copies *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter available copies"
            value={availableCopies}
            onChangeText={setAvailableCopies}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Status</Text>
          <CustomDropdown
            value={status}
            options={statusOptions}
            onSelect={(value) => setStatus(value)}
            placeholder="Select status"
          />

          <Text style={styles.label}>Cover Image</Text>
          <TouchableOpacity style={styles.fileButton} onPress={pickImage}>
            <Text style={styles.fileButtonText}>+ Choose a file</Text>
          </TouchableOpacity>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleUpdateBook}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.addButtonText}>Update book</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 14,
    color: '#000000',
  },
  inputText: {
    fontSize: 14,
    color: '#000000',
    paddingVertical: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  fileButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#4A3780',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A3780',
  },
  addButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#4A3780',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
});

export default EditBookScreen; 