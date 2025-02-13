import { Suspense, useCallback } from 'react';
import { ModuleNamespace } from 'vite/types/hot';
import { AppShell, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { ReactComponent } from '../parser/types';
import { StimulusParams } from '../store/types';
import ResourceNotFound from '../ResourceNotFound';
import { useStoreDispatch, useStoreActions } from '../store/store';
import { useCurrentComponent, useCurrentStep } from '../routes/utils';
import { AnalysisPopout } from '../components/interface/audioAnalysis/AnalysisPopout';

const modules = import.meta.glob(
  '../public/**/*.{mjs,js,mts,ts,jsx,tsx}',
  { eager: true },
);

function ReactComponentController({ currentConfig, provState }: { currentConfig: ReactComponent; provState?: unknown; }) {
  const currentStep = useCurrentStep();
  const currentComponent = useCurrentComponent();
  const { trrackId } = useParams();

  const reactPath = `../public/${currentConfig.path}`;
  const StimulusComponent = reactPath in modules ? (modules[reactPath] as ModuleNamespace).default : null;

  const storeDispatch = useStoreDispatch();
  const { updateResponseBlockValidation, setIframeAnswers } = useStoreActions();

  const setAnswer = useCallback(({ status, provenanceGraph, answers }: Parameters<StimulusParams<unknown, unknown>['setAnswer']>[0]) => {
    storeDispatch(updateResponseBlockValidation({
      location: 'sidebar',
      identifier: `${currentComponent}_${currentStep}`,
      status,
      values: answers,
      provenanceGraph,
    }));

    storeDispatch(setIframeAnswers(answers));
  }, [storeDispatch, updateResponseBlockValidation, currentComponent, currentStep, setIframeAnswers]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {StimulusComponent
        ? (
          <StimulusComponent
            parameters={currentConfig.parameters}
            // eslint-disable-next-line react/jsx-no-bind
            setAnswer={setAnswer}
            provenanceState={provState}
          />
        )
        : <ResourceNotFound path={currentConfig.path} />}
      {currentStep.toString().startsWith('reviewer-') && trrackId ? (
        <AppShell.Footer p="md">
          <AnalysisPopout mini />
        </AppShell.Footer>
      ) : null }
    </Suspense>
  );
}

export default ReactComponentController;
