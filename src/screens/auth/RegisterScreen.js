import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import { authService } from '../../services/auth.service';
import { databaseService } from '../../services/database.service';
import { supabase } from '../../config/supabase';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!email || !userName || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Kiểm tra điều kiện đăng ký admin
    const isAdminRegistration = userName === 'admin' && password === 'admin123' && confirmPassword === 'admin123';
    
    // Kiểm tra độ dài mật khẩu (chỉ áp dụng cho đăng ký thông thường)
    if (!isAdminRegistration && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      
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
      
      // Hiển thị thông báo thành công và chuyển đến trang đăng nhập
      Alert.alert(
        'Registration Success',
        'Your account has been created successfully',
        [
          {
            text: 'Login Now',
            onPress: () => navigation.replace('Login')
          }
        ]
      );
    } catch (error) {
      let errorMessage = 'An error occurred during registration';
      
      // Xử lý các lỗi cụ thể
      if (error.message.includes('email')) {
        errorMessage = 'This email is already registered';
      } else if (error.message.includes('password')) {
        errorMessage = 'Password must be at least 6 characters';
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Icon name="envelope-o" size={20} color={COLORS.gray} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="user" size={20} color={COLORS.gray} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="lock" size={20} color={COLORS.gray} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon name="lock" size={20} color={COLORS.gray} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.registerButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    color: COLORS.black,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.black,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    color: COLORS.gray,
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen; 