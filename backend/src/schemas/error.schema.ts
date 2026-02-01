import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const ErrorSchema = (status: number, message: string) =>
    z.object({
        status: z.number().openapi({ description: 'HTTP status code', example: status }),
        success: z
            .boolean()
            .openapi({ description: 'Indicates if the request was successful', example: false }),
        message: z.string().openapi({ description: 'Error message', example: message }),
    })

export const BadRequestErrorSchema = ErrorSchema(400, 'Invalid input data')
export const NotFoundErrorSchema = ErrorSchema(404, 'Resource not found')
export const ConflictErrorSchema = ErrorSchema(409, 'Conflict in unique fields')
export const UnsupportedMediaTypeErrorSchema = ErrorSchema(415, 'Unsupported file type')
export const InternalServerErrorSchema = ErrorSchema(500, 'Internal server error')
export const UnprocessableEntityErrorSchema = ErrorSchema(422, 'Unprocessable entity')
