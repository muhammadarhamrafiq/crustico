import { Router } from 'express'
import {
    createProduct,
    uploadImage,
    updateProduct,
    updateProductImage,
    removeProductImage,
} from '../controllers/product.controller'
import { validator } from '../middlewares/validator.middleware'
import { createProductSchema, updateProductSchema } from '../schemas/productValidation.schemas'
import { upload, moveToPermanentStorage } from '../middlewares/upload.middleware'
import { idParamsSchema } from '../schemas/commons.schema'
const router = Router()

router.post('/upload-image', upload.single('image'), uploadImage)
router.post('/add', validator(createProductSchema), moveToPermanentStorage, createProduct)
router.patch(
    '/:id/update',
    validator(idParamsSchema, 'params'),
    validator(updateProductSchema),
    updateProduct
)
router.patch(
    '/:id/update-image',
    upload.single('image'),
    validator(idParamsSchema, 'params'),
    moveToPermanentStorage,
    updateProductImage
)
router.delete('/:id/remove-image', validator(idParamsSchema, 'params'), removeProductImage)

export default router
