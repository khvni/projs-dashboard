import { Card, Row, Col, Progress, Timeline } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'

export default function PublicViewPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>MyFundAction Project Portal</h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Track the impact of our projects in real-time
        </p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Homeless Care Program 2024"
            extra={<span style={{ color: '#52c41a' }}>Active</span>}
          >
            <p style={{ fontSize: '16px', marginBottom: '24px' }}>
              Providing essential support, shelter, and food distribution to homeless individuals
              across Kuala Lumpur.
            </p>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Project Progress</span>
                <span style={{ fontWeight: 'bold' }}>65%</span>
              </div>
              <Progress percent={65} status="active" />
            </div>

            <Row gutter={16}>
              <Col xs={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>127</div>
                  <div style={{ color: '#666' }}>Beneficiaries Served</div>
                </Card>
              </Col>
              <Col xs={12}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>45</div>
                  <div style={{ color: '#666' }}>Volunteers</div>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Project Timeline">
            <Timeline
              items={[
                {
                  color: 'green',
                  dot: <CheckCircleOutlined />,
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>Site Setup Complete</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>March 15, 2024</div>
                    </div>
                  ),
                },
                {
                  color: 'green',
                  dot: <CheckCircleOutlined />,
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>First Distribution</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>March 22, 2024</div>
                    </div>
                  ),
                },
                {
                  color: 'blue',
                  dot: <ClockCircleOutlined />,
                  children: (
                    <div>
                      <div style={{ fontWeight: 500 }}>Shelter Services</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>In Progress</div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title="Recent Updates">
            <Timeline
              items={[
                {
                  children: (
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                        Weekly distribution completed
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Successfully distributed food packages to 45 families. Team of 12 volunteers
                        worked throughout the day.
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        2 days ago
                      </div>
                    </div>
                  ),
                },
                {
                  children: (
                    <div>
                      <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                        New shelter facility opened
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        Temporary shelter in Chow Kit area now operational with capacity for 30 individuals.
                      </div>
                      <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                        5 days ago
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
