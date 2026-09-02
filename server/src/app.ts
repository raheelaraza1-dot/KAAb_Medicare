import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import api from './routes/api'
import { errors } from './middleware/auth'
import { isDbReady } from './config'

export const app = express()

app.use(helmet())

const corsOrigin = process.env.CORS_ORIGIN
const allowedOrigins = corsOrigin
  ? corsOrigin.split(',').map((s) => s.trim())
  : ['http://localhost:3000', 'http://localhost:4000', 'https://kaab-medicare.vercel.app']

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (!corsOrigin || corsOrigin === '*' || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true)
      }
      return callback(null, true)
    },
    credentials: true,
  })
)

app.use(express.json({ limit: '1mb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true }))

app.get('/health', (_req, res) => res.json({ status: 'ok', database: isDbReady() ? 'connected' : 'disconnected' }))
app.use('/api', api)
app.use(errors)
