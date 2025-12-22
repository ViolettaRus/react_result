import React, { useState, useEffect, useRef } from 'react';
import { Layout, Button, Modal, Empty, Space, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useNotes } from '../../contexts/NotesContext';
import { Editor } from '../editor';
import './Workspace.css';

const { Content } = Layout;
const { Text } = Typography;

const Workspace: React.FC = () => {
  const { selectedNote, updateNote, deleteNote, isNewNote, setIsNewNote } = useNotes();
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [localNote, setLocalNote] = useState<{ title: string; content: string } | null>(null);
  const [originalNote, setOriginalNote] = useState<{ title: string; content: string } | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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

    // Очищаем предыдущий таймер
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Автосохранение через 1 секунду после последнего изменения
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const updatedNote = {
          ...selectedNote,
          title: extractedTitle,
          content: value
        };
        await updateNote(updatedNote);
      } catch (error) {
        console.error('Error auto-saving note:', error);
      }
    }, 1000);
  };

  const handleDelete = async () => {
    if (selectedNote?.id) {
      await deleteNote(selectedNote.id);
      setDeleteModalOpen(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

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
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (!selectedNote) {
    return (
      <Content className="workspace-empty">
        <Empty
          description={
            <div className="empty-state">
              <h3>Выберите заметку для просмотра</h3>
              <p>или создайте новую</p>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Content>
    );
  }

  return (
    <Content className="workspace">
      <div className="workspace-toolbar">
        {!isEditing ? (
          <>
            <div className="workspace-info">
              <Text className="workspace-note-title">{selectedNote.title || 'Без названия'}</Text>
              <Text type="secondary" className="workspace-note-date">
                {formatDate(selectedNote.updatedAt)}
              </Text>
            </div>
            <Space className="workspace-actions">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                className="workspace-btn workspace-btn-edit"
                size="large"
              >
                Редактировать
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => setDeleteModalOpen(true)}
                className="workspace-btn workspace-btn-delete"
                size="large"
              >
                Удалить
              </Button>
            </Space>
          </>
        ) : (
          <div className="workspace-actions editing">
            <Text className="editing-indicator">Режим редактирования</Text>
            <Space>
              <Button
                icon={<CloseOutlined />}
                onClick={handleCancel}
                className="workspace-btn workspace-btn-cancel"
                size="large"
              >
                Отменить
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                className="workspace-btn workspace-btn-save"
                size="large"
              >
                Сохранить
              </Button>
            </Space>
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

      <Modal
        title={
          <div className="delete-modal-title">
            <DeleteOutlined style={{ color: '#ef4444', marginRight: '8px' }} />
            Удалить заметку?
          </div>
        }
        open={deleteModalOpen}
        onOk={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
        okText="Удалить"
        cancelText="Отмена"
        okButtonProps={{ 
          danger: true,
          size: 'large',
          icon: <DeleteOutlined />
        }}
        cancelButtonProps={{ size: 'large' }}
        className="delete-modal"
      >
        <div className="delete-modal-content">
          <p>Вы уверены, что хотите удалить эту заметку?</p>
          <p className="delete-warning">Это действие нельзя отменить.</p>
        </div>
      </Modal>
    </Content>
  );
};

export default Workspace;
