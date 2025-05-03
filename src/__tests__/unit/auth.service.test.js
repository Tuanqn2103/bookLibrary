// Mock các dependencies trước khi import module
jest.mock('../../config/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn()
    },
    from: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn()
    })
  }
}));

jest.mock('../../services/database.service', () => ({
  databaseService: {
    getUserByEmail: jest.fn(),
    getUserByUsername: jest.fn(),
    createUser: jest.fn()
  }
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  removeItem: jest.fn()
}));

// Import module sau khi mock
const { authService } = require('../../services/auth.service');
const { supabase } = require('../../config/supabase');
const { databaseService } = require('../../services/database.service');
const AsyncStorage = require('@react-native-async-storage/async-storage');

// Silence console.log và console.error
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    test('nên đăng ký thành công người dùng mới', async () => {
      // Arrange
      const userName = 'testuser';
      const email = 'test@example.com';
      const password = 'password123';
      
      // Mock getUserByEmail để trả về null (không tồn tại user)
      databaseService.getUserByEmail.mockResolvedValue(null);
      
      // Mock signUp để trả về thành công
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'auth-user-id' } },
        error: null
      });
      
      // Mock createUser để trả về thành công
      const mockUser = {
        id: 'db-user-id',
        userName,
        email,
        is_admin: false
      };
      databaseService.createUser.mockResolvedValue(mockUser);
      
      // Act
      const result = await authService.register(userName, email, password);
      
      // Assert
      expect(databaseService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email,
        password,
        options: {
          data: {
            isAdminRegistration: false
          }
        }
      });
      expect(databaseService.createUser).toHaveBeenCalledWith(
        userName, email, password, false, 'auth-user-id'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(result).toEqual(mockUser);
    });

    test('nên ném lỗi khi email đã tồn tại', async () => {
      // Arrange
      const userName = 'testuser';
      const email = 'existing@example.com';
      const password = 'password123';
      
      // Mock getUserByEmail để trả về user đã tồn tại
      databaseService.getUserByEmail.mockResolvedValue({
        id: 'existing-user-id',
        email
      });
      
      // Act & Assert
      await expect(authService.register(userName, email, password))
        .rejects.toThrow('User with this email already exists');
      
      expect(databaseService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(supabase.auth.signUp).not.toHaveBeenCalled();
    });

    test('nên ném lỗi khi Supabase Auth thất bại', async () => {
      // Arrange
      const userName = 'testuser';
      const email = 'test@example.com';
      const password = 'password123';
      
      // Mock getUserByEmail để trả về null (không tồn tại user)
      databaseService.getUserByEmail.mockResolvedValue(null);
      
      // Mock signUp để trả về lỗi
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: {
          message: 'Auth error'
        }
      });
      
      // Act & Assert
      await expect(authService.register(userName, email, password))
        .rejects.toThrow('Auth error');
      
      expect(databaseService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(databaseService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    test('nên đăng nhập thành công bằng email', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      
      // Mock signInWithPassword để trả về thành công
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'auth-user-id', email } },
        error: null
      });
      
      // Mock getUserByEmail để trả về user
      const mockUser = {
        id: 'db-user-id',
        userName: 'testuser',
        email,
        is_admin: false
      };
      databaseService.getUserByEmail.mockResolvedValue(mockUser);
      
      // Act
      const result = await authService.login(email, password);
      
      // Assert
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password
      });
      expect(databaseService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(result).toEqual(mockUser);
    });

    test('nên đăng nhập thành công bằng username', async () => {
      // Arrange
      const username = 'testuser';
      const email = 'test@example.com';
      const password = 'password123';
      
      // Mock getUserByUsername để trả về user
      const mockUser = {
        id: 'db-user-id',
        userName: username,
        email,
        is_admin: false
      };
      databaseService.getUserByUsername.mockResolvedValue(mockUser);
      
      // Mock signInWithPassword để trả về thành công
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'auth-user-id', email } },
        error: null
      });
      
      // Mock getUserByEmail để trả về user
      databaseService.getUserByEmail.mockResolvedValue(mockUser);
      
      // Act
      const result = await authService.login(username, password);
      
      // Assert
      expect(databaseService.getUserByUsername).toHaveBeenCalledWith(username);
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email,
        password
      });
      expect(databaseService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
      expect(result).toEqual(mockUser);
    });

    test('nên ném lỗi khi username không tồn tại', async () => {
      // Arrange
      const username = 'nonexistentuser';
      const password = 'password123';
      
      // Mock getUserByUsername để trả về null
      databaseService.getUserByUsername.mockResolvedValue(null);
      
      // Act & Assert
      await expect(authService.login(username, password))
        .rejects.toThrow('Invalid username or password');
      
      expect(databaseService.getUserByUsername).toHaveBeenCalledWith(username);
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    test('nên ném lỗi khi đăng nhập thất bại', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrong-password';
      
      // Mock signInWithPassword để trả về lỗi
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid login credentials'
        }
      });
      
      // Act & Assert
      await expect(authService.login(email, password))
        .rejects.toThrow('Invalid username or password');
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    test('nên đăng xuất thành công', async () => {
      // Arrange
      supabase.auth.signOut.mockResolvedValue({ error: null });
      
      // Act
      await authService.logout();
      
      // Assert
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });

    test('nên ném lỗi khi đăng xuất thất bại', async () => {
      // Arrange - Lỗi đăng xuất
      const errorMsg = 'Logout error';
      supabase.auth.signOut.mockRejectedValue(new Error(errorMsg));
      
      // Act & Assert
      await expect(authService.logout())
        .rejects.toThrow(errorMsg);
      
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    test('nên trả về null khi không có session', async () => {
      // Arrange
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      // Act
      const result = await authService.getCurrentUser();
      
      // Assert
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('nên trả về user khi có session', async () => {
      // Arrange
      const email = 'test@example.com';
      
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { email }
          }
        },
        error: null
      });
      
      const mockUser = {
        id: 'db-user-id',
        userName: 'testuser',
        email,
        is_admin: false
      };
      databaseService.getUserByEmail.mockResolvedValue(mockUser);
      
      // Act
      const result = await authService.getCurrentUser();
      
      // Assert
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(databaseService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    test('nên ném lỗi khi getSession thất bại', async () => {
      // Arrange
      const errorMsg = 'Session error';
      supabase.auth.getSession.mockRejectedValue(new Error(errorMsg));
      
      // Act & Assert
      await expect(authService.getCurrentUser())
        .rejects.toThrow(errorMsg);
      
      expect(supabase.auth.getSession).toHaveBeenCalled();
    });
  });

  describe('updateUserProfile', () => {
    test('nên cập nhật thông tin người dùng thành công', async () => {
      // Arrange
      const userId = 'user-id';
      const updateData = {
        userName: 'newusername',
        avatar_url: 'new-avatar-url'
      };
      
      const mockUpdatedUser = {
        id: userId,
        ...updateData
      };
      
      supabase.from().single.mockResolvedValue({
        data: mockUpdatedUser,
        error: null
      });
      
      // Act
      const result = await authService.updateUserProfile(userId, updateData);
      
      // Assert
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from().update).toHaveBeenCalledWith(updateData);
      expect(supabase.from().update().eq).toHaveBeenCalledWith('id', userId);
      expect(result).toEqual(mockUpdatedUser);
    });

    test('nên ném lỗi khi cập nhật thất bại', async () => {
      // Arrange
      const userId = 'user-id';
      const updateData = {
        userName: 'newusername'
      };
      
      const errorMsg = 'Update error';
      supabase.from().single.mockRejectedValue(new Error(errorMsg));
      
      // Act & Assert
      await expect(authService.updateUserProfile(userId, updateData))
        .rejects.toThrow(errorMsg);
      
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(supabase.from().update).toHaveBeenCalledWith(updateData);
      expect(supabase.from().update().eq).toHaveBeenCalledWith('id', userId);
    });
  });
}); 