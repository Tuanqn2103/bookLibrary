import { supabase } from '../config/supabase';
import { databaseService } from './database.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  async register(userName, email, password, isAdminRegistration = false) {
    try {
      console.log('Starting registration process...');
      
      // Kiểm tra email đã tồn tại chưa
      console.log('Checking if email exists...');
      const existingUser = await databaseService.getUserByEmail(email);
      if (existingUser) {
        console.log('Email already exists');
        throw new Error('User with this email already exists');
      }

      // Tạo user mới trong Supabase Auth
      console.log('Creating user in Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            isAdminRegistration
          }
        }
      });

      if (authError) {
        console.error('Supabase Auth error:', authError);
        throw new Error(authError.message);
      }

      console.log('User created in Supabase Auth:', authData);

      // Tạo user profile trong database với role dựa trên isAdminRegistration
      console.log('Creating user profile in database...');
      const user = await databaseService.createUser(userName, email, password, isAdminRegistration, authData.user.id);
      console.log('User profile created:', user);
      
      // Lưu thông tin user vào AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(usernameOrEmail, password) {
    try {
      console.log('Starting login process...');
      
      // Kiểm tra xem input là username hay email
      const isEmail = usernameOrEmail.includes('@');
      let email = usernameOrEmail;
      
      // Nếu đăng nhập bằng username, tìm email tương ứng
      if (!isEmail) {
        console.log('Looking up user by username...');
        const user = await databaseService.getUserByUsername(usernameOrEmail);
        if (!user) {
          console.error('Username not found');
          throw new Error('Invalid username or password');
        }
        email = user.email;
      }
      
      // Đăng nhập với Supabase Auth bằng email
      console.log('Authenticating with Supabase...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Supabase Auth error:', authError);
        throw new Error('Invalid username or password');
      }

      console.log('Authentication successful:', authData);

      // Lấy thông tin user từ database
      console.log('Getting user from database...');
      const user = await databaseService.getUserByEmail(email);
      if (!user) {
        console.error('User not found in database');
        throw new Error('User not found');
      }

      console.log('User found:', user);

      // Lưu thông tin user vào AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('Starting logout process...');
      
      // Đăng xuất khỏi Supabase Auth
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase Auth error:', error);
        throw error;
      }

      console.log('Logout successful');
      
      // Xóa thông tin user khỏi AsyncStorage
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      console.log('Getting current user...');
      
      // Lấy session hiện tại từ Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase Auth error:', error);
        throw error;
      }
      
      if (!session) {
        console.log('No active session');
        return null;
      }

      console.log('Active session found:', session);

      // Lấy thông tin user từ database
      const user = await databaseService.getUserByEmail(session.user.email);
      console.log('User from database:', user);
      
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  async updateUserProfile(userId, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const authService = new AuthService(); 