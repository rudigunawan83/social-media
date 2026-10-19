import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isCreatePostModalOpen: boolean;
  isEditProfileModalOpen: boolean;
  likedByPostId: number | null;
  activeProfileTab: string;
}

const initialState: UiState = {
  isCreatePostModalOpen: false,
  isEditProfileModalOpen: false,
  likedByPostId: null,
  activeProfileTab: "posts",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCreatePostModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreatePostModalOpen = action.payload;
    },
    setEditProfileModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditProfileModalOpen = action.payload;
    },
    setLikedByPostId: (state, action: PayloadAction<number | null>) => {
      state.likedByPostId = action.payload;
    },
    setActiveProfileTab: (state, action: PayloadAction<string>) => {
      state.activeProfileTab = action.payload;
    },
  },
});

export const {
  setCreatePostModalOpen,
  setEditProfileModalOpen,
  setLikedByPostId,
  setActiveProfileTab,
} = uiSlice.actions;

export default uiSlice.reducer;
