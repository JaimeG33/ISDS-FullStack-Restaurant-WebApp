import { mkdir, writeFile } from 'node:fs/promises'
import { X509Certificate } from 'node:crypto'

const url = 'https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem'
const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
if (!response.ok) throw new Error(`RDS certificate download failed with HTTP ${response.status}`)
const bundle = await response.text()
const certificates = bundle.match(/-----BEGIN CERTIFICATE-----[\s\S]+?-----END CERTIFICATE-----/g)
if (!certificates?.length) throw new Error('RDS response did not contain certificates')
for (const certificate of certificates) new X509Certificate(certificate)
await mkdir('certs', { recursive: true })
await writeFile('certs/global-bundle.pem', bundle)
console.log('Saved the public AWS RDS CA bundle to backend/certs/global-bundle.pem.')
