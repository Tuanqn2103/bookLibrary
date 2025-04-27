import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import Icon from 'react-native-vector-icons/FontAwesome';

const BookDetailScreen = ({ route, navigation }) => {
  const { book } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={20} color={COLORS.black} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.favoriteButton}>
            <Icon name="heart" size={20} color="red" />
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: book.image }}
            style={styles.bookImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>

          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Icon name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.5</Text>
            </View>
            <Text style={styles.ratingCount}>108 Pages</Text>
            <Text style={styles.language}>Eng Language</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Product code</Text>
              <Text style={styles.detailValue}>8945251471125</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Supplier name</Text>
              <Text style={styles.detailValue}>Alpha Books</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Author</Text>
              <Text style={styles.detailValue}>{book.author}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Genre</Text>
              <Text style={styles.detailValue}>Self-help</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Year of publication</Text>
              <Text style={styles.detailValue}>2023</Text>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Product description</Text>
            <Text style={styles.description}>
              Have you ever sat down to work, and then, without realizing it,
              you start checking social media? This book will help you stay
              focused on the task at hand. Learning how to do deep work - the
              ability to focus on a difficult task without distraction - is key
              to producing better results in less time.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.price}>${book.price.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Buy Now</Text>
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
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  imageContainer: {
    height: 300,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookImage: {
    width: '80%',
    height: '80%',
  },
  infoContainer: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  ratingText: {
    marginLeft: 4,
    color: COLORS.black,
    fontWeight: '600',
  },
  ratingCount: {
    color: COLORS.gray,
    marginRight: 16,
  },
  language: {
    color: COLORS.gray,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailLabel: {
    color: COLORS.gray,
  },
  detailValue: {
    color: COLORS.black,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  description: {
    color: COLORS.gray,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  priceContainer: {
    flex: 1,
    marginRight: 16,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookDetailScreen; 