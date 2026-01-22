import React from 'react';
import type { Note } from '../../../types';
import { useNotes } from '../../../hooks/useNotes';
import { formatDate } from '../../../helpers';
import './ListItem.css';

interface ListItemProps {
  note: Note;
}

const ListItem: React.FC<ListItemProps> = ({ note }) => {
  const { selectedNote, selectNote } = useNotes();
  const isSelected = selectedNote?.id === note.id;

  return (
    <div
      className={`list-item ${isSelected ? 'list-item-selected' : ''}`}
      onClick={() => selectNote(note)}
    >
      <div className="list-item-content">
        <div className="list-item-title">{note.title || 'Без названия'}</div>
        <div className="list-item-date">{formatDate(note.updatedAt)}</div>
      </div>
    </div>
  );
};

export default ListItem;
