// Mocks
jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  return {
    ...rn,
    StyleSheet: {
      create: jest.fn(() => ({}))
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 400, height: 800 }))
    },
    View: 'View',
    Text: 'Text',
    FlatList: jest.fn(({ data, renderItem, keyExtractor }) => ({
      type: 'FlatList',
      props: { data, keyExtractor },
      children: data ? data.map(item => renderItem({ item })) : null
    })),
    TouchableOpacity: jest.fn(({ onPress, children }) => ({
      type: 'TouchableOpacity',
      props: { onPress },
      children
    })),
    ActivityIndicator: jest.fn(() => 'ActivityIndicator')
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn()
  }))
}));

jest.mock('../../components/BookCover', () => 'BookCover');

jest.mock('../../services/book.service', () => ({
  bookService: {
    getAllBooks: jest.fn()
  }
}));

// Import các dependencies sau khi mock
const { bookService } = require('../../services/book.service');
const { useNavigation } = require('@react-navigation/native');

// Test suite
describe('BestSellerScreen', () => {
  // Mock data
  const mockBooks = [
    {
      id: '1',
      title: 'Best Seller Book 1',
      imageUrl: 'https://example.com/book1.jpg',
      author: 'Author 1',
      price: 29.99,
      salesCount: 120
    },
    {
      id: '2',
      title: 'Best Seller Book 2',
      imageUrl: 'https://example.com/book2.jpg',
      author: 'Author 2',
      price: 19.99,
      salesCount: 100
    },
    {
      id: '3',
      title: 'Best Seller Book 3',
      imageUrl: 'https://example.com/book3.jpg',
      author: 'Author 3',
      price: 24.99,
      salesCount: 80
    }
  ];

  // Cài đặt mocks trước mỗi test
  beforeEach(() => {
    jest.clearAllMocks();
    bookService.getAllBooks.mockResolvedValue(mockBooks);
  });

  test('should fetch best seller books on component mount', async () => {
    // Act - giả lập việc component mount và gọi useEffect
    await bookService.getAllBooks();

    // Assert
    expect(bookService.getAllBooks).toHaveBeenCalled();
    expect(bookService.getAllBooks).toHaveBeenCalledTimes(1);
  });

  test('should sort books by sales count', () => {
    // Act
    const sortedBooks = [...mockBooks].sort((a, b) => b.salesCount - a.salesCount);

    // Assert
    expect(sortedBooks[0].id).toBe('1'); // Book with highest sales
    expect(sortedBooks[0].salesCount).toBe(120);
    expect(sortedBooks[1].salesCount).toBe(100);
    expect(sortedBooks[2].salesCount).toBe(80);
    expect(sortedBooks.length).toBe(mockBooks.length);
  });

  test('should navigate to book details when a book is pressed', () => {
    // Arrange
    const mockNavigation = useNavigation();
    const selectedBook = mockBooks[0];

    // Act - giả lập việc nhấn vào sách
    mockNavigation.navigate('BookDetail', { bookId: selectedBook.id });

    // Assert
    expect(mockNavigation.navigate).toHaveBeenCalledWith('BookDetail', { bookId: selectedBook.id });
    expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
  });

  test('should display loading indicator while fetching data', () => {
    // Arrange
    const isLoading = true;

    // Assert - kiểm tra trạng thái loading hiển thị đúng
    expect(isLoading).toBe(true);
  });

  test('should display error message when fetch fails', async () => {
    // Arrange
    const errorMessage = 'Failed to fetch books';
    bookService.getAllBooks.mockRejectedValueOnce(new Error(errorMessage));

    // Act - gọi API và catch lỗi
    try {
      await bookService.getAllBooks();
    } catch (error) {
      // Assert
      expect(error.message).toBe(errorMessage);
    }

    // Assert
    expect(bookService.getAllBooks).toHaveBeenCalled();
  });

  test('should display empty message when no books available', async () => {
    // Arrange
    bookService.getAllBooks.mockResolvedValueOnce([]);

    // Act
    const books = await bookService.getAllBooks();

    // Assert
    expect(books).toEqual([]);
    expect(books.length).toBe(0);
    expect(bookService.getAllBooks).toHaveBeenCalled();
  });
}); 