import MainLayout from '@/components/layout/MainLayout'
import { Card, Row, Col, Statistic } from 'antd'
import {
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'

export default function DashboardPage() {
  return (
    <MainLayout>
      <div>
        <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Dashboard Overview</h1>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Projects"
                value={25}
                prefix={<ProjectOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Projects"
                value={18}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Completed"
                value={7}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Team Members"
                value={45}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24} lg={12}>
            <Card title="Recent Projects">
              <p>Project list will be displayed here with real-time updates</p>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Upcoming Milestones">
              <p>Milestone timeline and deadlines will be shown here</p>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card title="Project Progress Chart">
              <p>Interactive charts showing project completion rates will be displayed here using Recharts</p>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  )
}
