import { ApiResponse } from '../utils/apiResponse'
import { asyncHandler } from '../utils/asynHandler'
import type { Request, Response } from 'express'
import CategoryService from '../services/category.services'

export const addCategory = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body
    const category = await CategoryService.createCategory(data)
    return res.status(201).json(new ApiResponse(201, 'Category added successfully', category))
})

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await CategoryService.getCategories()
    return res.status(200).json(new ApiResponse(200, 'Categories Fetched', categories))
})

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.getCategoryById(req.params.id as string)
    return res.status(200).json(new ApiResponse(200, 'Category fetched successfully', category))
})

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.update(req.params.id as string, req.body)
    return res.status(200).json(new ApiResponse(200, 'Category updated successfully', category))
})

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const category = await CategoryService.delete(req.params.id as string)
    return res.status(200).json(new ApiResponse(200, 'Category deleted successfully', category))
})
