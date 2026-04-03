export function formatMoney(v) {
  if (v == null || v === '') {
    return '—'
  }
  const n = Number(v)
  return Number.isFinite(n) ? n.toFixed(2) : String(v)
}

export function formatDate(iso) {
  if (!iso) {
    return '—'
  }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return String(iso)
  }
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function lineTotal(unit, qty) {
  const u = Number(unit)
  const q = Number(qty)
  if (!Number.isFinite(u) || !Number.isFinite(q)) {
    return '—'
  }
  return (u * q).toFixed(2)
}
