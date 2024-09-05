/* eslint-disable @typescript-eslint/no-explicit-any */

import { Loader, Stack } from '@mantine/core';
import * as d3 from 'd3';
import { useMemo } from 'react';
import { useAsync } from '../../../store/hooks/useAsync';
import { StorageEngine } from '../../../storage/engines/StorageEngine';
import { AnalysisSingleParticipant } from './AnalysisSingleParticipant';
import { useStorageEngine } from '../../../storage/storageEngineHooks';

function getParticipantData(storageEngine: StorageEngine | undefined) {
  if (storageEngine) {
    return storageEngine.getAllParticipantsData();
  }

  return null;
}

const inPersonIds = ['participant1',
  'participant2',
  'participant3',
  'participant4',
  'participant5',
  'participant6',
  'participant7',
  'participant8',
  'participant9',
  'participant10',
  'participant11'];

const prolificIds = ['64889a71fa7592ae332fa34f',
  '63626a68cf44b4184483c8e8',
  '5c838a63532afd001506fd34',
  '6171849094893d838e6e6f62',
  '5b14898a30d562000155f1e9',
  '5ba42e35984ec30001c6018d',
  '5e690f83d1e0d41a69f00db8',
  '65c10e659858a125507f47f7',
  '616c844bac81732b87340f97',
  '63f7a3b799889de3f13622db',
  '65dca61cadaa2dd820a0f28c',
  '65a00ba072965b5ce928d307',
  '5cb3cdc781f3750001043bf2',
  '5d76ac914c93440001c03fd7',
  '65c691b5ca603ec8e389700e',
  '5d31dc6e42678e001a0bdedd',
  '6294ce94ea81c4554b141010',
  '638a8c63c74f91261108cebf',
  '5780d9a1900cc80001d2d1c2',
  '5fa07c635b16f50d21483d5e',
  '63ee65e3470c23cb401ca89a',
  '5b99663d4cefb60001e7a214',
  '63162bda14b96736b08a554d',
  '6554e79557e3d6be08e32ceb',
  '63d5021468a31efc02740c1e',
  '63fbf0e3b18cc14adc0dbfb6',
  '63beebaa4c5884797ff00a98',
  '64217d8202361ad4dbed3596',
  '58ff31a1d10e2b000108579e',
  '63f779d27ba18edb4b6e5a57',
  '62e023ae6d022e4d7bfc5db1',
  '5e5521580ee1b951df544c3c',
  '5bb756696322c5000159756c',
  '637545d6428d85daeedc3df5',
  '641ecfa9f83175a3d9f63636',
  '611a8d23c1d17506a23df589',
  '605e622287f0e806ffe04590'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AnalysisHome() {
  const { storageEngine } = useStorageEngine();

  const { value: allPartsData, status } = useAsync(getParticipantData, [storageEngine]);

  const maxDuration = useMemo(() => {
    if (status !== 'success' || !allPartsData) {
      return undefined;
    }

    return d3.max(allPartsData?.map((participant) => {
      if (!participant.answers || Object.entries(participant.answers).length === 0) {
        return 0;
      }

      const answersSorted = Object.values(participant.answers).sort((a, b) => a.startTime - b.startTime);

      return new Date(answersSorted[answersSorted.length - 1].endTime - answersSorted[0].startTime).getTime();
    }));
  }, [allPartsData, status]);

  // const totalInteractionsProlific = useMemo(() => {
  //   if (!allPartsData) {
  //     return 0;
  //   }
  //   const interactionsCount = allPartsData?.filter((d) => prolificIds.includes(d.participantId)).map((participant) => {
  //     if (!participant.answers || Object.entries(participant.answers).length === 0) {
  //       return 0;
  //     }

  //     const answersSorted = d3.sum(Object.values(participant.answers).map((a) => (a.provenanceGraph ? Object.keys(a.provenanceGraph.nodes).length : 0)));

  //     return answersSorted;
  //   });

  //   return d3.median(interactionsCount);
  // }, [allPartsData]);

  // const totalInteractionsInPerson = useMemo(() => {
  //   if (!allPartsData) {
  //     return 0;
  //   }

  //   const interactionsCount = allPartsData?.filter((d) => inPersonIds.includes(d.participantId)).map((participant) => {
  //     if (!participant.answers || Object.entries(participant.answers).length === 0) {
  //       return 0;
  //     }

  //     const answersSorted = d3.sum(Object.values(participant.answers).map((a) => (a.provenanceGraph ? Object.keys(a.provenanceGraph.nodes).length : 0)));

  //     return answersSorted;
  //   });

  //   return d3.median(interactionsCount);
  // }, [allPartsData]);

  return status === 'success' && allPartsData ? (
    <Stack gap={50} style={{ width: '100%' }}>
      {allPartsData?.filter((d) => prolificIds.includes(d.participantId) || inPersonIds.includes(d.participantId)).map((participant) => <AnalysisSingleParticipant maxDuration={maxDuration} key={participant.participantId} participant={participant} />)}
    </Stack>
  ) : <Loader />;
}
