import { Router } from 'express'
import { validator } from '../middlewares/validator.middleware'
import { categorySchema } from '../schemas/categoryValidation.schema'
import {
    addCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from '../controllers/category.controller'
import { idParamsSchema } from '../schemas/commons.schema'

const router = Router()

router.post('/add', validator(categorySchema), addCategory)
router.get('/', getCategories)
router.get('/:id', validator(idParamsSchema, 'params'), getCategoryById)
router.put('/:id', validator(idParamsSchema, 'params'), validator(categorySchema), updateCategory)
router.delete('/:id', validator(idParamsSchema, 'params'), deleteCategory)

export default router
