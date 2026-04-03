import { LineChartOutlined } from '@ant-design/icons'
import { Card, Empty, Typography } from 'antd'

const { Title, Paragraph } = Typography

export default function SupplierSalesPlaceholder() {
  return (
    <Card>
      <Title level={3} style={{ marginTop: 0 }}>
        <LineChartOutlined /> Sales
      </Title>
      <Paragraph type="secondary">See who bought your products and order line details.</Paragraph>
      <Empty description="Sales data will display here" />
    </Card>
  )
}
