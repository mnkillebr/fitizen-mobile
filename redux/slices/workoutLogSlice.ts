import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ExerciseLogSet {
  set: string;
  actualReps?: string;
  load?: number;
  unit: "bodyweight" | "kilogram" | "pound";
  notes?: string;
}

interface ExerciseLogType {
  circuitId?: string;
  exerciseId: string;
  exerciseName: string;
  exerciseThumbnail: string;
  orderInRoutine: number;
  sets: ExerciseLogSet[];
  target: "time" | "reps";
  targetReps?: string;
  time?: string;
}

interface WorkoutLogState {
  exerciseLogs: Array<ExerciseLogType>;
  duration: string | null;
  workoutId: string | null;
}

const initialState: WorkoutLogState = {
  exerciseLogs: [],
  duration: null,
  workoutId: null,
};

export const workoutLogSlice = createSlice({
  name: "workoutLog",
  initialState,
  reducers: {
    startWorkout(state, action: PayloadAction<string>) {
      state.workoutId = action.payload;
      state.exerciseLogs = [];
      state.duration = null;
    },
    recordSet(
      state,
      action: PayloadAction<{
        circuitId?: string;
        exerciseId: string;
        exerciseName: string;
        orderInRoutine: number;
        set: ExerciseLogSet;
        target: "time" | "reps";
        targetReps?: string;
        time?: string;
      }>
    ) {
      let updatedExerciseLogs: Array<ExerciseLogType> = []
      const { circuitId, exerciseId, exerciseName, exerciseThumbnail, set, orderInRoutine, target, targetReps, time } = action.payload;
      const existingExercise = circuitId ? state.exerciseLogs.find(log => log.circuitId === circuitId && log.exerciseId === exerciseId && log.orderInRoutine === orderInRoutine) : state.exerciseLogs.find(log => log.exerciseId === exerciseId && log.orderInRoutine === orderInRoutine)
      if (existingExercise) {
        updatedExerciseLogs = state.exerciseLogs.map(log => {
          if (log.circuitId === circuitId && log.exerciseId === exerciseId && log.orderInRoutine === orderInRoutine) {
            return {
              ...log,
              sets: [...log.sets, set]
            }
          } else if (log.exerciseId === exerciseId && log.orderInRoutine === orderInRoutine) {
            return {
              ...log,
              sets: [...log.sets, set]
            }
          } else {
            return log
          }
        })
      } else {
        updatedExerciseLogs = [
          ...state.exerciseLogs,
          {
            circuitId,
            exerciseId,
            orderInRoutine,
            target,
            exerciseName,
            exerciseThumbnail,
            targetReps,
            time,
            sets: [set]
          }
        ]
      }
      state.exerciseLogs = updatedExerciseLogs;
    },
    finishWorkout(state, action: PayloadAction<string>) {
      state.duration = action.payload;
    },
    resetWorkoutLog(state) {
      state.exerciseLogs = [];
      state.duration = null;
    },
    cancelWorkout(state) {
      state.workoutId = null;
      state.duration = null;
      state.exerciseLogs = [];
    }
  },
});

export const { startWorkout, recordSet, finishWorkout, resetWorkoutLog, cancelWorkout } = workoutLogSlice.actions;
export default workoutLogSlice.reducer;