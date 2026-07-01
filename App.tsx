/**
 * TrekGPT React Native App
 * @format
 */
import 'react-native-gesture-handler'; // Must be at the top
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PaperProvider } from 'react-native-paper';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

import { store, persistor } from '@store/index';
import { RootNavigator } from '@navigation/index';
import { colors } from '@theme/colors';
import { seedStaticDataToFirestore } from './src/seedData';

const queryClient = new QueryClient();

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftWidth: 0, backgroundColor: colors.surface }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
      }}
      text2Style={{
        fontSize: 13,
        color: colors.muted,
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftWidth: 0, backgroundColor: colors.surface }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
      }}
      text2Style={{
        fontSize: 13,
        color: colors.muted,
      }}
    />
  ),
};

function App(): React.JSX.Element {
  useEffect(() => {
    seedStaticDataToFirestore().catch(console.error);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <PaperProvider>
              <SafeAreaProvider>
                <BottomSheetModalProvider>
                  <StatusBar
                    barStyle="light-content"
                    backgroundColor={colors.background}
                  />
                  <RootNavigator />
                </BottomSheetModalProvider>
              </SafeAreaProvider>
            </PaperProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
      <Toast config={toastConfig} position="top" topOffset={40} />
    </GestureHandlerRootView>
  );
}

export default App;
