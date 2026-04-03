import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { apiFetch, apiJson } from '../../api'
import { formatMoney } from '../../formatters'

const { Text, Title } = Typography

function mapValidationToFormErrors(errors) {
  if (!errors || typeof errors !== 'object') {
    return []
  }
  return Object.entries(errors).map(([name, msgs]) => ({
    name,
    errors: [].concat(msgs).map(String),
  }))
}

export default function SupplierProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [form] = Form.useForm()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const json = await apiJson('/api/supplier/products')
      setProducts(Array.isArray(json.data) ? json.data : [])
    } catch (e) {
      message.error(e.message || 'Could not load products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({
      name: '',
      description: '',
      price: 0,
      stock_quantity: 0,
    })
    setModalOpen(true)
  }

  function openEdit(record) {
    setEditingId(record.id)
    form.setFieldsValue({
      name: record.name,
      description: record.description ?? '',
      price: record.price != null ? Number(record.price) : 0,
      stock_quantity: record.stock_quantity ?? 0,
    })
    setModalOpen(true)
  }

  async function handleDelete(id) {
    try {
      const res = await apiFetch(`/api/supplier/products/${id}`, { method: 'DELETE' })
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
        throw new Error(data.message || 'Delete failed')
      }
      message.success('Product removed')
      await load()
    } catch (e) {
      message.error(e.message || 'Delete failed')
    }
  }

  async function onModalOk() {
    try {
      const values = await form.validateFields()
      setSubmitting(true)
      const body = {
        name: values.name,
        description: values.description || null,
        price: values.price,
        stock_quantity: values.stock_quantity,
      }
      if (editingId == null) {
        await apiJson('/api/supplier/products', {
          method: 'POST',
          body: JSON.stringify(body),
        })
        message.success('Product created')
      } else {
        await apiJson(`/api/supplier/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })
        message.success('Product updated')
      }
      setModalOpen(false)
      await load()
    } catch (e) {
      if (e?.errorFields) {
        return
      }
      if (e.payload?.errors) {
        form.setFields(mapValidationToFormErrors(e.payload.errors))
      }
      message.error(e.message || 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 110,
      render: (v) => formatMoney(v),
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      width: 90,
    },
    {
      title: '',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this product?"
            description="This cannot be undone. Orders already satisfied stay in history."
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            My products
          </Title>
          <Text type="secondary">List items for the shared catalog. Shoppers see them on the Products page.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add product
        </Button>
      </div>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={products}
        pagination={false}
        locale={{ emptyText: 'No products yet — add your first one.' }}
      />

      <Modal
        title={editingId == null ? 'New product' : 'Edit product'}
        open={modalOpen}
        onOk={onModalOk}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitting}
        destroyOnHidden
        width={560}
        okText={editingId == null ? 'Create' : 'Save'}
      >
        <Form form={form} layout="vertical" requiredMark={false} style={{ marginTop: 8 }}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. Organic cotton tee" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} placeholder="Specs, sizes, materials…" />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Price is required' }]}
            extra="Amount in your store currency."
          >
            <InputNumber min={0} step={0.01} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="stock_quantity"
            label="Stock quantity"
            rules={[{ required: true, message: 'Stock is required' }]}
          >
            <InputNumber min={0} step={1} precision={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}
