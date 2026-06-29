import { useMemo } from 'react';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ImageBackground,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { InputField } from '@components/inputs/InputField';
import { useNavigation } from '@react-navigation/native';
import { normalize, normalizeFont } from '@theme/normalize';
import { resetPassword, getAuthErrorMessage } from '@services/firebase/auth.service';
import { ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ForgotPasswordScreen = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your email address',
      });
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      Toast.show({
        type: 'success',
        text1: 'Password Reset',
        text2: 'A password reset link has been sent to your email address.',
      });
      navigation.navigate('Login');
    } catch (error: any) {
      console.log('Reset Password Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} showsVerticalScrollIndicator={false}>
          {/* Top Half with Image and Logo */}
          <ImageBackground
            source={require('@assets/images/login_bg.png')}
            style={styles.topImageContainer}
            resizeMode="cover"
          >
            {/* Svg Gradient Overlay */}
            <View style={styles.gradientContainer}>
              <Svg height="100%" width="100%">
                <Defs>
                  <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <Stop offset="0%" stopColor="rgba(13, 17, 23, 0.15)" />
                    <Stop offset="60%" stopColor="rgba(13, 17, 23, 0.8)" />
                    <Stop offset="100%" stopColor="#0D1117" />
                  </LinearGradient>
                </Defs>
                <Rect width="100%" height="100%" fill="url(#grad)" />
              </Svg>
            </View>

            {/* Back Button */}
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Icon name="lock-reset" size={60} color={colors.accent} />
            </View>
          </ImageBackground>

          <View style={styles.bottomSection}>
            {/* Form Section */}
            <View style={styles.formSection}>
            <Text style={styles.welcomeText}>Forgot Password</Text>
            <Text style={styles.welcomeSubtitle}>Enter your email address to reset your password</Text>

            <InputField
              label="Email Address"
              placeholder="youremail@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Icon name="email-outline" size={20} color={colors.accent} />}
            />

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleReset}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#0D1117" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Send Reset Link</Text>
                  <View style={styles.arrowIconContainer}>
                    <Icon name="arrow-right" size={20} color="#0D1117" />
                  </View>
                </>
              )}
            </TouchableOpacity>

          </View>

          {/* Footer Section */}
            <View style={styles.footerContainer}>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.signUpText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    paddingTop: normalize(20),
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: normalize(24),
    width: normalize(40),
    height: normalize(40),
    borderRadius: normalize(20),
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: normalize(24),
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: normalize(150),
  },
  formSection: {
    marginTop: normalize(10),
  },
  welcomeText: {
    fontSize: normalizeFont(22),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: normalize(2),
  },
  welcomeSubtitle: {
    fontSize: normalizeFont(13),
    color: '#94A3B8',
    marginBottom: normalize(32),
  },
  loginButton: {
    backgroundColor: colors.accent,
    height: normalize(48),
    borderRadius: normalize(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(16),
    marginTop: normalize(20),
    position: 'relative',
  },
  loginButtonText: {
    color: '#0D1117',
    fontSize: normalizeFont(15),
    fontWeight: 'bold',
  },
  arrowIconContainer: {
    position: 'absolute',
    right: normalize(20),
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: normalize(10),
  },
  signUpText: {
    color: colors.accent,
    fontSize: normalizeFont(14),
    fontWeight: 'bold',
  },
});
