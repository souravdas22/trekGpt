import { useMemo } from 'react';
import { useAppTheme } from '@hooks/useAppTheme';
import { ColorsType } from '@theme/colors';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@screens/home/HomeScreen';
import { ExploreScreen } from '@screens/explore/ExploreScreen';
import { AiAssistantScreen } from '@screens/ai/AiAssistantScreen';
import { CommunityScreen } from '@screens/community/CommunityScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();

export const TabNavigator = () => {
  const colors = useAppTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Explore') iconName = 'compass';
          else if (route.name === 'AI Planner') iconName = 'robot';
          else if (route.name === 'Community') iconName = 'account-group';
          else if (route.name === 'Profile') iconName = 'account';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.background,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="AI Planner" component={AiAssistantScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
