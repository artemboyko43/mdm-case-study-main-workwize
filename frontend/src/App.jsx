import { ConfigProvider } from 'antd'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import CartPlaceholder from './pages/CartPlaceholder'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OrdersPlaceholder from './pages/OrdersPlaceholder'
import ProductsPlaceholder from './pages/ProductsPlaceholder'
import RegisterPage from './pages/RegisterPage'
import SupplierProductsPlaceholder from './pages/supplier/SupplierProductsPlaceholder'
import SupplierSalesPlaceholder from './pages/supplier/SupplierSalesPlaceholder'
import { appTheme } from './theme'

function App() {
  return (
    <ConfigProvider theme={appTheme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPlaceholder />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute roles={['customer']}>
                    <CartPlaceholder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute roles={['customer']}>
                    <OrdersPlaceholder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supplier/products"
                element={
                  <ProtectedRoute roles={['supplier']}>
                    <SupplierProductsPlaceholder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supplier/sales"
                element={
                  <ProtectedRoute roles={['supplier']}>
                    <SupplierSalesPlaceholder />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App
