import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import Icon from 'react-native-vector-icons/FontAwesome';

// Dummy bestseller book data
const BESTSELLER_BOOKS = [
  {
    id: '1',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Ocean',
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Night',
    isFavorite: false,
  },
  {
    id: '3',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Art',
    isFavorite: true,
  },
  {
    id: '4',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Train',
    isFavorite: false,
  },
  {
    id: '5',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Key',
    isFavorite: false,
  },
  {
    id: '6',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Blue',
    isFavorite: false,
  },
];

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 45) / 2;

// BookCard component for rendering each book
const BookCard = ({ book, onPress }) => {
  const [imageError, setImageError] = useState(false);
  const [isFavorite, setIsFavorite] = useState(book.isFavorite);
  
  return (
    <TouchableOpacity style={styles.bookCard} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageError ? 'https://via.placeholder.com/300x400?text=Book' : book.image }}
          style={styles.bookImage}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => setIsFavorite(!isFavorite)}
        >
          <Icon 
            name={isFavorite ? "heart" : "heart-o"} 
            size={16} 
            color={isFavorite ? "#FF0000" : "#000000"} 
          />
        </TouchableOpacity>
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${book.price.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addButton}>
            <Icon name="plus" size={14} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const BestSellerScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bestseller</Text>
          <TouchableOpacity style={styles.emptyButton}>
            <Text> </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size={36} color="#4B4BF5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bestseller</Text>
        <TouchableOpacity style={styles.emptyButton}>
          <Text> </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={BESTSELLER_BOOKS}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bookList}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
  },
  emptyButton: {
    width: 40,
  },
  bookList: {
    padding: 15,
  },
  row: {
    justifyContent: 'space-between',
  },
  bookCard: {
    width: cardWidth,
    marginBottom: 15,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    marginBottom: 8,
  },
  bookImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookInfo: {
    gap: 4,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  addButton: {
    backgroundColor: '#4B4BF5',
    borderRadius: 8,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BestSellerScreen; 