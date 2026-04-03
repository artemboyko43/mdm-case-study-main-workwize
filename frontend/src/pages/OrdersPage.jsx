import { UnorderedListOutlined } from '@ant-design/icons'
import { Button, Space, Table, Typography, message } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../api'
import { formatDate, formatMoney } from '../formatters'

const { Text, Title } = Typography

const DEFAULT_PAGE_SIZE = 15

export default function OrdersPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  })

  const load = useCallback(async (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
    setLoading(true)
    try {
      const json = await apiJson(`/api/orders?page=${page}&per_page=${pageSize}`)
      setRows(Array.isArray(json.data) ? json.data : [])
      const meta = json.meta ?? {}
      setPagination({
        current: meta.current_page ?? page,
        pageSize: meta.per_page ?? pageSize,
        total: meta.total ?? 0,
      })
    } catch (e) {
      message.error(e.message || 'Could not load orders')
      setRows([])
      setPagination((p) => ({ ...p, total: 0 }))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(1, DEFAULT_PAGE_SIZE)
  }, [load])

  const columns = [
    {
      title: 'Order',
      dataIndex: 'id',
      key: 'id',
      width: 90,
      render: (id) => `#${id}`,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 200,
      render: (v) => formatDate(v),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      width: 110,
      align: 'right',
      render: (v) => formatMoney(v),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, r) => (
        <Link to={`/orders/${r.id}`}>
          <Button type="link" size="small">
            View
          </Button>
        </Link>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>
          <UnorderedListOutlined /> Orders
        </Title>
        <Text type="secondary">Your completed purchases and line-item snapshots.</Text>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        locale={{ emptyText: 'You have not placed an order yet.' }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: [10, 15, 25, 50, 100],
          onChange: (p, ps) => load(p, ps),
        }}
      />
    </Space>
  )
}
