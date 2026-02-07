import { Router } from 'express'
import productRouter from './product.route'
import categoryRouter from './category.route'
import { apiRateLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

router.use(apiRateLimiter)
router.use('/product', productRouter)
router.use('/categories', categoryRouter)

export default router
