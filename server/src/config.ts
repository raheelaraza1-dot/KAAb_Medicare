import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { Admin, Patient, Visit } from './models'

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  adminEmail: process.env.ADMIN_EMAIL || 'doctor@example.com',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global.__mongooseCache ?? { conn: null, promise: null }
if (!global.__mongooseCache) global.__mongooseCache = cached

let indexesSynced = false
let adminSeeded = false

export async function connectDatabase() {
  if (!config.mongoUri) throw new Error('MONGODB_URI is required in environment variables')

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.mongoUri).catch((err) => {
      cached.promise = null
      throw err
    })
  }

  cached.conn = await cached.promise

  if (!indexesSynced) {
    await Patient.syncIndexes().catch(() => {})
    indexesSynced = true
  }

  if (!adminSeeded && config.adminPassword) {
    try {
      const existing = await Admin.findOne({ email: config.adminEmail })
      if (!existing) {
        const hash = await bcrypt.hash(config.adminPassword, 12)
        await Admin.create({ email: config.adminEmail, passwordHash: hash })
      }
      adminSeeded = true
    } catch {
      // Ignore initial seed errors
    }
  }

  return cached.conn
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
  cached.conn = null
  cached.promise = null
  indexesSynced = false
}
export function requireConfig() {
  if (!config.jwtSecret) throw new Error('JWT_SECRET is required')
}
export const isDbReady = () => mongoose.connection.readyState === 1

export const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
export const lineProfit = (sellingPrice: number, tradePrice: number, quantity: number) => roundMoney((sellingPrice - tradePrice) * quantity)

export async function syncPatientAggregates(patientId: string) {
  const visits = await Visit.find({ patientId })
  const totalVisits = visits.length
  const totalProfit = roundMoney(visits.reduce((sum, v) => sum + v.visitTotalProfit, 0))
  await Patient.updateOne({ _id: patientId }, { totalVisits, totalProfit })
}
