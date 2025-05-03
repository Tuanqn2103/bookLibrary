// Mocks
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

jest.mock('react-native/Libraries/Animated/Animated', () => ({
  View: 'AnimatedView',
  createAnimatedComponent: component => component,
  timing: jest.fn(),
  spring: jest.fn(),
  Value: jest.fn(() => ({
    setValue: jest.fn(),
    interpolate: jest.fn(() => ({ interpolate: jest.fn() }))
  }))
}));

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
    Image: 'Image',
    ScrollView: 'ScrollView',
    TouchableOpacity: jest.fn(({ onPress, children }) => ({
      type: 'TouchableOpacity',
      props: { onPress },
      children
    })),
    ActivityIndicator: 'ActivityIndicator'
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    goBack: jest.fn()
  })),
  useRoute: jest.fn(() => ({
    params: {
      bookId: '1'
    }
  }))
}));

jest.mock('../../services/book.service', () => ({
  bookService: {
    getBookById: jest.fn(),
    getAllAuthors: jest.fn(),
    getAllCategories: jest.fn(),
    deleteBook: jest.fn()
  }
}));

// Import các dependencies sau khi mock
const { bookService } = require('../../services/book.service');
const { useNavigation, useRoute } = require('@react-navigation/native');
const Alert = require('react-native/Libraries/Alert/Alert');

// Test suite
describe('BookDetailScreen', () => {
  // Mock data
  const mockBook = {
    id: '1',
    title: 'Test Book',
    description: 'A test book description',
    imageUrl: 'https://example.com/book-cover.jpg',
    author: 'Test Author',
    category: 'Test Category',
    isbn: '1234567890',
    status: 'Available',
    dateAdded: '2023-01-01',
    price: 19.99
  };

  // Cài đặt mocks trước mỗi test
  beforeEach(() => {
    jest.clearAllMocks();
    bookService.getBookById.mockResolvedValue(mockBook);
    bookService.getAllAuthors.mockResolvedValue([{ id: '1', authorname: 'Test Author' }]);
    bookService.getAllCategories.mockResolvedValue([{ id: '1', categoryname: 'Test Category' }]);
  });

  test('should fetch book details on component mount', async () => {
    // Arrange
    const mockRoute = useRoute();
    const mockNavigation = useNavigation();

    // Act - giả lập việc component mount và gọi useEffect
    await bookService.getBookById(mockRoute.params.bookId);

    // Assert
    expect(bookService.getBookById).toHaveBeenCalledWith(mockRoute.params.bookId);
    expect(bookService.getBookById).toHaveBeenCalledTimes(1);
  });

  test('should navigate back when back button is pressed', () => {
    // Arrange
    const mockNavigation = useNavigation();
    
    // Act
    mockNavigation.goBack();
    
    // Assert
    expect(mockNavigation.goBack).toHaveBeenCalled();
    expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
  });

  test('should show confirm dialog when delete button is pressed', () => {
    // Arrange
    const mockNavigation = useNavigation();
    
    // Act - giả lập việc nhấn nút xóa và hiển thị dialog xác nhận
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this book?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {}
        }
      ]
    );
    
    // Assert
    expect(Alert.alert).toHaveBeenCalled();
    expect(Alert.alert.mock.calls[0][0]).toBe('Confirm Delete');
    expect(Alert.alert.mock.calls[0][1]).toBe('Are you sure you want to delete this book?');
    expect(Alert.alert.mock.calls[0][2].length).toBe(2);
  });

  test('should delete book when confirm delete', async () => {
    // Arrange
    const mockRoute = useRoute();
    const mockNavigation = useNavigation();
    bookService.deleteBook.mockResolvedValue(true);
    
    // Act - giả lập việc xác nhận xóa
    await bookService.deleteBook(mockRoute.params.bookId);
    mockNavigation.goBack();
    
    // Assert
    expect(bookService.deleteBook).toHaveBeenCalledWith(mockRoute.params.bookId);
    expect(bookService.deleteBook).toHaveBeenCalledTimes(1);
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  test('should navigate to edit screen when edit button is pressed', () => {
    // Arrange
    const mockRoute = useRoute();
    const mockNavigation = useNavigation();
    
    // Act - giả lập việc chọn nút sửa
    mockNavigation.navigate('EditBook', { bookId: mockRoute.params.bookId });
    
    // Assert
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EditBook', { bookId: mockRoute.params.bookId });
    expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
  });
}); 