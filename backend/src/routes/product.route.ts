import { Router } from 'express'
import { createProduct, uploadImage, updateProduct } from '../controllers/product.controller'
import { validator } from '../middlewares/validator.middleware'
import { createProductSchema, updateProductSchema } from '../schemas/productValidation.schemas'
import { upload, moveToPermanentStorage } from '../middlewares/upload.middleware'
import { idParamsSchema } from '../schemas/commons.schema'
const router = Router()

router.post('/upload-image', upload.single('image'), uploadImage)
router.post('/add', moveToPermanentStorage, validator(createProductSchema), createProduct)
router.patch(
    '/:id/update',
    validator(idParamsSchema, 'params'),
    validator(updateProductSchema),
    updateProduct
)

export default router
