const ALLOWED_PROTOCOLS = ['http:', 'https:']

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  '0.0.0.0',
  '127.0.0.1',
  '[::1]',
])

// IPv4 private/reserved ranges that block SSRF
const BLOCKED_IPV4_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\./,
]

function isHostnameBlocked(hostname: string): boolean {
  if (BLOCKED_HOSTNAMES.has(hostname)) return true
  // Block bare IPv4 addresses in private/reserved ranges
  for (const pattern of BLOCKED_IPV4_PATTERNS) {
    if (pattern.test(hostname)) return true
  }
  return false
}

export async function discoverFavicon(websiteUrl: string): Promise<string> {
  try {
    const parsed = new URL(websiteUrl)

    // SSRF guard: only allow http/https, block private/internal hostnames
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) return ''
    if (isHostnameBlocked(parsed.hostname)) return ''

    const baseUrl = `${parsed.protocol}//${parsed.hostname}`

    // Step 1: Try HEAD /favicon.ico with 5s timeout
    const faviconUrl = `${baseUrl}/favicon.ico`
    const headOk = await headRequest(faviconUrl, 5000)
    if (headOk) return faviconUrl

    // Step 2: Fetch homepage HTML and parse <link rel="icon">
    const html = await fetchHtml(baseUrl, 5000)
    if (!html) return ''

    const iconHref = parseIconLink(html, baseUrl)
    if (!iconHref) return ''

    // data: URIs don't need reachability verification
    if (iconHref.startsWith('data:')) return iconHref

    // Step 3: Verify the parsed icon URL is reachable
    const iconOk = await headRequest(iconHref, 3000)
    if (iconOk) return iconHref

    return ''
  } catch {
    return ''
  }
}

async function headRequest(url: string, timeoutMs: number): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
    clearTimeout(timer)
    return res.ok
  } catch {
    return false
  }
}

const MAX_HTML_SIZE = 2 * 1024 * 1024 // 2MB cap to prevent memory exhaustion

async function fetchHtml(url: string, timeoutMs: number): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    const text = await res.text()
    if (text.length > MAX_HTML_SIZE) return null
    return text
  } catch {
    return null
  }
}

function parseIconLink(html: string, baseUrl: string): string | null {
  // Extract all <link> tags, then check each for rel=icon and an href.
  // This handles both rel-before-href and href-before-rel orderings.
  const linkRegex = /<link\s+[^>]*>/gi
  let linkMatch: RegExpExecArray | null
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const tag = linkMatch[0]
    // Must have rel="icon" or rel="shortcut icon"
    if (!/rel=["'](?:shortcut\s+)?icon["']/i.test(tag)) continue
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i)
    if (!hrefMatch) continue

    try {
      return new URL(hrefMatch[1], baseUrl).href
    } catch {
      continue
    }
  }
  return null
}
