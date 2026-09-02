import type { Request, Response, NextFunction } from 'express-serve-static-core'
import jwt from 'jsonwebtoken'
import { config } from '../config'

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Bearer token required' } })
  }
  try {
    ;(req as any).admin = jwt.verify(token, process.env.JWT_SECRET || config.jwtSecret)
    next()
  } catch {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } })
  }
}

export function errors(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err.status || (err.name === 'ZodError' ? 400 : 500)
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: status === 500 ? 'Internal server error' : err.message,
      details: err.issues,
    },
  })
}
