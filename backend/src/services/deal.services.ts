import { ProductWhereInput } from '../generated/prisma/models'
import DealRepo from '../repositories/deals.repository'
import ProductRepo from '../repositories/product.repository'
import type { createDealInput, updateDealInput } from '../schemas/dealsValidation.schemas'
import { ApiError } from '../utils/apiError'
import { removeUndefined } from '../utils/common'

class DealServices {
    static async calculateTotalPrice(
        items: { productId: string; productVariantId: string | null; quantity: number }[]
    ) {
        let total = 0
        const variantIds = items.map((i) => i.productVariantId).filter((id) => id !== null)
        const productIds = items.map((i) => i.productId)
        const where: ProductWhereInput = {
            id: {
                in: productIds,
            },
            variants: {
                some: {
                    id: {
                        in: variantIds,
                    },
                },
            },
        }
        const products = await ProductRepo.find(where)
        for (const item of items) {
            const product = products.find((p) => p.id === item.productId)
            total += Number(product?.basePrice) * item.quantity
            if (item.productVariantId) {
                const variant = product?.variants.find((v) => v.id === item.productVariantId)
                total += Number(variant?.priceModifier) * item.quantity
            }
        }
        return total
    }

    static async createDeal(dealData: createDealInput) {
        const totalPrice = await this.calculateTotalPrice(dealData.items)
        if (totalPrice + dealData.priceModifier < 0) {
            throw new ApiError(400, 'Price modifier cannot reduce the price below zero')
        }
        const deal = await DealRepo.create(dealData)
        return deal
    }

    static async updateDeal(id: string, dealData: updateDealInput) {
        const cleared = removeUndefined(dealData)
        const existingDeal = await DealRepo.findById(id)
        if (!existingDeal) {
            throw new ApiError(404, 'Deal not found')
        }

        if (cleared.startDate && !cleared.endDate && existingDeal.endDate) {
            if (new Date(cleared.startDate) >= new Date(existingDeal.endDate)) {
                throw new ApiError(400, 'Start date must be less than end date')
            }
        }

        if (cleared.endDate && !cleared.startDate && existingDeal.startDate) {
            if (new Date(cleared.endDate) <= new Date(existingDeal.startDate)) {
                throw new ApiError(400, 'End date must be greater than start date')
            }
        }

        // Check if priceModifier is reducing the price below zero
        if (cleared.priceModifier) {
            const total = await this.calculateTotalPrice(existingDeal.dealItems)
            if (total + cleared.priceModifier < 0) {
                throw new ApiError(400, 'Price modifier cannot reduce the price below zero')
            }
        }

        const updatedDeal = await DealRepo.update(id, cleared)
        return updatedDeal
    }

    static async addItemsToDeal(
        id: string,
        items: { productId: string; productVariantId: string | null; quantity: number }[]
    ) {
        const deal = await DealRepo.findById(id)
        if (!deal) {
            throw new ApiError(404, 'Deal not found')
        }
        for (const item of items) {
            if (
                deal.dealItems.some(
                    (i) =>
                        i.productId === item.productId &&
                        i.productVariantId === item.productVariantId
                )
            ) {
                throw new ApiError(
                    409,
                    `Deal item with productId ${item.productId} and productVariantId ${item.productVariantId} already exists in the deal`
                )
            }
        }
        return await DealRepo.addItems(id, items)
    }

    static async removeDealItem(
        id: string,
        productId: string,
        productVariantId: string | null,
        confirmed: boolean
    ) {
        const deal = await DealRepo.findById(id)
        if (!deal) throw new ApiError(404, 'Deal not found')
        const item = deal.dealItems.find(
            (i) => i.productId === productId && i.productVariantId === productVariantId
        )
        if (!item) throw new ApiError(404, 'Deal item not found in the deal')

        if (!confirmed) {
            const total = await this.calculateTotalPrice(deal.dealItems)
            const itemPrice = await this.calculateTotalPrice([
                { productId, productVariantId, quantity: item.quantity },
            ])
            const priceAfterRemoval = total - itemPrice + Number(deal.priceModifier)
            if (priceAfterRemoval < 0) {
                throw new ApiError(
                    412,
                    'Removing this item will reduce the deal price below zero. Please confirm to proceed with the removal.'
                )
            }
        }

        return await DealRepo.removeItem(id, productId, productVariantId)
    }

    static async getById(id: string) {
        const deal = await DealRepo.findById(id)
        if (!deal) throw new ApiError(404, 'Deal not found')
        return deal
    }

    static async getAll() {
        const deals = await DealRepo.findAll()
        return deals
    }

    static async deleteDeal(id: string) {
        const deal = await DealRepo.delete(id)
        return deal
    }
}

export default DealServices
