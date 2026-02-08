import { Router } from 'express'
import { validator } from '../middlewares/validator.middleware'
import { createDealSchema } from '../schemas/dealsValidation.schemas'
import { createDeal } from '../controllers/deals.controller'

const router = Router()

router.post('/add', validator(createDealSchema), createDeal)

export default router
