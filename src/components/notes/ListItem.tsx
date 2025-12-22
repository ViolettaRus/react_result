import React from 'react';
import { List } from 'antd';
import type { Note } from '../../types';
import { useNotes } from '../../contexts/NotesContext';
import './ListItem.css';

interface ListItemProps {
  note: Note;
}

const ListItem: React.FC<ListItemProps> = ({ note }) => {
  const { selectedNote, selectNote } = useNotes();
  const isSelected = selectedNote?.id === note.id;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <List.Item
      className={`list-item ${isSelected ? 'list-item-selected' : ''}`}
      onClick={() => selectNote(note)}
    >
      <List.Item.Meta
        title={<div className="list-item-title">{note.title || 'Без названия'}</div>}
        description={<div className="list-item-date">{formatDate(note.updatedAt)}</div>}
      />
    </List.Item>
  );
};

export default ListItem;
