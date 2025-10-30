'use client'

import React, { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import Link from 'next/link'
import {
  DashboardOutlined,
  ProjectOutlined,
  AppstoreOutlined,
  TeamOutlined,
  SettingOutlined,
  EyeOutlined,
} from '@ant-design/icons'

const { Header, Content, Footer, Sider } = Layout

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard">Dashboard</Link>,
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: <Link href="/projects">Projects</Link>,
    },
    {
      key: 'kanban',
      icon: <AppstoreOutlined />,
      label: <Link href="/kanban">Kanban Board</Link>,
    },
    {
      key: 'public-view',
      icon: <EyeOutlined />,
      label: <Link href="/public-view">Public View</Link>,
    },
    {
      key: 'team',
      icon: <TeamOutlined />,
      label: <Link href="/team">Team</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">Settings</Link>,
    },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div
          style={{
            height: 32,
            margin: 16,
            color: 'white',
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: collapsed ? '14px' : '16px',
          }}
        >
          {collapsed ? 'MFA' : 'MyFundAction'}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['dashboard']}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0, fontSize: '20px' }}>Projects Dashboard</h1>
            <div>
              {/* User profile / logout will go here */}
            </div>
          </div>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          MyFundAction Projects Dashboard ©{new Date().getFullYear()} - Built with Next.js 15
        </Footer>
      </Layout>
    </Layout>
  )
}
