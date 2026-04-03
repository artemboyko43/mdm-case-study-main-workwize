import { LockOutlined, MailOutlined, ShopOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Segmented,
  Space,
  Typography,
} from 'antd'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const { Title, Paragraph, Text } = Typography

function mapErrorsToFormFields(errors) {
  if (!errors || typeof errors !== 'object') {
    return []
  }
  return Object.entries(errors).map(([name, msgs]) => ({
    name,
    errors: (Array.isArray(msgs) ? msgs : [msgs]).map(String),
  }))
}

export default function RegisterPage() {
  const { register, user, ready } = useAuth()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  if (!ready) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Text type="secondary">Loading…</Text>
      </Flex>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  async function onFinish(values) {
    setError(null)
    const fields = ['name', 'email', 'password', 'password_confirmation', 'role']
    form.setFields(fields.map((name) => ({ name, errors: [] })))
    setPending(true)
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        password_confirmation: values.password_confirmation,
        role: values.role,
      })
      navigate('/', { replace: true })
    } catch (err) {
      const p = err.payload
      if (p?.errors) {
        form.setFields(mapErrorsToFormFields(p.errors))
      }
      setError(p?.message ?? err.message ?? 'Registration failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <Flex justify="center" align="flex-start" style={{ paddingTop: 8, paddingBottom: 56 }}>
      <Card
        variant="outlined"
        style={{
          width: '100%',
          maxWidth: 520,
          borderRadius: 16,
          boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)',
        }}
        styles={{
          body: { padding: '28px 32px 32px' },
        }}
      >
        <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 8 }}>
          <Title level={3} style={{ margin: 0 }}>
            Create your account
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 15, lineHeight: 1.6 }}>
            Choose how you will use the marketplace, then add your details. One account is either a shopper or a supplier.
          </Paragraph>
        </Space>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false}
          initialValues={{ role: 'customer' }}
          style={{ marginTop: 8 }}
        >
          <Form.Item
            name="role"
            label={<Text strong>How will you use this app?</Text>}
            rules={[{ required: true, message: 'Choose account type' }]}
            style={{ marginBottom: 20 }}
          >
            <Segmented
              block
              size="large"
              className="register-role-segmented"
              options={[
                {
                  value: 'customer',
                  label: (
                    <Space direction="vertical" size={2} style={{ padding: '4px 0' }}>
                      <TeamOutlined style={{ fontSize: 18 }} />
                      <span style={{ fontWeight: 600 }}>Shopper</span>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', lineHeight: 1.35 }}>
                        Browse all suppliers, cart & checkout
                      </Text>
                    </Space>
                  ),
                },
                {
                  value: 'supplier',
                  label: (
                    <Space direction="vertical" size={2} style={{ padding: '4px 0' }}>
                      <ShopOutlined style={{ fontSize: 18 }} />
                      <span style={{ fontWeight: 600 }}>Supplier</span>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', lineHeight: 1.35 }}>
                        List products & see who bought them
                      </Text>
                    </Space>
                  ),
                },
              ]}
            />
          </Form.Item>

          <Divider orientation="left" plain style={{ margin: '8px 0 20px', fontSize: 13 }}>
            Your profile
          </Divider>

          <Form.Item name="name" label="Full name" rules={[{ required: true, message: 'Please enter your name' }]}>
            <Input size="large" placeholder="Alex Morgan" prefix={<UserOutlined />} autoComplete="name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
            extra={<Text type="secondary">Used to log in — we will not spam you.</Text>}
          >
            <Input size="large" prefix={<MailOutlined />} placeholder="you@company.com" autoComplete="email" />
          </Form.Item>

          <Divider orientation="left" plain style={{ margin: '8px 0 20px', fontSize: 13 }}>
            Password
          </Divider>

          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, min: 8, message: 'At least 8 characters' }]}
                extra={<Text type="secondary">Minimum 8 characters.</Text>}
              >
                <Input.Password size="large" prefix={<LockOutlined />} autoComplete="new-password" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="password_confirmation"
                label="Confirm password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('Passwords do not match'))
                    },
                  }),
                ]}
              >
                <Input.Password size="large" prefix={<LockOutlined />} autoComplete="new-password" />
              </Form.Item>
            </Col>
          </Row>

          {error ? (
            <Alert
              type="error"
              description={error}
              showIcon
              style={{ marginBottom: 16 }}
              role="alert"
              closable
              onClose={() => setError(null)}
            />
          ) : null}

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" size="large" block loading={pending}>
              Create account
            </Button>
          </Form.Item>
        </Form>

        <Flex justify="center" style={{ marginTop: 8 }}>
          <Text type="secondary">
            Already registered?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Log in
            </Link>
          </Text>
        </Flex>
      </Card>
    </Flex>
  )
}
