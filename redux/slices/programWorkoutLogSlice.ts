import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProgramExerciseLogSet {
  set: string | number;
  actualReps?: string;
  load?: number;
  notes?: string;
  unit: string;
}

interface ProgramExerciseLogType {
  programBlockId: string;
  exerciseId: string;
  exerciseName: string;
  orderInBlock: number;
  exerciseThumbnail?: string;
  sets: ProgramExerciseLogSet[];
  targetReps?: string | number;
  time?: string | number;
}

interface ProgramWorkoutLogState {
  programId: string | null;
  programWeek: number | null;
  programDay: number | null;
  duration: string | null;
  exerciseLogs: ProgramExerciseLogType[];
  currentNote: string | undefined;
  currentExercise: any;
}

const sampleWorkoutState: ProgramWorkoutLogState = {
  programId: 'cm5nd6lud0005xilpb371955v',
  programWeek: 1,
  programDay: 1,
  duration: '278000',
  exerciseLogs: [
    {
      programBlockId: 'cm5nd6lue0009xilpwsp3b72m',
      exerciseId: 'cm5nd618u001f2wx6r70yenss',
      exerciseName: 'Goblet Squat',
      orderInBlock: 1,
      targetReps: 8,
      sets: [
        {
          set: 1,
          actualReps: '8',
          load: 45,
          notes: 'Too ez',
          unit: 'pound'
        },
        {
          set: 2,
          actualReps: '8',
          load: 55,
          unit: 'pound'
        }
      ]
    },
    {
      programBlockId: 'cm5nd6lue0009xilpwsp3b72m',
      exerciseId: 'cm5nd618s00182wx689a0wj0r',
      exerciseName: 'X Pulldowns',
      orderInBlock: 2,
      targetReps: 8,
      sets: [
        {
          set: 1,
          actualReps: '8',
          load: 60,
          notes: 'Right is stronger',
          unit: 'pound'
        },
        {
          set: 2,
          actualReps: '8',
          load: 65,
          unit: 'pound'
        }
      ]
    },
    {
      programBlockId: 'cm5nd6lue0009xilpwsp3b72m',
      exerciseId: 'cm5nd618p00152wx6axpz8kfb',
      exerciseName: 'Front Plank',
      orderInBlock: 3,
      time: 15,
      sets: [
        {
          set: 1,
          actualReps: '',
          unit: 'pound'
        },
        {
          set: 2,
          actualReps: '',
          unit: 'pound'
        }
      ]
    },
    {
      programBlockId: 'cm5nd6lue000axilpt3zwxupx',
      exerciseId: 'cm5nd618n000v2wx6slda50h7',
      exerciseName: 'Reaching Single Leg Deadlift',
      orderInBlock: 1,
      targetReps: 8,
      sets: [
        {
          set: 1,
          actualReps: '8',
          unit: 'pound'
        },
        {
          set: 2,
          actualReps: '8',
          unit: 'pound'
        }
      ]
    },
    {
      programBlockId: 'cm5nd6lue000axilpt3zwxupx',
      exerciseId: 'cm5nd618o000z2wx6p96qm5ec',
      exerciseName: 'Standing Cable Chop',
      orderInBlock: 2,
      targetReps: 8,
      sets: [
        {
          set: 1,
          actualReps: '8',
          load: 25,
          unit: 'pound'
        },
        {
          set: 2,
          actualReps: '8',
          load: 25,
          unit: 'pound'
        }
      ]
    },
    {
      programBlockId: 'cm5nd6lue000axilpt3zwxupx',
      exerciseId: 'cm5nd618o000y2wx68yu2yzpy',
      exerciseName: 'Tall Kneeling Cable Anti Rotation Pallof Press',
      orderInBlock: 3,
      targetReps: 8,
      sets: [
        {
          set: 1,
          actualReps: '8',
          load: 20,
          unit: 'pound'
        },
        {
          set: 2,
          actualReps: '8',
          load: 20,
          unit: 'pound'
        }
      ]
    },
    {
      programBlockId: 'cm5nd6lue000bxilp9s75sizz',
      exerciseId: 'cm5nd618s00192wx6adik2qq4',
      exerciseName: 'Pushup',
      orderInBlock: 1,
      targetReps: 8,
      sets: [
        {
          set: 1,
          actualReps: '10',
          unit: 'pound'
        },
        {
          set: 2,
          actualReps: '10',
          unit: 'pound'
        }
      ]
    },
    {
      programBlockId: 'cm5nd6lue000bxilp9s75sizz',
      exerciseId: 'cm5nd618p00122wx6cez667gu',
      exerciseName: 'Suspension Row',
      orderInBlock: 2,
      targetReps: 8,
      sets: [
        {
          set: 1,
          actualReps: '10',
          unit: 'pound'
        },
        {
          set: 2,
          actualReps: '10',
          unit: 'pound'
        }
      ]
    },
    {
      programBlockId: 'cm5nd6lue000bxilp9s75sizz',
      exerciseId: 'cm5nd618u001h2wx6o7uazbti',
      exerciseName: 'Farmers Carry',
      orderInBlock: 3,
      time: 15,
      sets: [
        {
          set: 1,
          actualReps: '',
          load: 70,
          unit: 'pound'
        },
        {
          set: 2,
          actualReps: '',
          load: 70,
          unit: 'pound'
        }
      ]
    }
  ],
  currentExercise: {
    programBlockId: 'cm5nd6lue000bxilp9s75sizz',
    exercise: {
      id: 'cm5nd618u001h2wx6o7uazbti',
      name: 'Farmers Carry',
      muxPlaybackId: 'a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4',
      cues: [
        'Stand tall with your feet hip-width apart, holding a dumbbell or kettlebell in each hand at your sides. Your palms should face in toward your body, with your arms fully extended but not locked out. Pull your shoulders down and back, engage your core, and keep your chest up. Ensure that your posture is strong and upright.',
        'Begin walking forward, taking small, controlled steps. Keep your core tight and your posture tall, with your shoulders stable and your arms straight by your sides. Avoid leaning or letting the kettlebells pull you to one side. Focus on maintaining balance and control as you walk. Keep your steps smooth and deliberate, moving with purpose.',
        'Continue walking for the desired distance or time, then carefully set the weights down by hinging at the hips. You should feel the exercise in your forearms, shoulders, upper back, core, and legs. The key areas of focus are grip strength, core stability, and maintaining good posture throughout the carry. Avoid slouching or letting the weights cause your body to shift or sway.'
      ],
      tags: [
        'functional',
        'stabilizer',
        'core'
      ],
      gif: 'https://image.mux.com/a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4/animated.gif?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNWhTVXdtcDAwcnZwMU14Vmh4UDAwOVFHdzUwMERwWUR3S1o1dGgzMU5zaWo0IiwiYXVkIjoiZyIsImV4cCI6MTczODA4NjkwMCwia2lkIjoiTDljMDJKa3VDU1VSSWpQSDgwMEpCN2VWYmJZRVpoazRNVDd6dnFBWHdpTlg0IiwiaGVpZ2h0IjoiNjQwIiwiaWF0IjoxNzM4MDgzMzAwfQ.BcaT8vwDua0FGxqpuwI6BBL8jxedGg_VVnsnYfEMte8koOjZy-NsR45rXtXIwIn8wwIlkV3FoXxisvJL_HUUTIjIEnUl6aii5NAdT0TA7CohwcN-QGf-yAjmXIWV4-Eny_34JdTRfxE2aX7uburRSApiYul8919fI7S5NDqLDg_luUPkwBo-ojyoLcN50S2IDgExbi5W0HowRbOASMOCmhDhDo46aumFFEo_bvtqoKpnFgS0UXZZu81ROF2hwuWMzdsFfhiqDdz2Lxbw3WaLrqbXFJci-rhy1YlaElzHdhvOCvdBL3260oAw0eMDv9OLdBMDFft64cQeIlm4A7YICQ'
    },
    orderInBlock: 3,
    sets: 2,
    reps: null,
    time: 15,
    id: 'cm5nd618u001h2wx6o7uazbti',
    name: 'Farmers Carry',
    muxPlaybackId: 'a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4',
    cues: [
      'Stand tall with your feet hip-width apart, holding a dumbbell or kettlebell in each hand at your sides. Your palms should face in toward your body, with your arms fully extended but not locked out. Pull your shoulders down and back, engage your core, and keep your chest up. Ensure that your posture is strong and upright.',
      'Begin walking forward, taking small, controlled steps. Keep your core tight and your posture tall, with your shoulders stable and your arms straight by your sides. Avoid leaning or letting the kettlebells pull you to one side. Focus on maintaining balance and control as you walk. Keep your steps smooth and deliberate, moving with purpose.',
      'Continue walking for the desired distance or time, then carefully set the weights down by hinging at the hips. You should feel the exercise in your forearms, shoulders, upper back, core, and legs. The key areas of focus are grip strength, core stability, and maintaining good posture throughout the carry. Avoid slouching or letting the weights cause your body to shift or sway.'
    ],
    tags: [
      'functional',
      'stabilizer',
      'core'
    ],
    gif: 'https://image.mux.com/a5hSUwmp00rvp1MxVhxP009QGw500DpYDwKZ5th31Nsij4/animated.gif?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNWhTVXdtcDAwcnZwMU14Vmh4UDAwOVFHdzUwMERwWUR3S1o1dGgzMU5zaWo0IiwiYXVkIjoiZyIsImV4cCI6MTczODA4NjkwMCwia2lkIjoiTDljMDJKa3VDU1VSSWpQSDgwMEpCN2VWYmJZRVpoazRNVDd6dnFBWHdpTlg0IiwiaGVpZ2h0IjoiNjQwIiwiaWF0IjoxNzM4MDgzMzAwfQ.BcaT8vwDua0FGxqpuwI6BBL8jxedGg_VVnsnYfEMte8koOjZy-NsR45rXtXIwIn8wwIlkV3FoXxisvJL_HUUTIjIEnUl6aii5NAdT0TA7CohwcN-QGf-yAjmXIWV4-Eny_34JdTRfxE2aX7uburRSApiYul8919fI7S5NDqLDg_luUPkwBo-ojyoLcN50S2IDgExbi5W0HowRbOASMOCmhDhDo46aumFFEo_bvtqoKpnFgS0UXZZu81ROF2hwuWMzdsFfhiqDdz2Lxbw3WaLrqbXFJci-rhy1YlaElzHdhvOCvdBL3260oAw0eMDv9OLdBMDFft64cQeIlm4A7YICQ',
    exerciseId: 'cm5nd618u001h2wx6o7uazbti',
    currentSet: 2
  },
  currentNote: undefined,
}

