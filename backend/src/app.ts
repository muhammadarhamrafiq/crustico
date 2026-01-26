import express from 'express'
import type { Request, Response } from 'express'
import productRouter from './routes/product.route'
import { errorHandler } from './middlewares/error.middleware'
import path from 'path'
import startCleanUpJob from './jobs/cleanup'

const app = express()
startCleanUpJob()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/image', express.static(path.join(__dirname, '../uploads/storage')))

app.use('/api/v1/product', productRouter)

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Server is working properly!')
})

app.use(errorHandler)

export default app
