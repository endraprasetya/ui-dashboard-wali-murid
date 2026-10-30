export function text(value: unknown) {
  if (value == null) return ''
  const raw = String(value).trim()
  if (raw === '-' || raw === '–' || raw === '—' || raw === 'null') return ''
  return raw
}

export function dateValue(value: unknown) {
  const raw = text(value)
  if (!raw) return 0

  const local = raw.match(
    /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/,
  )
  if (local) {
    return new Date(
      Number(local[3]),
      Number(local[2]) - 1,
      Number(local[1]),
      Number(local[4] ?? 0),
      Number(local[5] ?? 0),
      Number(local[6] ?? 0),
    ).getTime()
  }

  const parsed = Date.parse(raw)
  return Number.isNaN(parsed) ? 0 : parsed
}

export function formatDisplayDate(value: unknown) {
  const raw = text(value)
  if (!raw) return '-'

  const time = dateValue(raw)
  if (!time) return raw

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(time))
}

export function formatMonthLabel(value: unknown) {
  const raw = text(value)
  const match = raw.match(/^(\d{4})-(\d{2})$/)
  if (!match) return raw || '-'

  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(Number(match[1]), Number(match[2]) - 1, 1))
}

export function currentMonthKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date())
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  return `${year}-${month}`
}

export function currentMonthLabel() {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

export function todayLabel() {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date())
}

export function todayIso() {
  return isoFromTime(Date.now())
}

export function isoDate(value: unknown) {
  const time = dateValue(value)
  return time ? isoFromTime(time) : ''
}

function isoFromTime(time: number) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(time))
}

export function displayValue(value: unknown) {
  const raw = text(value)
  if (!raw) return '-'
  if (raw === 'true') return 'Ya'
  if (raw === 'false') return 'Tidak'
  return raw
}

export function statusClass(status: string) {
  const value = status.toLowerCase()
  if (/(lancar|selesai|lulus|mumtaz|hadir|dikerjakan)/.test(value)) {
    return 'bg-success/12 text-success-foreground'
  }
  if (/(cukup|baik|izin)/.test(value)) return 'bg-gold/20 text-gold-foreground'
  if (/(ulang|kurang|belum|gagal|alpha|alpa|sakit)/.test(value)) {
    return 'bg-destructive/10 text-destructive'
  }
  return 'bg-muted text-muted-foreground'
}

const SURAH_ARABIC: Record<string, string> = {
  'an-naba': 'النبأ',
  'an-naziat': 'النازعات',
  abasa: 'عبس',
  'at-takwir': 'التكوير',
  'al-infitar': 'الانفطار',
  'al-mutaffifin': 'المطففين',
  'al-inshiqaq': 'الانشقاق',
  'al-buruj': 'البروج',
  'at-tariq': 'الطارق',
  'al-ala': 'الأعلى',
  'al-ghashiyah': 'الغاشية',
  'al-fajr': 'الفجر',
  'al-balad': 'البلد',
  'ash-shams': 'الشمس',
  'al-lail': 'الليل',
  'ad-duha': 'الضحى',
  'ash-sharh': 'الشرح',
  'at-tin': 'التين',
  'al-alaq': 'العلق',
  'al-qadr': 'القدر',
  'al-bayyinah': 'البينة',
  'az-zalzalah': 'الزلزلة',
  'al-adiyat': 'العاديات',
  'al-qariah': 'القارعة',
  'at-takathur': 'التكاثر',
  'al-asr': 'العصر',
  'al-humazah': 'الهمزة',
  'al-fil': 'الفيل',
  quraisy: 'قريش',
  'al-maun': 'الماعون',
  'al-kautsar': 'الكوثر',
  'al-kafirun': 'الكافرون',
  'an-nasr': 'النصر',
  'al-lahab': 'اللهب',
  'al-masad': 'المسد',
  'al-ikhlas': 'الإخلاص',
  'al-falaq': 'الفلق',
  'an-nas': 'الناس',
  'al-fatihah': 'الفاتحة',
}

export function surahArabic(name: string) {
  const key = name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace('naas', 'nas')
    .replace('ikhlash', 'ikhlas')

  return SURAH_ARABIC[key] ?? null
}
