// Mock supabase trước khi import module
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

// Import module sau khi mock
import { supabase } from '../../config/supabase';
import { categoryService } from '../../services/category.service';

// Tắt các console log và error trong quá trình test
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('CategoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    test('nên trả về tất cả danh mục khi request thành công', async () => {
      // Arrange
      const mockCategories = [
        { id: 1, categoryname: 'Fiction', description: 'Fiction books' },
        { id: 2, categoryname: 'Non-fiction', description: 'Non-fiction books' }
      ];

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
      const result = await categoryService.getAllCategories();

      // Assert
      expect(result).toEqual(mockCategories);
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(orderMethod).toHaveBeenCalledWith('categoryname', { ascending: true });
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
        if (table === 'categories') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(categoryService.getAllCategories())
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(orderMethod).toHaveBeenCalledWith('categoryname', { ascending: true });
    });
  });

  describe('getCategoryById', () => {
    test('nên trả về danh mục khi tìm thấy ID', async () => {
      // Arrange
      const categoryId = 1;
      const mockCategory = {
        id: categoryId,
        categoryname: 'Fiction',
        description: 'Fiction books'
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockCategory,
        error: null
      });

      const eqMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const selectMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'categories') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await categoryService.getCategoryById(categoryId);

      // Assert
      expect(result).toEqual(mockCategory);
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('id', categoryId);
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const categoryId = 999;
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
        if (table === 'categories') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(categoryService.getCategoryById(categoryId))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('id', categoryId);
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('addCategory', () => {
    test('nên thêm danh mục mới thành công', async () => {
      // Arrange
      const categoryData = {
        categoryname: 'New Category',
        description: 'Description for new category'
      };
      
      const mockAddedCategory = {
        id: 3,
        ...categoryData
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockAddedCategory,
        error: null
      });

      const selectMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const insertMethod = jest.fn().mockReturnValue({
        select: selectMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'categories') {
          return { insert: insertMethod };
        }
        return {};
      });

      // Act
      const result = await categoryService.addCategory(categoryData);

      // Assert
      expect(result).toEqual(mockAddedCategory);
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(insertMethod).toHaveBeenCalledWith([categoryData]);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const categoryData = {
        categoryname: 'New Category',
        description: 'Description for new category'
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
        if (table === 'categories') {
          return { insert: insertMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(categoryService.addCategory(categoryData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(insertMethod).toHaveBeenCalledWith([categoryData]);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    test('nên cập nhật danh mục thành công', async () => {
      // Arrange
      const categoryId = 1;
      const categoryData = {
        categoryname: 'Updated Category',
        description: 'Updated description'
      };
      
      const mockUpdatedCategory = {
        id: categoryId,
        ...categoryData
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockUpdatedCategory,
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
        if (table === 'categories') {
          return { update: updateMethod };
        }
        return {};
      });

      // Act
      const result = await categoryService.updateCategory(categoryId, categoryData);

      // Assert
      expect(result).toEqual(mockUpdatedCategory);
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(updateMethod).toHaveBeenCalledWith(categoryData);
      expect(eqMethod).toHaveBeenCalledWith('id', categoryId);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const categoryId = 999;
      const categoryData = {
        categoryname: 'Updated Category',
        description: 'Updated description'
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
        if (table === 'categories') {
          return { update: updateMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(categoryService.updateCategory(categoryId, categoryData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(updateMethod).toHaveBeenCalledWith(categoryData);
      expect(eqMethod).toHaveBeenCalledWith('id', categoryId);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    test('nên xóa danh mục thành công', async () => {
      // Arrange
      const categoryId = 1;
      
      const deleteResponse = {
        error: null
      };

      const eqMethod = jest.fn().mockReturnValue(deleteResponse);

      const deleteMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'categories') {
          return { delete: deleteMethod };
        }
        return {};
      });

      // Act
      const result = await categoryService.deleteCategory(categoryId);

      // Assert
      expect(result).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(deleteMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', categoryId);
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const categoryId = 999;
      const errorMsg = 'Database error';

      const deleteResponse = {
        error: new Error(errorMsg)
      };

      const eqMethod = jest.fn().mockReturnValue(deleteResponse);

      const deleteMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'categories') {
          return { delete: deleteMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(categoryService.deleteCategory(categoryId))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(deleteMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', categoryId);
    });
  });

  describe('searchCategories', () => {
    test('nên trả về các danh mục phù hợp khi tìm kiếm thành công', async () => {
      // Arrange
      const query = 'fiction';
      const mockCategories = [
        { id: 1, categoryname: 'Fiction', description: 'Fiction books' },
        { id: 3, categoryname: 'Science Fiction', description: 'Science Fiction books' }
      ];

      const orderMethod = jest.fn().mockReturnValue({
        data: mockCategories,
        error: null
      });

      const ilikeMethod = jest.fn().mockReturnValue({
        order: orderMethod
      });

      const selectMethod = jest.fn().mockReturnValue({
        ilike: ilikeMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'categories') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await categoryService.searchCategories(query);

      // Assert
      expect(result).toEqual(mockCategories);
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(ilikeMethod).toHaveBeenCalledWith('categoryname', `%${query}%`);
      expect(orderMethod).toHaveBeenCalledWith('categoryname', { ascending: true });
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const query = 'fiction';
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
        if (table === 'categories') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(categoryService.searchCategories(query))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(ilikeMethod).toHaveBeenCalledWith('categoryname', `%${query}%`);
      expect(orderMethod).toHaveBeenCalledWith('categoryname', { ascending: true });
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
        if (table === 'categories') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await categoryService.searchCategories(query);

      // Assert
      expect(result).toEqual([]);
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(ilikeMethod).toHaveBeenCalledWith('categoryname', `%${query}%`);
      expect(orderMethod).toHaveBeenCalledWith('categoryname', { ascending: true });
    });
  });
}); 