import { configureStore } from "@reduxjs/toolkit";
import devtoolsEnhancer from "redux-devtools-expo-dev-plugin";
import workoutLogReducer from "./slices/workoutLogSlice";
import programWorkoutLogReducer from "./slices/programWorkoutLogSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    workoutLog: workoutLogReducer,
    programWorkoutLog: programWorkoutLogReducer,
    ui: uiReducer,
  },
  devTools: false,
  enhancers: getDefaultEnhancers => getDefaultEnhancers().concat(devtoolsEnhancer()),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;