/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionIcon,
  Box, Button, Center, Group, Loader, Select, Stack, Text,
} from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useResizeObserver, useThrottledState } from '@mantine/hooks';
import { WaveForm, useWavesurfer } from 'wavesurfer-react';
import WaveSurferContext from 'wavesurfer-react/dist/contexts/WaveSurferContext';
import Crunker from 'crunker';
import * as d3 from 'd3';
import { Registry, Trrack, initializeTrrack } from '@trrack/core';
import WaveSurfer from 'wavesurfer.js';
import {
  IconArrowLeft, IconArrowRight, IconPlayerPause, IconPlayerPauseFilled, IconPlayerPlay,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';

import { useAsync } from '../../../store/hooks/useAsync';
import { StorageEngine } from '../../../storage/engines/StorageEngine';
import { AllTasksTimeline } from './AllTasksTimeline';
import { SingleTaskTimeline } from './SingleTaskTimeline';
import { useStudyConfig } from '../../../store/hooks/useStudyConfig';
import { deepCopy } from '../../../utils/deepCopy';
import { useEvent } from '../../../store/hooks/useEvent';
import { useStoreActions, useStoreDispatch, useStoreSelector } from '../../../store/store';
import { TranscriptLines } from './TransciptLines';
import { TextEditor } from './TextEditor';
import { EditedText, ParticipantTags, TranscriptLinesWithTimes } from './types';
import { useStorageEngine } from '../../../storage/storageEngineHooks';
import { getSequenceFlatMap } from '../../../utils/getSequenceFlatMap';
import { useCurrentComponent } from '../../../routes/utils';
import { useAuth } from '../../../store/hooks/useAuth';
import { TagSelector } from './TextEditorComponents/TagSelector';

const margin = {
  left: 5, top: 0, right: 5, bottom: 0,
};

function getParticipantData(trrackId: string | undefined, storageEngine: StorageEngine | undefined) {
  if (storageEngine) {
    return storageEngine.getParticipantData(trrackId);
  }

  return null;
}

async function getTranscript(storageEngine: StorageEngine | undefined, partId: string | undefined, trialName: string | undefined, authEmail: string | null | undefined) {
  if (storageEngine && partId && trialName && authEmail) {
    return await storageEngine.getEditedTranscript(partId, authEmail, trialName);
  }

  return null;
}

async function getParticipantTags(trrackId: string | undefined, storageEngine: StorageEngine | undefined) {
  if (storageEngine && trrackId) {
    return (await storageEngine.getAllParticipantAndTaskTags());
  }

  return null;
}

async function getTags(storageEngine: StorageEngine | undefined, type: 'participant' | 'task' | 'text') {
  if (storageEngine) {
    return await storageEngine.getTags(type);
  }

  return [];
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
export function AnalysisPopout({ mini } : {mini: boolean}) {
  const { trrackId, index } = useParams();

  const _trialFilter = useCurrentComponent();

  const auth = useAuth();

  const trialFilter = useMemo(() => (index ? _trialFilter : null), [_trialFilter, index]);

  const { storageEngine } = useStorageEngine();

  const [currentShownTranscription, setCurrentShownTranscription] = useState(0);

  const [ref, { width }] = useResizeObserver();

  const [currentNode, setCurrentNode] = useState<string | null>(null);

  const { value: participant, status } = useAsync(getParticipantData, [trrackId, storageEngine]);

  const { value: partTags, execute: pullPartTags } = useAsync(getParticipantTags, [trrackId, storageEngine]);

  const { saveAnalysisState } = useStoreActions();
  const storeDispatch = useStoreDispatch();

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playTime, setPlayTime] = useThrottledState<number>(0, 200);

  const waveSurferDiv = useRef(null);

  const config = useStudyConfig();

  const navigate = useNavigate();

  const { analysisTrialName: trialName, analysisWaveformTime } = useStoreSelector((state) => state);

  const { setAnalysisTrialName, setAnalysisParticipantName, setAnalysisWaveformTime } = useStoreActions();

  const { value: taskTags, execute: pullTaskTags } = useAsync(getTags, [storageEngine, 'task']);

  const [waveSurferLoading, setWaveSurferLoading] = useState<boolean>(true);

  const trrackForTrial = useRef<Trrack<object, string> | null>(null);

  const [transcriptLines, setTranscriptLines] = useState<TranscriptLinesWithTimes[]>([]);

  const [transcriptList, _setTranscriptList] = useState<EditedText[] | null>(null);

  const debouncedSave = useMemo(() => {
    if (storageEngine && trrackId && _trialFilter) {
      return debounce((editedText: EditedText[]) => storageEngine.saveEditedTranscript(trrackId, auth.user.user?.email || 'temp', _trialFilter, editedText), 1000, { maxWait: 5000 });
    }

    return (editedText: EditedText[]) => null;
  }, [_trialFilter, auth.user.user?.email, storageEngine, trrackId]);

  const setTranscriptList = useCallback((editedText: EditedText[]) => {
    _setTranscriptList(editedText);
    debouncedSave(editedText);
  }, [debouncedSave]);

  const { value: onlineTranscriptList, status: transcriptStatus } = useAsync(getTranscript, [storageEngine, participant?.participantId, _trialFilter, auth.user.user?.email]);

  useEffect(() => {
    if (onlineTranscriptList && transcriptStatus === 'success') {
      _setTranscriptList(onlineTranscriptList);
    } else {
      _setTranscriptList(null);
    }
  }, [onlineTranscriptList, transcriptStatus]);

  const allPartIds = useMemo(() => [...inPersonIds, ...prolificIds], []);

  const trialFilterAnswersName = useMemo(() => {
    if (!trialFilter || !participant) {
      return null;
    }

    return Object.keys(participant.answers).find((key) => key.startsWith(trialFilter)) || null;
  }, [participant, trialFilter]);
  // Create an instance of trrack to ensure getState works, incase the saved state is not a full state node.
  useEffect(() => {
    if (trialFilterAnswersName && participant) {
      const reg = Registry.create();

      const trrack = initializeTrrack({ registry: reg, initialState: {} });

      if (participant.answers[trialFilterAnswersName].provenanceGraph) {
        trrack.importObject(deepCopy(participant.answers[trialFilterAnswersName].provenanceGraph!));

        trrackForTrial.current = trrack;
      }
    }
  }, [participant, trialFilterAnswersName]);

  const _setCurrentNode = useCallback((node: string | undefined) => {
    if (!node) {
      return;
    }

    if (trialFilterAnswersName && participant && trrackForTrial.current) {
      storeDispatch(saveAnalysisState(trrackForTrial.current.getState(participant.answers[trialFilterAnswersName].provenanceGraph?.nodes[node])));

      trrackForTrial.current.to(node);
    }

    setCurrentNode(node);
  }, [participant, saveAnalysisState, storeDispatch, trialFilterAnswersName]);

  const setSelectedTask = useCallback((s: string) => {
    if (!mini) {
      storeDispatch(setAnalysisTrialName(s));
      storeDispatch(saveAnalysisState(null));
      setCurrentShownTranscription(0);

      const sFullName = participant ? Object.keys(participant.answers).find((key) => key.startsWith(s)) : '';

      if (participant && sFullName && participant.answers[sFullName].provenanceGraph) {
        const reg = Registry.create();

        const trrack = initializeTrrack({ registry: reg, initialState: {} });

        trrack.importObject(deepCopy(participant.answers[sFullName].provenanceGraph!));

        trrackForTrial.current = trrack;

        _setCurrentNode(participant.answers[sFullName].provenanceGraph?.root || '');
      } else {
        storeDispatch(saveAnalysisState(null));
        setCurrentNode(null);
        trrackForTrial.current = null;
      }
    }
  }, [_setCurrentNode, mini, participant, saveAnalysisState, setAnalysisTrialName, storeDispatch]);

  useEffect(() => {
    if (trialFilter) {
      setSelectedTask(trialFilter);
    }
  }, [setSelectedTask, trialFilter]);

  const throttledTimeDispatch = useMemo(() => throttle((t: number) => storeDispatch(setAnalysisWaveformTime(t)), 200), [setAnalysisWaveformTime, storeDispatch]);

  const timeUpdate = useEvent((t: number, dispatch = true) => {
    // check if were on the next task. If so, navigate to the next task
    if (participant && trialFilter && trialFilterAnswersName && (participant.answers[trialFilterAnswersName].endTime - participant.answers.audioTest_2.startTime) / 1000 < t) {
      const seq = getSequenceFlatMap(participant.sequence);
      setSelectedTask(seq[seq.indexOf(trialFilter) + 1]);
    } else if (participant && trialFilter && trrackForTrial.current && trrackForTrial.current.current.children.length > 0 && (trrackForTrial.current.graph.backend.nodes[trrackForTrial.current.current.children[0]].createdOn - participant.answers.audioTest_2.startTime) / 1000 < t) {
      _setCurrentNode(trrackForTrial.current.current.children[0]);
    }

    if (participant && trialFilter) {
      const startTime = (trialFilterAnswersName ? participant.answers[trialFilterAnswersName].startTime : participant.answers.audioTest_2.startTime);
      setPlayTime(t * 1000 + startTime);
    }

    if (dispatch) {
      throttledTimeDispatch(t);
    }
  });

  const handleWSMount = useCallback(
    (waveSurfer: WaveSurfer | null) => {
      if (waveSurfer && participant && trrackId) {
        const crunker = new Crunker();

        storageEngine?.getAudio(getSequenceFlatMap(participant.sequence).filter((seq) => config.tasksToNotRecordAudio === undefined || !config.tasksToNotRecordAudio.includes(seq)).filter((seq) => (trialFilter ? seq === trialFilter : true)), trrackId).then((urls) => {
          if (waveSurfer) {
            crunker
              .fetchAudio(...urls)
              .then((buffers) => crunker.concatAudio(buffers))
              .then((merged) => crunker.export(merged, 'audio/mp3'))
              .then((output) => waveSurfer.loadBlob(output.blob).then(() => { setWaveSurferLoading(false); }))
              .catch((error) => {
                throw new Error(error);
              });
          }

          waveSurfer.on('timeupdate', timeUpdate);
        });
      }
    },
    [config.tasksToNotRecordAudio, participant, storageEngine, timeUpdate, trialFilter, trrackId],
  );

  const plugins = useMemo(() => [], []);

  const wavesurfer = useWavesurfer({
    container: waveSurferDiv.current!, plugins, onMount: handleWSMount, progressColor: 'cornflowerblue', waveColor: 'lightgray',
  } as any);

  const _setPlayTime = useCallback((n: number, percent: number) => {
    setPlayTime(n);

    if (wavesurfer && percent) {
      setTimeout(() => {
        wavesurfer.seekTo(percent);
      });
    }
  }, [setPlayTime, wavesurfer]);

  const _setIsPlaying = useCallback((b: boolean) => {
    setIsPlaying(b);

    if (wavesurfer) {
      if (b) {
        wavesurfer.play();
      } else {
        wavesurfer.pause();
      }
    }
  }, [wavesurfer]);

  useEffect(() => {
    timeUpdate(analysisWaveformTime, false);

    if (wavesurfer && Math.abs(wavesurfer.getCurrentTime() - analysisWaveformTime) > 0.8) {
      setTimeout(() => {
        wavesurfer.setTime(analysisWaveformTime);
      });
    }
  }, [analysisWaveformTime, timeUpdate, wavesurfer]);

  const xScale = useMemo(() => {
    if (!participant) {
      return null;
    }

    const allStartTimes = Object.values(participant.answers || {}).map((answer) => [answer.startTime, answer.endTime]).flat();

    const extent = d3.extent(allStartTimes) as [number, number];

    const scale = d3.scaleLinear([margin.left, width + margin.left + margin.right]).domain(trialFilterAnswersName ? [participant.answers[trialFilterAnswersName].startTime, participant.answers[trialFilterAnswersName].endTime] : extent).clamp(true);

    return scale;
  }, [participant, trialFilterAnswersName, width]);

  useEffect(() => {
    handleWSMount(wavesurfer);
  }, [handleWSMount, participant, wavesurfer]);

  const clickNextNode = useCallback((node: string | undefined) => {
    if (!node) {
      return;
    }

    if (trialFilterAnswersName && participant && trrackForTrial.current && xScale) {
      const fullNode = participant.answers[trialFilterAnswersName].provenanceGraph!.nodes[node];
      storeDispatch(saveAnalysisState(trrackForTrial.current.getState(participant.answers[trialFilterAnswersName].provenanceGraph?.nodes[node])));

      trrackForTrial.current.to(node);

      const totalLength = xScale.domain()[1] - xScale.domain()[0];

      _setPlayTime(fullNode.createdOn + 1, (fullNode.createdOn - xScale.domain()[0]) / totalLength);
    }
  }, [_setPlayTime, participant, saveAnalysisState, storeDispatch, trialFilterAnswersName, xScale]);

  const nextParticipantCallback = useCallback((positive: boolean) => {
    if (!participant) {
      return;
    }

    const _index = allPartIds.indexOf(participant.participantId);

    if (positive) {
      navigate(`../../${trialFilter ? '../' : ''}${allPartIds[_index + 1]}/ui/reviewer-${trialFilter || ''}`, { relative: 'path' });
    } else {
      navigate(`../../${trialFilter ? '../' : ''}${allPartIds[_index - 1]}/ui/reviewer-${trialFilter || ''}`, { relative: 'path' });
    }
  }, [allPartIds, navigate, participant, trialFilter]);

  return (
    <Group wrap="nowrap" gap={25}>
      <Stack ref={ref} style={{ width: '100%' }} gap={!mini ? 25 : 0}>
        { !mini ? (
          <Center>
            <Group>
              <ActionIcon>
                <IconArrowLeft onClick={() => nextParticipantCallback(false)} />
              </ActionIcon>
              <Select
                style={{ width: '300px' }}
                value={participant?.participantId}
                onChange={(e) => {
                  storeDispatch(setAnalysisParticipantName(e));
                  navigate(`../../${trialFilter ? '../' : ''}${e}/ui/reviewer-${trialFilter || ''}`, { relative: 'path' });
                }}
                data={[...inPersonIds, ...prolificIds]}
              />
              <Select
                style={{ width: '300px' }}
                clearable
                value={trialFilter}
                data={participant ? [...getSequenceFlatMap(participant.sequence)] : []}
                onChange={(val) => navigate(`${trialFilter ? '../' : ''}reviewer-${val || ''}`, { relative: 'path' })}
              />
              <ActionIcon>
                <IconArrowRight onClick={() => nextParticipantCallback(true)} />
              </ActionIcon>
            </Group>
          </Center>
        ) : null}
        {status === 'success' && participant && xScale
          ? !mini ? <AllTasksTimeline trialFilter={trialFilterAnswersName} xScale={xScale} setSelectedTask={setSelectedTask} participantData={participant} width={width} height={200} /> : null
          : !mini ? <Center style={{ height: '275px' }}><Loader /></Center>
            : null}
        { xScale && participant !== null
          ? (
            <>
              <Box
                ref={waveSurferDiv}
                ml={participant && xScale ? xScale(participant.answers.audioTest_2.startTime) : 0}
                mr={participant && xScale ? xScale(participant.answers['post-study-survey_13'].startTime) : 0}
                style={{
                  overflow: 'visible', width: `${participant && !trialFilter ? xScale(participant.answers['post-study-survey_13'].startTime) - xScale(participant.answers.audioTest_2.startTime) : (xScale.range()[1] - xScale.range()[0])}px`,
                }}
              >
                <WaveSurferContext.Provider value={wavesurfer}>
                  <WaveForm id="waveform" />
                </WaveSurferContext.Provider>
                {waveSurferLoading ? <Loader /> : null}
              </Box>
              {!mini ? <TranscriptLines startTime={trialFilter ? xScale.domain()[0] : participant.answers.audioTest_2.startTime} xScale={xScale} transcriptLines={transcriptLines} currentShownTranscription={currentShownTranscription} /> : null }
            </>
          ) : null }
        {status === 'success' && participant && xScale ? <SingleTaskTimeline xScale={xScale} setSelectedTask={setSelectedTask} playTime={playTime - participant.answers.introduction_0.startTime} setPlayTime={_setPlayTime} isPlaying={isPlaying} setIsPlaying={_setIsPlaying} currentNode={currentNode} setCurrentNode={_setCurrentNode} participantData={participant} width={width} height={50} /> : null}
        <Group align="center" justify="center">
          {/* <ActionIcon variant="subtle"><IconArrowLeft onClick={() => clickNextNode((trrackForTrial.current?.current as any).parent)} /></ActionIcon> */}
          <ActionIcon variant="light" size={50} onClick={() => _setIsPlaying(!isPlaying)}>{isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}</ActionIcon>
          {taskTags && partTags && trialFilter && trrackId ? (
            <TagSelector
              tags={taskTags || []}
              onSelectTags={(tempTag) => {
                if (storageEngine && partTags) {
                  const copy = deepCopy(partTags);
                  if (copy[trrackId as string]) {
                    copy[trrackId].taskTags[trialFilter] = tempTag;
                  } else {
                    copy[trrackId] = { partTags: [], taskTags: {} };

                    copy[trrackId].taskTags[trialFilter] = tempTag;
                  }

                  storageEngine.saveAllParticipantAndTaskTags(copy).then(() => {
                    pullPartTags(trrackId, storageEngine);
                  });
                }
              }}
              selectedTags={partTags && (partTags as Record<string, ParticipantTags>)[trrackId] ? (partTags as Record<string, ParticipantTags>)[trrackId].taskTags[trialFilter] || [] : []}
            />
          ) : null}
          {/* <Button onClick={() => _setIsPlaying(true)}>Play</Button>
          <Button onClick={() => _setIsPlaying(false)}>Pause</Button> */}
          {/* <ActionIcon variant="subtle"><IconArrowRight onClick={() => clickNextNode(trrackForTrial.current?.current.children[0])} /></ActionIcon> */}
        </Group>

        { trialFilter ? (
          <Stack>
            {participant && onlineTranscriptList && transcriptStatus === 'success' && transcriptList && !mini ? <TextEditor transcriptList={transcriptList} setTranscriptList={setTranscriptList} setCurrentShownTranscription={setCurrentShownTranscription} currentShownTranscription={currentShownTranscription} participant={participant} playTime={playTime} setTranscriptLines={setTranscriptLines as any} /> : !mini ? <Loader /> : null}
          </Stack>
        ) : null}
      </Stack>
    </Group>
  );
}
