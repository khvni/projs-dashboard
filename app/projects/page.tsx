'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Button, Tag, Progress, Space, Input, Select, Card } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { formatDate, formatPercentage, formatEnum } from '@/lib/utils/format';
import { useProjectFiltersStore } from '@/store/useProjectFiltersStore';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

const { Option } = Select;

export default function ProjectsPage() {
  const router = useRouter();
  const { search, status, category, priority, setSearch, setStatus, setCategory, setPriority } = useProjectFiltersStore();
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch projects
  const { data, isLoading } = useQuery({
    queryKey: ['projects', { page, limit, search, status, category, priority }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      status.forEach(s => params.append('status', s));
      category.forEach(c => params.append('category', c));
      priority.forEach(p => params.append('priority', p));

      const response = await fetch(`/api/projects?${params}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    },
  });

  // Connect to real-time updates
  useRealtimeUpdates();

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <a onClick={() => router.push(`/projects/${record.id}`)} className="text-blue-600 hover:text-blue-800">
          {text}
        </a>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          PLANNING: 'blue',
          IN_PROGRESS: 'green',
          ON_HOLD: 'orange',
          COMPLETED: 'gray',
          CANCELLED: 'red',
        };
        return <Tag color={colors[status]}>{formatEnum(status)}</Tag>;
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => formatEnum(category),
    },
    {
      title: 'Progress',
      dataIndex: 'percentComplete',
      key: 'percentComplete',
      render: (percent: number) => (
        <div className="flex items-center gap-2">
          <Progress percent={percent} size="small" style={{ width: 100 }} />
          <span className="text-sm">{formatPercentage(percent)}</span>
        </div>
      ),
    },
    {
      title: 'Tasks',
      dataIndex: 'tasks',
      key: 'tasks',
      render: (tasks: any[]) => {
        const completed = tasks?.filter(t => t.status === 'DONE').length || 0;
        const total = tasks?.length || 0;
        return `${completed}/${total}`;
      },
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Manager',
      dataIndex: 'projectManager',
      key: 'projectManager',
      render: (manager: any) => manager?.name || 'Unassigned',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/projects/new')}
          >
            New Project
          </Button>
        </div>

        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space wrap>
              <Input
                placeholder="Search projects..."
                prefix={<SearchOutlined />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 300 }}
              />
              <Select
                mode="multiple"
                placeholder="Status"
                value={status}
                onChange={setStatus}
                style={{ minWidth: 200 }}
              >
                <Option value="PLANNING">Planning</Option>
                <Option value="IN_PROGRESS">In Progress</Option>
                <Option value="ON_HOLD">On Hold</Option>
                <Option value="COMPLETED">Completed</Option>
                <Option value="CANCELLED">Cancelled</Option>
              </Select>
              <Select
                mode="multiple"
                placeholder="Priority"
                value={priority}
                onChange={setPriority}
                style={{ minWidth: 150 }}
              >
                <Option value="LOW">Low</Option>
                <Option value="MEDIUM">Medium</Option>
                <Option value="HIGH">High</Option>
                <Option value="URGENT">Urgent</Option>
              </Select>
            </Space>

            <Table
              columns={columns}
              dataSource={data?.projects || []}
              loading={isLoading}
              rowKey="id"
              pagination={{
                current: page,
                pageSize: limit,
                total: data?.pagination?.total || 0,
                onChange: setPage,
              }}
            />
          </Space>
        </Card>
      </div>
    </div>
  );
}
