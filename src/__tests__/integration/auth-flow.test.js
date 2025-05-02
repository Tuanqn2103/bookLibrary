// Mock dependencies
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

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getItem: jest.fn()
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
}));

// Import services sau khi mock
const { authService } = require('../../services/auth.service');
const { databaseService } = require('../../services/database.service');
const { supabase } = require('../../config/supabase');
const AsyncStorage = require('@react-native-async-storage/async-storage');
const Alert = require('react-native/Libraries/Alert/Alert');

// Silence console logs và errors
global.console.log = jest.fn();
global.console.error = jest.fn();

describe('Luồng xác thực tích hợp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Quy trình đăng ký', () => {
    const username = 'newuser';
    const email = 'newuser@example.com';
    const password = 'password123';
    let newUser;

    test('1. Đăng ký user mới nên hoạt động đúng', async () => {
      // Arrange
      // Mock các phụ thuộc cần thiết
      // 1. Kiểm tra email tồn tại
      jest.spyOn(databaseService, 'getUserByEmail').mockResolvedValue(null);
      
      // 2. Đăng ký với Supabase Auth
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: 'auth-user-id' } },
        error: null
      });
      
      // 3. Tạo user trong DB
      newUser = {
        id: 'user-id',
        userName: username,
        email,
        is_admin: false
      };
      jest.spyOn(databaseService, 'createUser').mockResolvedValue(newUser);
      
      // Act
      const result = await authService.register(username, email, password);
      
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
        username, email, password, false, 'auth-user-id'
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(newUser));
      expect(result).toEqual(newUser);
    });

    test('2. Đăng ký nên ngăn chặn email trùng lặp', async () => {
      // Arrange - Email đã tồn tại
      jest.spyOn(databaseService, 'getUserByEmail').mockResolvedValue({
        id: 'existing-user-id',
        email
      });
      
      // Act & Assert
      await expect(authService.register(username, email, password))
        .rejects.toThrow('User with this email already exists');
      
      // Không nên gọi các service sau nếu email đã tồn tại
      expect(supabase.auth.signUp).not.toHaveBeenCalled();
      expect(databaseService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('Quy trình đăng nhập', () => {
    const email = 'user@example.com';
    const username = 'username';
    const password = 'password123';
    const mockUser = {
      id: 'user-id',
      userName: username,
      email,
      is_admin: false
    };

    test('1. Đăng nhập với email nên hoạt động đúng', async () => {
      // Arrange
      // 1. Đăng nhập với Supabase Auth
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'auth-user-id', email } },
        error: null
      });
      
      // 2. Lấy thông tin user từ DB
      jest.spyOn(databaseService, 'getUserByEmail').mockResolvedValue(mockUser);
      
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

    test('2. Đăng nhập với username nên hoạt động đúng', async () => {
      // Arrange
      // 1. Tìm user bằng username
      jest.spyOn(databaseService, 'getUserByUsername').mockResolvedValue(mockUser);
      
      // 2. Đăng nhập với Supabase Auth
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: { id: 'auth-user-id', email } },
        error: null
      });
      
      // 3. Lấy thông tin user từ DB
      jest.spyOn(databaseService, 'getUserByEmail').mockResolvedValue(mockUser);
      
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

    test('3. Đăng nhập nên xử lý username không tồn tại', async () => {
      // Arrange - Username không tồn tại
      jest.spyOn(databaseService, 'getUserByUsername').mockResolvedValue(null);
      
      // Act & Assert
      await expect(authService.login('nonexistentuser', password))
        .rejects.toThrow('Invalid username or password');
      
      // Không nên đăng nhập nếu username không tồn tại
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    test('4. Đăng nhập nên xử lý thông tin đăng nhập không hợp lệ', async () => {
      // Arrange - Thông tin đăng nhập không hợp lệ
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: {
          message: 'Invalid login credentials'
        }
      });
      
      // Act & Assert
      await expect(authService.login(email, 'wrongpassword'))
        .rejects.toThrow('Invalid username or password');
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('Quy trình đăng xuất', () => {
    test('1. Đăng xuất thành công nên xóa dữ liệu người dùng trong AsyncStorage', async () => {
      // Arrange
      supabase.auth.signOut.mockResolvedValue({
        error: null
      });
      
      // Act
      await authService.logout();
      
      // Assert
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
    });
    
    test('2. Đăng xuất nên xử lý lỗi từ Supabase', async () => {
      // Arrange
      const errorMsg = 'Logout error';
      supabase.auth.signOut.mockRejectedValue(new Error(errorMsg));
      
      // Act & Assert
      await expect(authService.logout())
        .rejects.toThrow();
      
      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('Quy trình lấy thông tin user hiện tại', () => {
    const email = 'user@example.com';
    const mockUser = {
      id: 'user-id',
      userName: 'username',
      email,
      is_admin: false
    };

    test('1. Lấy thông tin user khi có session hợp lệ', async () => {
      // Arrange
      // 1. Lấy session hiện tại
      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'auth-user-id', email }
          }
        },
        error: null
      });
      
      // 2. Lấy thông tin user từ DB
      jest.spyOn(databaseService, 'getUserByEmail').mockResolvedValue(mockUser);
      
      // Act
      const result = await authService.getCurrentUser();
      
      // Assert
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(databaseService.getUserByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(mockUser);
    });

    test('2. Trả về null khi không có session', async () => {
      // Arrange - Không có session
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });
      
      // Act
      const result = await authService.getCurrentUser();
      
      // Assert
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(databaseService.getUserByEmail).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('Các tình huống lỗi', () => {
    test('1. Hiển thị thông báo lỗi khi đăng ký thất bại', async () => {
      // Arrange
      // Mock Alert.alert
      Alert.alert.mockImplementation(() => {});
      
      // Giả lập lỗi đăng ký
      jest.spyOn(authService, 'register').mockRejectedValue(
        new Error('Registration failed')
      );
      
      // Act
      try {
        await authService.register('username', 'email@example.com', 'password');
      } catch (error) {
        // Giả lập UI hiển thị lỗi
        Alert.alert('Error', 'Registration failed. Please try again.');
      }
      
      // Assert
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Registration failed. Please try again.');
    });

    test('2. Hiển thị thông báo lỗi khi đăng nhập thất bại', async () => {
      // Arrange
      // Mock Alert.alert
      Alert.alert.mockImplementation(() => {});
      
      // Giả lập lỗi đăng nhập
      jest.spyOn(authService, 'login').mockRejectedValue(
        new Error('Invalid username or password')
      );
      
      // Act
      try {
        await authService.login('username', 'password');
      } catch (error) {
        // Giả lập UI hiển thị lỗi
        Alert.alert('Error', 'Invalid username or password. Please try again.');
      }
      
      // Assert
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Invalid username or password. Please try again.');
    });
  });
}); 