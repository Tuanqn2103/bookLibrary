// Mock first
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

// Then import
import { supabase } from '../../config/supabase';
import { bookService } from '../../services/book.service';

// Tắt các console log và error trong quá trình test
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('BookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllBooks', () => {
    test('nên lấy tất cả sách', async () => {
      // Arrange
      const mockBooksData = [
        { 
          id: 1, 
          title: 'Book 1',
          author: 'Unknown Author',
          author_id: undefined,
          category: 'Uncategorized',
          category_id: undefined,
          description: undefined,
          cover_image: undefined,
          isbn: undefined,
          published_date: undefined,
          total_copies: undefined,
          available_copies: undefined,
          status: undefined
        },
        { 
          id: 2, 
          title: 'Book 2',
          author: 'Unknown Author',
          author_id: undefined,
          category: 'Uncategorized',
          category_id: undefined,
          description: undefined,
          cover_image: undefined,
          isbn: undefined,
          published_date: undefined,
          total_copies: undefined,
          available_copies: undefined,
          status: undefined
        }
      ];
      
      // Setup mock
      const selectMethod = jest.fn().mockReturnValue({
        data: mockBooksData,
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
      expect(result).toEqual(mockBooksData);
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(selectMethod).toHaveBeenCalled();
    });
    
    test('nên ném lỗi khi có lỗi từ Supabase', async () => {
      // Arrange
      const errorMsg = 'Database error';
      const selectMethod = jest.fn().mockRejectedValue(new Error(errorMsg));
      
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { select: selectMethod };
        }
        return {};
      });
      
      // Act & Assert
      await expect(bookService.getAllBooks())
        .rejects.toThrow();
      
      expect(supabase.from).toHaveBeenCalledWith('books');
    });
  });

  describe('getBookById', () => {
    test('nên lấy sách theo ID và định dạng dữ liệu đúng', async () => {
      // Arrange
      const bookId = 1;
      const mockBookData = {
        id: bookId,
        title: 'Test Book',
        author: 'Unknown Author',
        author_id: 1,
        category: 'Uncategorized',
        category_id: 2,
        description: 'Test Description',
        cover_image: 'test.jpg',
        isbn: undefined,
        published_date: undefined,
        total_copies: undefined,
        available_copies: undefined,
        status: undefined
      };
      
      // Setup mock chain
      const singleMethod = jest.fn().mockReturnValue({
        data: mockBookData,
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
      expect(result).toEqual(mockBookData);
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(selectMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
      expect(singleMethod).toHaveBeenCalled();
    });
    
    test('nên trả về null khi không tìm thấy sách', async () => {
      // Arrange
      const bookId = 999;
      
      // Setup mock chain
      const singleMethod = jest.fn().mockReturnValue({
        data: null,
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
      expect(result).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(selectMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
      expect(singleMethod).toHaveBeenCalled();
    });
    
    test('nên ném lỗi khi có lỗi từ Supabase', async () => {
      // Arrange
      const bookId = 1;
      const errorMsg = 'Database error';
      
      // Setup mock chain
      const singleMethod = jest.fn().mockRejectedValue(new Error(errorMsg));
      
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
        .rejects.toThrow();
      
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(selectMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('addBook', () => {
    test('nên thêm sách mới thành công', async () => {
      // Arrange
      const bookData = {
        title: 'New Book',
        author_id: 1,
        category_id: 2,
        description: 'Description',
        cover_image: 'cover.jpg'
      };
      
      const mockResponse = {
        id: 1,
        ...bookData,
        created_at: '2023-01-01'
      };
      
      // Setup mock chain
      const selectMethod = jest.fn().mockReturnValue({
        data: [mockResponse],
        error: null
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
      const result = await bookService.addBook(bookData);
      
      // Assert
      expect(result).toEqual(mockResponse);
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(insertMethod).toHaveBeenCalledWith([bookData]);
      expect(selectMethod).toHaveBeenCalled();
    });
    
    test('nên ném lỗi khi có lỗi từ Supabase', async () => {
      // Arrange
      const bookData = {
        title: 'New Book',
        author_id: 1
      };
      
      const errorMsg = 'Database error';
      
      // Setup mock chain
      const selectMethod = jest.fn().mockRejectedValue(new Error(errorMsg));
      
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
      await expect(bookService.addBook(bookData))
        .rejects.toThrow();
      
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(insertMethod).toHaveBeenCalledWith([bookData]);
      expect(selectMethod).toHaveBeenCalled();
    });
  });

  describe('updateBook', () => {
    test('nên cập nhật sách thành công', async () => {
      // Arrange
      const bookId = 1;
      const bookData = {
        title: 'Updated Book',
        description: 'New Description'
      };
      
      const mockUpdatedBook = {
        id: bookId,
        title: 'Updated Book',
        description: 'New Description',
        author_id: 1,
        category_id: 2,
        cover_image: 'cover.jpg',
        created_at: '2023-01-01'
      };
      
      // Setup mock chain
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
    });
    
    test('nên ném lỗi khi có lỗi từ Supabase', async () => {
      // Arrange
      const bookId = 1;
      const bookData = {
        title: 'Updated Book'
      };
      
      const errorMsg = 'Database error';
      
      // Setup mock chain
      const selectMethod = jest.fn().mockRejectedValue(new Error(errorMsg));
      
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
        .rejects.toThrow();
      
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(updateMethod).toHaveBeenCalledWith(bookData);
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
      expect(selectMethod).toHaveBeenCalled();
    });
  });

  describe('deleteBook', () => {
    test('nên xóa sách thành công', async () => {
      // Arrange
      const bookId = 1;
      
      // Setup mock chain
      const eqMethod = jest.fn().mockReturnValue({
        data: { id: bookId },
        error: null
      });
      
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
      const result = await bookService.deleteBook(bookId);
      
      // Assert
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(deleteMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
    });
    
    test('nên ném lỗi khi có lỗi từ Supabase', async () => {
      // Arrange
      const bookId = 1;
      const errorMsg = 'Database error';
      
      // Setup mock chain
      const eqMethod = jest.fn().mockRejectedValue(new Error(errorMsg));
      
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
        .rejects.toThrow();
      
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(deleteMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', bookId);
    });
  });

  describe('searchBooks', () => {
    test('nên tìm kiếm sách theo query', async () => {
      // Arrange
      const searchQuery = 'Test';
      const mockSearchResults = [
        { id: 1, title: 'Test Book 1' },
        { id: 2, title: 'Test Book 2' }
      ];
      
      // Setup mock chain
      const orMethod = jest.fn().mockReturnValue({
        data: mockSearchResults,
        error: null
      });
      
      const selectMethod = jest.fn().mockReturnValue({
        or: orMethod
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { select: selectMethod };
        }
        return {};
      });
      
      // Act
      const result = await bookService.searchBooks(searchQuery);
      
      // Assert
      expect(result).toEqual(mockSearchResults);
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(selectMethod).toHaveBeenCalled();
      expect(orMethod).toHaveBeenCalledWith(expect.stringContaining(searchQuery));
    });
    
    test('nên ném lỗi khi có lỗi từ Supabase', async () => {
      // Arrange
      const searchQuery = 'Test';
      const errorMsg = 'Database error';
      
      // Setup mock chain
      const orMethod = jest.fn().mockRejectedValue(new Error(errorMsg));
      
      const selectMethod = jest.fn().mockReturnValue({
        or: orMethod
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'books') {
          return { select: selectMethod };
        }
        return {};
      });
      
      // Act & Assert
      await expect(bookService.searchBooks(searchQuery))
        .rejects.toThrow();
      
      expect(supabase.from).toHaveBeenCalledWith('books');
      expect(selectMethod).toHaveBeenCalled();
      expect(orMethod).toHaveBeenCalledWith(expect.stringContaining(searchQuery));
    });
  });

  describe('getAllCategories', () => {
    test('nên lấy tất cả các danh mục', async () => {
      // Arrange
      const mockCategories = [
        { id: 1, categoryname: 'Fiction' },
        { id: 2, categoryname: 'Non-fiction' }
      ];
      
      // Setup mock chain
      const orderMethod = jest.fn().mockReturnValue({
        data: mockCategories,
        error: null
      });
      
      const selectMethod = jest.fn().mockReturnValue({
        order: orderMethod
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'categories') {
          return { select: selectMethod };
        }
        return {};
      });
      
      // Act
      const result = await bookService.getAllCategories();
      
      // Assert
      expect(result).toEqual(mockCategories);
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(selectMethod).toHaveBeenCalled();
      expect(orderMethod).toHaveBeenCalledWith('categoryname');
    });
    
    test('nên ném lỗi khi có lỗi từ Supabase', async () => {
      // Arrange
      const errorMsg = 'Database error';
      
      // Setup mock chain
      const orderMethod = jest.fn().mockRejectedValue(new Error(errorMsg));
      
      const selectMethod = jest.fn().mockReturnValue({
        order: orderMethod
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'categories') {
          return { select: selectMethod };
        }
        return {};
      });
      
      // Act & Assert
      await expect(bookService.getAllCategories())
        .rejects.toThrow();
      
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(selectMethod).toHaveBeenCalled();
      expect(orderMethod).toHaveBeenCalledWith('categoryname');
    });
  });

  describe('getAllAuthors', () => {
    test('nên lấy tất cả các tác giả', async () => {
      // Arrange
      const mockAuthors = [
        { id: 1, authorname: 'Author 1' },
        { id: 2, authorname: 'Author 2' }
      ];
      
      // Setup mock chain
      const orderMethod = jest.fn().mockReturnValue({
        data: mockAuthors,
        error: null
      });
      
      const selectMethod = jest.fn().mockReturnValue({
        order: orderMethod
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'authors') {
          return { select: selectMethod };
        }
        return {};
      });
      
      // Act
      const result = await bookService.getAllAuthors();
      
      // Assert
      expect(result).toEqual(mockAuthors);
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(selectMethod).toHaveBeenCalled();
      expect(orderMethod).toHaveBeenCalledWith('authorname');
    });
    
    test('nên ném lỗi khi có lỗi từ Supabase', async () => {
      // Arrange
      const errorMsg = 'Database error';
      
      // Setup mock chain
      const orderMethod = jest.fn().mockRejectedValue(new Error(errorMsg));
      
      const selectMethod = jest.fn().mockReturnValue({
        order: orderMethod
      });
      
      supabase.from.mockImplementation((table) => {
        if (table === 'authors') {
          return { select: selectMethod };
        }
        return {};
      });
      
      // Act & Assert
      await expect(bookService.getAllAuthors())
        .rejects.toThrow();
      
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(selectMethod).toHaveBeenCalled();
      expect(orderMethod).toHaveBeenCalledWith('authorname');
    });
  });
}); 