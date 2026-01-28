import type { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../utils/apiResponse'
import { ApiError } from '../utils/apiError'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { handlePrismaError } from '../utils/prismaError'

export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) {
        req.log.error(
            { err, path: req.path, method: req.method },
            'Error occurred after headers were sent'
        )
        return
    }

    if (err instanceof SyntaxError) {
        return res.status(400).json(new ApiResponse(400, 'Invalid JSON payload'))
    }

    if (err instanceof ApiError) {
        req.log.warn({ err, path: req.path, method: req.method, stack: err.stack }, 'API Error')
        return res
            .status(err.statusCode)
            .json(
                new ApiResponse(
                    err.statusCode,
                    err.message,
                    process.env.NODE_ENV !== 'production'
                        ? { message: err.message, stack: err.stack }
                        : undefined
                )
            )
    }

    if (err instanceof ZodError) {
        const response = handleZodError(err)
        req.log.info({ err, path: req.path, method: req.method }, 'Validation Error')
        return res.status(response.status).json(response)
    }

    if (err instanceof PrismaClientKnownRequestError) {
        const response = handlePrismaError(err)
        req.log.error(
            { err, path: req.path, method: req.method, stack: err.stack },
            'Prisma Client Error'
        )
        return res.status(response.status).json(response)
    }

    req.log.error(
        { err, path: req.path, method: req.method, stack: err.stack },
        `Unhandled error: ${err.message}`
    )

    return res
        .status(500)
        .json(
            new ApiResponse(
                500,
                'Internal Server Error',
                process.env.NODE_ENV !== 'production'
                    ? { message: err.message, stack: err.stack }
                    : undefined
            )
        )
}

const handleZodError = (err: ZodError): ApiResponse => {
    const firstIssue = err.issues[0]

    if (firstIssue?.code === 'invalid_type') {
        return new ApiResponse(
            400,
            `${firstIssue.path.join('.')} should be of type ${firstIssue.expected}`,
            process.env.NODE_ENV !== 'production'
                ? { message: err.message, stack: err.stack }
                : undefined
        )
    }

    return new ApiResponse(
        400,
        firstIssue?.message || 'Validation Error',
        process.env.NODE_ENV !== 'production'
            ? { message: err.message, stack: err.stack }
            : undefined
    )
}
