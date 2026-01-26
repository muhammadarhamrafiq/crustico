import type { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../utils/apiResponse'
import { ApiError } from '../utils/apiError'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { handlePrismaError } from '../utils/prismaError'

export const errorHandler = (err: Error, req: Request, res: Response, _: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json(new ApiResponse(400, 'Invalid JSON payload'))
    }

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(new ApiResponse(err.statusCode, err.message))
    }

    if (err instanceof ZodError) {
        const response = handleZodError(err)
        return res.status(response.status).json(response)
    }

    if (err instanceof PrismaClientKnownRequestError) {
        const response = handlePrismaError(err)
        return res.status(response.status).json(response)
    }

    console.log(err)
    return res.status(500).json(new ApiResponse(500, 'Internal Server Error'))
}

const handleZodError = (err: ZodError): ApiResponse => {
    const firstIssue = err.issues[0]

    if (firstIssue?.code === 'invalid_type') {
        return new ApiResponse(
            400,
            `${firstIssue.path.join('.')} should be of type ${firstIssue.expected}`
        )
    }

    return new ApiResponse(400, firstIssue?.message || 'Validation Error')
}
