import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const uiSlice = createSlice({
  name: "ui",
  initialState: {
    hideTabs: false,
    clearBottomSheet: false,
  },
  reducers: {
    setToggleHideTabs(state) {
      state.hideTabs = !state.hideTabs
    },
    setClearBottomSheet(state, action: PayloadAction<boolean>) {
      state.clearBottomSheet = action.payload;
    }
  },
});

export const { setToggleHideTabs, setClearBottomSheet } = uiSlice.actions;
export default uiSlice.reducer;