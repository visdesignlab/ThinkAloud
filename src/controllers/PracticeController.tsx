import { useForm } from "@mantine/form";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";

import { Group } from "@mantine/core";
import { Text } from "@mantine/core";
import { Button } from "@mantine/core";
import { useParams } from "react-router-dom";
import { NextButton } from "../components/NextButton";
import { PracticeComponent } from "../parser/types";
import { useCurrentStep } from "../routes";
import { useNavigate } from "react-router-dom";

import {
  saveTrialAnswer,
  useAppDispatch,
  useAppSelector,
  useNextStep,
  useTrialStatus,
} from "../store";

import ResponseSwitcher from "../components/stimuli/inputcomponents/ResponseSwitcher";
import {
  createTrialProvenance,
  TrialProvenanceContext,
} from "../store/trialProvenance";

export function useTrialsConfig() {
  const currentStep = useCurrentStep();

  return useAppSelector((state) => {
    const { config } = state.study;
    const component = currentStep ? config?.components[currentStep] : null;

    if (!config || !currentStep || component?.type !== "practice") return null;

    return config.components[currentStep] as PracticeComponent;
  });
}

export function useNextTrialId(currentTrial: string | null) {
  const config = useTrialsConfig();

  if (!currentTrial || !config) return null;

  const { order } = config;

  const idx = order.findIndex((t) => t === currentTrial);

  if (idx === -1) return null;

  return order[idx + 1] || null;
}

// current active stimuli presented to the user

export default function PracticeController() {
  const dispatch = useAppDispatch();
  const currentStep = useCurrentStep();
  const nextStep = useNextStep();
  const { trialId = null } = useParams<{ trialId: string }>();
  const config = useTrialsConfig();
  const nextTrailId = useNextTrialId(trialId);
  const trialStatus = useTrialStatus(trialId);
  const [disableNext, setDisableNext] = useState(true);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const navigate = useNavigate();

  const trialProvenance = createTrialProvenance();

  const answerField = useForm({
    initialValues: {
      input: trialStatus.answer || "",
    },
    transformValues(values) {
      return {
        answer: parseFloat(values.input),
      };
    },
    validate: {
      input: (value) => {
        if (value.length === 0) return null;
        const ans = parseFloat(value);
        if (isNaN(ans)) return "Please enter a number";
        return ans < 0 || ans > 100 ? "The answer is range from 0 - 100" : null;
      },
    },
    validateInputOnChange: ["input"],
  });

  const handleResponseCheck = () => {
    if (answerField.getTransformedValues().answer === stimulus.stimulus.correctAnswer) 
      setCorrectAnswers(correctAnswers + 1);

    setDisableNext(false)

    if ((nextTrailId === null) && (correctAnswers < config?.minCorrect)) {}
  }
  
  useEffect(() => {
    answerField.setFieldValue("input", trialStatus.answer || "");
  }, [trialStatus.answer]);

  if (!trialId || !config) return null;

  const stimulus = config.trials[trialId];
  const componentPath = stimulus.stimulus.path;
  const response = config.response;
  const StimulusComponent = useMemo(() => {
    if (!componentPath || componentPath.length === 0) return null;

    return lazy(
      () => import(/* @vite-ignore */ `../components/${componentPath}`)
    );
  }, [componentPath]);

  return (
    <div key={trialId}>
      <ReactMarkdown>{stimulus.instruction}</ReactMarkdown>
      <TrialProvenanceContext.Provider value={trialProvenance}>
        {StimulusComponent && (
          <Suspense fallback={<div>Loading...</div>}>
            <StimulusComponent parameters={stimulus.stimulus.parameters} />
            <ResponseSwitcher status={trialStatus} response={response} />
            {!disableNext && (<Text>The correct answer is: {stimulus.stimulus.correctAnswer}</Text>)}
            {/* <TextInput
            //disabled={trialStatus.complete}
            //{...answerField.getInputProps("input")}
            placeholder={"The answer is range from 0 - 100"}
            label={"Your answer"}
            radius={"lg"}
            size={"md"}
          />  */}
          </Suspense>
        )}
      </TrialProvenanceContext.Provider>
      

      <Group position="right" spacing="xs" mt="xl">
      <Button onClick={handleResponseCheck} disabled={!disableNext}>Check Answer</Button>
        {nextTrailId ? (
          <NextButton
            // disabled={
            //   !trialStatus.complete &&
            //   (answerField.values.input.length === 0 ||
            //     !answerField.isValid("input"))
            // }
            disabled={disableNext}
            to={`/${currentStep}/${nextTrailId}`}
            process={() => {
              if (trialStatus.complete) {
                answerField.setFieldValue("input", "");
              }

            const answer = answerField.getTransformedValues().answer;  

            /*dispatch(
                saveTrialAnswer({
                  trialName: currentStep,
                  trialId,
                  answer: answer.toString(),
                })
              );*/

              setDisableNext(true)
              answerField.setFieldValue("input", "");
            }}
          />
        ) : (
          <NextButton
            to={`/${nextStep}`} 
            disabled={disableNext}
            process={() => {
              // complete trials
            }}
          />
        )}
      </Group>
    </div>
  );
}
