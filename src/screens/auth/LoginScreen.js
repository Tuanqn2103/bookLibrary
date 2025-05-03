import React, { useState, useCallback } from 'react';
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
import { supabase } from '../../config/supabase';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      
      // Đăng xuất trước để đảm bảo không có session cũ
      await supabase.auth.signOut();
      
      const user = await authService.login(username, password);
      
      // Sử dụng setTimeout để tránh race condition với navigation
      setTimeout(() => {
        if (user.role === 'admin') {
          navigation.replace('AdminHome');
        } else {
          navigation.replace('Home');
        }
      }, 0);
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.message || 'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  }, [username, password, navigation]);

  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Icon name="user" size={20} color={COLORS.gray} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Username or Email"
              value={username}
              onChangeText={setUsername}
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

          <TouchableOpacity onPress={() => {}} disabled={loading}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.loginButtonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text>

        <View style={styles.socialButtons}>
          <TouchableOpacity style={styles.socialButton} disabled={loading}>
            <Icon name="facebook" size={20} color="#4267B2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} disabled={loading}>
            <Icon name="google" size={20} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} disabled={loading}>
            <Icon name="apple" size={20} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have a Bookstore account? </Text>
          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.signupLink}>Sign Up</Text>
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
  forgotPassword: {
    color: COLORS.primary,
    textAlign: 'right',
    marginTop: 8,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: COLORS.gray,
    marginBottom: 24,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: COLORS.gray,
  },
  signupLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default LoginScreen; 