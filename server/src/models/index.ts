import { Schema, model, models, Types } from 'mongoose'

const MedicineSchema = new Schema({
  medicineName: { type: String, required: true, trim: true },
  tradePrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 1 },
  profit: { type: Number, required: true, default: 0 },
  morning: { type: Boolean, default: false },
  noon: { type: Boolean, default: false },
  night: { type: Boolean, default: false },
}, { _id: false })

const PatientSchema = new Schema({
  name: { type: String, required: true, trim: true }, phone: { type: String, trim: true, default: '' },
  age: { type: Number, min: 0, max: 150 }, gender: String, address: String,
  createdAt: { type: Date, default: Date.now }, totalVisits: { type: Number, default: 0 }, totalProfit: { type: Number, default: 0 },
}, { timestamps: true })
PatientSchema.index({ name: 'text', phone: 'text' }, { name: 'patient_search_text' })

const VisitSchema = new Schema({
  patientId: { type: Types.ObjectId, ref: 'Patient', required: true, index: true }, visitDate: { type: Date, default: Date.now },
  diagnosis: String, notes: String, medicines: { type: [MedicineSchema], default: [] }, visitTotalProfit: { type: Number, default: 0 },
})
VisitSchema.index({ patientId: 1, visitDate: -1 })
VisitSchema.pre('validate', function() { this.medicines.forEach((m: any) => { m.profit = (m.sellingPrice - m.tradePrice) * m.quantity }); this.visitTotalProfit = this.medicines.reduce((sum: number, m: any) => sum + m.profit, 0) })

const AdminSchema = new Schema({ email: { type: String, unique: true, required: true, lowercase: true }, passwordHash: { type: String, required: true } })
export const Patient = models.Patient || model('Patient', PatientSchema)
export const Visit = models.Visit || model('Visit', VisitSchema)
export const Admin = models.Admin || model('Admin', AdminSchema)
