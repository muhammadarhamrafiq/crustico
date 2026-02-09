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
