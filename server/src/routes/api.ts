import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express-serve-static-core'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { Admin, Patient, Visit } from '../models'
import { config, syncPatientAggregates } from '../config'
import { auth } from '../middleware/auth'

const router = Router()

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const medicine = z.object({
  medicineName: z.string().min(1),
  tradePrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  quantity: z.number().nonnegative().default(1),
  morning: z.boolean().optional().default(false),
  noon: z.boolean().optional().default(false),
  night: z.boolean().optional().default(false),
})

const patient = z.object({
  name: z.string().min(1),
  phone: z.string().optional().default(''),
  age: z.number().int().nonnegative().max(150).optional(),
  gender: z.string().optional().default(''),
  address: z.string().optional().default(''),
})

const visit = z.object({
  visitDate: z.coerce.date().optional(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  checkupFee: z.number().nonnegative().optional().default(0),
  medicines: z.array(medicine).default([]),
})

router.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body)
    const admin = await Admin.findOne({ email: body.email })
    if (!admin || !(await bcrypt.compare(body.password, admin.passwordHash))) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } })
    }
    res.json({
      data: {
        token: jwt.sign({ sub: admin.id, email: admin.email }, process.env.JWT_SECRET || config.jwtSecret, {
          expiresIn: '8h',
        }),
      },
    })
  } catch (e) {
    next(e)
  }
})

router.use(auth)

router.post('/patients', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await Patient.create(patient.parse(req.body))
    res.status(201).json({ data: p })
  } catch (e) {
    next(e)
  }
})

router.get('/patients', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = String(req.query.search || '').trim()
    if (search) {
      const escaped = escapeRegex(search)
      const filter = {
        $or: [
          { name: { $regex: escaped, $options: 'i' } },
          { phone: { $regex: escaped, $options: 'i' } },
        ],
      }
      let query = Patient.find(filter).sort({ name: 1 })
      const limit = Number(req.query.limit)
      if (Number.isFinite(limit) && limit > 0) query = query.limit(Math.min(limit, 25))
      return res.json({ data: await query })
    }
    res.json({ data: await Patient.find({}).sort({ createdAt: -1 }) })
  } catch (e) {
    next(e)
  }
})

router.get('/patients/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await Patient.findById(req.params.id)
    if (!p) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found' } })
    const visits = await Visit.find({ patientId: p._id }).sort({ visitDate: -1 })
    res.json({ data: { patient: p, visits } })
  } catch (e) {
    next(e)
  }
})

router.put('/patients/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await Patient.findByIdAndUpdate(req.params.id, patient.partial().parse(req.body), {
      new: true,
      runValidators: true,
    })
    if (!p) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found' } })
    res.json({ data: p })
  } catch (e) {
    next(e)
  }
})

router.delete('/patients/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const p = await Patient.findById(req.params.id)
    if (!p) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found' } })
    await Visit.deleteMany({ patientId: p._id })
    await Patient.findByIdAndDelete(p._id)
    res.json({ data: { deleted: true } })
  } catch (e) {
    next(e)
  }
})

router.post('/patients/:id/visits', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = visit.parse(req.body)
    const p = await Patient.findById(req.params.id)
    if (!p) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Patient not found' } })
    const v = await Visit.create({ ...data, patientId: p._id })
    await syncPatientAggregates(String(p._id))
    res.status(201).json({ data: v })
  } catch (e) {
    next(e)
  }
})

router.put('/patients/:patientId/visits/:visitId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = visit.partial().parse(req.body)
    const v = await Visit.findOne({ _id: req.params.visitId, patientId: req.params.patientId })
    if (!v) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Visit not found' } })
    if (data.visitDate !== undefined) v.visitDate = data.visitDate
    if (data.diagnosis !== undefined) v.diagnosis = data.diagnosis
    if (data.notes !== undefined) v.notes = data.notes
    if (data.checkupFee !== undefined) v.checkupFee = data.checkupFee
    if (data.medicines !== undefined) v.medicines = data.medicines
    await v.save()
    await syncPatientAggregates(String(req.params.patientId))
    res.json({ data: v })
  } catch (e) {
    next(e)
  }
})

router.get('/medicines/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = String(req.query.q || '').trim()
    if (!q) {
      return res.json({ data: [] })
    }
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const results = await Visit.aggregate([
      { $unwind: '$medicines' },
      { $match: { 'medicines.medicineName': { $regex: escaped, $options: 'i' } } },
      { $sort: { visitDate: -1 } },
      {
        $group: {
          _id: { $toLower: '$medicines.medicineName' },
          medicineName: { $first: '$medicines.medicineName' },
          tradePrice: { $first: '$medicines.tradePrice' },
          sellingPrice: { $first: '$medicines.sellingPrice' },
        },
      },
      { $sort: { medicineName: 1 } },
      { $limit: 15 },
    ])
    res.json({ data: results })
  } catch (e) {
    next(e)
  }
})

router.delete('/patients/:patientId/visits/:visitId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const v = await Visit.findOneAndDelete({ _id: req.params.visitId, patientId: req.params.patientId })
    if (!v) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Visit not found' } })
    await syncPatientAggregates(String(req.params.patientId))
    res.json({ data: { deleted: true } })
  } catch (e) {
    next(e)
  }
})

router.get('/reports/summary', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const from = req.query.from ? new Date(String(req.query.from)) : new Date(0)
    const to = req.query.to ? new Date(String(req.query.to)) : new Date()
    const [summary, top, byDay] = await Promise.all([
      Visit.aggregate([
        { $match: { visitDate: { $gte: from, $lte: to } } },
        {
          $addFields: {
            _tradeTotal: {
              $sum: {
                $map: {
                  input: '$medicines',
                  as: 'm',
                  in: { $multiply: ['$$m.tradePrice', '$$m.quantity'] },
                },
              },
            },
            _sellingTotal: {
              $sum: {
                $map: {
                  input: '$medicines',
                  as: 'm',
                  in: { $multiply: ['$$m.sellingPrice', '$$m.quantity'] },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalProfit: { $sum: '$visitTotalProfit' },
            totalTradePrice: { $sum: '$_tradeTotal' },
            totalSellingPrice: { $sum: '$_sellingTotal' },
            totalVisits: { $sum: 1 },
          },
        },
      ]),
      Visit.aggregate([
        { $match: { visitDate: { $gte: from, $lte: to } } },
        { $unwind: '$medicines' },
        {
          $group: {
            _id: '$medicines.medicineName',
            profit: { $sum: '$medicines.profit' },
            quantity: { $sum: '$medicines.quantity' },
          },
        },
        { $sort: { profit: -1 } },
        { $limit: 10 },
      ]),
      Visit.aggregate([
        { $match: { visitDate: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDate' } },
            profit: { $sum: '$visitTotalProfit' },
            visits: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])
    res.json({
      data: {
        summary: summary[0] || { totalProfit: 0, totalTradePrice: 0, totalSellingPrice: 0, totalVisits: 0 },
        topMedicines: top,
        byDay,
      },
    })
  } catch (e) {
    next(e)
  }
})

export default router
