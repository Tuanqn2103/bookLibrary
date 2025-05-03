// Mock supabase trước khi import module
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

// Import module sau khi mock
import { supabase } from '../../config/supabase';
import { borrowingService } from '../../services/database.service';

// Tắt các console log và error trong quá trình test
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('BorrowingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBorrowing', () => {
    test('nên tạo ghi mượn sách mới thành công', async () => {
      // Arrange
      const borrowingData = {
        user_id: 'user-123',
        book_id: 'book-456',
        borrow_date: '2023-06-01',
        return_date: '2023-06-15',
        status: 'borrowed'
      };
      
      const mockCreatedBorrowing = {
        id: 'borrowing-789',
        ...borrowingData
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockCreatedBorrowing,
        error: null
      });

      const selectMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const insertMethod = jest.fn().mockReturnValue({
        select: selectMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'borrowings') {
          return { insert: insertMethod };
        }
        return {};
      });

      // Act
      const result = await borrowingService.createBorrowing(borrowingData);

      // Assert
      expect(result).toEqual(mockCreatedBorrowing);
      expect(supabase.from).toHaveBeenCalledWith('borrowings');
      expect(insertMethod).toHaveBeenCalledWith([borrowingData]);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const borrowingData = {
        user_id: 'user-123',
        book_id: 'book-456',
        borrow_date: '2023-06-01',
        return_date: '2023-06-15',
        status: 'borrowed'
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
        if (table === 'borrowings') {
          return { insert: insertMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(borrowingService.createBorrowing(borrowingData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('borrowings');
      expect(insertMethod).toHaveBeenCalledWith([borrowingData]);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('getBorrowingById', () => {
    test('nên trả về ghi mượn sách khi tìm thấy ID', async () => {
      // Arrange
      const borrowingId = 'borrowing-789';
      const mockBorrowing = {
        id: borrowingId,
        user_id: 'user-123',
        book_id: 'book-456',
        borrow_date: '2023-06-01',
        return_date: '2023-06-15',
        status: 'borrowed'
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockBorrowing,
        error: null
      });

      const eqMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const selectMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'borrowings') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await borrowingService.getBorrowingById(borrowingId);

      // Assert
      expect(result).toEqual(mockBorrowing);
      expect(supabase.from).toHaveBeenCalledWith('borrowings');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('id', borrowingId);
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const borrowingId = 'nonexistent-id';
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
        if (table === 'borrowings') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(borrowingService.getBorrowingById(borrowingId))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('borrowings');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('id', borrowingId);
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('getUserBorrowings', () => {
    test('nên trả về danh sách mượn sách của người dùng', async () => {
      // Arrange
      const userId = 'user-123';
      const mockBorrowings = [
        {
          id: 'borrowing-1',
          user_id: userId,
          book_id: 'book-1',
          borrow_date: '2023-06-01',
          return_date: '2023-06-15',
          status: 'borrowed',
          books: {
            id: 'book-1',
            title: 'Book Title 1',
            author: 'Author 1'
          }
        },
        {
          id: 'borrowing-2',
          user_id: userId,
          book_id: 'book-2',
          borrow_date: '2023-07-01',
          return_date: '2023-07-15',
          status: 'returned',
          books: {
            id: 'book-2',
            title: 'Book Title 2',
            author: 'Author 2'
          }
        }
      ];

      const eqMethod = jest.fn().mockReturnValue({
        data: mockBorrowings,
        error: null
      });

      const selectMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'borrowings') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await borrowingService.getUserBorrowings(userId);

      // Assert
      expect(result).toEqual(mockBorrowings);
      expect(supabase.from).toHaveBeenCalledWith('borrowings');
      expect(selectMethod).toHaveBeenCalledWith('*, books(*)');
      expect(eqMethod).toHaveBeenCalledWith('user_id', userId);
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const userId = 'user-123';
      const errorMsg = 'Database error';

      const eqMethod = jest.fn().mockReturnValue({
        data: null,
        error: new Error(errorMsg)
      });

      const selectMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'borrowings') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(borrowingService.getUserBorrowings(userId))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('borrowings');
      expect(selectMethod).toHaveBeenCalledWith('*, books(*)');
      expect(eqMethod).toHaveBeenCalledWith('user_id', userId);
    });
  });

  describe('updateBorrowing', () => {
    test('nên cập nhật ghi mượn sách thành công', async () => {
      // Arrange
      const borrowingId = 'borrowing-789';
      const borrowingData = {
        status: 'returned',
        actual_return_date: '2023-06-10'
      };
      
      const mockUpdatedBorrowing = {
        id: borrowingId,
        user_id: 'user-123',
        book_id: 'book-456',
        borrow_date: '2023-06-01',
        return_date: '2023-06-15',
        actual_return_date: '2023-06-10',
        status: 'returned'
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockUpdatedBorrowing,
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
        if (table === 'borrowings') {
          return { update: updateMethod };
        }
        return {};
      });

      // Act
      const result = await borrowingService.updateBorrowing(borrowingId, borrowingData);

      // Assert
      expect(result).toEqual(mockUpdatedBorrowing);
      expect(supabase.from).toHaveBeenCalledWith('borrowings');
      expect(updateMethod).toHaveBeenCalledWith(borrowingData);
      expect(eqMethod).toHaveBeenCalledWith('id', borrowingId);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi cập nhật thất bại', async () => {
      // Arrange
      const borrowingId = 'borrowing-789';
      const borrowingData = {
        status: 'returned',
        actual_return_date: '2023-06-10'
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
        if (table === 'borrowings') {
          return { update: updateMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(borrowingService.updateBorrowing(borrowingId, borrowingData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('borrowings');
      expect(updateMethod).toHaveBeenCalledWith(borrowingData);
      expect(eqMethod).toHaveBeenCalledWith('id', borrowingId);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });
  });
}); 