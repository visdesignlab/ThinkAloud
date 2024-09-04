import {
  IconSticker2,
} from '@tabler/icons-react';
import {
  Divider, Group, Popover, Textarea,
} from '@mantine/core';
import * as d3 from 'd3';
import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { Tag } from '../types';
import { TagSelector } from '../TextEditorComponents/TagSelector';

export function IconComponent({
  annotation, setAnnotation, start, current, end, text, tags, selectedTags, onTextChange, deleteRowCallback, addRowCallback, onSelectTags, addRef, index,
} : {annotation: string; setAnnotation: (i: number, s: string) => void; start: number, end: number, current: number, text: string, tags: Tag[], selectedTags: Tag[], onTextChange: (i: number, v: string) => void, deleteRowCallback: (i: number) => void, addRowCallback: (i: number, textIndex: number) => void, onSelectTags: (i: number, t: Tag[]) => void, addRef: (i: number, ref: HTMLTextAreaElement) => void, index: number }) {
  const [annotationVal, setAnnotationVal] = useState<string>(annotation);

  const indexRef = useRef<number>(0);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const memoizedRender = useMemo(() => (
    <Group justify="space-between" style={{ width: '100%' }} wrap="nowrap">
      <Group wrap="nowrap" gap={0} style={{ width: '100%', backgroundColor: current >= start && current <= end ? 'rgba(100, 149, 237, 0.3)' : 'white' }}>
        <Textarea
          ref={(r) => (r ? addRef(indexRef.current, r) : null)}
          autosize
          minRows={1}
          maxRows={3}
          style={{ width: '100%' }}
          variant="unstyled"
          value={text}
          onChange={(e) => { onTextChange(indexRef.current, e.currentTarget.value); }}
          onKeyDown={((e) => {
            if (e.key === 'Enter' && e.currentTarget.selectionStart !== null) {
              addRowCallback(indexRef.current, e.currentTarget.selectionStart);
              e.preventDefault();
              e.stopPropagation();
            } else if (e.key === 'Backspace') {
              if (e.currentTarget.selectionStart === 0 && e.currentTarget.selectionEnd === 0) {
                deleteRowCallback(indexRef.current);
                e.preventDefault();
                e.stopPropagation();
              }
            }
          })}
        />
      </Group>
      <Group wrap="nowrap" style={{ width: '300px' }}>
        <Divider orientation="vertical" size="xs" />
        <TagSelector onSelectTags={(t) => onSelectTags(indexRef.current, t)} selectedTags={selectedTags} tags={tags} />
        <Popover>
          <Popover.Target>
            <IconSticker2 style={{ color: annotation.length > 0 ? 'cornflowerblue' : 'lightgray', cursor: 'pointer' }} />
          </Popover.Target>
          <Popover.Dropdown>
            <Textarea
              value={annotationVal}
              onChange={(event) => setAnnotationVal(event.currentTarget.value)}
              placeholder="Add Annotation"
              onBlur={() => setAnnotation(indexRef.current, annotationVal)}
            />
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Group>
  ), [addRef, addRowCallback, annotation.length, annotationVal, current, deleteRowCallback, end, onSelectTags, onTextChange, selectedTags, setAnnotation, start, tags, text]);

  return memoizedRender;
}
