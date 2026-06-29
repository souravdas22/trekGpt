import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Trek {
  id: string;
  name: string;
  subtitle?: string;
  duration?: string;
  distance?: string;
  difficulty?: string;
  image?: any;
  description?: string;
}

interface SavedTreksState {
  savedTreks: Trek[];
}

const initialState: SavedTreksState = {
  savedTreks: [],
};

export const savedTreksSlice = createSlice({
  name: 'savedTreks',
  initialState,
  reducers: {
    toggleSaveTrek: (state, action: PayloadAction<Trek>) => {
      const existingIndex = state.savedTreks.findIndex(t => t.id === action.payload.id);
      if (existingIndex >= 0) {
        // Remove if already saved
        state.savedTreks.splice(existingIndex, 1);
      } else {
        // Add if not saved
        state.savedTreks.push(action.payload);
      }
    },
  },
});

export const { toggleSaveTrek } = savedTreksSlice.actions;
export default savedTreksSlice.reducer;
