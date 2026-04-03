import { useMemo } from 'react'
import {
  AppstoreOutlined,
  HomeOutlined,
  LineChartOutlined,
  LogoutOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { Button, Layout as AntLayout, Menu, Space, Tag, Typography } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const { Header, Content } = AntLayout
const { Text } = Typography

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = useMemo(() => {
    const items = [
      { key: '/', label: 'Home', icon: <HomeOutlined /> },
      { key: '/products', label: 'Products', icon: <AppstoreOutlined /> },
    ]
    if (user?.role === 'customer') {
      items.push(
        { key: '/cart', label: 'Cart', icon: <ShoppingCartOutlined /> },
        { key: '/orders', label: 'Orders', icon: <UnorderedListOutlined /> },
      )
    }
    if (user?.role === 'supplier') {
      items.push(
        { key: '/supplier/products', label: 'My products', icon: <ShopOutlined /> },
        { key: '/supplier/sales', label: 'Sales', icon: <LineChartOutlined /> },
      )
    }
    return items
  }, [user])

  const selectedKey = useMemo(() => {
    const path = location.pathname
    const keys = menuItems.map((item) => item.key)
    const sorted = [...keys].sort((a, b) => b.length - a.length)
    const hit = sorted.find((k) => path === k || (k !== '/' && path.startsWith(`${k}/`)))
    return hit ? [hit] : []
  }, [location.pathname, menuItems])

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          paddingInline: 16,
          lineHeight: '62px',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Button
          type="text"
          size="large"
          style={{ fontWeight: 700, fontSize: 18, paddingInline: 8 }}
          onClick={() => navigate('/')}
          icon={<ShopOutlined />}
        >
          Multi-supplier
        </Button>
        <Menu
          mode="horizontal"
          selectedKeys={selectedKey}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0, border: 'none', lineHeight: '62px' }}
        />
        <Space size="middle" style={{ flexShrink: 0 }}>
          {user ? (
            <>
              <Space direction="vertical" size={0} style={{ textAlign: 'right', lineHeight: 1.3 }}>
                <Text strong ellipsis style={{ maxWidth: 160 }} title={user.name}>
                  {user.name}
                </Text>
                <Tag color={user.role === 'supplier' ? 'orange' : 'blue'} style={{ margin: 0 }}>
                  {user.role}
                </Tag>
              </Space>
              <Button type="default" icon={<LogoutOutlined />} onClick={() => logout()}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button type="text" onClick={() => navigate('/login')}>
                Log in
              </Button>
              <Button type="primary" onClick={() => navigate('/register')}>
                Register
              </Button>
            </>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '24px clamp(16px, 4vw, 48px)', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>
    </AntLayout>
  )
}
