import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ExpeditionState {
  isActive: boolean;
  activeTrek: any | null; // Can be official trek or saved custom trek
  planType: 'official' | 'custom' | null;
  progress: number;
  currentDay: number;
}

const initialState: ExpeditionState = {
  isActive: false,
  activeTrek: null,
  planType: null,
  progress: 0,
  currentDay: 1,
};

const expeditionSlice = createSlice({
  name: 'expedition',
  initialState,
  reducers: {
    beginExpedition: (
      state,
      action: PayloadAction<{ trek: any; planType: 'official' | 'custom' }>
    ) => {
      state.isActive = true;
      state.activeTrek = action.payload.trek;
      state.planType = action.payload.planType;
      state.progress = 0;
      state.currentDay = 1;
    },
    updateProgress: (
      state,
      action: PayloadAction<{ progress: number; currentDay?: number }>
    ) => {
      if (state.isActive) {
        state.progress = action.payload.progress;
        if (action.payload.currentDay) {
          state.currentDay = action.payload.currentDay;
        }
      }
    },
    endExpedition: (state) => {
      state.isActive = false;
      state.activeTrek = null;
      state.planType = null;
      state.progress = 0;
      state.currentDay = 1;
    },
  },
});

export const { beginExpedition, updateProgress, endExpedition } = expeditionSlice.actions;

export default expeditionSlice.reducer;
