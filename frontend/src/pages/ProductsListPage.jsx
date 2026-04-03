import { AppstoreOutlined } from '@ant-design/icons'
import { Card, Col, List, Pagination, Row, Space, Typography, message } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiJson } from '../api'

const { Text, Title } = Typography

const DEFAULT_PAGE_SIZE = 12

function formatMoney(v) {
  if (v == null || v === '') {
    return '—'
  }
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(2) : String(v)
}

export default function ProductsListPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  })

  const load = useCallback(async (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
    setLoading(true)
    try {
      const json = await apiJson(`/api/products?page=${page}&per_page=${pageSize}`)
      setProducts(Array.isArray(json.data) ? json.data : [])
      const meta = json.meta ?? {}
      setPagination({
        current: meta.current_page ?? page,
        pageSize: meta.per_page ?? pageSize,
        total: meta.total ?? 0,
      })
    } catch (e) {
      message.error(e.message || 'Could not load products')
      setProducts([])
      setPagination((p) => ({ ...p, total: 0 }))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(1, DEFAULT_PAGE_SIZE)
  }, [load])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>
          <AppstoreOutlined /> Products
        </Title>
        <Text type="secondary">Browse the shared catalog from all suppliers.</Text>
      </div>

      <List
        grid={{ gutter: [16, 16], xs: 1, sm: 2, md: 3, lg: 3 }}
        loading={loading}
        dataSource={products}
        locale={{ emptyText: 'No products in the catalog yet.' }}
        renderItem={(p) => (
          <List.Item style={{ marginBlockEnd: 0 }}>
            <Link to={`/products/${p.id}`} style={{ display: 'block', height: '100%' }}>
              <Card hoverable size="small" title={p.name} style={{ height: '100%' }}>
                <Text strong>{formatMoney(p.price)}</Text>
                {p.supplier?.name ? (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {p.supplier.name}
                    </Text>
                  </div>
                ) : null}
                {p.stock_quantity != null && p.stock_quantity <= 0 ? (
                  <Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                    Out of stock
                  </Text>
                ) : null}
              </Card>
            </Link>
          </List.Item>
        )}
      />

      {!loading && pagination.total > 0 ? (
        <Row justify="center">
          <Col>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              pageSizeOptions={['12', '24', '48']}
              onChange={(p, ps) => load(p, ps)}
            />
          </Col>
        </Row>
      ) : null}
    </Space>
  )
}
