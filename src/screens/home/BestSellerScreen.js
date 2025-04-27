// import React from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   FlatList,
//   Image,
//   TouchableOpacity,
// } from 'react-native';
// import { COLORS } from '../../theme/colors';
// import Icon from 'react-native-vector-icons/FontAwesome';

// const DUMMY_BOOKS = [
//   {
//     id: '1',
//     title: 'Modern Calligraphy',
//     author: 'June and Lucy',
//     price: 19.99,
//     image: 'https://example.com/book1.jpg',
//   },
//   {
//     id: '2',
//     title: 'Think Again',
//     author: 'Adam Grant',
//     price: 24.99,
//     image: 'https://example.com/book2.jpg',
//   },
//   {
//     id: '3',
//     title: 'The Great Gatsby',
//     author: 'F. Scott Fitzgerald',
//     price: 15.99,
//     image: 'https://example.com/book3.jpg',
//   },
//   {
//     id: '4',
//     title: '1984',
//     author: 'George Orwell',
//     price: 12.99,
//     image: 'https://example.com/book4.jpg',
//   },
//   {
//     id: '5',
//     title: 'Pride and Prejudice',
//     author: 'Jane Austen',
//     price: 14.99,
//     image: 'https://example.com/book5.jpg',
//   },
//   {
//     id: '6',
//     title: 'To Kill a Mockingbird',
//     author: 'Harper Lee',
//     price: 18.99,
//     image: 'https://example.com/book6.jpg',
//   },
// ];

// const BookCard = ({ book, onPress }) => {
//   return (
//     <TouchableOpacity style={styles.bookCard} onPress={onPress}>
//       <View style={styles.imageContainer}>
//         <Image
//           source={{ uri: book.image }}
//           style={styles.bookImage}
//           resizeMode="cover"
//         />
//         <TouchableOpacity style={styles.favoriteButton}>
//           <Icon name="heart-o" size={20} color={COLORS.primary} />
//         </TouchableOpacity>
//       </View>
//       <View style={styles.bookInfo}>
//         <Text style={styles.bookTitle} numberOfLines={2}>
//           {book.title}
//         </Text>
//         <Text style={styles.bookAuthor}>{book.author}</Text>
//         <View style={styles.priceContainer}>
//           <Text style={styles.price}>${book.price.toFixed(2)}</Text>
//           <TouchableOpacity style={styles.addButton}>
//             <Icon name="plus" size={12} color={COLORS.white} />
//           </TouchableOpacity>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const BestsellerScreen = ({ navigation }) => {
//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={DUMMY_BOOKS}
//         renderItem={({ item }) => (
//           <BookCard
//             book={item}
//             onPress={() => navigation.navigate('BookDetail', { book: item })}
//           />
//         )}
//         keyExtractor={(item) => item.id}
//         numColumns={2}
//         contentContainerStyle={styles.bookList}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//   },
//   bookList: {
//     padding: 12,
//   },
//   bookCard: {
//     flex: 1,
//     margin: 8,
//     backgroundColor: COLORS.white,
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: COLORS.black,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   imageContainer: {
//     position: 'relative',
//   },
//   bookImage: {
//     width: '100%',
//     height: 200,
//     borderTopLeftRadius: 12,
//     borderTopRightRadius: 12,
//   },
//   favoriteButton: {
//     position: 'absolute',
//     top: 8,
//     right: 8,
//     backgroundColor: COLORS.white,
//     borderRadius: 20,
//     padding: 8,
//   },
//   bookInfo: {
//     padding: 12,
//   },
//   bookTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.black,
//     marginBottom: 4,
//   },
//   bookAuthor: {
//     fontSize: 14,
//     color: COLORS.gray,
//     marginBottom: 8,
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   price: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: COLORS.black,
//   },
//   addButton: {
//     backgroundColor: COLORS.primary,
//     borderRadius: 12,
//     padding: 6,
//   },
// });

// export default BestsellerScreen;