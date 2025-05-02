// Mock supabase trước khi import module
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

// Import module sau khi mock
import { supabase } from '../../config/supabase';
import { bookService } from '../../services/database.service';

// Tắt các console log và error trong quá trình test
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBook', () => {
    test('nên tạo sách mới thành công', async () => {
      // Arrange
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test description',
        category: 'Test Category',
        isbn: '1234567890',
        price: 29.99,
        imageUrl: 'https://example.com/cover.jpg'
      };
      
      const mockCreatedBook = {
        id: 'book-123',
        ...bookData,
        dateAdded: '2023-06-01'
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockCreatedBook,
        error: null
      });

      const selectMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const insertMethod = jest.fn().mockReturnValue({
        select: selectMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { insert: insertMethod };
        }
        return {};
      });

      // Act
      const result = await bookService.createBook(bookData);

      // Assert
      expect(result).toEqual(mockCreatedBook);
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(insertMethod).toHaveBeenCalledWith([bookData]);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const bookData = {
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test description',
        category: 'Test Category',
        isbn: '1234567890',
        price: 29.99,
        imageUrl: 'https://example.com/cover.jpg'
      };
      const errorMsg = 'Database error';

      const singleMethod = jest.fn().mockReturnValue({
        data: null,
        error: new Error(errorMsg)
      });

      const selectMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const insertMethod = jest.fn().mockReturnValue({
        select: selectMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { insert: insertMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(bookService.createBook(bookData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(insertMethod).toHaveBeenCalledWith([bookData]);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('getBookById', () => {
    test('nên trả về sách khi tìm thấy ID', async () => {
      // Arrange
      const bookId = 'book-123';
      const mockBook = {
        id: bookId,
        title: 'Test Book',
        author: 'Test Author',
        description: 'Test description',
        category: 'Test Category',
        isbn: '1234567890',
        price: 29.99,
        imageUrl: 'https://example.com/cover.jpg',
        dateAdded: '2023-06-01'
      };

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
        return {};
      });

      // Act
      const result = await bookService.getBookById(bookId);

      // Assert
      expect(result).toEqual(mockBook);
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const bookId = 'nonexistent-id';
      const errorMsg = 'Database error';

      const singleMethod = jest.fn().mockReturnValue({
        data: null,
        error: new Error(errorMsg)
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
        return {};
      });

      // Act & Assert
      await expect(bookService.getBookById(bookId))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('getAllBooks', () => {
    test('nên trả về tất cả sách khi request thành công', async () => {
      // Arrange
      const mockBooks = [
        {
          id: 'book-1',
          title: 'Test Book 1',
          author: 'Test Author 1',
          description: 'Test description 1',
          category: 'Test Category 1',
          isbn: '1234567890',
          price: 29.99,
          imageUrl: 'https://example.com/cover1.jpg',
          dateAdded: '2023-06-01'
        },
        {
          id: 'book-2',
          title: 'Test Book 2',
          author: 'Test Author 2',
          description: 'Test description 2',
          category: 'Test Category 2',
          isbn: '0987654321',
          price: 19.99,
          imageUrl: 'https://example.com/cover2.jpg',
          dateAdded: '2023-06-02'
        }
      ];

      const selectMethod = jest.fn().mockReturnValue({
        data: mockBooks,
        error: null
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await bookService.getAllBooks();

      // Assert
      expect(result).toEqual(mockBooks);
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(selectMethod).toHaveBeenCalledWith('*');
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const errorMsg = 'Database error';
      
      const selectMethod = jest.fn().mockReturnValue({
        data: null,
        error: new Error(errorMsg)
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(bookService.getAllBooks())
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(selectMethod).toHaveBeenCalledWith('*');
    });
  });

  describe('updateBook', () => {
    test('nên cập nhật sách thành công', async () => {
      // Arrange
      const bookId = 'book-123';
      const bookData = {
        title: 'Updated Book Title',
        description: 'Updated description',
        price: 34.99
      };
      
      const mockUpdatedBook = {
        id: bookId,
        title: 'Updated Book Title',
        author: 'Test Author',
        description: 'Updated description',
        category: 'Test Category',
        isbn: '1234567890',
        price: 34.99,
        imageUrl: 'https://example.com/cover.jpg',
        dateAdded: '2023-06-01'
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockUpdatedBook,
        error: null
      });

      const selectMethod = jest.fn().mockReturnValue({
        single: singleMethod
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
        return {};
      });

      // Act
      const result = await bookService.updateBook(bookId, bookData);

      // Assert
      expect(result).toEqual(mockUpdatedBook);
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(updateMethod).toHaveBeenCalledWith(bookData);
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi cập nhật thất bại', async () => {
      // Arrange
      const bookId = 'book-123';
      const bookData = {
        title: 'Updated Book Title',
        description: 'Updated description',
        price: 34.99
      };
      const errorMsg = 'Database error';

      const singleMethod = jest.fn().mockReturnValue({
        data: null,
        error: new Error(errorMsg)
      });

      const selectMethod = jest.fn().mockReturnValue({
        single: singleMethod
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
        return {};
      });

      // Act & Assert
      await expect(bookService.updateBook(bookId, bookData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(updateMethod).toHaveBeenCalledWith(bookData);
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('deleteBook', () => {
    test('nên xóa sách thành công', async () => {
      // Arrange
      const bookId = 'book-123';
      
      const deleteResponse = {
        error: null
      };

      const eqMethod = jest.fn().mockReturnValue(deleteResponse);

      const deleteMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { delete: deleteMethod };
        }
        return {};
      });

      // Act
      await bookService.deleteBook(bookId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(deleteMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
    });

    test('nên ném lỗi khi xóa thất bại', async () => {
      // Arrange
      const bookId = 'book-123';
      const errorMsg = 'Database error';

      const deleteResponse = {
        error: new Error(errorMsg)
      };

      const eqMethod = jest.fn().mockReturnValue(deleteResponse);

      const deleteMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { delete: deleteMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(bookService.deleteBook(bookId))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(deleteMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
    });
  });
}); 