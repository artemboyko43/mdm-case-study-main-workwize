import { UnorderedListOutlined } from '@ant-design/icons'
import { Card, Empty, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function OrdersPlaceholder() {
  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        <UnorderedListOutlined /> Orders
      </Title>
      <Paragraph type="secondary">Past purchases with totals and line items will list here.</Paragraph>
      <Empty description="No orders to show yet" />
    </Card>
  )
}
