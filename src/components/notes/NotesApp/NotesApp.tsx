import React from 'react';
import { Layout } from 'antd';
import Sidebar from '../Sidebar';
import Workspace from '../Workspace';
import './NotesApp.css';

const { Content } = Layout;

const NotesApp: React.FC = () => {
  return (
    <Layout className="notes-app">
      <Sidebar />
      <Content className="notes-content">
        <Workspace />
      </Content>
    </Layout>
  );
};

export default NotesApp;
