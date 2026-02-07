import express from 'express'
import startCleanUpJob from './jobs/cleanup'
import helmet from 'helmet'
import cors from 'cors'
import httpLogger from './middlewares/httpLogger.midlleware'
import path from 'path'
import router from './routes'
import { errorHandler } from './middlewares/error.middleware'
import SwaggerUi from 'swagger-ui-express'
import { openApiDoc } from './lib/swagger'

const app = express()
startCleanUpJob()

app.use(helmet())
app.use(cors())
app.use(httpLogger)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
    '/api-docs',
    SwaggerUi.serve,
    SwaggerUi.setup(openApiDoc, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Api Documentation',
        isExplorer: false,
        swaggerOptions: {
            defaultModelsExpandDepth: -1,
            docExpansion: 'list',
        },
    })
)
app.use('/image', express.static(path.join(__dirname, '../uploads/storage')))

app.use('/api/v1', router)
app.get('/', (_req, res) => {
    res.status(200).json({
        name: 'Crustico Api Server',
        version: '1.0.0',
        message: 'Welcome to Crustico Api Server',
        documentation: '/api-docs',
        endpoints: {
            products: '/api/v1/product',
        },
    })
})
app.get('/api-docs.json', (_req, res) => {
    res.status(200).json(openApiDoc)
})

app.use(errorHandler)

export default app
