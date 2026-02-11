import { Router } from 'express'
import { validator } from '../middlewares/validator.middleware'
import {
    addItemsSchema,
    createDealSchema,
    updateDealSchema,
    removeDealItemSchema,
} from '../schemas/dealsValidation.schemas'
import {
    createDeal,
    updateDeal,
    addItemsToDeal,
    removeDealItem,
    getDealById,
    getAllDeals,
    deleteDeal,
} from '../controllers/deals.controller'
import { idParamsSchema } from '../schemas/commons.schema'

const router = Router()

router.post('/add', validator(createDealSchema), createDeal)
router.patch(
    '/:id/update',
    validator(updateDealSchema),
    validator(idParamsSchema, 'params'),
    updateDeal
)

router.patch(
    '/:id/add-items',
    validator(idParamsSchema, 'params'),
    validator(addItemsSchema),
    addItemsToDeal
)
router.delete(
    '/:id/remove-item',
    validator(idParamsSchema, 'params'),
    validator(removeDealItemSchema, 'query'),
    removeDealItem
)

router.get('/:id', validator(idParamsSchema, 'params'), getDealById)
router.get('/', getAllDeals)
router.delete('/:id', validator(idParamsSchema, 'params'), deleteDeal)

export default router
