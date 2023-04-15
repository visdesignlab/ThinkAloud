import { type PayloadAction } from "@reduxjs/toolkit";
import { configureTrrackableStore, createTrrackableSlice } from "@trrack/redux";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { StudyComponent, StudyConfig } from "../parser/types";
import { useCurrentStep } from "../routes";

export interface TrialResult {
  complete: boolean;
  answer: string | null;
}

type TrialRecord = Record<string, TrialResult>;

interface Step extends StudyComponent {
  complete: boolean;
  next: string | null;
}

interface State {
  config: StudyConfig | null;
  consent?: {signature: unknown; timestamp: number},
  steps: Record<string, Step>;
  trials: Record<string, TrialRecord>;
  practices: Record<string, TrialRecord>;
}

const initialState: State = {
  config: null,
  consent: undefined,
  steps: {},
  trials: {},
  practices: {},
};

const studySlice = createTrrackableSlice({
  name: "studySlice",
  initialState,
  reducers: {
    saveConfig(state, config: PayloadAction<StudyConfig>) {
      const { payload } = config;
      // Set the config
      state.config = payload;

      // Create steps record to store complete status
      const steps: Record<string, Step> = {};
      payload.sequence.forEach((id, idx, arr) => {
        const component = payload.components[id];
        steps[id] = {
          ...component,
          complete: false,
          next: arr[idx + 1] || null,
        };
      });
      state.steps = steps;
    
      // Create answers record for trail type steps
      const trialSteps = payload.sequence.filter(
        (step) => payload.components[step].type === "trials"
      );
      trialSteps.forEach((trialName) => {
        state.trials[trialName] = {};
      });

      const practiceSteps = payload.sequence.filter(
        (step) => payload.components[step].type === "practice"
      );
      practiceSteps.forEach((practiceStep) => {
        state.practices[practiceStep] = {};
      });
    },
    completeStep(state, step) {
      state.steps[step.payload].complete = true;
    },
    saveConsent: (state, response: PayloadAction<{ signature: unknown, timestamp: number }>) => {
      state.consent = response.payload;
    },
    saveTrialAnswer(
      state,
      {
        payload,
      }: PayloadAction<{
        trialName: string;
        trialId: string;
        answer: string;
      }>
    ) {
      state.trials[payload.trialName][payload.trialId] = {
        complete: true,
        answer: payload.answer,
      };
    },
  },
});

export const { saveConfig, completeStep, saveTrialAnswer } = studySlice.actions;

export const { store, trrack, trrackStore } = configureTrrackableStore({
  reducer: {
    study: studySlice.reducer,
  },
  slices: [studySlice],
});

export const useAppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export function useNextStep() {
  const currentStep = useCurrentStep();

  const { config, steps } = useAppSelector((state) => state.study);

  if (currentStep === "end") return null;

  if (!config) return null;

  return steps[currentStep].next || "end";
}

export function useTrialStatus(trialId: string | null): TrialResult {
  const currentStep = useCurrentStep();
  const { config, trials, practices  } = useAppSelector((state) => state.study);

  if (!trialId || !config || (config.components[currentStep].type !== "trials" && config.components[currentStep].type !== "practice"))
    throw new Error("Not called from a trial route");

  let status: TrialResult | null = null

  switch (config.components[currentStep].type) {
    case "trials": 
      status = trials[currentStep][trialId]
      break
    case "practice":
      status = practices[currentStep][trialId]
      break
    default:
      break
  }

  return (
    status || {
      complete: false,
      answer: null,
    }
  );
}

export type RootState = ReturnType<typeof store.getState>;
