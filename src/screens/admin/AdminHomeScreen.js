import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';
import { bookService } from '../../services/book.service';
import { SafeAreaView } from 'react-native-safe-area-context';
import BookCover from '../../components/BookCover';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 3; // 16px padding * 2 + 8px giữa các item

const AdminHomeScreen = ({ navigation }) => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(data || []);
      setTotalBooks((data && data.length) || 0);
    } catch (error) {
      console.error('Error loading books:', error);
      Alert.alert('Error', 'Failed to load books. Please try again.');
      setTotalBooks(0);
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
    { id: 1, name: 'Biographies', icon: '👤' },
    { id: 2, name: 'Business', icon: '💼' },
    { id: 3, name: "Children's", icon: '🧸' },
    { id: 4, name: 'Novel', icon: '📚' },
    { id: 5, name: 'Technical', icon: '💡' },
  ];

  const handleBookPress = (book) => {
    navigation.navigate('BookDetail', {
      bookId: book.id,
      bookData: book
    });
  };

  const renderBookItem = ({ item }) => (
    <TouchableOpacity style={styles.bookItem} onPress={() => handleBookPress(item)}>
      <BookCover coverImage={item.cover_image} title={item.title} style={styles.bookCover} />
      <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.bookAuthor} numberOfLines={1}>by {item.author}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.storeName}>BOOKSTORE</Text>
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              value={searchQuery}
              onChangeText={handleSearch}
              placeholderTextColor="#888"
            />
          </View>
        </View>
        <Text style={styles.sectionTitle}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <View style={styles.categoryContainer}>
            {categories.map(category => (
              <View key={category.id} style={styles.categoryItem}>
                <View style={styles.categoryCircle}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
        <View style={styles.totalBookContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.totalBookText}>Total of book</Text>
            <Text style={styles.totalBookCount}> ({totalBooks})</Text>
          </View>
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
          <FlatList
            data={filteredBooks}
            renderItem={renderBookItem}
            keyExtractor={item => item.id.toString()}
            numColumns={3}
            columnWrapperStyle={styles.bookRow}
            contentContainerStyle={styles.bookList}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6B4EFF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    height: 40,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#888',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 8,
    color: '#222',
  },
  categoryScroll: {
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 10,
    color: '#222',
  },
  totalBookContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  totalBookText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  totalBookCount: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookList: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  bookRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bookItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 8,
  },
  bookCover: {
    width: 90,
    height: 130,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  bookTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

export default AdminHomeScreen; 
