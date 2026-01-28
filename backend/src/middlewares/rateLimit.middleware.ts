import rateLimit from 'express-rate-limit'
import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/apiError'

export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    legacyHeaders: false,
    standardHeaders: true,
    handler: (req: Request, res: Response, next: NextFunction) => {
        next(new ApiError(429, 'Too many requests, please slow down.'))
    },
})
