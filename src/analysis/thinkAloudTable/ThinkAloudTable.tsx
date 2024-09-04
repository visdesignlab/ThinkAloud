/* eslint-disable react/prop-types */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable camelcase */
import {
  Box,
  Stack,

  Group,
  Select,
  Title,
  Anchor,
  Loader,
  MenuItem,
  ScrollArea,
  Button,
} from '@mantine/core';
import React, {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { ParticipantData, StudyConfig } from '../../parser/types';
import { configSequenceToUniqueTrials } from '../../utils/getSequenceFlatMap';
import { useStorageEngine } from '../../storage/storageEngineHooks';
import { useAuth } from '../../store/hooks/useAuth';
import { ParticipantTags, Tag } from '../../components/interface/audioAnalysis/types';
import { StorageEngine } from '../../storage/engines/StorageEngine';
import 'mantine-react-table/styles.css';
import { Pills } from '../../components/interface/audioAnalysis/tiptapExtensions/Pills';
import { useAsync } from '../../store/hooks/useAsync';
import { TagSelector } from '../../components/interface/audioAnalysis/TextEditorComponents/TagSelector';
import { deepCopy } from '../../utils/deepCopy';
import { TagEditor } from '../../components/interface/audioAnalysis/TextEditorComponents/TagEditor';
import { PREFIX } from '../../utils/Prefix';

export interface TableData {
  timeSpent: number,
  interactionCount: number,
  id: string,
  tasks: Record<string, {
    timeSpent: number,
    wordCount: number | null,
    interactionCount: number,
    tags: Tag[]
  }>

}

function millisToMinutesAndSeconds(millis: number) {
  const minutes = Math.floor(millis / 60000);
  const seconds = ((millis % 60000) / 1000).toFixed(0);
  return (
    seconds === '60'
      ? `${minutes + 1}:00`
      : `${minutes}:${+seconds < 10 ? '0' : ''}${seconds}`
  );
}

async function getTranscript(storageEngine: StorageEngine | undefined, partId: string | undefined, trialName: string | undefined, authEmail: string | null | undefined) {
  if (storageEngine && partId && trialName && authEmail) {
    return await storageEngine.getEditedTranscript(partId, authEmail, trialName);
  }

  return null;
}

async function getTags(storageEngine: StorageEngine | undefined, type: 'participant' | 'task' | 'text') {
  if (storageEngine) {
    return await storageEngine.getTags(type);
  }

  return [];
}

async function getParticipantTags(storageEngine: StorageEngine | undefined) {
  if (storageEngine) {
    return await storageEngine.getAllParticipantAndTaskTags();
  }

  return {};
}

export function ThinkAloudTable({
  completed,
  studyConfig,
}: {
    completed: ParticipantData[];
    studyConfig: StudyConfig;
  }) {
  const { storageEngine } = useStorageEngine();

  const [currentTask, setCurrentTask] = useState<string | null>(null);

  const uniqueTrials = useMemo(() => configSequenceToUniqueTrials(studyConfig.sequence).map((c) => c.componentName), [studyConfig.sequence]);

  const auth = useAuth();

  const { value: textTags, execute: pullTextTags } = useAsync(getTags, [storageEngine, 'text']);

  const { value: taskTags, execute: pullTaskTags } = useAsync(getTags, [storageEngine, 'task']);

  const { value: allPartTags, execute: pullAllPartTags } = useAsync(getTags, [storageEngine, 'participant']);

  const { value: partTags, execute: pullPartTags } = useAsync(getParticipantTags, [storageEngine]);

  const [fullTableData, setFullTableData] = useState<TableData[]>([]);

  const [tableData, setTableData] = useState<TableData[]>([]);

  const [filteredTags, setFilteredTags] = useState<string[]>([]);

  const [wordCountWidth, setWordCountWidth] = useState<number>(150);

  const wordCountScale = useMemo(() => {
    if (!currentTask) {
      return null;
    }

    const extent = d3.extent(fullTableData.map((t) => t.tasks[currentTask].wordCount || 0)) as [number, number];

    return d3.scaleLinear([0, wordCountWidth]).domain(extent);
  }, [currentTask, fullTableData, wordCountWidth]);

  const interactionCountScale = useMemo(() => {
    if (!currentTask) {
      const extent = d3.extent(fullTableData.map((t) => t.interactionCount || 0)) as [number, number];
      return d3.scaleLinear([0, wordCountWidth]).domain(extent);
    }

    const extent = d3.extent(fullTableData.map((t) => t.tasks[currentTask].interactionCount || 0)) as [number, number];

    return d3.scaleLinear([0, wordCountWidth]).domain(extent);
  }, [currentTask, fullTableData, wordCountWidth]);

  const timeScale = useMemo(() => {
    if (!currentTask) {
      const extent = d3.extent(fullTableData.map((t) => t.timeSpent || 0)) as [number, number];
      return d3.scaleLinear([0, wordCountWidth]).domain(extent);
    }

    const extent = d3.extent(fullTableData.map((t) => t.tasks[currentTask].timeSpent || 0)) as [number, number];

    return d3.scaleLinear([0, wordCountWidth]).domain(extent);
  }, [currentTask, fullTableData, wordCountWidth]);

  const setTags = useCallback((_tags: Tag[], type: 'participant' | 'task') => {
    if (storageEngine) {
      storageEngine.saveTags(_tags, type).then(() => {
        pullPartTags(storageEngine);
        pullTextTags(storageEngine, 'text');
        pullTaskTags(storageEngine, 'task');
        pullAllPartTags(storageEngine, 'participant');
      });
    }
  }, [pullAllPartTags, pullPartTags, pullTaskTags, pullTextTags, storageEngine]);

  useEffect(() => {
    if (!auth || !storageEngine) {
      return;
    }

    const allData = completed.map((participant) => {
      const allTasks = Object.values(participant.answers);
      const startAndEndTime: [number, number] = d3.extent(allTasks.map((task) => [task.startTime, task.endTime]).flat()) as [number, number];
      const totalInteractionCount = d3.sum(allTasks.map((task) => (task.provenanceGraph ? Object.keys(task.provenanceGraph.nodes).length - 1 : 0)));

      const tasksInfo: Record<string, {
        timeSpent: number,
        interactionCount: number,
        wordCount: null,
        tags: Tag[]
      }> = {};

      Object.entries(participant.answers).forEach((entry) => {
        const [key, value] = entry;

        const realName = key.slice(0, key.lastIndexOf('_'));

        tasksInfo[realName] = {
          interactionCount: value.provenanceGraph ? Object.keys(value.provenanceGraph.nodes).length - 1 : 0,
          wordCount: null,
          timeSpent: value.endTime - value.startTime,
          tags: [],
        };
      });

      return {
        timeSpent: startAndEndTime[1] - startAndEndTime[0],
        wordCount: null,
        interactionCount: totalInteractionCount,
        id: participant.participantId,
        tasks: tasksInfo,
      };
    });

    setFullTableData(allData);
  }, [auth, completed, storageEngine]);

  useEffect(() => {
    if (currentTask && auth.user.user) {
      const newTable = [...fullTableData];
      Promise.all(fullTableData.map((d, i) => getTranscript(storageEngine, d.id, currentTask, auth.user.user?.email)
        .then((editedTranscript) => {
          if (editedTranscript && editedTranscript.length > 0) {
            const wordCount = d3.sum(editedTranscript.map((t) => t.text.length));
            const tags = editedTranscript.map((t) => t.selectedTags.map((tag) => ({ ...tag, startTime: t.transcriptMappingStart }))).flat();

            newTable[i].tasks[currentTask].tags = tags;
            newTable[i].tasks[currentTask].wordCount = wordCount;
          } else {
            newTable[i].tasks[currentTask].wordCount = 0;
          }
        }))).then(() => setFullTableData(newTable));
    }
    // DO NOT ADD TABLE DATA TO THIS
  }, [auth.user.user, currentTask, storageEngine]);

  useEffect(() => {
    if (filteredTags.length === 0) {
      setTableData(fullTableData);
      return;
    }

    setTableData(fullTableData.filter((part) => {
      if (partTags && partTags[part.id]) {
        const currPartTags = partTags[part.id].partTags;

        if (currPartTags.find((tag) => !!filteredTags.find((fTag) => fTag === tag.name))) {
          return true;
        }
        if (currentTask) {
          const currTaskTags = partTags[part.id].taskTags[currentTask];
          if (currTaskTags && currTaskTags.find((tag) => !!(filteredTags.find((fTag) => fTag === tag.name)))) {
            return true;
          }
        }
      }
      if (currentTask) {
        if (part.tasks[currentTask].tags.find((tag) => !!(filteredTags.find((fTag) => fTag === tag.name)))) {
          return true;
        }
      }

      return false;
    }));
  }, [currentTask, filteredTags, fullTableData, partTags]);

  const columns = useMemo<MRT_ColumnDef<TableData>[]>(() => {
    if (currentTask === null) {
      return [
        {
          accessorKey: 'id',
          header: 'Participant Id',
        },
        {
          accessorKey: 'timeSpent',
          header: 'Time Spent',
          id: 'timeSpent',
          mantineTableBodyCellProps: { style: { padding: 0 } },
          Cell: ({ cell }) => (cell.getValue() === null || cell.getValue() === undefined
            ? <Loader /> : (
              <svg style={{ width: cell.column.getSize(), height: '60px' }}>
                <rect x={0} y={0} height={200} fill="cornflowerblue" width={timeScale(cell.getValue() as number)} />
                <text x={5} y={30} style={{ textAnchor: 'start', dominantBaseline: 'middle' }}>{millisToMinutesAndSeconds(cell.getValue() as number)}</text>
              </svg>
            )),
          size: 150,
        },
        {
          accessorKey: 'interactionCount',
          header: 'Interaction Count',
          id: 'interactionCount',
          mantineTableBodyCellProps: { style: { padding: 0 } },
          Cell: ({ cell }) => (cell.getValue() === null || cell.getValue() === undefined
            ? <Loader /> : (
              <svg style={{ width: cell.column.getSize(), height: '60px' }}>
                <rect x={0} y={0} height={200} fill="cornflowerblue" width={interactionCountScale(cell.getValue() as number)} />
                <text x={5} y={30} style={{ textAnchor: 'start', dominantBaseline: 'middle' }}>{cell.getValue() as number}</text>
              </svg>
            )),
          size: 150,
        },
        {
          accessorKey: 'id',
          id: 'participantTags',
          header: 'Participant Tags',
          renderColumnActionsMenuItems({ internalColumnMenuItems }) {
            return (
              <>
                {internalColumnMenuItems}
                <MenuItem closeMenuOnClick={false}>
                  <TagEditor tags={allPartTags || []} createTagCallback={(t: Tag) => { setTags([...(allPartTags || []), t], 'participant'); }} editTagCallback={() => null} />
                </MenuItem>
              </>
            );
          },
          Cell: ({ cell }) => (
            <TagSelector
              tags={allPartTags || []}
              onSelectTags={(tempTag) => {
                if (storageEngine && partTags) {
                  const copy = deepCopy(partTags);
                  if (copy[cell.getValue() as string]) {
                    copy[cell.getValue() as string].partTags = tempTag;
                  } else {
                    copy[cell.getValue() as string] = { partTags: [], taskTags: {} };

                    copy[cell.getValue() as string].partTags = tempTag;
                  }

                  storageEngine.saveAllParticipantAndTaskTags(copy).then(() => {
                    pullPartTags(storageEngine);
                  });
                }
              }}
              selectedTags={partTags && (partTags as Record<string, ParticipantTags>)[cell.getValue() as string] ? (partTags as Record<string, ParticipantTags>)[cell.getValue() as string].partTags : []}
            />
          ),
          size: 150,
        }];
    }

    return [
      {
        accessorKey: 'id',
        id: 'id',
        header: 'Participant Id',
        Cell: ({ cell }) => (
          <Anchor
            size="12px"
            component={Link}
            target="_blank"
            to={`${PREFIX}ThinkAloud/analysis/${cell.getValue()}/reviewer-${currentTask}`}
          >
            {cell.getValue() as string}
          </Anchor>
        ),
        size: 150,
      },
      {
        accessorKey: `tasks.${currentTask}.timeSpent`,
        header: 'Time Spent',
        id: 'timeSpent',
        mantineTableBodyCellProps: { style: { padding: 0 } },
        Cell: ({ cell }) => (cell.getValue() === null || cell.getValue() === undefined
          ? <Loader /> : (
            <svg style={{ width: cell.column.getSize(), height: '60px' }}>
              <rect x={0} y={0} height={200} fill="cornflowerblue" width={timeScale(cell.getValue() as number)} />
              <text x={5} y={30} style={{ textAnchor: 'start', dominantBaseline: 'middle' }}>{millisToMinutesAndSeconds(cell.getValue() as number)}</text>
            </svg>
          )),
        size: 150,
      },
      {
        accessorKey: `tasks.${currentTask}.wordCount`,
        header: 'Word Count',
        id: 'wordCount',
        mantineTableBodyCellProps: { style: { padding: 0 } },
        Cell: ({ cell }) => (cell.getValue() === null || cell.getValue() === undefined
          ? <Loader /> : (
            <svg style={{ width: cell.column.getSize(), height: '60px' }}>
              <rect x={0} y={0} height={200} fill="cornflowerblue" width={wordCountScale ? wordCountScale(cell.getValue() as number) : 0} />
              <text x={5} y={30} style={{ textAnchor: 'start', dominantBaseline: 'middle' }}>{cell.getValue() as number}</text>
            </svg>
          )),
        size: 150,

      },
      {
        accessorKey: `tasks.${currentTask}.interactionCount`,
        header: 'Interaction Count',
        id: 'interactionCount',
        mantineTableBodyCellProps: { style: { padding: 0 } },
        Cell: ({ cell }) => (cell.getValue() === null || cell.getValue() === undefined
          ? <Loader /> : (
            <svg style={{ width: cell.column.getSize(), height: '60px' }}>
              <rect x={0} y={0} height={200} fill="cornflowerblue" width={interactionCountScale(cell.getValue() as number)} />
              <text x={5} y={30} style={{ textAnchor: 'start', dominantBaseline: 'middle' }}>{cell.getValue() as number}</text>
            </svg>
          )),
        size: 150,
      },
      {
        accessorKey: `tasks.${currentTask}.tags`,
        header: 'Tags',
        Cell: ({ cell, row }) => (
          <ScrollArea type="auto" h={40}>
            <Group gap={2}><Pills size="xs" selectedTags={(cell.getValue() as Tag[]).filter((tag) => (filteredTags.length > 0 ? !!(filteredTags.find((t) => t === tag.name)) : true))} currentTask={currentTask} isLink participantId={row.getValue('id')} /></Group>
          </ScrollArea>
        ),
        size: 150,
      },
      {
        accessorKey: 'id',
        id: 'taskTags',
        header: 'Task Tags',
        renderColumnActionsMenuItems({ internalColumnMenuItems }) {
          return (
            <>
              {internalColumnMenuItems}
              <MenuItem closeMenuOnClick={false}>
                <TagEditor tags={taskTags || []} createTagCallback={(t: Tag) => { setTags([...(taskTags || []), t], 'task'); }} editTagCallback={() => null} />
              </MenuItem>
            </>
          );
        },
        Cell: ({ cell }) => (
          <TagSelector
            tags={taskTags || []}
            onSelectTags={(tempTag) => {
              if (storageEngine && partTags) {
                const copy = deepCopy(partTags);
                if (copy[cell.getValue() as string]) {
                  copy[cell.getValue() as string].taskTags[currentTask] = tempTag;
                } else {
                  copy[cell.getValue() as string] = { partTags: [], taskTags: {} };

                  copy[cell.getValue() as string].taskTags[currentTask] = tempTag;
                }

                storageEngine.saveAllParticipantAndTaskTags(copy).then(() => {
                  pullPartTags(storageEngine);
                });
              }
            }}
            selectedTags={partTags && (partTags as Record<string, ParticipantTags>)[cell.getValue() as string] ? (partTags as Record<string, ParticipantTags>)[cell.getValue() as string].taskTags[currentTask] || [] : []}
          />
        ),
        size: 150,
      }];
  }, [allPartTags, currentTask, filteredTags, interactionCountScale, partTags, pullPartTags, setTags, storageEngine, taskTags, timeScale, wordCountScale]);

  const table = useMantineReactTable({
    columns,
    data: tableData,
    enableMultiSort: true,
    enableDensityToggle: false,
    enablePagination: false,
    enableRowVirtualization: true,
    initialState: {
      density: 'xs',
    },
    mantineTableContainerProps: { style: { maxHeight: '77dvh' } },
    renderTopToolbarCustomActions: () => (
      <Group gap="xl">
        <Group>
          <Title order={5}>Select Task</Title>
          <Select clearable value={currentTask} onChange={setCurrentTask} data={uniqueTrials} />
          <Button>Download all</Button>
        </Group>

        <Group>
          <Title order={5}>Filter by tags</Title>
          {textTags && taskTags && allPartTags && textTags.length > 0 ? (
            <TagSelector
              tags={textTags}
              onSelectTags={(tempTag) => setFilteredTags(tempTag.map((t) => t.name))}
              selectedTags={[...textTags.filter((t) => filteredTags.includes(t.name)), ...taskTags.filter((t) => filteredTags.includes(t.name)), ...allPartTags.filter((t) => filteredTags.includes(t.name))]}
              partTags={allPartTags || []}
              taskTags={taskTags || []}
            />
          ) : <Loader />}
        </Group>
      </Group>
    ),
  });

  return <Box px="sm" style={{ height: '100%' }}><MantineReactTable table={table} /></Box>;
}
