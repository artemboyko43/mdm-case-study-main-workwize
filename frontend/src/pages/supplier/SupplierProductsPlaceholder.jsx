import { ShopOutlined } from '@ant-design/icons'
import { Card, Empty, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function SupplierProductsPlaceholder() {
  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        <ShopOutlined /> My products
      </Title>
      <Paragraph type="secondary">Create, edit, and delete products from this workspace.</Paragraph>
      <Empty description="Product table and forms coming soon" />
    </Card>
  )
}
