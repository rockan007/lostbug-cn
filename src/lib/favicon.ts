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
  for (const pattern of BLOCKED_IPV4_PATTERNS) {
    if (pattern.test(hostname)) return true
  }
  return false
}

const BROWSER_UA =
  'Mozilla/5.0 (compatible; LostBug/1.0; +https://lostbug.cn)'

// Headers that make us look like a normal browser, not a bot.
// Sites like GitHub and Canva block requests that lack these.
const FETCH_HEADERS = {
  'User-Agent': BROWSER_UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.5',
}

const CHECK_HEADERS = {
  'User-Agent': BROWSER_UA,
  'Accept': 'image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.5',
}

// Proxy env vars that Node.js undici reads. If any of these point to a
// broken local proxy, every fetch() fails.  We temporarily clear them
// during our outbound requests so favicon discovery works regardless of
// the user's shell proxy config.
const PROXY_ENV_VARS = [
  'http_proxy',
  'https_proxy',
  'HTTP_PROXY',
  'HTTPS_PROXY',
  'no_proxy',
  'NO_PROXY',
]

/**
 * fetch() wrapper that ignores system proxy settings.
 *
 * A bad proxy (e.g. `http_proxy=http://127.0.0.1:9897`) makes every
 * undici request time out.  We save & delete those env vars for the
 * duration of the request, then restore them.
 */
async function fetchNoProxy(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const saved: Record<string, string | undefined> = {}
  for (const key of PROXY_ENV_VARS) {
    saved[key] = process.env[key]
    delete process.env[key]
  }
  try {
    return await fetch(url, init)
  } finally {
    for (const key of PROXY_ENV_VARS) {
      if (saved[key] !== undefined) {
        process.env[key] = saved[key]
      } else {
        delete process.env[key]
      }
    }
  }
}

export async function discoverFavicon(websiteUrl: string): Promise<string> {
  try {
    const parsed = new URL(websiteUrl)

    // SSRF guard: only allow http/https, block private/internal hostnames
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) return ''
    if (isHostnameBlocked(parsed.hostname)) return ''

    const baseUrl = `${parsed.protocol}//${parsed.hostname}`

    // Step 1: Fetch homepage HTML and parse <link rel="icon"> tags.
    //   This is preferred because it reflects what the site owner
    //   explicitly declares as their icon.
    const html = await fetchHtml(baseUrl, 10000)
    if (html) {
      const iconUrl = parseIconLink(html, baseUrl)
      if (iconUrl) {
        // data: URIs are inline — no reachability check needed
        if (iconUrl.startsWith('data:')) return iconUrl
        const ok = await urlReachable(iconUrl, 8000)
        if (ok) return iconUrl
      }
    }

    // Step 2: Fall back to /favicon.ico (the de-facto standard path)
    const faviconUrl = `${baseUrl}/favicon.ico`
    const ok = await urlReachable(faviconUrl, 8000)
    if (ok) return faviconUrl

    // Step 3: Fall back to Google favicon service — handles sites behind
    //   Cloudflare (e.g. chatgpt.com) and other fetch-blocking scenarios
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=32`
    const googleOk = await urlReachable(googleFavicon, 8000)
    if (googleOk) return googleFavicon

    return ''
  } catch {
    return ''
  }
}

async function urlReachable(url: string, timeoutMs: number): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    // Use GET, not HEAD — some servers (GitHub, Canva) reject or
    // time out on HEAD, and favicons are small enough to be cheap.
    const res = await fetchNoProxy(url, {
      method: 'GET',
      signal: controller.signal,
      headers: CHECK_HEADERS,
    })
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
    const res = await fetchNoProxy(url, {
      signal: controller.signal,
      headers: FETCH_HEADERS,
    })
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
  // Collect all <link rel="icon"> candidates, then pick the best one.
  // We prefer a filename containing "favicon" (explicitly intended as
  // the favicon), then the smallest `sizes` dimension.
  const linkRegex = /<link\s+[^>]*>/gi
  let linkMatch: RegExpExecArray | null
  const candidates: { url: string; isFavicon: boolean; size: number }[] = []

  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const tag = linkMatch[0]

    // Must have rel="icon" or rel="shortcut icon"
    if (!/rel=["'](?:shortcut\s+)?icon["']/i.test(tag)) continue

    const hrefMatch = tag.match(/href=["']([^"']+)["']/i)
    if (!hrefMatch) continue

    try {
      const url = new URL(hrefMatch[1], baseUrl).href
      // Does the filename contain "favicon"?
      const isFavicon = /\/favicon\./i.test(url)
      // Parse sizes attribute (e.g. "128x128" → 128)
      const sizesMatch = tag.match(/sizes=["'](\d+)x\d+["']/i)
      const size = sizesMatch
        ? parseInt(sizesMatch[1], 10)
        : isFavicon
          ? 32 // assume a standard favicon is small
          : 256 // assume large touch-icon otherwise
      candidates.push({ url, isFavicon, size })
    } catch {
      continue
    }
  }

  if (candidates.length === 0) return null

  // Sort: favicon-name first, then smallest size
  candidates.sort((a, b) => {
    if (a.isFavicon !== b.isFavicon) return a.isFavicon ? -1 : 1
    return a.size - b.size
  })

  return candidates[0].url
}
