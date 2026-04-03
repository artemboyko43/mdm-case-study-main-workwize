import { AppstoreOutlined } from '@ant-design/icons'
import { Card, Empty, Space, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function ProductsPlaceholder() {
  return (
    <Card>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>
          <AppstoreOutlined /> Products
        </Title>
        <Paragraph type="secondary">The full catalog with filters and product detail will load here.</Paragraph>
        <Empty description="Coming next" />
      </Space>
    </Card>
  )
}
