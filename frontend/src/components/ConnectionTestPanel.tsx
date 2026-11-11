import { useEffect, useState } from 'react'
import './connection-test.css'

interface ConnectionResult {
  status: 'connected'
  catalogKey: 'public_catalog'
  catalogVersion: string | null
  empty: boolean
  product: {
    menuItemId: number
    name: string
    variantId: number
    variantName: string
    price: string
  } | null
}

type PanelState =
  | { status: 'loading' }
  | { status: 'connected'; result: ConnectionResult }
  | { status: 'unavailable'; message: string; requestId?: string }

function isConnectionResult(value: unknown): value is ConnectionResult {
  if (!value || typeof value !== 'object') return false
  const result = value as ConnectionResult
  if (result.status !== 'connected' || result.catalogKey !== 'public_catalog') return false
  if (result.catalogVersion !== null && typeof result.catalogVersion !== 'string') return false
  if (result.empty === true) return result.product === null
  return result.empty === false && !!result.product &&
    typeof result.product.name === 'string' &&
    typeof result.product.variantName === 'string' &&
    typeof result.product.price === 'string' && /^\d+\.\d{2}$/.test(result.product.price)
}

export function ConnectionTestPanel() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<PanelState>({ status: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const timeout = window.setTimeout(() => controller.abort(), 25000)
    async function checkConnection() {
      setState({ status: 'loading' })
      const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '')
      if (!baseUrl) {
        setState({ status: 'unavailable', message: 'Set VITE_API_BASE_URL to enable the connection test.' })
        window.clearTimeout(timeout)
        return
      }
      try {
        const response = await fetch(`${baseUrl}/api/catalog/connection-test`, {
          signal: controller.signal,
          cache: 'no-store',
          credentials: 'omit',
        })
        const body: unknown = await response.json()
        if (!active) return
        if (!response.ok || !isConnectionResult(body)) {
          const requestId = (body as { requestId?: unknown } | null)?.requestId
          setState({
            status: 'unavailable',
            message: 'The database connection could not be verified. Try again.',
            requestId: typeof requestId === 'string' && /^[\w-]{1,80}$/.test(requestId) ? requestId : undefined,
          })
          return
        }
        setState({ status: 'connected', result: body })
      } catch {
        if (active) setState({ status: 'unavailable', message: 'The API could not be reached. Check its URL and connection settings.' })
      } finally {
        window.clearTimeout(timeout)
      }
    }
    // Defer so React StrictMode's setup/cleanup check does not send a duplicate request.
    const start = window.setTimeout(() => { void checkConnection() }, 0)
    return () => {
      active = false
      window.clearTimeout(start)
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [attempt])

  return (
    <aside className="connection-test" aria-labelledby="connection-test-title">
      <h2 id="connection-test-title">Database connection test</h2>
      <div role="status" aria-live="polite" aria-atomic="true">
        {state.status === 'loading' && <p>Checking database connection…</p>}
        {state.status === 'unavailable' && <>
          <p className="connection-test__error">Unavailable</p>
          <p>{state.message}</p>
          {state.requestId && <p className="connection-test__request">Request {state.requestId}</p>}
        </>}
        {state.status === 'connected' && <>
          <p className="connection-test__success">Connected to database</p>
          {state.result.product
            ? <p><strong>{state.result.product.name}</strong><br />{state.result.product.variantName} · ${state.result.product.price}</p>
            : <p>No active products with available variants were returned.</p>}
          <p>Catalog version {state.result.catalogVersion ?? 'has not been set'}</p>
        </>}
      </div>
      <button type="button" className="btn btn--md btn--secondary" disabled={state.status === 'loading'} onClick={() => {
        setState({ status: 'loading' })
        setAttempt((value) => value + 1)
      }}>Retry</button>
    </aside>
  )
}
