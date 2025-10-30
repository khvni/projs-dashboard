import MainLayout from '@/components/layout/MainLayout'
import { Card, Avatar, Tag } from 'antd'
import { UserOutlined } from '@ant-design/icons'

export default function TeamPage() {
  const teamMembers = [
    { name: 'Ahmad Hassan', role: 'PROJECT_MANAGER', email: 'ahmad@myfundaction.org', projects: 5 },
    { name: 'Fatima Ali', role: 'TEAM_MEMBER', email: 'fatima@myfundaction.org', projects: 3 },
    { name: 'Ibrahim Khan', role: 'TEAM_MEMBER', email: 'ibrahim@myfundaction.org', projects: 4 },
  ]

  return (
    <MainLayout>
      <div>
        <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Team Members</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {teamMembers.map((member, index) => (
            <Card key={index}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar size={64} icon={<UserOutlined />} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                    {member.name}
                  </div>
                  <div style={{ color: '#666', marginBottom: '8px' }}>{member.email}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Tag color="blue">{member.role}</Tag>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {member.projects} projects
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
