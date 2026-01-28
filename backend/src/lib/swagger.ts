import swaggerJsDoc from 'swagger-jsdoc'
import type { Options } from 'swagger-jsdoc'

const options: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Crustico API Documentation',
            version: '1.0.0',
            description:
                'API documentation for Crustico application a firm mangement application for a fast food resturant',
        },
        tags: [
            {
                name: 'Products',
                description: 'API endpoints for managing products',
            },
        ],
        servers: [
            {
                url: 'http://localhost:8080/api/v1',
                description: 'Local development server',
            },
        ],
    },
    apis: ['src/routes/*.ts'],
}

const specs = swaggerJsDoc(options)
export default specs
