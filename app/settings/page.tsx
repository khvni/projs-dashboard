import MainLayout from '@/components/layout/MainLayout'
import { Card, Form, Input, Button, Switch, Select } from 'antd'

export default function SettingsPage() {
  return (
    <MainLayout>
      <div>
        <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Settings</h1>

        <div style={{ maxWidth: '800px' }}>
          <Card title="General Settings" style={{ marginBottom: '16px' }}>
            <Form layout="vertical">
              <Form.Item label="Organization Name">
                <Input defaultValue="MyFundAction" />
              </Form.Item>
              <Form.Item label="Default Language">
                <Select defaultValue="en">
                  <Select.Option value="en">English</Select.Option>
                  <Select.Option value="ms">Bahasa Malaysia</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item label="Enable Real-time Updates">
                <Switch defaultChecked />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Save Changes</Button>
              </Form.Item>
            </Form>
          </Card>

          <Card title="Notification Settings">
            <Form layout="vertical">
              <Form.Item label="Email Notifications">
                <Switch defaultChecked />
              </Form.Item>
              <Form.Item label="Task Assignment Alerts">
                <Switch defaultChecked />
              </Form.Item>
              <Form.Item label="Project Update Notifications">
                <Switch defaultChecked />
              </Form.Item>
              <Form.Item>
                <Button type="primary">Save Preferences</Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
