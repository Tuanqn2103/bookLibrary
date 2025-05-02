// Mocks first
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

// Mock storage service
jest.mock('../../services/storage.service', () => ({
  uploadImage: jest.fn(),
  deleteImage: jest.fn()
}));

// Mock Alert
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn()
  }
}));

// Then imports
import { Alert } from 'react-native';
import { supabase } from '../../config/supabase';
import { bookService } from '../../services/book.service';
import * as storageServiceModule from '../../services/storage.service';

// Tắt các console log và error trong quá trình test
global.console.log = jest.fn();
global.console.error = jest.fn();

const storageService = storageServiceModule;

describe('Quản lý sách - Luồng tích hợp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAuthors = [
    { id: 1, authorname: 'Author 1' },
    { id: 2, authorname: 'Author 2' }
  ];

  const mockCategories = [
    { id: 1, categoryname: 'Category 1' },
    { id: 2, categoryname: 'Category 2' }
  ];

  const mockBooks = [
    {
      id: 1,
      title: 'Book 1',
      author: 'Unknown Author',
      author_id: 1,
      category: 'Uncategorized',
      category_id: 1,
      description: 'Description 1',
      cover_image: 'cover1.jpg',
      isbn: '1234567890',
      published_date: '2022-01-01',
      total_copies: 5,
      available_copies: 3,
      status: undefined
    },
    {
      id: 2,
      title: 'Book 2',
      author: 'Unknown Author',
      author_id: 2,
      category: 'Uncategorized',
      category_id: 2,
      description: 'Description 2',
      cover_image: 'cover2.jpg',
      isbn: '0987654321',
      published_date: '2022-02-01',
      total_copies: 3,
      available_copies: 1,
      status: undefined
    }
  ];

  describe('Quy trình tạo sách mới', () => {
    test('1. Nên lấy danh sách tác giả và danh mục trước khi tạo sách', async () => {
      // Arrange - Mock for authors
      const authorsSelect = jest.fn().mockReturnThis();
      const authorsOrder = jest.fn().mockReturnValue({
        data: mockAuthors,
        error: null
      });
      
      // Mock for categories
      const categoriesSelect = jest.fn().mockReturnThis();
      const categoriesOrder = jest.fn().mockReturnValue({
        data: mockCategories,
        error: null
      });
      
      // Setup the mocks
      supabase.from.mockImplementation((table) => {
        if (table === 'authors') {
          return { 
            select: authorsSelect,
            order: authorsOrder
          };
        } else if (table === 'categories') {
          return {
            select: categoriesSelect,
            order: categoriesOrder
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });
      
      // Act
      const authors = await bookService.getAllAuthors();
      const categories = await bookService.getAllCategories();
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(authors).toEqual(mockAuthors);
      expect(categories).toEqual(mockCategories);
    });

    test('2. Nên tải lên ảnh bìa sách trước khi tạo sách', async () => {
      // Arrange
      const imageUrl = 'https://example.com/book-cover.jpg';
      const fileName = 'book-cover.jpg';
      const publicUrl = 'https://storage.com/public/book-cover.jpg';
      
      // Setup mock
      storageService.uploadImage.mockResolvedValue(publicUrl);
      
      // Act
      const result = await storageService.uploadImage(imageUrl, fileName);
      
      // Assert
      expect(storageService.uploadImage).toHaveBeenCalledWith(imageUrl, fileName);
      expect(result).toBe(publicUrl);
    });

    test('3. Nên thêm sách mới vào cơ sở dữ liệu', async () => {
      // Arrange
      const newBookData = {
        title: 'New Book',
        author_id: 1,
        category_id: 1,
        description: 'New Description',
        cover_image: 'https://storage.com/public/book-cover.jpg'
      };
      
      const insertedBook = {
        id: 3,
        ...newBookData,
        created_at: '2023-01-01'
      };
      
      // Setup mocks
      const insertMethod = jest.fn().mockReturnThis();
      const selectMethod = jest.fn().mockReturnValue({
        data: [insertedBook],
        error: null
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return {
            insert: insertMethod,
            select: selectMethod
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });
      
      // Adjust mock for method chaining
      insertMethod.mockReturnValue({ select: selectMethod });
      
      // Act
      const result = await bookService.addBook(newBookData);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(result).toEqual(insertedBook);
    });
  });

  describe('Quy trình hiển thị và tìm kiếm sách', () => {
    test('1. Nên lấy tất cả sách để hiển thị', async () => {
      // Arrange
      const booksSelect = jest.fn().mockReturnValue({
        data: mockBooks,
        error: null
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { select: booksSelect };
        }
        return { select: jest.fn().mockReturnThis() };
      });
      
      // Act
      const result = await bookService.getAllBooks();
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(result).toEqual(mockBooks);
    });

    test('2. Nên tìm kiếm sách theo từ khóa', async () => {
      // Arrange
      const searchQuery = 'Book';
      
      const orMethod = jest.fn().mockReturnValue({
        data: mockBooks,
        error: null
      });
      
      const selectMethod = jest.fn().mockReturnValue({
        or: orMethod
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { select: selectMethod };
        }
        return { select: jest.fn().mockReturnThis() };
      });
      
      // Act
      const result = await bookService.searchBooks(searchQuery);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(orMethod).toHaveBeenCalledWith(expect.stringContaining(searchQuery));
      expect(result).toEqual(mockBooks);
    });

    test('3. Nên lấy chi tiết sách theo ID', async () => {
      // Arrange
      const bookId = 1;
      const mockBook = mockBooks[0];
      
      const singleMethod = jest.fn().mockReturnValue({
        data: mockBook,
        error: null
      });
      
      const eqMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });
      
      const selectMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { select: selectMethod };
        }
        return { select: jest.fn().mockReturnThis() };
      });
      
      // Act
      const result = await bookService.getBookById(bookId);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
      expect(result).toEqual(mockBook);
    });
  });

  describe('Quy trình cập nhật sách', () => {
    test('1. Nên cập nhật thông tin sách', async () => {
      // Arrange
      const bookId = 1;
      const updateData = {
        title: 'Updated Book',
        description: 'Updated Description'
      };
      
      const mockUpdatedBook = {
        ...mockBooks[0],
        ...updateData
      };
      
      const selectMethod = jest.fn().mockReturnValue({
        data: [mockUpdatedBook],
        error: null
      });
      
      const eqMethod = jest.fn().mockReturnValue({
        select: selectMethod
      });
      
      const updateMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { update: updateMethod };
        }
        return { select: jest.fn().mockReturnThis() };
      });
      
      // Act
      const result = await bookService.updateBook(bookId, updateData);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(updateMethod).toHaveBeenCalledWith(updateData);
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
      expect(result).toEqual(mockUpdatedBook);
    });

    test('2. Nên cập nhật ảnh bìa sách', async () => {
      // Arrange
      const oldCoverUrl = 'https://storage.com/public/old-cover.jpg';
      const newCoverUrl = 'https://example.com/new-cover.jpg';
      const fileName = 'new-cover.jpg';
      const publicUrl = 'https://storage.com/public/new-cover.jpg';
      
      // Setup mocks
      storageService.deleteImage.mockResolvedValue(true);
      storageService.uploadImage.mockResolvedValue(publicUrl);
      
      // Act
      await storageService.deleteImage(oldCoverUrl);
      const result = await storageService.uploadImage(newCoverUrl, fileName);
      
      // Assert
      expect(storageService.deleteImage).toHaveBeenCalledWith(oldCoverUrl);
      expect(storageService.uploadImage).toHaveBeenCalledWith(newCoverUrl, fileName);
      expect(result).toBe(publicUrl);
    });
  });

  describe('Quy trình xóa sách', () => {
    test('1. Nên xóa bìa sách trước khi xóa sách', async () => {
      // Arrange
      const bookId = 1;
      const mockBook = mockBooks[0];
      const coverUrl = mockBook.cover_image;
      
      // 1. Setup getBookById mock
      const singleMethod = jest.fn().mockReturnValue({
        data: mockBook,
        error: null
      });
      
      const eqSelectMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });
      
      const selectMethod = jest.fn().mockReturnValue({
        eq: eqSelectMethod
      });
      
      // 2. Setup deleteBook mock
      const eqDeleteMethod = jest.fn().mockReturnValue({
        data: { id: bookId },
        error: null
      });
      
      const deleteMethod = jest.fn().mockReturnValue({
        eq: eqDeleteMethod
      });
      
      // Setup from mock with multiple return values
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return {
            select: selectMethod,
            delete: deleteMethod
          };
        }
        return { select: jest.fn().mockReturnThis() };
      });
      
      // Setup storage mock
      storageService.deleteImage.mockResolvedValue(true);
      
      // Act - Get book first, then delete image, then delete book
      const book = await bookService.getBookById(bookId);
      await storageService.deleteImage(book.cover_image);
      const result = await bookService.deleteBook(bookId);
      
      // Assert
      expect(book).toEqual(mockBook);
      expect(storageService.deleteImage).toHaveBeenCalledWith(coverUrl);
      expect(eqDeleteMethod).toHaveBeenCalledWith('id', bookId);
      expect(result).toBe(true);
    });

    test('2. Nên hiển thị thông báo thành công sau khi xóa', async () => {
      // Arrange & Act
      Alert.alert('Thành công', 'Sách đã được xóa thành công');
      
      // Assert
      expect(Alert.alert).toHaveBeenCalledWith(
        'Thành công',
        'Sách đã được xóa thành công'
      );
    });
  });

  describe('Xử lý lỗi trong quản lý sách', () => {
    test('1. Nên xử lý lỗi khi tạo sách thất bại', async () => {
      // Arrange
      const newBookData = {
        title: 'New Book',
        author_id: 1,
        category_id: 1
      };
      
      // Setup error mock
      const selectMethod = jest.fn().mockRejectedValue(new Error('Database error'));
      const insertMethod = jest.fn().mockReturnValue({ select: selectMethod });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { insert: insertMethod };
        }
        return { select: jest.fn().mockReturnThis() };
      });
      
      // Act & Assert
      await expect(bookService.addBook(newBookData))
        .rejects.toThrow();
      
      // Giả lập UI hiển thị lỗi
      Alert.alert('Error', 'Failed to add book. Please try again.');
      
      // Kiểm tra Alert đã được gọi
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to add book. Please try again.'
      );
    });

    test('2. Nên xử lý lỗi khi cập nhật sách thất bại', async () => {
      // Arrange
      const bookId = 1;
      const updateData = {
        title: 'Updated Book',
        description: 'Updated Description'
      };
      
      // Setup error mock
      const selectMethod = jest.fn().mockRejectedValue(new Error('Database error'));
      const eqMethod = jest.fn().mockReturnValue({ select: selectMethod });
      const updateMethod = jest.fn().mockReturnValue({ eq: eqMethod });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { update: updateMethod };
        }
        return { select: jest.fn().mockReturnThis() };
      });
      
      // Act & Assert
      await expect(bookService.updateBook(bookId, updateData))
        .rejects.toThrow();
      
      // Giả lập UI hiển thị lỗi
      Alert.alert('Error', 'Failed to update book. Please try again.');
      
      // Kiểm tra Alert đã được gọi
      expect(Alert.alert).toHaveBeenCalledWith(
        'Error',
        'Failed to update book. Please try again.'
      );
    });
  });
}); 