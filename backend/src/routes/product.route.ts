import { Router } from 'express'
import { createProduct } from '../controllers/product.controller'
import { validator } from '../middlerwares/validator.middleware'
import { createProductSchema } from '../schemas/productValidation.schemas'

const router = Router()

router.post('/add', validator(createProductSchema), createProduct)

export default router
