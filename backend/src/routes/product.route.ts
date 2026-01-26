import { Router } from 'express'
import { createProduct, uploadImage } from '../controllers/product.controller'
import { validator } from '../middlewares/validator.middleware'
import { createProductSchema } from '../schemas/productValidation.schemas'
import { upload, moveToPermanentStorage } from '../middlewares/upload.middleware'

const router = Router()

router.post('/upload-image', upload.single('image'), uploadImage)
router.post('/add', moveToPermanentStorage, validator(createProductSchema), createProduct)

export default router
