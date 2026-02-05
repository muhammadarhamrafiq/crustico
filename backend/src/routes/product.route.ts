import { Router } from 'express'
import {
    createProduct,
    uploadImage,
    updateProduct,
    updateProductImage,
    removeProductImage,
    addCategoriesToProduct,
    removeCategoryFromProduct,
    addProductVariants,
    updateVariant,
    deleteVariant,
    deleteProduct,
    getProductById,
    getProducts,
} from '../controllers/product.controller'
import { validator } from '../middlewares/validator.middleware'
import {
    addProductCategoriesSchema,
    createProductSchema,
    updateProductSchema,
    removeCategoryFromProductSchema,
    productVariantSchema,
    updateVariantSchema,
} from '../schemas/productValidation.schemas'
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

router.patch(
    '/:id/add-categories',
    validator(idParamsSchema, 'params'),
    validator(addProductCategoriesSchema),
    addCategoriesToProduct
)
router.delete(
    '/:id/remove-category/:categoryId',
    validator(removeCategoryFromProductSchema, 'params'),
    removeCategoryFromProduct
)

router.patch(
    '/:id/add-variants',
    validator(idParamsSchema, 'params'),
    validator(productVariantSchema),
    addProductVariants
)
router.patch(
    '/update-variant/:id',
    validator(updateVariantSchema),
    validator(idParamsSchema, 'params'),
    updateVariant
)

router.delete('/delete-variant/:id', validator(idParamsSchema, 'params'), deleteVariant)

router.delete('/:id/delete', validator(idParamsSchema, 'params'), deleteProduct)
router.get('/:id', validator(idParamsSchema, 'params'), getProductById)
router.get('/', getProducts)
export default router
