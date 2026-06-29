import { useMemo } from 'react';
import React, { useState } from 'react';
import { getIdToken } from '@react-native-firebase/auth';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, { Defs, LinearGradient, Rect, Stop, Path } from 'react-native-svg';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { InputField } from '@components/inputs/InputField';
import { setToken } from '@store/slices/authSlice';
import { useNavigation } from '@react-navigation/native';
import { normalize, normalizeFont } from '@theme/normalize';
import { loginWithEmail, signInWithGoogle, getAuthErrorMessage } from '@services/firebase/auth.service';
import { saveUserProfile } from '@services/firebase/user.service';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Official Google "G" Logo SVG
const GoogleIcon = ({ style }: { style?: any }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" style={style}>
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

export const LoginScreen = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

    const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter your email and password',
      });
      return;
    }

    try {
      setLoading(true);
      const credential = await loginWithEmail(email, password);
      const idToken = await getIdToken(credential.user as any);
      dispatch(setToken(idToken));
    } catch (error: any) {
      console.log('Login Error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: getAuthErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const credential = await signInWithGoogle();
      
      // Save user profile to Firestore
      await saveUserProfile(credential.user.uid, {
        email: credential.user.email || '',
        name: credential.user.displayName,
        photoUrl: credential.user.photoURL,
      });

      const idToken = await getIdToken(credential.user as any);
      dispatch(setToken(idToken));
    } catch (error: any) {
      if (error.code !== 'SIGN_IN_CANCELLED') {
        console.log('Google Sign-In Error:', error);
        Toast.show({
          type: 'error',
          text1: 'Google Sign-In Failed',
          text2: getAuthErrorMessage(error),
        });
      }
    } finally {
      setGoogleLoading(false);
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

            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Icon name="terrain" size={52} color={colors.accent} />
              <Text style={styles.logoText}>TrekGPT</Text>
              <Text style={styles.logoSubtitle}>AI Powered Trek Planner</Text>
            </View>
          </ImageBackground>

          <View style={styles.bottomSection}>
            {/* Form Section */}
            <View style={styles.formSection}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Login to continue your adventure</Text>

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

            <InputField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon={<Icon name="lock-outline" size={20} color={colors.accent} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
                  <Icon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity 
              style={styles.forgotPasswordContainer} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#0D1117" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Login</Text>
                  <View style={styles.arrowIconContainer}>
                    <Icon name="arrow-right" size={20} color="#0D1117" />
                  </View>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.socialButton}
              activeOpacity={0.8}
              onPress={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color={colors.accent} style={styles.socialIcon} />
              ) : (
                <GoogleIcon style={styles.socialIcon} />
              )}
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Section */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpText}>Sign Up</Text>
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
    height: SCREEN_HEIGHT * 0.39,
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
  bottomSection: {
    flex: 1,
    paddingHorizontal: normalize(24),
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: normalize(180),
  },
  logoText: {
    fontSize: normalizeFont(29),
    fontWeight: 'bold',
    color: '#FFFFFF', // Keep it white against the dark image overlay
    letterSpacing: 0.5,
  },
  logoSubtitle: {
    fontSize: normalizeFont(15),
    color: '#94A3B8',
    marginTop: normalize(2),
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
    marginBottom: normalize(16),
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: normalize(16),
  },
  forgotPasswordText: {
    color: colors.accent,
    fontSize: normalizeFont(13),
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: colors.accent,
    height: normalize(48),
    borderRadius: normalize(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(16),
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  dividerLine: {
    flex: 1,
    height: normalize(1),
    backgroundColor: colors.outline,
  },
  dividerText: {
    color: colors.muted,
    fontSize: normalizeFont(12),
    marginHorizontal: normalize(16),
    fontWeight: '600',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    height: normalize(48),
    borderRadius: normalize(24),
    borderWidth: 1,
    borderColor: colors.outline,
    marginBottom: normalize(10),
  },
  socialIcon: {
    marginRight: normalize(10),
  },
  socialButtonText: {
    color: colors.text,
    fontSize: normalizeFont(14),
    fontWeight: '600',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto'
  },
  footerText: {
    color: '#94A3B8',
    fontSize: normalizeFont(14),
  },
  signUpText: {
    color: colors.accent,
    fontSize: normalizeFont(14),
    fontWeight: 'bold',
  },
});
