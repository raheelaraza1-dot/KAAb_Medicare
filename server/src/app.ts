import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import api from './routes/api'
import { errors } from './middleware/auth'
import { isDbReady } from './config'
export const app=express(); app.use(helmet()); app.use(cors({origin:process.env.CORS_ORIGIN||'http://localhost:3000'})); app.use(express.json({limit:'1mb'})); app.use(rateLimit({windowMs:15*60*1000,max:200,standardHeaders:true})); app.get('/health',(_req,res)=>res.json({status:'ok',database:isDbReady()?'connected':'disconnected'})); app.use('/api',api); app.use(errors)
