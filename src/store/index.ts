import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { reduxStorage } from './storage';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import savedTreksReducer from './slices/savedTreksSlice';
import likedTreksReducer from './slices/likedTreksSlice';
import expeditionReducer from './slices/expeditionSlice';
import { apiSlice } from '../services/api/apiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  savedTreks: savedTreksReducer,
  likedTreks: likedTreksReducer,
  expedition: expeditionReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  whitelist: ['auth', 'settings', 'savedTreks', 'likedTreks', 'expedition'], // Only persist these reducers
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
