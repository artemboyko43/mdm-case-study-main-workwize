import { AppstoreOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons'
import { Alert, Card, Col, Row, Space, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { getApiBase } from '../api'

const { Title, Paragraph } = Typography

export default function HomePage() {
  const [status, setStatus] = useState({ ok: null, label: 'Checking API…' })

  useEffect(() => {
    const url = `${getApiBase()}/api/health`
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) =>
        setStatus({
          ok: d.status === 'ok',
          label: d.status === 'ok' ? 'API is reachable — you can shop and manage products.' : 'Unexpected API response.',
        }),
      )
      .catch(() => setStatus({ ok: false, label: 'Cannot reach the API. Start the Laravel backend (e.g. docker compose up or php artisan serve).' }))
  }, [])

  return (
    <Space direction="vertical" size={28} style={{ width: '100%' }}>
      <div>
        <Title level={2} style={{ marginBottom: 8 }}>
          Welcome
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 16, maxWidth: 640, marginBottom: 0 }}>
          One storefront for every supplier. Browse the catalog, build a cart, and check out — or sign in as a supplier to list
          products and see who bought them.
        </Paragraph>
      </div>

      {status.ok === null ? (
        <Alert type="info" message={status.label} showIcon />
      ) : status.ok ? (
        <Alert type="success" message={status.label} showIcon />
      ) : (
        <Alert type="warning" message={status.label} showIcon />
      )}

      <Row gutter={[20, 20]}>
        <Col xs={24} md={8}>
          <Card hoverable>
            <Space direction="vertical" size="small">
              <AppstoreOutlined style={{ fontSize: 28, color: '#c45c26' }} />
              <Title level={5} style={{ margin: 0 }}>
                Browse products
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Every supplier’s catalog in one place with clear pricing and stock.
              </Paragraph>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card hoverable>
            <Space direction="vertical" size="small">
              <ShopOutlined style={{ fontSize: 28, color: '#c45c26' }} />
              <Title level={5} style={{ margin: 0 }}>
                For suppliers
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Manage inventory and review who purchased your items.
              </Paragraph>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card hoverable>
            <Space direction="vertical" size="small">
              <TeamOutlined style={{ fontSize: 28, color: '#c45c26' }} />
              <Title level={5} style={{ margin: 0 }}>
                For shoppers
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Cart, checkout, and order history with a single account.
              </Paragraph>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}
