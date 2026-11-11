import { readFile, writeFile } from 'node:fs/promises'
import { zipSync } from 'fflate'

const ca = await readFile('certs/global-bundle.pem')
const handler = await readFile('dist/lambda.cjs')
await writeFile('dist/burgerlab-api.zip', zipSync({
  'lambda.cjs': handler,
  'certs/global-bundle.pem': ca,
}))
console.log('Created backend/dist/burgerlab-api.zip with the handler and RDS CA bundle.')
