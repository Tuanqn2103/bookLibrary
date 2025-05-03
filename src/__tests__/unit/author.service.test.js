// Mock supabase trước khi import module
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

// Import module sau khi mock
import { supabase } from '../../config/supabase';
import { authorService } from '../../services/author.service';

// Tắt các console log và error trong quá trình test
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('AuthorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllAuthors', () => {
    test('nên trả về tất cả tác giả khi request thành công', async () => {
      // Arrange
      const mockAuthors = [
        { id: 1, authorname: 'Author 1', bio: 'Bio of Author 1' },
        { id: 2, authorname: 'Author 2', bio: 'Bio of Author 2' }
      ];

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
      const result = await authorService.getAllAuthors();

      // Assert
      expect(result).toEqual(mockAuthors);
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(orderMethod).toHaveBeenCalledWith('authorname', { ascending: true });
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const errorMsg = 'Database error';
      
      const orderMethod = jest.fn().mockReturnValue({
        data: null,
        error: new Error(errorMsg)
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

      // Act & Assert
      await expect(authorService.getAllAuthors())
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(orderMethod).toHaveBeenCalledWith('authorname', { ascending: true });
    });
  });

  describe('getAuthorById', () => {
    test('nên trả về tác giả khi tìm thấy ID', async () => {
      // Arrange
      const authorId = 1;
      const mockAuthor = {
        id: authorId,
        authorname: 'Author 1',
        bio: 'Bio of Author 1'
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockAuthor,
        error: null
      });

      const eqMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const selectMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'authors') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await authorService.getAuthorById(authorId);

      // Assert
      expect(result).toEqual(mockAuthor);
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('id', authorId);
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const authorId = 999;
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
        if (table === 'authors') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(authorService.getAuthorById(authorId))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('id', authorId);
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('addAuthor', () => {
    test('nên thêm tác giả mới thành công', async () => {
      // Arrange
      const authorData = {
        authorname: 'New Author',
        bio: 'Biography of New Author'
      };
      
      const mockAddedAuthor = {
        id: 3,
        ...authorData
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockAddedAuthor,
        error: null
      });

      const selectMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const insertMethod = jest.fn().mockReturnValue({
        select: selectMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'authors') {
          return { insert: insertMethod };
        }
        return {};
      });

      // Act
      const result = await authorService.addAuthor(authorData);

      // Assert
      expect(result).toEqual(mockAddedAuthor);
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(insertMethod).toHaveBeenCalledWith([authorData]);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const authorData = {
        authorname: 'New Author',
        bio: 'Biography of New Author'
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
        if (table === 'authors') {
          return { insert: insertMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(authorService.addAuthor(authorData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(insertMethod).toHaveBeenCalledWith([authorData]);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('updateAuthor', () => {
    test('nên cập nhật tác giả thành công', async () => {
      // Arrange
      const authorId = 1;
      const authorData = {
        authorname: 'Updated Author',
        bio: 'Updated biography'
      };
      
      const mockUpdatedAuthor = {
        id: authorId,
        ...authorData
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockUpdatedAuthor,
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
        if (table === 'authors') {
          return { update: updateMethod };
        }
        return {};
      });

      // Act
      const result = await authorService.updateAuthor(authorId, authorData);

      // Assert
      expect(result).toEqual(mockUpdatedAuthor);
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(updateMethod).toHaveBeenCalledWith(authorData);
      expect(eqMethod).toHaveBeenCalledWith('id', authorId);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const authorId = 999;
      const authorData = {
        authorname: 'Updated Author',
        bio: 'Updated biography'
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
        if (table === 'authors') {
          return { update: updateMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(authorService.updateAuthor(authorId, authorData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(updateMethod).toHaveBeenCalledWith(authorData);
      expect(eqMethod).toHaveBeenCalledWith('id', authorId);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('deleteAuthor', () => {
    test('nên xóa tác giả thành công', async () => {
      // Arrange
      const authorId = 1;
      
      const deleteResponse = {
        error: null
      };

      const eqMethod = jest.fn().mockReturnValue(deleteResponse);

      const deleteMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'authors') {
          return { delete: deleteMethod };
        }
        return {};
      });

      // Act
      const result = await authorService.deleteAuthor(authorId);

      // Assert
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(deleteMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', authorId);
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const authorId = 999;
      const errorMsg = 'Database error';

      const deleteResponse = {
        error: new Error(errorMsg)
      };

      const eqMethod = jest.fn().mockReturnValue(deleteResponse);

      const deleteMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'authors') {
          return { delete: deleteMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(authorService.deleteAuthor(authorId))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(deleteMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', authorId);
    });
  });

  describe('searchAuthors', () => {
    test('nên trả về các tác giả phù hợp khi tìm kiếm thành công', async () => {
      // Arrange
      const query = 'john';
      const mockAuthors = [
        { id: 1, authorname: 'John Smith', bio: 'Bio of John Smith' },
        { id: 3, authorname: 'John Doe', bio: 'Bio of John Doe' }
      ];

      const orderMethod = jest.fn().mockReturnValue({
        data: mockAuthors,
        error: null
      });

      const ilikeMethod = jest.fn().mockReturnValue({
        order: orderMethod
      });

      const selectMethod = jest.fn().mockReturnValue({
        ilike: ilikeMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'authors') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await authorService.searchAuthors(query);

      // Assert
      expect(result).toEqual(mockAuthors);
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(ilikeMethod).toHaveBeenCalledWith('authorname', `%${query}%`);
      expect(orderMethod).toHaveBeenCalledWith('authorname', { ascending: true });
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const query = 'john';
      const errorMsg = 'Database error';
      
      const orderMethod = jest.fn().mockReturnValue({
        data: null,
        error: new Error(errorMsg)
      });

      const ilikeMethod = jest.fn().mockReturnValue({
        order: orderMethod
      });

      const selectMethod = jest.fn().mockReturnValue({
        ilike: ilikeMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'authors') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(authorService.searchAuthors(query))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(ilikeMethod).toHaveBeenCalledWith('authorname', `%${query}%`);
      expect(orderMethod).toHaveBeenCalledWith('authorname', { ascending: true });
    });

    test('nên trả về danh sách rỗng khi không có kết quả phù hợp', async () => {
      // Arrange
      const query = 'nonexistent';
      
      const orderMethod = jest.fn().mockReturnValue({
        data: [],
        error: null
      });

      const ilikeMethod = jest.fn().mockReturnValue({
        order: orderMethod
      });

      const selectMethod = jest.fn().mockReturnValue({
        ilike: ilikeMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'authors') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await authorService.searchAuthors(query);

      // Assert
      expect(result).toEqual([]);
      expect(supabase.from).toHaveBeenCalledWith('authors');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(ilikeMethod).toHaveBeenCalledWith('authorname', `%${query}%`);
      expect(orderMethod).toHaveBeenCalledWith('authorname', { ascending: true });
    });
  });
}); 