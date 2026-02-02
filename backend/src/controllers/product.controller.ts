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

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const productData = req.body
    const productId = req.params.id
    const updatedProduct = await ProductService.updateProduct(productId as string, productData)
    return res
        .status(200)
        .json(new ApiResponse(200, 'Product updated successfully', updatedProduct))
})

export const updateProductImage = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id
    const updatedProduct = await ProductService.updateProductImage(
        productId as string,
        req.body.image
    )
    return res
        .status(200)
        .json(new ApiResponse(200, 'Product image updated successfully', updatedProduct))
})

export const removeProductImage = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id
    const updatedProduct = await ProductService.removeProductImage(productId as string)
    return res
        .status(200)
        .json(new ApiResponse(200, 'Product image removed successfully', updatedProduct))
})
