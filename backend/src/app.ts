import express from 'express'
import type { Request, Response } from 'express'
import productRouter from './routes/product.route'
import { errorHandler } from './middlerwares/error.middleware'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1/product', productRouter)

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Server is working properly!')
})

app.use(errorHandler)

export default app
