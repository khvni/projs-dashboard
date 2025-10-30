import MainLayout from '@/components/layout/MainLayout'
import { Card, Col, Row, Tag } from 'antd'

export default function KanbanPage() {
  // Sample tasks - will be replaced with real drag-and-drop using dnd-kit
  const todoTasks = [
    { id: '1', title: 'Design project logo', assignee: 'Ahmad' },
    { id: '2', title: 'Prepare budget proposal', assignee: 'Fatima' },
  ]

  const inProgressTasks = [
    { id: '3', title: 'Meet with beneficiaries', assignee: 'Hassan' },
    { id: '4', title: 'Order supplies', assignee: 'Aisha' },
  ]

  const doneTasks = [
    { id: '5', title: 'Site inspection completed', assignee: 'Ibrahim' },
  ]

  const renderTaskCard = (task: any) => (
    <Card
      key={task.id}
      size="small"
      style={{ marginBottom: '12px', cursor: 'pointer' }}
      hoverable
    >
      <div style={{ fontWeight: 500, marginBottom: '8px' }}>{task.title}</div>
      <Tag color="blue">{task.assignee}</Tag>
    </Card>
  )

  return (
    <MainLayout>
      <div>
        <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Kanban Board</h1>
        <p style={{ marginBottom: '24px', color: '#666' }}>
          Drag and drop tasks between columns. Real-time updates with SSE will be implemented.
        </p>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Card
              title="To Do"
              headStyle={{ backgroundColor: '#f0f0f0' }}
              bodyStyle={{ minHeight: '400px' }}
            >
              {todoTasks.map(renderTaskCard)}
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              title="In Progress"
              headStyle={{ backgroundColor: '#e6f7ff' }}
              bodyStyle={{ minHeight: '400px' }}
            >
              {inProgressTasks.map(renderTaskCard)}
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card
              title="Done"
              headStyle={{ backgroundColor: '#f6ffed' }}
              bodyStyle={{ minHeight: '400px' }}
            >
              {doneTasks.map(renderTaskCard)}
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  )
}
