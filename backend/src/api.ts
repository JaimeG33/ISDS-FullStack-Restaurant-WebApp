import type { CatalogResult } from './catalog.js'

interface ApiRequest {
  method: string
  path: string
  origin?: string
  requestId: string
}

export interface ApiResponse {
  statusCode: number
  headers: Record<string, string>
  body: string
}

const safeCodes = new Set([
  'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ER_ACCESS_DENIED_ERROR',
  'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_BAD_FIELD_ERROR',
  'PROTOCOL_SEQUENCE_TIMEOUT', 'CERT_HAS_EXPIRED', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
  'AccessDeniedException', 'ResourceNotFoundException',
])

export function createApi(
  readCatalog: () => Promise<CatalogResult>,
  allowedOrigins: string[],
  logError: (details: Record<string, string>) => void = (details) => console.error(JSON.stringify(details)),
) {
  return async (request: ApiRequest): Promise<ApiResponse> => {
    const headers: Record<string, string> = {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      vary: 'Origin',
    }
    if (request.origin && allowedOrigins.includes(request.origin)) {
      headers['access-control-allow-origin'] = request.origin
      headers['access-control-allow-methods'] = 'GET, OPTIONS'
    }
    const reply = (statusCode: number, body: unknown): ApiResponse => ({
      statusCode, headers, body: JSON.stringify(body),
    })
    if (request.origin && !allowedOrigins.includes(request.origin)) {
      return reply(403, { message: 'Origin is not allowed.' })
    }
    if (!['/api/health', '/api/catalog/connection-test'].includes(request.path)) {
      return reply(404, { message: 'Route not found.' })
    }
    if (request.method === 'OPTIONS') return { statusCode: 204, headers, body: '' }
    if (request.method !== 'GET') {
      headers.allow = 'GET, OPTIONS'
      return reply(405, { message: 'Method not allowed.' })
    }
    if (request.path === '/api/health') return reply(200, { status: 'ok' })
    try {
      return reply(200, { ...await readCatalog(), requestId: request.requestId })
    } catch (error) {
      const failure = error as { code?: string; name?: string } | null
      const code = failure?.code ?? failure?.name ?? ''
      logError({
        event: 'catalog_connection_failed',
        requestId: request.requestId,
        code: safeCodes.has(code) ? code : 'DATABASE_UNAVAILABLE',
      })
      return reply(503, { status: 'unavailable', message: 'Catalog connection is unavailable.', requestId: request.requestId })
    }
  }
}

export function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS ?? '').split(',').map((origin) => origin.trim()).filter(Boolean)
}
