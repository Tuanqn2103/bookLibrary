import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import BookCover from '../../components/BookCover';
import { authorService } from '../../services/author.service';
import { categoryService } from '../../services/category.service';

const BookDetailScreen = ({ route, navigation }) => {
  const { bookData } = route.params;
  const book = bookData || {};

  const [authorName, setAuthorName] = useState('');
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchNames = async () => {
      if (book.author_id) {
        try {
          const author = await authorService.getAuthorById(book.author_id);
          if (isMounted) setAuthorName(author?.authorname || 'Unknown');
        } catch {
          if (isMounted) setAuthorName('Unknown');
        }
      }
      if (book.category_id) {
        try {
          const category = await categoryService.getCategoryById(book.category_id);
          if (isMounted) setCategoryName(category?.categoryname || 'Unknown');
        } catch {
          if (isMounted) setCategoryName('Unknown');
        }
      }
    };
    fetchNames();
    return () => { isMounted = false; };
  }, [book.author_id, book.category_id]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={22} color={COLORS.gray} />
          </TouchableOpacity>
          <View style={styles.coverAndInfo}>
            <BookCover
              coverImage={book.cover_image || ''}
              title={book.title || ''}
              style={styles.bookImage}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.title}>{book.title || ''}</Text>
              <Text style={styles.author}>{authorName || 'Unknown'}</Text>
              <TouchableOpacity style={[styles.statusButton, book.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                <Text style={[styles.statusText, book.status === 'active' ? styles.statusActiveText : styles.statusInactiveText]}>{book.status === 'active' ? 'Available' : 'Unavailable'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditBook', { bookId: book.id })}
              >
                <Text style={styles.editButtonText}>Edit Information</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Book Details Section */}
        <View style={styles.infoSection}>
          {book.isbn && (
            <View style={styles.infoRow}><Text style={styles.infoLabel}>ISBN</Text><Text style={styles.infoValue}>{book.isbn}</Text></View>
          )}
          {book.published_date && (
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Published</Text><Text style={styles.infoValue}>{book.published_date}</Text></View>
          )}
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Total copies</Text><Text style={styles.infoValue}>{book.total_copies ?? '-'}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Available</Text><Text style={styles.infoValue}>{book.available_copies ?? '-'}</Text></View>
          {categoryName ? (
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Category</Text><Text style={styles.infoValue}>{categoryName}</Text></View>
          ) : null}
        </View>

        {/* Description Section */}
        {book.description ? (
          <View style={styles.descSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{book.description}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerSection: {
    padding: 20,
    paddingBottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 8,
    left: 0,
    zIndex: 2,
    padding: 8,
  },
  coverAndInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 24,
  },
  bookImage: {
    width: 110,
    height: 160,
    borderRadius: 10,
    marginRight: 18,
    backgroundColor: COLORS.lightGray,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 6,
  },
  author: {
    fontSize: 15,
    color: COLORS.gray,
    marginBottom: 10,
  },
  statusButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginTop: 2,
  },
  statusActive: {
    backgroundColor: '#E6F6EC',
  },
  statusInactive: {
    backgroundColor: '#F6E6E6',
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusActiveText: {
    color: '#3CB371',
  },
  statusInactiveText: {
    color: '#FF4B4B',
  },
  editButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  editButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoSection: {
    marginTop: 28,
    marginHorizontal: 20,
    backgroundColor: '#F8F8FA',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoLabel: {
    width: 120,
    color: COLORS.gray,
    fontWeight: '500',
    fontSize: 15,
  },
  infoValue: {
    flex: 1,
    color: COLORS.black,
    fontSize: 15,
    fontWeight: '500',
  },
  descSection: {
    marginTop: 28,
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: '#F8F8FA',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  description: {
    color: COLORS.gray,
    fontSize: 15,
    lineHeight: 20,
  },
});

export default BookDetailScreen; 