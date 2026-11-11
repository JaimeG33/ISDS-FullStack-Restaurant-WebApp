import { readFile } from 'node:fs/promises'
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager'
import { createPool, type Pool } from 'mysql2/promise'
import { catalogResponse, connectionTestSql, type CatalogRow } from './catalog.js'

const credentialTtlMs = 5 * 60 * 1000
const secrets = new SecretsManagerClient({
  maxAttempts: 2,
  requestHandler: { connectionTimeout: 2000, requestTimeout: 3000 },
})
let pool: Pool | undefined
let expiresAt = 0
let pending: Promise<unknown> = Promise.resolve()

function required(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') throw new Error('Invalid database configuration')
  return value
}

async function getPool() {
  if (pool && Date.now() < expiresAt) return pool
  await pool?.end()
  pool = undefined

  let config: Record<string, unknown> = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ?? '3306',
    dbname: process.env.DB_NAME ?? 'TheBurgerLab',
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }
  if (process.env.DB_SECRET_ARN) {
    const secret = await secrets.send(new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_ARN }))
    config = JSON.parse(required(secret.SecretString))
  }
  const port = Number(config.port ?? 3306)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid database configuration')
  const ca = await readFile(process.env.DB_SSL_CA_PATH ?? 'certs/global-bundle.pem', 'utf8')
  pool = createPool({
    host: required(config.host),
    port,
    database: required(config.dbname),
    user: required(config.username),
    password: required(config.password),
    ssl: { ca, rejectUnauthorized: true, verifyIdentity: true },
    connectTimeout: 5000,
    connectionLimit: 1,
    waitForConnections: true,
    queueLimit: 2,
    enableKeepAlive: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
  })
  expiresAt = Date.now() + credentialTtlMs
  return pool
}

export function readConnectionTest() {
  // Serialize reads so a credential refresh can safely close the previous pool.
  const result = pending.then(async () => {
    const database = await getPool()
    try {
      const [rows] = await database.query<CatalogRow[]>({
        sql: connectionTestSql,
        values: ['public_catalog'],
        timeout: 5000,
      })
      return catalogResponse(rows[0])
    } catch (error) {
      // Refresh credentials and connections on the next explicit request.
      expiresAt = 0
      throw error
    }
  })
  pending = result.catch(() => undefined)
  return result
}

export async function closeDatabase() {
  await pending
  await pool?.end()
  pool = undefined
}
