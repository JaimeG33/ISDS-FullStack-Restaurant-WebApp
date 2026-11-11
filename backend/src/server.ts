import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'
import { allowedOrigins, createApi } from './api.js'
import { closeDatabase, readConnectionTest } from './database.js'

const api = createApi(readConnectionTest, allowedOrigins())
const port = Number(process.env.PORT ?? 3001)
const server = createServer(async (request, response) => {
  const result = await api({
    method: request.method ?? 'GET',
    path: (request.url ?? '/').split('?')[0],
    origin: request.headers.origin,
    requestId: randomUUID(),
  })
  response.writeHead(result.statusCode, result.headers)
  response.end(result.body)
})
server.listen(port, '127.0.0.1', () => console.log(`BurgerLab API listening on http://localhost:${port}`))

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    server.close(() => { void closeDatabase() })
  })
}
