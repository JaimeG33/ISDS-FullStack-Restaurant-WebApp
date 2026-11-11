import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createApi } from '../src/api.js'
import { catalogResponse, type CatalogRow } from '../src/catalog.js'

const row = {
  catalogVersion: '9007199254740993',
  menuItemId: 101,
  name: 'Classic Cheeseburger',
  variantId: 201,
  variantName: 'Standard',
  price: '6.49',
} as CatalogRow
const request = {
  method: 'GET', path: '/api/catalog/connection-test',
  origin: 'http://localhost:5173', requestId: 'test-request',
}

test('health does not access the database', async () => {
  const api = createApi(async () => { throw new Error('Must not query') }, [request.origin])
  const response = await api({ ...request, path: '/api/health' })
  assert.equal(response.statusCode, 200)
  assert.deepEqual(JSON.parse(response.body), { status: 'ok' })
})

test('catalog keeps price and large version exact and queries each request', async () => {
  let reads = 0
  const api = createApi(async () => { reads++; return catalogResponse(row) }, [request.origin])
  const response = await api(request)
  await api(request)
  const body = JSON.parse(response.body)
  assert.equal(reads, 2)
  assert.equal(body.product.price, '6.49')
  assert.equal(body.catalogVersion, '9007199254740993')
  assert.equal(body.empty, false)
  assert.equal(response.headers['cache-control'], 'no-store')
  assert.equal(response.headers['access-control-allow-origin'], request.origin)
})

test('empty catalog is a successful database connection', async () => {
  const empty = { catalogVersion: null, menuItemId: null, name: null, variantId: null, variantName: null, price: null } as CatalogRow
  const api = createApi(async () => catalogResponse(empty), [request.origin])
  const response = await api(request)
  assert.equal(response.statusCode, 200)
  assert.deepEqual(JSON.parse(response.body), {
    status: 'connected', catalogKey: 'public_catalog', catalogVersion: null,
    empty: true, product: null, requestId: request.requestId,
  })
})

test('failures expose only safe diagnostics and the request ID', async () => {
  const logs: Record<string, string>[] = []
  const api = createApi(async () => {
    throw Object.assign(new Error('secret password at private-host'), { code: 'ER_ACCESS_DENIED_ERROR', sql: 'private SQL' })
  }, [request.origin], (entry) => logs.push(entry))
  const response = await api(request)
  assert.equal(response.statusCode, 503)
  assert.equal(JSON.parse(response.body).requestId, request.requestId)
  assert.deepEqual(logs, [{ event: 'catalog_connection_failed', requestId: 'test-request', code: 'ER_ACCESS_DENIED_ERROR' }])
  assert.doesNotMatch(response.body, /secret|private|password|SQL/)
})

test('CORS allows configured origins and rejects others before querying', async () => {
  const api = createApi(async () => { throw new Error('Must not query') }, [request.origin])
  const denied = await api({ ...request, origin: 'https://unrelated.example' })
  assert.equal(denied.statusCode, 403)
  assert.equal(denied.headers['access-control-allow-origin'], undefined)
  const options = await api({ ...request, method: 'OPTIONS' })
  assert.equal(options.statusCode, 204)
  assert.equal(options.body, '')
  assert.equal(options.headers['access-control-allow-methods'], 'GET, OPTIONS')
})

test('unknown routes and writes are rejected', async () => {
  const api = createApi(async () => { throw new Error('Must not query') }, [request.origin])
  assert.equal((await api({ ...request, path: '/api/unknown' })).statusCode, 404)
  assert.equal((await api({ ...request, method: 'POST' })).statusCode, 405)
})
