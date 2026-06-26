export async function discoverFavicon(websiteUrl: string): Promise<string> {
  try {
    const parsed = new URL(websiteUrl)
    const baseUrl = `${parsed.protocol}//${parsed.hostname}`

    // Step 1: Try HEAD /favicon.ico with 5s timeout
    const faviconUrl = `${baseUrl}/favicon.ico`
    const headOk = await headRequest(faviconUrl, 5000)
    if (headOk) return faviconUrl

    // Step 2: Fetch homepage HTML and parse <link rel="icon">
    const html = await fetchHtml(baseUrl, 5000)
    if (!html) return ''

    const iconHref = parseIconLink(html, baseUrl)
    if (iconHref) {
      // Verify the parsed icon URL is reachable
      const iconOk = await headRequest(iconHref, 3000)
      if (iconOk) return iconHref
    }

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

async function fetchHtml(url: string, timeoutMs: number): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function parseIconLink(html: string, baseUrl: string): string | null {
  // Match <link rel="icon" href="..."> or <link rel="shortcut icon" href="...">
  const regex = /<link[^>]*\brel=["'](?:shortcut\s+)?icon["'][^>]*\bhref=["']([^"']+)["']/i
  const match = html.match(regex)
  if (!match) return null

  const href = match[1]
  // Resolve relative URLs
  try {
    return new URL(href, baseUrl).href
  } catch {
    return null
  }
}
