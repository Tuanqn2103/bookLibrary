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

const AddBookScreen = ({ navigation }) => {
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

  useEffect(() => {
    fetchCategoriesAndAuthors();
    generateISBN();
  }, []);

  const fetchCategoriesAndAuthors = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories and authors...');
      
      const [categoriesData, authorsData] = await Promise.all([
        categoryService.getAllCategories(),
        authorService.getAllAuthors()
      ]);
      
      console.log('Raw Categories Data:', JSON.stringify(categoriesData, null, 2));
      console.log('Raw Authors Data:', JSON.stringify(authorsData, null, 2));
      
      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData);
        console.log('Categories set successfully:', categoriesData);
      } else {
        console.log('No categories data received');
      }
      
      if (authorsData && authorsData.length > 0) {
        setAuthors(authorsData);
        console.log('Authors set successfully:', authorsData);
      } else {
        console.log('No authors data received');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load categories and authors');
    } finally {
      setLoading(false);
    }
  };

  const generateISBN = () => {
    // Generate a random ISBN-13
    const prefix = '978';
    const registrationGroup = '0';
    const publisherCode = Math.floor(Math.random() * 90000).toString().padStart(5, '0');
    const titleIdentifier = Math.floor(Math.random() * 900000).toString().padStart(6, '0');
    
    // Calculate check digit
    let sum = 0;
    const isbnWithoutCheck = prefix + registrationGroup + publisherCode + titleIdentifier;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(isbnWithoutCheck[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    
    const generatedISBN = `${prefix}-${registrationGroup}${publisherCode}-${titleIdentifier}${checkDigit}`;
    setIsbn(generatedISBN);
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

  const handleAddBook = async () => {
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

      let coverImageUrl = '';
      if (imageUri) {
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

      await bookService.addBook(bookData);
      Alert.alert('Success', 'Book added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error adding book:', error);
      Alert.alert('Error', 'Failed to add book. Please try again.');
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
          <Text style={styles.headerTitle}>Add book</Text>
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
              label: author.authorname,
              value: author.id
            }))}
            onSelect={(value) => {
              console.log('Selected author:', value);
              setAuthorId(value);
            }}
            placeholder="Select from list"
          />

          <Text style={styles.label}>Category *</Text>
          <CustomDropdown
            value={categoryId}
            options={categories.map(category => ({
              label: category.categoryname,
              value: category.id
            }))}
            onSelect={(value) => {
              console.log('Selected category:', value);
              setCategoryId(value);
            }}
            placeholder="Choose a category"
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
            style={[styles.input, styles.disabledInput]}
            value={isbn}
            editable={false}
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
            onSelect={(value) => {
              console.log('Selected status:', value);
              setStatus(value);
            }}
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
            onPress={handleAddBook}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.addButtonText}>Add book</Text>
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

export default AddBookScreen; 