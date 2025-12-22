import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { Note, User } from '../types';

export class NotesDatabase extends Dexie {
  notes!: Table<Note, number>;
  users!: Table<User, string>;

  constructor() {
    super('NotesDatabase');
    this.version(1).stores({
      notes: '++id, title, content, createdAt, updatedAt',
      users: 'id, username, password'
    });
  }
}

export const db = new NotesDatabase();

