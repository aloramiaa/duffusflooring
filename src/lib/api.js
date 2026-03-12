function extractMessage(value, fallback) {
  if (!value) return fallback

  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized || fallback
  }

  if (value instanceof Error) {
    return extractMessage(value.message, fallback)
  }

  if (typeof value === 'object') {
    if ('error' in value) {
      const nested = extractMessage(value.error, '')
      if (nested) return nested
    }

    if ('message' in value) {
      const nested = extractMessage(value.message, '')
      if (nested) return nested
    }

    if ('details' in value) {
      const nested = extractMessage(value.details, '')
      if (nested) return nested
    }

    try {
      const serialized = JSON.stringify(value)
      return serialized && serialized !== '{}' ? serialized : fallback
    } catch {
      return fallback
    }
  }

  return fallback
}

// Used by AdminLogin to pre-fill the default local key and show a dev hint.
export function isLocalHost() {
  return false
}

/**
 * Resolve an API path to a full URL.
 * In production (and vercel dev) relative paths are used so the same-origin
 * serverless functions handle requests automatically.
 */
export function resolveApiPath(path) {
  // Already an absolute URL — pass through unchanged.
  if (/^https?:\/\//i.test(path)) return path

  return String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`
}

export function getErrorMessage(error, fallback = 'Request failed') {
  return extractMessage(error, fallback)
}

export async function parseApiError(response, fallback = 'Request failed') {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const payload = await response.json().catch(() => null)
    return getErrorMessage(payload, fallback)
  }

  const text = await response.text().catch(() => '')
  return getErrorMessage(text, fallback)
}