import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'

type SchemaTarget = 'body' | 'params' | 'query'

export const validator =
    (schema: ZodSchema, target: SchemaTarget = 'body') =>
    (req: Request, res: Response, next: NextFunction) => {
        const parsed = schema.parse(req[target])
        req[target] = parsed
        next()
    }
