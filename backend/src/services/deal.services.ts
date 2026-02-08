import DealRepo from '../repositories/deals.repository'
import type { createDealInput } from '../schemas/dealsValidation.schemas'

class DealServices {
    static async createDeal(dealData: createDealInput) {
        const deal = await DealRepo.create(dealData)
        return deal
    }
}

export default DealServices
