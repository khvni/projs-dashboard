'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Statistic, List, Tag, Spin } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { formatDate, formatEnum } from '@/lib/utils/format';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const router = useRouter();

  // Fetch projects for stats
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', { limit: 10 }],
    queryFn: async () => {
      const response = await fetch('/api/projects?limit=10');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  // Connect to real-time updates
  useRealtimeUpdates();

  const projects = projectsData?.projects || [];

  // Calculate stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p: any) => p.status === 'IN_PROGRESS').length;
  const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED').length;

  // Chart data
  const chartData = projects.slice(0, 5).map((p: any) => ({
    name: p.name.substring(0, 20),
    progress: p.percentComplete,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Projects"
              value={totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Projects"
              value={activeProjects}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={completedProjects}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Progress"
              value={Math.round(projects.reduce((sum: number, p: any) => sum + p.percentComplete, 0) / projects.length || 0)}
              suffix="%"
              prefix={<RocketOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Projects & Chart */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Projects">
            <List
              dataSource={projects}
              renderItem={(project: any) => (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <List.Item.Meta
                    title={project.name}
                    description={
                      <div className="flex items-center gap-2">
                        <Tag color={project.status === 'IN_PROGRESS' ? 'green' : 'blue'}>
                          {formatEnum(project.status)}
                        </Tag>
                        <span className="text-sm text-gray-500">
                          {project.percentComplete}% complete
                        </span>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Project Progress">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="progress" fill="#1890ff" name="Progress %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
