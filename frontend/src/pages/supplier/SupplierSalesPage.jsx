import { Table, Typography, message } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { apiJson } from '../../api'
import { formatDate, formatMoney } from '../../formatters'

const { Text, Title } = Typography

const DEFAULT_PAGE_SIZE = 20

export default function SupplierSalesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  })

  const load = useCallback(async (page = 1, pageSize = 20) => {
    setLoading(true)
    try {
      const json = await apiJson(`/api/supplier/sales?page=${page}&per_page=${pageSize}`)
      setRows(Array.isArray(json.data) ? json.data : [])
      const meta = json.meta ?? {}
      setPagination({
        current: meta.current_page ?? page,
        pageSize: meta.per_page ?? pageSize,
        total: meta.total ?? 0,
      })
    } catch (e) {
      message.error(e.message || 'Could not load sales')
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
      title: 'Date',
      dataIndex: 'purchased_at',
      key: 'purchased_at',
      width: 200,
      render: (v) => formatDate(v),
    },
    {
      title: 'Buyer',
      key: 'buyer',
      ellipsis: true,
      render: (_, r) => {
        const b = r.buyer
        if (!b) {
          return '—'
        }
        return (
          <span>
            {b.name}
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {b.email}
            </Text>
          </span>
        )
      },
    },
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
      width: 96,
      align: 'right',
      render: (v) => formatMoney(v),
    },
    {
      title: 'Line total',
      dataIndex: 'line_total',
      key: 'line_total',
      width: 110,
      align: 'right',
      render: (v) => formatMoney(v),
    },
  ]

  return (
    <div>
      <Title level={3} style={{ marginTop: 0 }}>
        Sales
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Line items from orders that included your products. Pagination matches the API (max 100 per page).
      </Text>
      <Table
        rowKey={(r) => `${r.order_id}-${r.id}`}
        loading={loading}
        columns={columns}
        dataSource={rows}
        locale={{ emptyText: 'No sales recorded yet.' }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50, 100],
          onChange: (p, ps) => load(p, ps),
        }}
      />
    </div>
  )
}
