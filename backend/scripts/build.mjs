import { mkdir } from 'node:fs/promises'
import { build } from 'esbuild'

await mkdir('dist', { recursive: true })
await build({
  entryPoints: ['src/lambda.ts'],
  outfile: 'dist/lambda.cjs',
  platform: 'node',
  target: 'node24',
  format: 'cjs',
  bundle: true,
})
