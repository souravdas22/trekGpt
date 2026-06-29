import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { SettingsScreen } from '@screens/settings/SettingsScreen';
import { TrekDetailsScreen } from '@screens/trek-details/TrekDetailsScreen';
import { HikeProgressScreen } from '@screens/progress/HikeProgressScreen';
import { MapRouteScreen } from '@screens/maps/MapRouteScreen';
import { ItineraryScreen } from '@screens/itinerary/ItineraryScreen';
import { BudgetScreen } from '@screens/budget/BudgetScreen';
import { GearScreen } from '@screens/gear/GearScreen';
import { WeatherScreen } from '@screens/weather/WeatherScreen';
import { AiAssistantScreen } from '@screens/ai/AiAssistantScreen';
import { BookingsScreen } from '@screens/bookings/BookingsScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';
import { AchievementsScreen } from '@screens/achievements/AchievementsScreen';
import { NotificationsScreen } from '@screens/notifications/NotificationsScreen';
import { OfflineMapsScreen } from '@screens/offline-maps/OfflineMapsScreen';
import { SavedTreksScreen } from '@screens/saved-treks/SavedTreksScreen';
import { ReviewsScreen } from '@screens/reviews/ReviewsScreen';
import { PaymentScreen } from '@screens/payment/PaymentScreen';
import { SupportScreen } from '@screens/support/SupportScreen';
import { EmergencyScreen } from '@screens/emergency/EmergencyScreen';

const Stack = createNativeStackNavigator();

export const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="TrekDetails"
        component={TrekDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="HikeProgress"
        component={HikeProgressScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="MapRoute"
        component={MapRouteScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Itinerary"
        component={ItineraryScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Budget"
        component={BudgetScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Gear"
        component={GearScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Weather"
        component={WeatherScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="AiAssistant"
        component={AiAssistantScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="OfflineMaps"
        component={OfflineMapsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="SavedTreks"
        component={SavedTreksScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Support"
        component={SupportScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
};

