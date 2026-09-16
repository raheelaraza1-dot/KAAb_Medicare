export function initials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'P'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

export function formatMoney(value) {
  const n = Number(value) || 0
  return `PKR ${n.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatNumber(value) {
  return (Number(value) || 0).toLocaleString('en-US')
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function patientCode(id = '') {
  const raw = String(id).replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase()
  return `KAAB-${raw || '0000'}`
}

export function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d
}

export function isSameDay(a, b) {
  const d1 = new Date(a)
  const d2 = new Date(b)
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()
}

export function formatDayLabel(date = new Date()) {
  const d = new Date(date)
  if (isSameDay(d, new Date())) return 'Today'
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (isSameDay(d, yesterday)) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export function getCompletedMonths(count = 6) {
  const months = []
  const now = new Date()
  for (let i = 1; i <= count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      start: startOfMonth(d),
      end: endOfMonth(d),
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    })
  }
  return months
}

export function getMonthsOfYear(year = new Date().getFullYear()) {
  const months = []
  for (let m = 0; m < 12; m++) {
    const d = new Date(year, m, 1)
    months.push({
      start: startOfMonth(d),
      end: endOfMonth(d),
      label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    })
  }
  return months
}

export function isoDate(date) {
  return new Date(date).toISOString()
}

/** YYYY-MM-DD in the user's local timezone (for `<input type="date">`). */
export function toLocalDateString(date = new Date()) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function lineProfit(sellingPrice, tradePrice, quantity) {
  return ((Number(sellingPrice) || 0) - (Number(tradePrice) || 0)) * (Number(quantity) || 0)
}

export function visitCheckupFee(visit = {}) {
  return Number(visit.checkupFee) || 0
}

export function visitTradeTotal(visit = {}) {
  if (visit.visitTotalTradePrice != null) return Number(visit.visitTotalTradePrice) || 0
  return (visit.medicines || []).reduce(
    (sum, m) => sum + (Number(m.tradePrice) || 0) * (Number(m.quantity) || 0),
    0,
  )
}

export function visitSellingTotal(visit = {}) {
  if (visit.visitTotalSellingPrice != null) return Number(visit.visitTotalSellingPrice) || 0
  return (visit.medicines || []).reduce(
    (sum, m) => sum + (Number(m.sellingPrice) || 0) * (Number(m.quantity) || 0),
    0,
  )
}

export function medicineScheduleLabel(medicine = {}) {
  const parts = []
  if (medicine.morning) parts.push('Morning')
  if (medicine.noon) parts.push('Noon')
  if (medicine.night) parts.push('Night')
  return parts.length ? parts.join(' · ') : '—'
}

export function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? '')
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
        })
        .join(','),
    )
    .join('\n')
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
