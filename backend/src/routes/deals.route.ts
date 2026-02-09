import { Router } from 'express'
import { validator } from '../middlewares/validator.middleware'
import { createDealSchema, updateDealSchema } from '../schemas/dealsValidation.schemas'
import { createDeal, updateDeal } from '../controllers/deals.controller'
import { idParamsSchema } from '../schemas/commons.schema'

const router = Router()

router.post('/add', validator(createDealSchema), createDeal)
router.patch(
    '/:id/update',
    validator(updateDealSchema),
    validator(idParamsSchema, 'params'),
    updateDeal
)

export default router
