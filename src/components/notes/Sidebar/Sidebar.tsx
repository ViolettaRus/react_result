import React from 'react';
import { Layout, Button, Input, Empty } from 'antd';
import { PlusOutlined, LogoutOutlined, SearchOutlined } from '@ant-design/icons';
import { useNotes } from '../../../hooks/useNotes';
import { useAuth } from '../../../hooks/useAuth';
import ListItem from '../ListItem';
import './Sidebar.css';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const { filteredNotes, createNote, searchQuery, setSearchQuery } = useNotes();
  const { logout } = useAuth();

  const handleCreateNote = async () => {
    await createNote();
  };

  return (
    <Sider width={320} className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Заметки</h2>
        <Button
          type="text"
          icon={<LogoutOutlined />}
          onClick={logout}
          className="sidebar-logout"
        >
          Выход
        </Button>
      </div>
      <div className="sidebar-content">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateNote}
          block
          size="large"
          className="sidebar-create-btn"
        >
          Новая заметка
        </Button>
        <Input
          placeholder="Поиск заметок..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sidebar-search"
        />
        <div className="sidebar-list">
          {filteredNotes.length === 0 ? (
            <Empty
              description="Создайте свою первую заметку"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            filteredNotes.map((note) => (
              <ListItem key={note.id} note={note} />
            ))
          )}
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;
