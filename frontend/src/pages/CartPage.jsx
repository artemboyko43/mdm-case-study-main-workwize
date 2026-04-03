import { DeleteOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { Button, InputNumber, Popconfirm, Space, Table, Typography, message } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch, apiJson } from '../api'
import { formatMoney, lineTotal } from '../formatters'

const { Text, Title } = Typography

export default function CartPage() {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const json = await apiJson('/api/cart')
      setRows(Array.isArray(json.data) ? json.data : [])
    } catch (e) {
      message.error(e.message || 'Could not load cart')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const subtotal = useMemo(() => {
    let sum = 0
    for (const r of rows) {
      const p = r.product
      if (!p) {
        continue
      }
      const u = Number(p.price)
      const q = Number(r.quantity)
      if (Number.isFinite(u) && Number.isFinite(q)) {
        sum += u * q
      }
    }
    return sum.toFixed(2)
  }, [rows])

  async function updateQuantity(cartItemId, quantity) {
    const q = Math.max(1, Number(quantity))
    try {
      await apiJson(`/api/cart/items/${cartItemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: q }),
      })
      await load()
    } catch (e) {
      message.error(e.message || 'Could not update quantity')
      await load()
    }
  }

  async function removeItem(cartItemId) {
    try {
      const res = await apiFetch(`/api/cart/items/${cartItemId}`, { method: 'DELETE' })
      if (!res.ok) {
        const text = await res.text()
        let data = {}
        if (text) {
          try {
            data = JSON.parse(text)
          } catch {
            /* ignore */
          }
        }
        throw new Error(data.message || 'Could not remove item')
      }
      message.success('Removed from cart')
      await load()
    } catch (e) {
      message.error(e.message || 'Could not remove item')
    }
  }

  async function checkout() {
    if (rows.length === 0) {
      return
    }
    setCheckoutLoading(true)
    try {
      const json = await apiJson('/api/checkout', { method: 'POST' })
      const order = json.data ?? json
      message.success('Order placed')
      navigate(`/orders/${order.id}`)
    } catch (e) {
      const cartErrs = e.payload?.errors?.cart
      const msg = Array.isArray(cartErrs) ? cartErrs.join(' ') : e.message
      message.error(msg || 'Checkout failed')
    } finally {
      setCheckoutLoading(false)
    }
  }

  const columns = [
    {
      title: 'Product',
      key: 'product',
      render: (_, r) =>
        r.product ? <Link to={`/products/${r.product.id}`}>{r.product.name}</Link> : '—',
    },
    {
      title: 'Supplier',
      key: 'supplier',
      width: 140,
      ellipsis: true,
      render: (_, r) => r.product?.supplier?.name ?? '—',
    },
    {
      title: 'Unit',
      key: 'price',
      width: 100,
      align: 'right',
      render: (_, r) => formatMoney(r.product?.price),
    },
    {
      title: 'Qty',
      key: 'qty',
      width: 140,
      render: (_, r) => (
        <InputNumber
          min={1}
          max={Math.max(r.product?.stock_quantity ?? 1, 1)}
          value={r.quantity}
          onChange={(v) => {
            if (v != null) {
              updateQuantity(r.id, v)
            }
          }}
        />
      ),
    },
    {
      title: 'Line',
      key: 'line',
      width: 100,
      align: 'right',
      render: (_, r) => lineTotal(r.product?.price, r.quantity),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, r) => (
        <Popconfirm title="Remove this line?" onConfirm={() => removeItem(r.id)} okText="Remove" cancelText="Cancel">
          <Button type="link" danger size="small" icon={<DeleteOutlined />}>
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <ShoppingCartOutlined /> Cart
          </Title>
          <Text type="secondary">Adjust quantities, then place one order for all lines.</Text>
        </div>
        <Button type="primary" size="large" disabled={rows.length === 0} loading={checkoutLoading} onClick={checkout}>
          Checkout
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: 'Your cart is empty. Browse products to add items.' }}
      />

      {rows.length > 0 ? (
        <div style={{ textAlign: 'right' }}>
          <Text strong style={{ fontSize: 16 }}>
            Estimated total: {subtotal}
          </Text>
        </div>
      ) : null}
    </Space>
  )
}
