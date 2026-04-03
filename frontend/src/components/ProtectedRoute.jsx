import { Flex, Spin } from 'antd'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute({ children, roles }) {
  const { user, ready } = useAuth()
  const location = useLocation()

  if (!ready) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 280 }}>
        <Spin size="large" tip="Loading…" />
      </Flex>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
