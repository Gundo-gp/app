import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';

import InputField from '../components/InputField';
import SocialButton from '../components/SocialButton';

WebBrowser.maybeCompleteAuthSession();

// ✅ Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'At least 8 characters')
    .matches(/[A-Z]/, 'Include an uppercase letter')
    .matches(/[a-z]/, 'Include a lowercase letter')
    .matches(/[0-9]/, 'Include a number')
    .matches(/[@$!%*?&#]/, 'Include a special character')
    .required('Password is required'),
});

// ✅ Mock authentication
const authenticateUser = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'user@example.com' && password === 'Password@123') {
        resolve({ success: true, message: 'Login successful!' });
      } else {
        reject({ success: false, message: 'Invalid email or password' });
      }
    }, 2000);
  });
};

export default function LoginPage({ navigation }) {
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Google & Facebook login setup
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID',
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      Alert.alert("Google Login", "Welcome, logged in with Google!");
    }
    if (fbResponse?.type === 'success') {
      Alert.alert("Facebook Login", "Welcome, logged in with Facebook!");
    }
  }, [googleResponse, fbResponse]);

  // ✅ Load Remember Me state
  useEffect(() => {
    AsyncStorage.getItem('rememberMe').then((value) => {
      if (value === 'true') setRememberMe(true);
    });
  }, []);

  const handleLogin = async (values) => {
    setIsLoading(true);
    try {
      const response = await authenticateUser(values.email, values.password);
      setIsLoading(false);

      if (rememberMe) {
        await AsyncStorage.setItem('rememberMe', 'true');
        await AsyncStorage.setItem('userEmail', values.email);
      } else {
        await AsyncStorage.removeItem('rememberMe');
        await AsyncStorage.removeItem('userEmail');
      }

      Alert.alert('Success', response.message);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', error.message);
    }
  };

  // ✅ Forgot Password with notification
  const handleForgotPassword = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Password Reset",
        body: "A reset link has been sent to your email.",
      },
      trigger: null,
    });
    Alert.alert("Forgot Password", "Check your email or SMS for reset instructions.");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {/* Form */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.formContainer}>
              <InputField
                icon="mail-outline"
                placeholder="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email}
              />

              <InputField
                icon="lock-closed-outline"
                placeholder="Password"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                secureTextEntry
                error={touched.password && errors.password}
              />

              {/* Remember me + Forgot password */}
              <View style={styles.rememberContainer}>
                <View style={styles.rememberMe}>
                  <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={rememberMe ? '#2e64e5' : '#f4f3f4'}
                  />
                  <Text style={styles.rememberText}>Remember me</Text>
                </View>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialContainer}>
          <SocialButton
            provider="Google"
            color="#DB4437"
            icon="google"
            onPress={() => googlePromptAsync()}
          />
          <SocialButton
            provider="Facebook"
            color="#4267B2"
            icon="facebook"
            onPress={() => fbPromptAsync()}
          />
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#2e64e5', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666' },
  formContainer: { marginBottom: 24 },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  rememberMe: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { marginLeft: 8, color: '#666' },
  forgotText: { color: '#2e64e5', fontWeight: '500' },
  loginButton: {
    backgroundColor: '#2e64e5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  loginButtonDisabled: { backgroundColor: '#a0b8f8' },
  loginButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ddd' },
  dividerText: { marginHorizontal: 16, color: '#666', fontWeight: '500' },
  socialContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  signupContainer: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { color: '#666' },
  signupLink: { color: '#2e64e5', fontWeight: 'bold' },
});
