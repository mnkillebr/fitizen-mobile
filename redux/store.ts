import { configureStore } from "@reduxjs/toolkit";
import workoutLogReducer from "./slices/workoutLogSlice";

export const store = configureStore({
  reducer: {
    workoutLog: workoutLogReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;