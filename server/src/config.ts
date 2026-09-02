import 'dotenv/config'
import mongoose from 'mongoose'
import { Patient, Visit } from './models'

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  adminEmail: process.env.ADMIN_EMAIL || 'doctor@example.com',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}

export async function connectDatabase() {
  if (!config.mongoUri) throw new Error('MONGODB_URI is required')
  await mongoose.connect(config.mongoUri)
  await Patient.syncIndexes()
}

export async function disconnectDatabase() { await mongoose.disconnect() }
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
