// Mock supabase trước khi import module
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

// Import module sau khi mock
import { supabase } from '../../config/supabase';
import { userService } from '../../services/database.service';

// Tắt các console log và error trong quá trình test
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    test('nên tạo user mới thành công', async () => {
      // Arrange
      const userData = {
        id: 'auth-user-id',
        userName: 'newuser',
        email: 'newuser@example.com',
        role: 'user'
      };
      
      const mockCreatedUser = {
        ...userData
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockCreatedUser,
        error: null
      });

      const selectMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const insertMethod = jest.fn().mockReturnValue({
        select: selectMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return { insert: insertMethod };
        }
        return {};
      });

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(mockCreatedUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(insertMethod).toHaveBeenCalledWith([{
        id: userData.id,
        userName: userData.userName,
        email: userData.email,
        role: userData.role
      }]);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const userData = {
        id: 'auth-user-id',
        userName: 'newuser',
        email: 'newuser@example.com',
        role: 'user'
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
        if (table === 'users') {
          return { insert: insertMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(insertMethod).toHaveBeenCalledWith([{
        id: userData.id,
        userName: userData.userName,
        email: userData.email,
        role: userData.role
      }]);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    test('nên trả về user khi tìm thấy ID', async () => {
      // Arrange
      const userId = 'user-123';
      const mockUser = {
        id: userId,
        userName: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockUser,
        error: null
      });

      const eqMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const selectMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('id', userId);
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const userId = 'nonexistent-id';
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
        if (table === 'users') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(userService.getUserById(userId))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('id', userId);
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('updateUser', () => {
    test('nên cập nhật thông tin người dùng thành công', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData = {
        userName: 'updateduser',
        email: 'updated@example.com'
      };
      
      const mockUpdatedUser = {
        id: userId,
        userName: 'updateduser',
        email: 'updated@example.com',
        role: 'user'
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockUpdatedUser,
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
        if (table === 'users') {
          return { update: updateMethod };
        }
        return {};
      });

      // Act
      const result = await userService.updateUser(userId, updateData);

      // Assert
      expect(result).toEqual(mockUpdatedUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(updateMethod).toHaveBeenCalledWith(updateData);
      expect(eqMethod).toHaveBeenCalledWith('id', userId);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi cập nhật thất bại', async () => {
      // Arrange
      const userId = 'user-123';
      const updateData = {
        userName: 'updateduser',
        email: 'updated@example.com'
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
        if (table === 'users') {
          return { update: updateMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(userService.updateUser(userId, updateData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(updateMethod).toHaveBeenCalledWith(updateData);
      expect(eqMethod).toHaveBeenCalledWith('id', userId);
      expect(selectMethod).toHaveBeenCalled();
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('getAllUsers', () => {
    test('nên trả về tất cả người dùng khi request thành công', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, userName: 'user1', email: 'user1@example.com', role: 'user' },
        { id: 2, userName: 'user2', email: 'user2@example.com', role: 'admin' }
      ];

      const selectMethod = jest.fn().mockReturnValue({
        data: mockUsers,
        error: null
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await userService.getAllUsers();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(supabase.from).toHaveBeenCalledWith('users');
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
        if (table === 'users') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(userService.getAllUsers())
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(selectMethod).toHaveBeenCalledWith('*');
    });
  });

  describe('getUserByEmail', () => {
    test('nên trả về user khi tìm thấy email', async () => {
      // Arrange
      const email = 'test@example.com';
      const mockUser = {
        id: 1,
        userName: 'testuser',
        email,
        role: 'user'
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockUser,
        error: null
      });

      const eqMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const selectMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await userService.getUserByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('email', email);
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
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
        if (table === 'users') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(userService.getUserByEmail(email))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('email', email);
      expect(singleMethod).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    test('nên xóa người dùng thành công', async () => {
      // Arrange
      const userId = 'user-123';
      
      const deleteResponse = {
        error: null
      };

      const eqMethod = jest.fn().mockReturnValue(deleteResponse);

      const deleteMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return { delete: deleteMethod };
        }
        return {};
      });

      // Act
      await userService.deleteUser(userId);

      // Assert
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(deleteMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', userId);
    });

    test('nên ném lỗi khi xóa thất bại', async () => {
      // Arrange
      const userId = 'user-123';
      const errorMsg = 'Database error';

      const deleteResponse = {
        error: new Error(errorMsg)
      };

      const eqMethod = jest.fn().mockReturnValue(deleteResponse);

      const deleteMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return { delete: deleteMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(userService.deleteUser(userId))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(deleteMethod).toHaveBeenCalled();
      expect(eqMethod).toHaveBeenCalledWith('id', userId);
    });
  });

  describe('getUserByUsername', () => {
    test('nên trả về user khi tìm thấy username', async () => {
      // Arrange
      const username = 'testuser';
      const mockUser = {
        id: 1,
        userName: username,
        email: 'test@example.com',
        role: 'user'
      };

      const singleMethod = jest.fn().mockReturnValue({
        data: mockUser,
        error: null
      });

      const eqMethod = jest.fn().mockReturnValue({
        single: singleMethod
      });

      const selectMethod = jest.fn().mockReturnValue({
        eq: eqMethod
      });

      supabase.from.mockImplementation((table) => {
        if (table === 'users') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act
      const result = await userService.getUserByUsername(username);

      // Assert
      expect(result).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('username', username);
      expect(singleMethod).toHaveBeenCalled();
    });

    test('nên ném lỗi khi request thất bại', async () => {
      // Arrange
      const username = 'nonexistentuser';
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
        if (table === 'users') {
          return { select: selectMethod };
        }
        return {};
      });

      // Act & Assert
      await expect(userService.getUserByUsername(username))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(selectMethod).toHaveBeenCalledWith('*');
      expect(eqMethod).toHaveBeenCalledWith('username', username);
      expect(singleMethod).toHaveBeenCalled();
    });
  });
}); 