const initialState: ProgramWorkoutLogState = {
  programId: null,
  programWeek: null,
  programDay: null,
  duration: null,
  exerciseLogs: [],
  currentNote: undefined,
  currentExercise: undefined,
};

export const programWorkoutLogSlice = createSlice({
  name: "programWorkoutLog",
  initialState,
  reducers: {
    startProgramWorkout(state, action: PayloadAction<{
      programId: string;
      programWeek: number;
      programDay: number;
    }>) {
      const { programId, programWeek, programDay } = action.payload;
      state.programId = programId;
      state.programWeek = programWeek;
      state.programDay = programDay;
      state.exerciseLogs = [];
      state.duration = null;
    },
    recordProgramSet(
      state,
      action: PayloadAction<{
        programBlockId: string;
        exerciseId: string;
        exerciseName: string;
        exerciseThumbnail: string;
        orderInBlock: number;
        set: ProgramExerciseLogSet;
        targetReps?: string;
        time?: string;
      }>
    ) {
      let updatedExerciseLogs: Array<ProgramExerciseLogType> = []
      const { programBlockId, exerciseId, exerciseName, exerciseThumbnail, orderInBlock, set, targetReps, time } = action.payload;
      const existingExercise = programBlockId
        ? state.exerciseLogs.find(log => log.programBlockId === programBlockId && log.exerciseId === exerciseId && log.orderInBlock === orderInBlock)
        : state.exerciseLogs.find(log => log.exerciseId === exerciseId)
      if (existingExercise) {
        updatedExerciseLogs = state.exerciseLogs.map(log => {
          if (log.programBlockId === programBlockId && log.exerciseId === exerciseId && log.orderInBlock === orderInBlock) {
            return {
              ...log,
              sets: [...log.sets, {
                ...set,
                notes: state.currentNote,
              }]
            }
          } else if (log.exerciseId === exerciseId) {
            return {
              ...log,
              sets: [...log.sets, {
                ...set,
                notes: state.currentNote,
              }]
            }
          } else {
            return log
          }
        })
      } else {
        updatedExerciseLogs = [
          ...state.exerciseLogs,
          {
            programBlockId,
            exerciseId,
            exerciseName,
            exerciseThumbnail,
            orderInBlock,
            targetReps,
            time,
            sets: [{
              ...set,
              notes: state.currentNote,
            }]
          }
        ]
      }
      state.exerciseLogs = updatedExerciseLogs;
      state.currentNote = undefined;
    },
    finishProgramWorkout(state, action: PayloadAction<string>) {
      state.duration = action.payload;
    },
    resetProgramWorkoutLog(state) {
      state.exerciseLogs = [];
      state.duration = null;
      state.currentNote = undefined;
    },
    cancelProgramWorkout(state) {
      state.programId = null;
      state.programWeek = null;
      state.programDay = null;
      state.duration = null;
      state.exerciseLogs = [];
    },
    setCurrentProgramExercise(state, action: PayloadAction) {
      state.currentExercise = action.payload;
    },
    saveProgramNote(state, action: PayloadAction<string>) {
      state.currentNote = action.payload;
    }
  },
});

export const { startProgramWorkout, recordProgramSet, finishProgramWorkout, resetProgramWorkoutLog, cancelProgramWorkout, setCurrentProgramExercise, saveProgramNote } = programWorkoutLogSlice.actions;
export default programWorkoutLogSlice.reducer;