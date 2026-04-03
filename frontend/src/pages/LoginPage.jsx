import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Flex, Form, Input, Typography } from 'antd'
import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const { Title, Text } = Typography

function mapErrorsToFormFields(errors) {
  if (!errors || typeof errors !== 'object') {
    return []
  }
  return Object.entries(errors).map(([name, msgs]) => ({
    name,
    errors: (Array.isArray(msgs) ? msgs : [msgs]).map(String),
  }))
}

export default function LoginPage() {
  const { login, user, ready } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from ?? '/'
  const [form] = Form.useForm()
  const [error, setError] = useState(null)
  const [pending, setPending] = useState(false)

  if (!ready) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 240 }}>
        <Typography.Text type="secondary">Loading…</Typography.Text>
      </Flex>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  async function onFinish(values) {
    setError(null)
    form.setFields(
      ['email', 'password'].map((name) => ({
        name,
        errors: [],
      })),
    )
    setPending(true)
    try {
      await login(values.email, values.password)
      navigate(from, { replace: true })
    } catch (err) {
      const p = err.payload
      if (p?.errors) {
        form.setFields(mapErrorsToFormFields(p.errors))
      }
      setError(p?.message ?? err.message ?? 'Login failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <Flex justify="center" style={{ paddingTop: 24, paddingBottom: 48 }}>
      <Card style={{ width: '100%', maxWidth: 420 }} variant="borderless">
        <Title level={3} style={{ marginTop: 0 }}>
          Log in
        </Title>
        <Text type="secondary">Sign in to continue shopping or managing your store.</Text>
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark="optional" style={{ marginTop: 24 }}>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input size="large" prefix={<UserOutlined />} placeholder="you@example.com" autoComplete="email" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Password required' }]}>
            <Input.Password size="large" prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          {error ? (
            <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} role="alert" closable onClose={() => setError(null)} />
          ) : null}
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={pending}>
              Log in
            </Button>
          </Form.Item>
        </Form>
        <Text type="secondary">
          No account? <Link to="/register">Create one</Link>
        </Text>
      </Card>
    </Flex>
  )
}
