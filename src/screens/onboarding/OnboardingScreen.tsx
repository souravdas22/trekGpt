import { useMemo } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import { PrimaryButton } from '@components/buttons/PrimaryButton';
import { normalize, normalizeFont } from '@theme/normalize';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    title: 'Plan Smarter.\nTrek Better.',
    subtitle: 'Get AI recommendations, detailed itineraries and everything you need for your next adventure.',
  },
  {
    id: '2',
    title: 'Explore Trails.\nStay Safe.',
    subtitle: 'Access offline maps, safety protocols and real-time weather updates for a secure trekking experience.',
  },
  {
    id: '3',
    title: 'Track Progress.\nShare Journeys.',
    subtitle: 'Log your accomplishments, keep tabs on your gear, and connect with a community of fellow explorers.',
  },
];

export const OnboardingScreen = () => {
  const colors = useAppTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const navigation = useNavigation<any>();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  const handlePressNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate('Login');
    }
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    return (
      <View style={styles.slide}>
        <Animated.View style={[styles.textContainer, { transform: [{ translateY: floatAnim }] }]}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={require('@assets/images/onboarding_bg.png')}
        style={styles.backgroundImage}
        imageStyle={styles.image}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          {/* Scrollable Slides */}
          <FlatList
            ref={flatListRef}
            data={SLIDES}
            renderItem={renderSlide}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            keyExtractor={(item) => item.id}
            style={styles.flatList}
          />

          {/* Footer Area with Dots and Button */}
          <View style={styles.footer}>
            {/* Pagination Dots */}
            <View style={styles.dotsContainer}>
              {SLIDES.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeIndex === index ? styles.activeDot : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>

            {/* Action Button */}
            <PrimaryButton
              title={activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
              onPress={handlePressNext}
              style={styles.button}
              textStyle={styles.buttonText}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const getStyles = (colors: ColorsType) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  image: {
    height: SCREEN_HEIGHT + 60,
    top: normalize(40),
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Slightly dark overlay for readability
  },
  flatList: {
    flex: 1
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'flex-start',
    paddingHorizontal: normalize(32),
    paddingTop: SCREEN_HEIGHT * 0.24, // Position font higher up to match mockup
  },
  textContainer: {},
  title: {
    fontSize: normalizeFont(36),
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: normalizeFont(44),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: normalizeFont(16),
    color: '#E2E8F0',
    lineHeight: normalizeFont(24),
    marginTop: normalize(16),
    fontWeight: '400',
  },
  footer: {
    position: 'absolute',
    bottom: normalize(50),
    left: normalize(0),
    right: normalize(0),
    paddingHorizontal: normalize(32),
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center dots horizontally
    marginBottom: normalize(32),
  },
  dot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    marginHorizontal: normalize(4),
  },
  activeDot: {
    backgroundColor: colors.accent,
  },
  inactiveDot: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 30, // Pill shaped button
    height: normalize(56),
  },
  buttonText: {
    color: '#0D1117',
    fontWeight: 'bold',
    fontSize: normalizeFont(16),
  },
});
