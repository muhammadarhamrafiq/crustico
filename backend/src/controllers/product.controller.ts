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

export const addCategoriesToProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { categoryIds } = req.body
    const updatedProduct = await ProductService.addCategoriesToProduct(id as string, categoryIds)
    return res
        .status(200)
        .json(new ApiResponse(200, 'Categories added successfully', updatedProduct))
})

export const removeCategoryFromProduct = asyncHandler(async (req: Request, res: Response) => {
    const { id, categoryId } = req.params
    const updatedProduct = await ProductService.removeCategoryFromProduct(
        id as string,
        categoryId as string
    )
    return res
        .status(200)
        .json(new ApiResponse(200, 'Category removed successfully', updatedProduct))
})

export const addProductVariants = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id
    const updatedProduct = await ProductService.addProductVariants(id as string, req.body)
    return res.status(200).json(new ApiResponse(200, 'Variants added successfully', updatedProduct))
})

export const updateVariant = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id
    const updatedVariant = await ProductService.updateVariant(id as string, req.body)
    return res
        .status(200)
        .json(new ApiResponse(200, 'Variant updated successfully', updatedVariant))
})

export const deleteVariant = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id
    const confirm = req.query.confirm === 'true'
    const result = await ProductService.deleteVariant(id as string, confirm)
    return res.status(200).json(new ApiResponse(200, 'Variant deleted successfully', result))
})
