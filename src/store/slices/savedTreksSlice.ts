import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Trek {
  id: string;
  name: string;
  location?: string;
  subtitle?: string;
  duration?: string;
  distance?: string;
  difficulty?: string;
  image?: any;
  description?: string;
  status?: 'Saved' | 'Ready' | 'Completed';
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
        state.savedTreks.push({ ...action.payload, status: action.payload.status || 'Saved' });
      }
    },
    updateTrekStatus: (state, action: PayloadAction<{ id: string; status: 'Saved' | 'Ready' | 'Completed' }>) => {
      const trek = state.savedTreks.find(t => t.id === action.payload.id);
      if (trek) {
        trek.status = action.payload.status;
      }
    },
  },
});

export const { toggleSaveTrek, updateTrekStatus } = savedTreksSlice.actions;
export default savedTreksSlice.reducer;
