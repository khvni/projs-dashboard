import MainLayout from '@/components/layout/MainLayout'
import { Button, Table, Tag, Space } from 'antd'
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'

export default function ProjectsPage() {
  // Sample data - will be replaced with real data from Prisma
  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'IN_PROGRESS' ? 'green' : status === 'PLANNING' ? 'orange' : 'blue'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} size="small">View</Button>
          <Button icon={<EditOutlined />} size="small">Edit</Button>
        </Space>
      ),
    },
  ]

  const sampleData = [
    {
      key: '1',
      name: 'Homeless Care Program 2024',
      category: 'HOMELESS_CARE',
      status: 'IN_PROGRESS',
      progress: 65,
    },
    {
      key: '2',
      name: 'Food Distribution - Ramadan',
      category: 'FOOD_DISTRIBUTION',
      status: 'PLANNING',
      progress: 20,
    },
    {
      key: '3',
      name: 'Education Fund - Rural Schools',
      category: 'EDUCATION',
      status: 'IN_PROGRESS',
      progress: 45,
    },
  ]

  return (
    <MainLayout>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', margin: 0 }}>Projects</h1>
          <Button type="primary" icon={<PlusOutlined />}>
            Create Project
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={sampleData}
          pagination={{ pageSize: 10 }}
        />
      </div>
    </MainLayout>
  )
}
