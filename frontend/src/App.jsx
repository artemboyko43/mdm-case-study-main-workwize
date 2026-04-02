import { useEffect, useState } from 'react'
import './App.css'

const apiBase = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

function App() {
  const [apiStatus, setApiStatus] = useState('checking…')
  const [apiError, setApiError] = useState(null)

  useEffect(() => {
    const url = `${apiBase.replace(/\/$/, '')}/api/health`
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        setApiStatus(data.status === 'ok' ? 'connected' : JSON.stringify(data))
        setApiError(null)
      })
      .catch((err) => {
        setApiStatus('unreachable')
        setApiError(err.message)
      })
  }, [])

  return (
    <div className="app">
      <header className="top">
        <h1>Multi-supplier shop</h1>
        <p className="lede">React (Vite) + Laravel API scaffold</p>
      </header>
      <main className="panel">
        <h2>API</h2>
        <p>
          <span className={`pill pill-${apiStatus === 'connected' ? 'ok' : 'warn'}`}>
            {apiStatus}
          </span>
        </p>
        <p className="meta">
          <code>{apiBase}/api/health</code>
        </p>
        {apiError ? (
          <p className="error" role="alert">
            {apiError}. Start the backend with{' '}
            <code>cd backend; php artisan serve</code>.
          </p>
        ) : null}
      </main>
    </div>
  )
}

export default App
