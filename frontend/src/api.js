const TOKEN_KEY = 'token'

export function getApiBase() {
  return (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/$/, '')
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function apiFetch(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }
  if (options.body != null && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return fetch(`${getApiBase()}${path}`, { ...options, headers })
}

export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options)
  const text = await res.text()
  let data = {}
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = {}
    }
  }
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`)
    err.status = res.status
    err.payload = data
    throw err
  }
  return data
}

export function normalizeUser(payload) {
  if (!payload || typeof payload !== 'object') {
    return null
  }
  if (payload.data && typeof payload.data === 'object' && 'email' in payload.data) {
    return payload.data
  }
  if ('email' in payload) {
    return payload
  }
  return null
}
