import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LikedTreksState {
  likedTrekIds: string[];
}

const initialState: LikedTreksState = {
  likedTrekIds: [],
};

export const likedTreksSlice = createSlice({
  name: 'likedTreks',
  initialState,
  reducers: {
    toggleLikeTrek: (state, action: PayloadAction<string>) => {
      const index = state.likedTrekIds.indexOf(action.payload);
      if (index >= 0) {
        state.likedTrekIds.splice(index, 1);
      } else {
        state.likedTrekIds.push(action.payload);
      }
    },
  },
});

export const { toggleLikeTrek } = likedTreksSlice.actions;
export default likedTreksSlice.reducer;
