import {
  Text,
  ColorSwatch,
  Divider, Group, MultiSelect, Stack, TextInput, Button, Popover,
} from '@mantine/core';
import React, { useState } from 'react';
import { IconEdit } from '@tabler/icons-react';
import { Tag } from '../types';
import { AddTagDropdown } from '../tiptapExtensions/AddTagDropdown';

export function TagEditor({ createTagCallback, editTagCallback, tags } : {createTagCallback : (tag: Tag) => void, editTagCallback: (oldTag: Tag, newTag: Tag) => void, tags: Tag[]}) {
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);

  return (
    <Stack style={{ width: '300px' }} gap="xs">
      {tags.length === 0 ? <Text color="dimmed">No tags found. Create new tags below.</Text> : null}
      {tags.map((t) => (
        <Group justify="space-between" key={t.name}>
          <Group>
            <ColorSwatch color={t.color} />
            <Text>{t.name}</Text>
          </Group>
          <Popover trapFocus withinPortal={false}>
            <Popover.Target>
              <IconEdit color="lightgray" />
            </Popover.Target>
            <Popover.Dropdown>
              <AddTagDropdown editTag currentNames={tags.map((tag) => tag.name)} addTagCallback={(tag: Tag) => { editTagCallback(t, tag); }} editableTag={t} />
            </Popover.Dropdown>
          </Popover>
        </Group>
      ))}

      <Popover trapFocus opened={addDialogOpen} withinPortal={false}>
        <Popover.Target>
          <Button variant="light" onClick={() => setAddDialogOpen(!addDialogOpen)}>
            Create new tag
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <AddTagDropdown currentNames={tags.map((t) => t.name)} addTagCallback={(t: Tag) => { setAddDialogOpen(false); createTagCallback(t); }} />
        </Popover.Dropdown>
      </Popover>
    </Stack>
  );
}
