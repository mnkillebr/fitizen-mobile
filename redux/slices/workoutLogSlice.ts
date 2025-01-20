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

const sampleWorkoutState: WorkoutLogState = {
  exerciseLogs: [
    {
      circuitId: '',
      exerciseId: 'cm5nd618e000k2wx6cjgo2hhz',
      orderInRoutine: 1,
      target: 'reps',
      exerciseName: 'Half Kneeling Adductor Rock',
      exerciseThumbnail: 'https://image.mux.com/vBU0063pFAXYUcfeQiPWJokcLFaC4jh8KU8PFtrQsiYI/thumbnail.png?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ2QlUwMDYzcEZBWFlVY2ZlUWlQV0pva2NMRmFDNGpoOEtVOFBGdHJRc2lZSSIsImF1ZCI6InQiLCJleHAiOjE3MzY0Njk2MzAsImtpZCI6Ikw5YzAySmt1Q1NVUklqUEg4MDBKQjdlVmJiWUVaaGs0TVQ3enZxQVh3aU5YNCIsImhlaWdodCI6Ijc3MCIsImZpdF9tb2RlIjoiY3JvcCIsImlhdCI6MTczNjQ2NjAzMH0.JIytIWzOJmQdb45An6kNgTVogGpsOkjqWziF7PY2iTNzFjVgVsTZNUWEHcVwH8z3C-NRHW89NcSRVeUjaNVJiiiypSHRdmDswFou6w4yaAocND1G8B-VEIoV5bqkMkgH1NhfGk_buGiPyYsvtEs2X9RFUDY1nmFnBHvrHfuUXmXMkpTr39c7I4EVGcBdUxneTPuUDNqgNRi7bLjVecDkxyGAHMkDx_BZG_G6v5_wjBf6eGzHquMOz7RE4EeSlQfDb7l1zv9_JnXflkWr-oU2wW_iDnDpJqv28fpP2PUy_9b6mbB1-Z6Xto0Xgn9Hs_nlohcTK1k39IlVuk8Uf_hlrw',
      targetReps: '5',
      time: '3',
      sets: [
        {
          set: "1",
          actualReps: '5',
          unit: 'pound'
        }
      ]
    },
    {
      circuitId: '',
      exerciseId: 'cm5nd6188000g2wx6o641mysj',
      orderInRoutine: 2,
      target: 'reps',
      exerciseName: 'Band Assisted Leg Lowering',
      exerciseThumbnail: 'https://image.mux.com/N602azha2Y3XjCw4QkJcbrGH6TzIYS02ZE2PegWcsvN00g/thumbnail.png?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJONjAyYXpoYTJZM1hqQ3c0UWtKY2JyR0g2VHpJWVMwMlpFMlBlZ1djc3ZOMDBnIiwiYXVkIjoidCIsImV4cCI6MTczNjQ2OTYzMCwia2lkIjoiTDljMDJKa3VDU1VSSWpQSDgwMEpCN2VWYmJZRVpoazRNVDd6dnFBWHdpTlg0IiwiaGVpZ2h0IjoiNzcwIiwiZml0X21vZGUiOiJzbWFydGNyb3AiLCJpYXQiOjE3MzY0NjYwMzB9.jBQcu472VVbapV-_MqhdH5ygSzZ8qEOe4QwM8hovmJ2_aWltXyDgVX3ywFaMcBUZIDvv_m5Gj3xxTHesHbCfG3n8hGLWPQlqsf8QNDPg_87bpybeFqTlYw2r2w1p4O7jCZp72g143G0K0yhBPIRPUmcNIZ-ZWwO6I4eUxZp3WZ1feJxVp9tyVyxDeyMK2hnhnHeKWTMvf3nxVZu4St8SEzvJeCOo10E-M_NBV_c-Kv4na9tPN7A20LpWYSGHKr3-yjiKch9GnWaqLIViD-JRXUZUI5Goa7UMhdksU0TW03MqB30HI45uYHkZTgtNbJOmVYQ0VjneKH1CTmIYYJhv-A',
      targetReps: '5',
      time: '3',
      sets: [
        {
          set: "1",
          actualReps: '5',
          unit: 'pound'
        }
      ]
    },
    {
      circuitId: '',
      exerciseId: 'cm5nd618o00112wx68ngcoqqg',
      orderInRoutine: 3,
      target: 'reps',
      exerciseName: 'V Stance Thoracic Spine Mobility',
      exerciseThumbnail: 'https://image.mux.com/5a5ziapKMdlI01rLQqzA3f93Fo1xrpHIkR02g8GCGq1008/thumbnail.png?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1YTV6aWFwS01kbEkwMXJMUXF6QTNmOTNGbzF4cnBISWtSMDJnOEdDR3ExMDA4IiwiYXVkIjoidCIsImV4cCI6MTczNjQ2OTYzMCwia2lkIjoiTDljMDJKa3VDU1VSSWpQSDgwMEpCN2VWYmJZRVpoazRNVDd6dnFBWHdpTlg0IiwiaGVpZ2h0IjoiNzcwIiwiZml0X21vZGUiOiJjcm9wIiwiaWF0IjoxNzM2NDY2MDMwfQ.PpRztzrAt0FnvkEJ9nuxVUQ-XVDiqgYxR9XXiphG_0C8iiCCnTcVUCypN-57BdZid4QbtjUN7aApPFUFOkztwjINiqbs39n_XmMlul3jGsB8BRQCSXx4CZfOoZaPLHnL5He6tAUFpPzSw0hHaaMQiOMcAl4V1XXFf286H9YNA-9CzxmY6CQFG9NmXQn4srAW6mv_0cKgFz5zDroFf_VDRQFmtmkq2jPrW5SjeEN0D4Asypa2q3yJxUsI5d2-bugLcacw8pkTEfwhMccWqNTM4QP3p-oLdImbOEr9RioM1O6Clr3Emg4daMVkt7_fjcKMfiWVZQ2ZKgu0gHmbHe4PIQ',
      targetReps: '5',
      time: '3',
      sets: [
        {
          set: "1",
          actualReps: '5',
          unit: 'pound'
        }
      ]
    },
    {
      circuitId: '',
      exerciseId: 'cm5nd618n000v2wx6slda50h7',
      orderInRoutine: 4,
      target: 'reps',
      exerciseName: 'Reaching Single Leg Deadlift',
      exerciseThumbnail: 'https://image.mux.com/7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms/thumbnail.png?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3Qkx3Y1h4YmNlSXNuaUJ0YmRUaHozYmxUWkcxaTJsZnR1T0FUbU91N21zIiwiYXVkIjoidCIsImV4cCI6MTczNjQ2OTYzMCwia2lkIjoiTDljMDJKa3VDU1VSSWpQSDgwMEpCN2VWYmJZRVpoazRNVDd6dnFBWHdpTlg0IiwiaGVpZ2h0IjoiNzcwIiwiZml0X21vZGUiOiJjcm9wIiwiaWF0IjoxNzM2NDY2MDMwfQ.cFmw_IkiiPuVE6pjNsJQP-JnNjfw7hH1O4-xy81SmlCq4_2HaMVO3LsHEhoDCUn5squk_iD-7FrT8Tm-V1QFTsDUGu4l3l-y4xu042fgOos13iX3f7fU7_67mQcTn_pWDnKYq5jy1AOJTqV7qZNe10Kk49TxzyT4Y5_TRaZkZ5Qoa52VtEepqH57xy8WphJgzzb9mFLPOWnito2gf8YCAvso12OgnzzepacDaQgKpQRJWgJAK20f7hscb7Eq36Bvyo8VgeQbtapjzR136Mjz-tG4WOV4AsbORlkPCx8qEZoPSRDmTjeatQS9fAv-XoTQQxLytw22pOf5hPliY4-sdQ',
      targetReps: '5',
      time: '3',
      sets: [
        {
          set: "1",
          actualReps: '5',
          unit: 'pound'
        }
      ]
    },
    {
      circuitId: 'circuit-1732317444526',
      exerciseId: 'cm5nd618p00162wx67lrf62p3',
      orderInRoutine: 5,
      target: 'time',
      exerciseName: 'Goblet Split Squat',
      exerciseThumbnail: 'https://image.mux.com/s628Twytob5ynbDKqKoNMiLHvMG2ZyTauK02vuV5texM/thumbnail.png?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzNjI4VHd5dG9iNXluYkRLcUtvTk1pTEh2TUcyWnlUYXVLMDJ2dVY1dGV4TSIsImF1ZCI6InQiLCJleHAiOjE3MzY0Njk2MzAsImtpZCI6Ikw5YzAySmt1Q1NVUklqUEg4MDBKQjdlVmJiWUVaaGs0TVQ3enZxQVh3aU5YNCIsImhlaWdodCI6Ijc3MCIsImZpdF9tb2RlIjoiY3JvcCIsImlhdCI6MTczNjQ2NjAzMH0.uMGdoYq4Tmqf8-eu3q7Eq1-rASn5P63C6BeZ_C61Evrav0ibdtQxEvqR6-eXJxM77V9_ONSM8sGIQEmCt9tMtEOg4jdN7mLEoB5l75-r2u83nwHCTsZmkVW1Kcl5BPdfAh1ECCEdka-wbVgA6cIXr8awlkQNA8PbrGpodWp97My0M8jfvfvfJd-5Le2XCwubpoQZSTxZnWIBh8XlvJ1Kc7UIR0nBmarWy-4U4gSR-FleAukvlyanbnPBFTK7M-I7Sp8cMO49A-ty3gLAykC72onVQLK0EjDiTbM3K5Dok7zTzJEVdIixF0v6n26dPZB3w8Se8z3iNBD5KrGGWyauDQ',
      time: '30 sec',
      sets: [
        {
          set: "1",
          actualReps: '12',
          load: 44,
          unit: 'pound'
        },
        {
          set: "2",
          actualReps: '12',
          load: 44,
          unit: 'pound'
        },
        {
          set: "3",
          actualReps: '12',
          load: 44,
          unit: 'pound'
        }
      ]
    },
    {
      circuitId: 'circuit-1732317444526',
      exerciseId: 'cm5nd6188000f2wx6gzmx8tjb',
      orderInRoutine: 6,
      target: 'reps',
      exerciseName: 'Half Kneel Kettlebell Press',
      exerciseThumbnail: 'https://image.mux.com/TU4XmFZXrsRuP5pI4kPLFV7rGuOijeFqZF2vt01983O8/thumbnail.png?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJUVTRYbUZaWHJzUnVQNXBJNGtQTEZWN3JHdU9pamVGcVpGMnZ0MDE5ODNPOCIsImF1ZCI6InQiLCJleHAiOjE3MzY0Njk2MzAsImtpZCI6Ikw5YzAySmt1Q1NVUklqUEg4MDBKQjdlVmJiWUVaaGs0TVQ3enZxQVh3aU5YNCIsImhlaWdodCI6IjQ4MSIsImZpdF9tb2RlIjoic21hcnRjcm9wIiwiaWF0IjoxNzM2NDY2MDMwfQ.RShoxNXeACWiL0kduL2PoJwkOwKTmdQDb2TvVgcPgarPOuIKxRogHsWOCR6v3MIdlW_Lzta0TIJ47AbKfX-IsddXt5kD54LlVAIfqaMNqkhSkMDxX-piwxamVr4xhmx5oWpufLEDbHcyWFNdD3H4ElXh-myYwS7yug4OkIdRGsdRMIPxcLFHsBbRhZ2vri-UcRmjV2aelp4y2puZTpyxC9IcSn2X5PqVhNj5HHDhK6pCqBj1MVZh9oe3tVu6q07IVIQtk_cAcN7WTfP_ykvGw-npZxSgsMlp_AQfV3e5QfF1FgqE_eabk2umSBSO8mTGJd-aiYHfqE6FNu73Ms_C-A',
      targetReps: '8',
      sets: [
        {
          set: "1",
          actualReps: '8',
          load: 35,
          unit: 'pound'
        },
        {
          set: "2",
          actualReps: '8',
          load: 35,
          unit: 'pound'
        },
        {
          set: "3",
          actualReps: '8',
          load: 35,
          unit: 'pound'
        }
      ]
    },
    {
      circuitId: 'circuit-1732317444526',
      exerciseId: 'cm5nd618o000y2wx68yu2yzpy',
      orderInRoutine: 7,
      target: 'reps',
      exerciseName: 'Tall Kneeling Cable Anti Rotation Pallof Press',
      exerciseThumbnail: 'https://image.mux.com/tG1R00di01E02CnddXquQQilFpRlSqLg55aw4niXIOvkxA/thumbnail.png?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0RzFSMDBkaTAxRTAyQ25kZFhxdVFRaWxGcFJsU3FMZzU1YXc0bmlYSU92a3hBIiwiYXVkIjoidCIsImV4cCI6MTczNjQ2OTYzMCwia2lkIjoiTDljMDJKa3VDU1VSSWpQSDgwMEpCN2VWYmJZRVpoazRNVDd6dnFBWHdpTlg0IiwiaGVpZ2h0IjoiNzcwIiwiZml0X21vZGUiOiJjcm9wIiwiaWF0IjoxNzM2NDY2MDMwfQ.sXSamKRGlxyZ-6KssmwjlykWODMRGvN4IJSq931xOeoWXVB9WsK26dp4nC1fQtCX1HxMc5juGFVc8fKAC6qQ-JFef34jvKziQkJ4kBMNClIFooaaKIt0IfphNP79HxeoathpWjAGNrdqKfg7iirrG06dphYacKBPEsRpvaINtnqMj8pKjHS0cHxbDsOaXhmz4qeFQSABLFBh0zoUli9A2IPyqrfqG1R-jT0l3BuWPzm5mDkvBKHTR1-LOskX_fartY8FtDCK_4fgCkdkTXlZkBtNoRTsdu53x6Wx7BiDGHVembbhOlosDaRkNw-iUUpD7TEcPkM5VYMw4vYgeEpASg',
      targetReps: '12',
      sets: [
        {
          set: "1",
          actualReps: '12',
          load: 20,
          unit: 'pound'
        },
        {
          set: "2",
          actualReps: '12',
          load: 20,
          unit: 'pound'
        },
        {
          set: "3",
          actualReps: '12',
          load: 20,
          unit: 'pound'
        }
      ]
    },
    {
      circuitId: 'circuit-1732317664252',
      exerciseId: 'cm5nd618k000p2wx6jj4rdwsk',
      orderInRoutine: 8,
      target: 'reps',
      exerciseName: 'Reaching Lateral Lunge',
      exerciseThumbnail: 'https://image.mux.com/8HlOIpUPa2ur6pzng0102iYzBDRRWA9omKjkm10200sPPAo/thumbnail.png?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4SGxPSXBVUGEydXI2cHpuZzAxMDJpWXpCRFJSV0E5b21LamttMTAyMDBzUFBBbyIsImF1ZCI6InQiLCJleHAiOjE3MzY0NzAyMTYsImtpZCI6Ikw5YzAySmt1Q1NVUklqUEg4MDBKQjdlVmJiWUVaaGs0TVQ3enZxQVh3aU5YNCIsImhlaWdodCI6Ijc3MCIsImZpdF9tb2RlIjoiY3JvcCIsImlhdCI6MTczNjQ2NjYxNn0.n5PvGABEeTgCLCVF5YYKUaBojXziS_38PsvwglXI-b_YVdbhLRIdI0Nmw1QEiBfoFIUm8p06PtZH_DfussoOpAE_lBckBFD_M9Xgmrp9dwkCmiKH79ymT8jAPE2kxsO1Xm4DmOYUcMC2s4NehHOhm-7G5qX1_6ZhpUuclPcOkFBxv4OUB8LpPEtbbHRyA0L5Fhs5rX_okL77lMe_vJ-1UFzIJqxmEwwEk3gl6mHWW9YZFeDa1Tmgg1Xy57U672Rb73sanc-hqqFkWz1Nc5exGvQEcfyRU7GqirykfWvDcQS-iCwqHoYS3h1ovP3q3ZJH0fFVRGmEvO6AyeF8_59C2Q',
      targetReps: '8',
      sets: [
        {
          set: "1",
          actualReps: '8',
          load: 15,
          unit: 'pound'
        },
        {
          set: "2",
          actualReps: '8',
          load: 15,
          unit: 'pound'
        },
        {
          set: "3",
          actualReps: '10',
          load: 15,
          unit: 'pound'
        },
        {
          set: "4",
          actualReps: '10',
          load: 14,
          unit: 'pound'
        }
      ]
    },
    {
      circuitId: 'circuit-1732317664252',
      exerciseId: 'cm5nd618p00122wx6cez667gu',
      orderInRoutine: 9,
      target: 'reps',
      exerciseName: 'Suspension Row',
      exerciseThumbnail: 'https://image.mux.com/yNTTTsacFF9K4vf02QwlFn7RWZDStq3T00hwrmnqw5cF4/thumbnail.png?token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ5TlRUVHNhY0ZGOUs0dmYwMlF3bEZuN1JXWkRTdHEzVDAwaHdybW5xdzVjRjQiLCJhdWQiOiJ0IiwiZXhwIjoxNzM2NDcwMjE2LCJraWQiOiJMOWMwMkprdUNTVVJJalBIODAwSkI3ZVZiYllFWmhrNE1UN3p2cUFYd2lOWDQiLCJoZWlnaHQiOiI3NzAiLCJmaXRfbW9kZSI6ImNyb3AiLCJpYXQiOjE3MzY0NjY2MTZ9.Swod8CwKStcSlYHCKnEXe6fNeyu24rt2LBoKsOk2ORPtOKHDlTQKtlbYJczU3CaGo-Miw4dIaM2CCMKu7DZ_TiH0pIA7aHUARtBnbspph31hqGRtF_601aHkm54j2gsSt3CdcMEpll6F4Ovpb-H7YUha0tP4CUVqX8diKamC_8UzwBE-PSEQ_2L7pznbv__jxrq2R-IVO5_kBxSqDP5Za6GJUVU6z_S6QGV8XuE1Tk4tnHG4miat1m7f1LcC25kkGStwP3fWvdSkdYRFRktXShet3KQpBq3h0ihO5iMk8nJshhzMProGscR8w6_-YIE_Sk3IyUKnqSWG1nQRL6NELw',
      targetReps: '10',
      sets: [
        {
          set: "1",
          actualReps: '12',
          unit: 'pound'
        },
        {
          set: "2",
          actualReps: '12',
          unit: 'pound'
        },
        {
          set: "3",
          actualReps: '14',
          unit: 'pound'
        },
        {
          set: "4",
          actualReps: '15',
          unit: 'pound'
        }
      ]
    }
  ],
  duration: '924000',
  workoutId: 'cm5nd6oxg001qxilp7zg10vxf'
}

const initialState: WorkoutLogState = {
  exerciseLogs: [],
  duration: null,
  workoutId: null,
};

export const workoutLogSlice = createSlice({
  name: "workoutLog",
  initialState: sampleWorkoutState,
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
        exerciseThumbnail: string;
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