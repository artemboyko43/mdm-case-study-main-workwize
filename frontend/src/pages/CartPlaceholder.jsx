import { ShoppingCartOutlined } from '@ant-design/icons'
import { Card, Empty, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function CartPlaceholder() {
  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        <ShoppingCartOutlined /> Cart
      </Title>
      <Paragraph type="secondary">Line items, quantity updates, and checkout will appear here.</Paragraph>
      <Empty description="Your cart is empty for now" />
    </Card>
  )
}
