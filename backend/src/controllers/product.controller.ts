import { asyncHandler } from '../utils/asynHandler'
import ProductRepo from '../repositories/product.repository'
import type { Request, Response } from 'express'
import { ApiResponse } from '../utils/apiResponse'

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await ProductRepo.createProduct(req.body)
    return res.status(201).json(new ApiResponse(201, 'Product created successfully', product))
})
