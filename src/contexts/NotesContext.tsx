import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Note } from '../types';
import { db } from '../db/database';
import { useAuth } from './AuthContext';

interface NotesContextType {
  notes: Note[];
  selectedNote: Note | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectNote: (note: Note | null) => void;
  createNote: () => Promise<Note>;
  updateNote: (note: Note) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  filteredNotes: Note[];
  isNewNote: boolean;
  setIsNewNote: (value: boolean) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider');
  }
  return context;
};

interface NotesProviderProps {
  children: ReactNode;
}

export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewNote, setIsNewNote] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadNotes();
    } else {
      setNotes([]);
      setSelectedNote(null);
    }
  }, [currentUser]);

  const loadNotes = async () => {
    try {
      const allNotes = await db.notes.orderBy('updatedAt').reverse().toArray();
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const createNote = async (): Promise<Note> => {
    const now = Date.now();
    const newNote: Note = {
      title: 'Новая заметка',
      content: '<p style="font-weight: normal; font-style: normal; text-decoration: none; font-size: 1rem;"></p>',
      createdAt: now,
      updatedAt: now
    };
    try {
      const id = await db.notes.add(newNote);
      const createdNote = { ...newNote, id };
      setNotes([createdNote, ...notes]);
      setSelectedNote(createdNote);
      setIsNewNote(true); // Устанавливаем флаг новой заметки
      return createdNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  };

  const updateNote = async (note: Note): Promise<void> => {
    if (!note.id) return;
    try {
      const updatedNote = { ...note, updatedAt: Date.now() };
      await db.notes.update(note.id, updatedNote);
      // Обновляем заметку в списке
      setNotes(prevNotes => prevNotes.map(n => n.id === note.id ? updatedNote : n));
      // Обновляем выбранную заметку, если это она
      setSelectedNote(prevSelected => prevSelected?.id === note.id ? updatedNote : prevSelected);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: number): Promise<void> => {
    try {
      await db.notes.delete(id);
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  const filteredNotes = notes.filter(note => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <NotesContext.Provider
      value={{
        notes,
        selectedNote,
        searchQuery,
        setSearchQuery,
        selectNote: setSelectedNote,
        createNote,
        updateNote,
        deleteNote,
        filteredNotes,
        isNewNote,
        setIsNewNote
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

