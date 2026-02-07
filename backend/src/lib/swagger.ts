import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi'
import registerPaths from '../docs'

export const registry = new OpenAPIRegistry()
registerPaths()

export const openApiDoc = new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.0',
    info: {
        title: 'Crustico Api',
        version: '1.0.0',
        description: 'API documentation for Crustico application',
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 8080}/api/v1`,
            description: 'Local development server',
        },
    ],
    tags: [
        { name: 'Products', description: 'Operations related to products' },
        { name: 'Category', description: 'Operations related to categories' },
    ],
})
