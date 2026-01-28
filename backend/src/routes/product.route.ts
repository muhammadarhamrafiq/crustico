import { Router } from 'express'
import { createProduct, uploadImage } from '../controllers/product.controller'
import { validator } from '../middlewares/validator.middleware'
import { createProductSchema } from '../schemas/productValidation.schemas'
import { upload, moveToPermanentStorage } from '../middlewares/upload.middleware'

const router = Router()
/**
 * @swagger
 * /product/upload-image:
 *   post:
 *     summary: Upload product image (Step 1 - Get temporary image URL (optional))
 *     description: Upload an image file and receive a temporary URL to use when creating the product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file (JPEG, PNG, GIF, WebP)
 *           encoding:
 *             image:
 *               contentType: image/png, image/jpeg, image/gif, image/webp
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: /uploads/tmp/12018231-412-42141.jpg
 *       400:
 *         description: Invalid file or no file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No file uploaded
 *       415:
 *         description: Unsupported file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Unsupported file type
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *              schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/upload-image', upload.single('image'), uploadImage)

/**
 * @swagger
 * /product/add:
 *   post:
 *     summary: Create a new product (Step 2 - Create product with details and image URL if provided)
 *     description: Create a new product by providing necessary details along with the temporary image URL obtained from the upload-image endpoint
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sku
 *               - slug
 *               - basePrice
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: Margherita Pizza
 *                 minLength: 3
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: Classic pizza with tomato sauce and mozzarella cheese
 *               baseprice:
 *                 type: number
 *                 format: float
 *                 description: Product price
 *                 example: 12.99
 *                 minimum: 0.01
 *               sku:
 *                 type: string
 *                 example: PIZZA-001
 *                 minLength: 6
 *               slug:
 *                 type: string
 *                 example: margherita-pizza
 *                 minLength: 2
 *               image:
 *                 type: string
 *                 example: /uploads/tmp/12018231-412-42141.jpg
 *               categoryIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of category IDs the product belongs to
 *                 example: ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440111"]
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: Large
 *                     description:
 *                       type: string
 *                       example: Large size variant
 *                     priceModifier:
 *                       type: number
 *                       format: float
 *                       example: 3.00
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Product created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: 770e8400-e29b-41d4-a716-446655440222
 *                     name:
 *                       type: string
 *                       example: Margherita Pizza
 *                     description:
 *                       type: string
 *                       example: Classic pizza with tomato sauce and mozzarella cheese
 *                     basePrice:
 *                       type: number
 *                       format: float
 *                       example: 12.99
 *                     sku:
 *                       type: string
 *                       example: PIZZA-001
 *                     slug:
 *                       type: string
 *                       example: margherita-pizza
 *                     image:
 *                       type: string
 *                       example: /uploads/storage/12018231-412-42141.jpg
 *                     createdAt:
 *                       type: string
 *                       example: 2026-01-28T11:31:57.129Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2026-01-28T11:31:57.129Z
 *       400:
 *         description: Validation error or Invalid JSON payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 400
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: name must be at least 3 characters long
 *       404:
 *         description: Category not found or temp image not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 404
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Referenced category not found
 *       409:
 *         description: Conflict in unique fields like SKU or slug
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 409
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: sku already exists in products
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 500
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.post('/add', moveToPermanentStorage, validator(createProductSchema), createProduct)

export default router
