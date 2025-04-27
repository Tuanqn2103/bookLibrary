import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../theme/colors'; // Assuming this file exists
import Icon from 'react-native-vector-icons/FontAwesome';

// Dummy book data
const DUMMY_BOOKS = [
  {
    id: '1',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Book+1',
  },
  {
    id: '2',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Book+2',
  },
  {
    id: '3',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Book+3',
  },
  {
    id: '4',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Book+4',
  },
  {
    id: '5',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Book+5',
  },
  {
    id: '6',
    title: 'Modern Calligraphy',
    price: 20.50,
    image: 'https://via.placeholder.com/300x400?text=Book+6',
  },
];

// BookCard component for rendering each book
const BookCard = ({ book, onPress }) => {
  const [imageError, setImageError] = React.useState(false);
  
  return (
    <TouchableOpacity style={styles.bookCard} onPress={onPress}>
      <Image
        source={{ uri: imageError ? 'https://via.placeholder.com/300x400?text=Book' : book.image }}
        style={styles.bookImage}
        resizeMode="cover"
        onError={() => setImageError(true)}
      />
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

// Updated HomeScreen component
const HomeScreen = ({ navigation, route }) => {
  const username = route?.params?.username || 'Hao'; // Default to "Hao" if no username is passed

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.storeName}>BOOKSTORE</Text>
          <Text style={styles.greeting}>Hi {username},</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
          <Icon name="shopping-cart" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          placeholderTextColor={COLORS.gray}
        />
        <TouchableOpacity>
          <Icon name="sliders" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      </View>

      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <View>
            <Text style={styles.bannerTitle}>WORLD</Text>
            <Text style={styles.bannerTitle}>BOOK DAY</Text>
            <Text style={styles.bannerSubtitle}>FREE 1EBOOK</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Get now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerIconContainer}>
            <Icon name="book" size={50} color="#4B4BF5" />
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bestseller</Text>
        <TouchableOpacity onPress={() => navigation.navigate('BestSeller')}>
          <Text style={styles.seeMore}>See more</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={DUMMY_BOOKS}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onPress={() => navigation.navigate('BookDetail', { book: item })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.bookList}
      />

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="compass" size={24} color={COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="clock-o" size={24} color={COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="user" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
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
    alignItems: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B4BF5',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.black,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  banner: {
    backgroundColor: '#FFE5A3',
    marginHorizontal: 15,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: COLORS.black,
    marginTop: 5,
  },
  bannerButton: {
    backgroundColor: '#4B4BF5',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  bannerIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(75, 75, 245, 0.1)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  seeMore: {
    fontSize: 14,
    color: '#4B4BF5',
  },
  bookList: {
    paddingHorizontal: 15,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
  },
  addButton: {
    backgroundColor: '#4B4BF5',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    alignItems: 'center',
  },
});

export default HomeScreen;