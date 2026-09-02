import type { IncomingMessage, ServerResponse } from 'http'
import { app } from '../server/src/app'
import { connectDatabase, requireConfig } from '../server/src/config'

let initPromise: Promise<void> | null = null

function ensureReady() {
  if (!initPromise) {
    initPromise = (async () => {
      requireConfig()
      await connectDatabase()
    })().catch((error) => {
      initPromise = null
      throw error
    })
  }
  return initPromise
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureReady()
  } catch (error) {
    console.error('API initialization failed:', error)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }))
    return
  }

  return new Promise<void>((resolve, reject) => {
    res.on('finish', () => resolve())
    res.on('close', () => resolve())
    res.on('error', reject)
    app(req, res)
  })
}
