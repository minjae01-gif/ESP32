import React from 'react';
import { Layout as AntLayout } from 'antd';
import Sidebar from './Sidebar';

const { Content } = AntLayout;

function Layout({ children }) {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <AntLayout style={{ marginLeft: 240 }}>
        <Content
          style={{
            padding: '24px',
            background: '#f0f2f5',
            minHeight: '100vh',
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;
