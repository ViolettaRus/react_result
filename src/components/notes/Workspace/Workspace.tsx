import React, { useState, useEffect } from 'react';
import { useNotes } from '../../../hooks/useNotes';
import { Editor } from '../../editor';
import { Button, IconButton, Dialog, DialogActions } from '../../ui';
import { EditIcon, DeleteIcon } from '../../icons';
import './Workspace.css';

const Workspace: React.FC = () => {
  const { selectedNote, updateNote, deleteNote, isNewNote, setIsNewNote } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [localNote, setLocalNote] = useState<{ title: string; content: string } | null>(null);
  const [originalNote, setOriginalNote] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    if (isNewNote && selectedNote) {
      setIsEditing(true);
      setIsNewNote(false);
    } else {
      setIsEditing(false);
    }
    setLocalNote(null);
  }, [selectedNote?.id, isNewNote, setIsNewNote]);

  useEffect(() => {
    if (selectedNote) {
      const noteData = { title: selectedNote.title, content: selectedNote.content };
      setLocalNote(noteData);
      setOriginalNote(noteData);
    }
  }, [selectedNote]);

  const extractTitleFromHTML = (html: string): string => {
    if (!html) return 'Без названия';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const text = tempDiv.textContent?.trim() || '';
    if (!text) return 'Без названия';
    
    const firstLine = text.split('\n')[0].trim() || text.trim();
    if (!firstLine) return 'Без названия';
    
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  };

  const handleContentChange = (value: string) => {
    if (!selectedNote || !localNote) return;

    const extractedTitle = extractTitleFromHTML(value);
    setLocalNote({ ...localNote, content: value, title: extractedTitle });
  };

  const handleDelete = async () => {
    if (selectedNote?.id) {
      await deleteNote(selectedNote.id);
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (selectedNote && localNote) {
      try {
        const extractedTitle = extractTitleFromHTML(localNote.content);
        const updatedNote = {
          ...selectedNote,
          title: extractedTitle,
          content: localNote.content
        };
        await updateNote(updatedNote);
        setOriginalNote({ title: extractedTitle, content: localNote.content });
      } catch (error) {
        console.error('Error saving note:', error);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = async () => {
    const isEmpty = !localNote?.content || 
                    localNote.content.trim() === '' || 
                    localNote.content === '<p></p>' || 
                    localNote.content === '<p><br></p>' ||
                    localNote.content.replace(/<[^>]*>/g, '').trim() === '';
    
    if (isEmpty && selectedNote?.id) {
      await deleteNote(selectedNote.id);
    } else {
      if (originalNote) {
        setLocalNote(originalNote);
      } else if (selectedNote) {
        setLocalNote({ title: selectedNote.title, content: selectedNote.content });
      }
    }
    setIsEditing(false);
  };

  if (!selectedNote) {
    return (
      <div className="workspace-empty">
        <div className="workspace-empty-content">
          <h3>Выберите заметку для просмотра</h3>
          <p>или создайте новую</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace">
      <div className="workspace-toolbar">
        {!isEditing && (
          <>
            <div style={{ flex: 1 }} />
            <IconButton
              onClick={handleEdit}
              color="primary"
              title="Редактировать"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={() => setDeleteDialogOpen(true)}
              color="error"
              title="Удалить"
            >
              <DeleteIcon />
            </IconButton>
          </>
        )}
        {isEditing && (
          <div className="workspace-actions">
            <Button
              onClick={handleCancel}
              variant="outline"
              style={{ marginRight: '8px' }}
            >
              Отменить
            </Button>
            <Button onClick={handleSave}>
              Сохранить
            </Button>
          </div>
        )}
      </div>

      <div className="workspace-content">
        {isEditing ? (
          <div className="workspace-editor-container">
            <Editor
              content={localNote?.content || ''}
              onChange={handleContentChange}
            />
          </div>
        ) : (
          <div className="workspace-view">
            <div
              className="workspace-content-html"
              dangerouslySetInnerHTML={{
                __html: selectedNote.content || ''
              }}
            />
          </div>
        )}
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Удалить заметку?"
      >
        <p>Вы уверены, что хотите удалить эту заметку? Это действие нельзя отменить.</p>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outline"
          >
            Отмена
          </Button>
          <Button
            onClick={handleDelete}
            variant="primary"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            }}
          >
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Workspace;
