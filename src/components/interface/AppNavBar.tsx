import { AppShell, Text } from '@mantine/core';
import ReactMarkdownWrapper from '../ReactMarkdownWrapper';
import { useStudyConfig } from '../../store/hooks/useStudyConfig';
import { useStoredAnswer } from '../../store/hooks/useStoredAnswer';
import ResponseBlock from '../response/ResponseBlock';
import { useCurrentStep } from '../../routes';
import { IndividualComponent } from '../../parser/types';
import { isPartialComponent } from '../../parser/parser';
import merge from 'lodash.merge';

export default function AppNavBar() {
  const trialHasSideBar = useStudyConfig()?.uiConfig.sidebar;
  const trialHasSideBarResponses = true;

  // Get the config for the current step
  const studyConfig = useStudyConfig();
  const currentStep = useCurrentStep();
  const stepConfig = studyConfig.components[currentStep];

  const currentConfig = stepConfig
    ? isPartialComponent(stepConfig) && studyConfig.baseComponents
      ? (merge(
          {},
          studyConfig.baseComponents?.[stepConfig.baseComponent],
          stepConfig
        ) as IndividualComponent)
      : (stepConfig as IndividualComponent)
    : null;
  const status = useStoredAnswer();
  const instruction = currentConfig?.instruction || '';

  const instructionInSideBar =
    currentConfig?.instructionLocation === 'sidebar' ||
    currentConfig?.instructionLocation === undefined;

  return trialHasSideBar && currentConfig ? (
    <AppShell.Navbar bg="gray.1" display="block" width={{ base: 300 }} style={{ zIndex: 0, overflowY: 'scroll' }}>
      {instructionInSideBar && instruction !== '' && (
        <AppShell.Section
          bg="gray.3"
          p="xl"
        >
          <Text c="gray.9">
            <Text span c="orange.8" fw={700} inherit>
              Task:
            </Text>
            <ReactMarkdownWrapper text={instruction} />
          </Text>
        </AppShell.Section>
      )}

      {trialHasSideBarResponses && (
        <AppShell.Section p="xl">
          {
            <ResponseBlock
              key={`${currentStep}-sidebar-response-block`}
              status={status}
              config={currentConfig}
              location="sidebar"
            />
          }
        </AppShell.Section>
      )}
    </AppShell.Navbar>
  ) : (
    <ResponseBlock
      key={`${currentStep}-sidebar-response-block`}
      status={status}
      config={currentConfig}
      location="sidebar"
      style={{ display: 'hidden' }}
    />
  );
}
