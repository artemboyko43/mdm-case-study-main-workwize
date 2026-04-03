import { Breadcrumb, Descriptions, Space, Spin, Table, Typography, message } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { apiJson } from '../api'

const { Text, Title } = Typography

function formatMoney(v) {
  if (v == null || v === '') {
    return '—'
  }
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(2) : String(v)
}

function formatDate(iso) {
  if (!iso) {
    return '—'
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return String(iso)
  }
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function lineTotal(unit, qty) {
  const u = Number(unit)
  const q = Number(qty)
  if (!Number.isFinite(u) || !Number.isFinite(q)) {
    return '—'
  }
  return (u * q).toFixed(2)
}

function normalizeItems(items) {
  if (Array.isArray(items)) {
    return items
  }
  if (items && Array.isArray(items.data)) {
    return items.data
  }
  return []
}

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!orderId) {
      return
    }
    setLoading(true)
    try {
      const json = await apiJson(`/api/orders/${orderId}`)
      setOrder(json.data ?? json)
    } catch (e) {
      message.error(e.message || 'Order not found')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!order) {
    return (
      <Space direction="vertical">
        <Breadcrumb
          items={[
            { title: <Link to="/">Home</Link> },
            { title: <Link to="/orders">Orders</Link> },
            { title: 'Not found' },
          ]}
        />
        <Link to="/orders">Back to orders</Link>
      </Space>
    )
  }

  const items = normalizeItems(order.items)

  const itemColumns = [
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      ellipsis: true,
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 72,
    },
    {
      title: 'Unit',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: 100,
      align: 'right',
      render: (v) => formatMoney(v),
    },
    {
      title: 'Line',
      key: 'line',
      width: 100,
      align: 'right',
      render: (_, r) => lineTotal(r.unit_price, r.quantity),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Breadcrumb
        items={[
          { title: <Link to="/">Home</Link> },
          { title: <Link to="/orders">Orders</Link> },
          { title: `Order #${order.id}` },
        ]}
      />

      <Title level={3} style={{ margin: 0 }}>
        Order #{order.id}
      </Title>

      <Descriptions bordered size="small" column={{ xs: 1, sm: 1, md: 2 }}>
        <Descriptions.Item label="Placed">{formatDate(order.created_at)}</Descriptions.Item>
        <Descriptions.Item label="Status">{order.status}</Descriptions.Item>
        <Descriptions.Item label="Total">{formatMoney(order.total)}</Descriptions.Item>
      </Descriptions>

      <div>
        <Title level={5}>Line items</Title>
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          columns={itemColumns}
          dataSource={items}
          locale={{ emptyText: 'No lines on this order.' }}
        />
      </div>
    </Space>
  )
}
