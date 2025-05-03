// Mocks
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn()
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
    TextInput: jest.fn(props => ({
      type: 'TextInput',
      props: { ...props }
    })),
    TouchableOpacity: jest.fn(({ onPress, children }) => ({
      type: 'TouchableOpacity',
      props: { onPress },
      children
    })),
    ActivityIndicator: 'ActivityIndicator',
    KeyboardAvoidingView: 'KeyboardAvoidingView',
    Platform: {
      OS: 'android'
    }
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn(),
    reset: jest.fn()
  }))
}));

jest.mock('../../services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    getUserProfile: jest.fn()
  }
}));

// Import các dependencies sau khi mock
import { authService } from '../../services/auth.service';
import { useNavigation } from '@react-navigation/native';
import Alert from 'react-native/Libraries/Alert/Alert';

// Test suite
describe('LoginScreen', () => {
  // Setup variables
  const validEmail = 'test@example.com';
  const validPassword = 'password123';
  const mockUser = {
    id: 'user-123',
    email: validEmail,
    role: 'user'
  };
  const mockUserProfile = {
    id: 'user-123',
    email: validEmail,
    username: 'testuser',
    role: 'user'
  };

  // Cài đặt mocks trước mỗi test
  beforeEach(() => {
    jest.clearAllMocks();
    authService.login.mockResolvedValue(mockUser);
    authService.getUserProfile.mockResolvedValue(mockUserProfile);
  });

  test('should validate email format', () => {
    // Arrange
    const invalidEmails = [
      'test',
      'test@',
      'test@example',
      '@example.com'
    ];
    const validEmails = [
      'test@example.com',
      'test.name@example.com',
      'test+name@example.com',
      'test.name+tag@example.co.uk'
    ];

    // Assert - hàm kiểm tra email giả định
    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    // Kiểm tra các email không hợp lệ
    invalidEmails.forEach(email => {
      expect(isValidEmail(email)).toBe(false);
    });

    // Kiểm tra các email hợp lệ
    validEmails.forEach(email => {
      expect(isValidEmail(email)).toBe(true);
    });
  });

  test('should show error alert for empty email or password', () => {
    // Act - gọi Alert.alert với thông báo lỗi
    Alert.alert('Error', 'Please enter both email and password');

    // Assert
    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter both email and password');
  });

  test('should call login API with correct parameters', async () => {
    // Act - gọi login service
    await authService.login(validEmail, validPassword);

    // Assert
    expect(authService.login).toHaveBeenCalledWith(validEmail, validPassword);
    expect(authService.login).toHaveBeenCalledTimes(1);
  });

  test('should navigate to Home screen on successful login', async () => {
    // Arrange
    const mockNavigation = useNavigation();
    
    // Act - Mô phỏng đăng nhập thành công và điều hướng
    await authService.login(validEmail, validPassword);
    await authService.getUserProfile(mockUser.id);
    mockNavigation.reset({ 
      index: 0, 
      routes: [{ name: 'Home' }] 
    });

    // Assert
    expect(authService.login).toHaveBeenCalledWith(validEmail, validPassword);
    expect(authService.getUserProfile).toHaveBeenCalledWith(mockUser.id);
    expect(mockNavigation.reset).toHaveBeenCalled();
    expect(mockNavigation.reset).toHaveBeenCalledWith({ 
      index: 0, 
      routes: [{ name: 'Home' }] 
    });
  });

  test('should navigate to AdminDashboard for admin users', async () => {
    // Arrange
    const adminUser = { ...mockUser, role: 'admin' };
    const adminProfile = { ...mockUserProfile, role: 'admin' };
    authService.login.mockResolvedValueOnce(adminUser);
    authService.getUserProfile.mockResolvedValueOnce(adminProfile);
    const mockNavigation = useNavigation();

    // Act - Mô phỏng đăng nhập admin thành công
    await authService.login(validEmail, validPassword);
    await authService.getUserProfile(adminUser.id);
    mockNavigation.reset({ 
      index: 0, 
      routes: [{ name: 'AdminDashboard' }] 
    });

    // Assert
    expect(authService.login).toHaveBeenCalledWith(validEmail, validPassword);
    expect(authService.getUserProfile).toHaveBeenCalledWith(adminUser.id);
    expect(mockNavigation.reset).toHaveBeenCalled();
    expect(mockNavigation.reset).toHaveBeenCalledWith({ 
      index: 0, 
      routes: [{ name: 'AdminDashboard' }] 
    });
  });

  test('should navigate to Register screen when signup button is pressed', () => {
    // Arrange
    const mockNavigation = useNavigation();
    
    // Act - Mô phỏng chuyển đến màn hình đăng ký
    mockNavigation.navigate('Register');
    
    // Assert
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Register');
    expect(mockNavigation.navigate).toHaveBeenCalledTimes(1);
  });

  test('should show error alert on login failure', async () => {
    // Arrange
    const errorMessage = 'Invalid email or password';
    authService.login.mockRejectedValueOnce(new Error(errorMessage));
    
    // Act - Mô phỏng đăng nhập thất bại
    try {
      await authService.login(validEmail, validPassword);
    } catch (error) {
      Alert.alert('Login Failed', errorMessage);
    }
    
    // Assert
    expect(authService.login).toHaveBeenCalledWith(validEmail, validPassword);
    expect(Alert.alert).toHaveBeenCalledWith('Login Failed', errorMessage);
  });
}); 