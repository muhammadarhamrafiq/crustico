import { asyncHandler } from '../utils/asynHandler'
import type { Request, Response } from 'express'
import { ApiResponse } from '../utils/apiResponse'
import { ApiError } from '../utils/apiError'
import ProductService from '../services/products.services'

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw new ApiError(400, 'No file uploaded')
    return res.status(200).json(
        new ApiResponse(200, 'Image uploaded successfully', {
            url: `${req.file?.path}`,
        })
    )
})

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const productData = req.body
    const newProduct = await ProductService.createProduct(productData)
    return res.status(201).json(new ApiResponse(201, 'Product created successfully', newProduct))
})
