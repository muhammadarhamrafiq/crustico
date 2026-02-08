import { Router } from 'express'
import productRouter from './product.route'
import categoryRouter from './category.route'
import dealRouter from './deals.route'
import { apiRateLimiter } from '../middlewares/rateLimit.middleware'

const router = Router()

router.use(apiRateLimiter)
router.use('/product', productRouter)
router.use('/categories', categoryRouter)
router.use('/deals', dealRouter)

export default router
