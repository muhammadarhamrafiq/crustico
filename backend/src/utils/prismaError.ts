import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { ApiResponse } from './apiResponse'

const foriegnKeyErrorMessages: Record<string, string> = {
    variants_product_id_fkey: 'Referenced product not found',
    category_products_product_id_fkey: 'Referenced product not found',
    category_products_category_id_fkey: 'Referenced category not found',
    deal_items_deal_id_fkey: 'Referenced deal not found',
    deal_items_product_id_fkey: 'Referenced product not found',
    deal_items_product_variant_id_fkey: 'Referenced product variant not found',
}

export const handlePrismaError = (err: PrismaClientKnownRequestError): ApiResponse => {
    switch (err.code) {
        case 'P2002':
            return handleUniqueConstraintError(err)
        case 'P2003':
            return handleInvalidReferenceError(err)
        case 'P2017':
            return new ApiResponse(
                404,
                'Relation not found',
                process.env.NODE_ENV !== 'production'
                    ? { mesage: err.message, stack: err.stack }
                    : undefined
            )
        case 'P2025':
            return handleRecordNotFoundError(err)
        default:
            return new ApiResponse(
                400,
                'Database Error',
                process.env.NODE_ENV !== 'production'
                    ? { mesage: err.message, stack: err.stack }
                    : undefined
            )
    }
}

const handleUniqueConstraintError = (err: PrismaClientKnownRequestError): ApiResponse => {
    const { meta } = err
    const modelName = meta?.modelName

    const stringified = JSON.stringify(meta?.driverAdapterError)
    const driverError = JSON.parse(stringified)

    const field = driverError?.cause?.constraint?.fields[0]

    return new ApiResponse(
        409,
        `${field} already exist in ${modelName}`,
        process.env.NODE_ENV !== 'production'
            ? { mesage: err.message, stack: err.stack }
            : undefined
    )
}

const handleInvalidReferenceError = (err: PrismaClientKnownRequestError): ApiResponse => {
    const { meta } = err

    const stringified = JSON.stringify(meta?.driverAdapterError)
    const driverError = JSON.parse(stringified)
    const index: string = driverError.cause.constraint.index

    return new ApiResponse(
        422,
        foriegnKeyErrorMessages[index] || 'Referenced resource not found',
        process.env.NODE_ENV !== 'production'
            ? { mesage: err.message, stack: err.stack }
            : undefined
    )
}

const handleRecordNotFoundError = (err: PrismaClientKnownRequestError): ApiResponse => {
    return new ApiResponse(
        404,
        `${err.meta?.modelName} not found`,
        process.env.NODE_ENV !== 'production'
            ? { message: err.message, stack: err.stack }
            : undefined
    )
}
