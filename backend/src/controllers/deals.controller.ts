import DealServices from '../services/deal.services'
import type { Request, Response } from 'express'
import { asyncHandler } from '../utils/asynHandler'
import { ApiResponse } from '../utils/apiResponse'

export const createDeal = asyncHandler(async (req: Request, res: Response) => {
    const deal = await DealServices.createDeal(req.body)
    return res.status(201).json(new ApiResponse(201, 'Deal created successfully', deal))
})

export const updateDeal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const updatedDeal = await DealServices.updateDeal(id as string, req.body)
    return res.status(200).json(new ApiResponse(200, 'Deal updated successfully', updatedDeal))
})

export const addItemsToDeal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const items = req.body.items
    const updatedDeal = await DealServices.addItemsToDeal(id as string, items)
    return res.status(200).json(new ApiResponse(200, 'Items added to deal', updatedDeal))
})

export const removeDealItem = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const { productId, productVariantId, confirmed } = req.query
    const updatedDeal = await DealServices.removeDealItem(
        id as string,
        productId as string,
        productVariantId as string | null,
        confirmed === 'true'
    )
    return res.status(200).json(new ApiResponse(200, 'Deal item removed successfully', updatedDeal))
})

export const getDealById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const deal = await DealServices.getById(id as string)
    return res.status(200).json(new ApiResponse(200, 'Deal retrieved successfully', deal))
})

export const getAllDeals = asyncHandler(async (req: Request, res: Response) => {
    const deals = await DealServices.getAll()
    return res.status(200).json(new ApiResponse(200, 'Deals retrieved successfully', deals))
})

export const deleteDeal = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params
    const deletedDeal = await DealServices.deleteDeal(id as string)
    return res.status(200).json(new ApiResponse(200, 'Deal deleted successfully', deletedDeal))
})
