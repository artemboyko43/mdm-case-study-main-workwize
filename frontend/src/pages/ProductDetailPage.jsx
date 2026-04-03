import { ShoppingCartOutlined } from '@ant-design/icons'
import { Alert, Breadcrumb, Button, Descriptions, InputNumber, Space, Spin, Typography, message } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { apiJson } from '../api'

const { Text, Title } = Typography

function formatMoney(v) {
  if (v == null || v === '') {
    return '—'
  }
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(2) : String(v)
}

export default function ProductDetailPage() {
  const { productId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    if (!productId) {
      return
    }
    setLoading(true)
    try {
      const json = await apiJson(`/api/products/${productId}`)
      const p = json.data ?? json
      setProduct(p)
      setQty(1)
    } catch (e) {
      message.error(e.message || 'Product not found')
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    load()
  }, [load])

  async function addToCart() {
    if (!product || !user || user.role !== 'customer') {
      return
    }
    const stock = product.stock_quantity ?? 0
    if (stock <= 0) {
      message.warning('This product is out of stock.')
      return
    }
    const q = Math.max(1, Math.min(Number(qty), stock))
    setAdding(true)
    try {
      await apiJson('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({ product_id: product.id, quantity: q }),
      })
      message.success('Added to cart')
      navigate('/cart')
    } catch (e) {
      message.error(e.message || 'Could not add to cart')
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!product) {
    return (
      <Space direction="vertical">
        <Breadcrumb
          items={[
            { title: <Link to="/">Home</Link> },
            { title: <Link to="/products">Products</Link> },
            { title: 'Not found' },
          ]}
        />
        <Text type="secondary">This product does not exist or was removed.</Text>
        <Link to="/products">Back to catalog</Link>
      </Space>
    )
  }

  const stock = product.stock_quantity ?? 0
  const canBuy = user?.role === 'customer' && stock > 0

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Breadcrumb
        items={[
          { title: <Link to="/">Home</Link> },
          { title: <Link to="/products">Products</Link> },
          { title: product.name },
        ]}
      />

      <Title level={3} style={{ margin: 0 }}>
        {product.name}
      </Title>

      <Descriptions column={{ xs: 1, sm: 1, md: 2 }} bordered size="small">
        <Descriptions.Item label="Price">{formatMoney(product.price)}</Descriptions.Item>
        <Descriptions.Item label="In stock">{stock > 0 ? stock : <Text type="danger">Out of stock</Text>}</Descriptions.Item>
        {product.supplier?.name ? (
          <Descriptions.Item label="Supplier" span={2}>
            {product.supplier.name}
          </Descriptions.Item>
        ) : null}
        {product.description ? (
          <Descriptions.Item label="Description" span={2}>
            {product.description}
          </Descriptions.Item>
        ) : null}
      </Descriptions>

      {!user ? (
        <Alert
          type="info"
          showIcon
          message="Log in as a customer to add items to your cart."
          action={
            <Button size="small" type="primary" onClick={() => navigate('/login', { state: { from: `/products/${product.id}` } })}>
              Log in
            </Button>
          }
        />
      ) : null}

      {user && user.role !== 'customer' ? (
        <Alert type="warning" showIcon message="Only customer accounts can shop. Suppliers manage inventory from My products." />
      ) : null}

      {user?.role === 'customer' && stock > 0 ? (
        <Space wrap align="center">
          <Text>Quantity</Text>
          <InputNumber min={1} max={stock} value={qty} onChange={(v) => setQty(v ?? 1)} />
          <Button type="primary" icon={<ShoppingCartOutlined />} loading={adding} onClick={addToCart} disabled={!canBuy}>
            Add to cart
          </Button>
        </Space>
      ) : null}

      {user?.role === 'customer' && stock <= 0 ? (
        <Text type="secondary">This item cannot be added while out of stock.</Text>
      ) : null}
    </Space>
  )
}
