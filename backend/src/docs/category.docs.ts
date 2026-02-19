import { registry } from '../lib/swagger'
import { categorySchema, categoryResponse } from '../schemas/categoryValidation.schema'
import {
    BadRequestErrorSchema,
    ConflictErrorSchema,
    InternalServerErrorSchema,
    NotFoundErrorSchema,
} from '../schemas/error.schema'

const registerCategoryPaths = () => {
    registry.register('categorySchema', categorySchema)
    registry.registerPath({
        method: 'post',
        path: '/categories/add',
        summary: 'Create Category',
        tags: ['Category'],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        $ref: '#components/schemas/categorySchema',
                    },
                },
            },
        },
        responses: {
            201: {
                description: 'Category was added successfully',
                content: {
                    'application/json': {
                        schema: categoryResponse,
                    },
                },
            },
            400: {
                description: 'Invalid Input',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            409: {
                description: 'Unique constraint failed for name or slug',
                content: {
                    'application/json': {
                        schema: ConflictErrorSchema,
                    },
                },
            },
            500: {
                description: 'Internal Server Error',
                content: {
                    'application/json': {
                        schema: InternalServerErrorSchema,
                    },
                },
            },
        },
    })

    registry.registerPath({
        method: 'get',
        path: '/categories/',
        summary: 'Get All Categories',
        tags: ['Category'],
        responses: {
            200: {
                description: 'List of all categories',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: { type: 'number', example: 200 },
                                success: { type: 'boolean', example: true },
                                message: {
                                    type: 'string',
                                    example: 'Categories retrieved successfully',
                                },
                                data: {
                                    type: 'array',
                                    items: { $ref: '#components/schemas/categorySchema' },
                                },
                            },
                        },
                    },
                },
            },
            500: {
                description: 'Internal Server Error',
                content: {
                    'application/json': {
                        schema: InternalServerErrorSchema,
                    },
                },
            },
        },
    })

    registry.registerPath({
        method: 'get',
        path: '/categories/{id}',
        summary: 'Get Category by Id',
        tags: ['Category'],
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
            },
        ],
        responses: {
            200: {
                description: 'Category details',
                content: {
                    'application/json': {
                        schema: categoryResponse,
                    },
                },
            },
            400: {
                description: 'Invalid ID supplied',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            404: {
                description: 'Category not found',
                content: {
                    'application/json': {
                        schema: NotFoundErrorSchema,
                    },
                },
            },
            500: {
                description: 'Internal Server Error',
                content: {
                    'application/json': {
                        schema: InternalServerErrorSchema,
                    },
                },
            },
        },
    })

    registry.registerPath({
        method: 'put',
        path: '/categories/{id}',
        summary: 'Update Category by Id',
        tags: ['Category'],
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
            },
        ],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        $ref: '#components/schemas/categorySchema',
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Category updated successfully',
                content: {
                    'application/json': {
                        schema: categoryResponse,
                    },
                },
            },
            400: {
                description: 'Invalid ID supplied or Invalid Input',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            404: {
                description: 'Category not found',
                content: {
                    'application/json': {
                        schema: NotFoundErrorSchema,
                    },
                },
            },
            409: {
                description: 'Unique constraint failed for name or slug',
                content: {
                    'application/json': {
                        schema: ConflictErrorSchema,
                    },
                },
            },
            500: {
                description: 'Internal Server Error',
                content: {
                    'application/json': {
                        schema: InternalServerErrorSchema,
                    },
                },
            },
        },
    })

    registry.registerPath({
        method: 'delete',
        path: '/categories/{id}',
        summary: 'Delete Category by Id',
        tags: ['Category'],
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
            },
        ],
        responses: {
            200: {
                description: 'Category deleted successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: { type: 'number', example: 200 },
                                success: { type: 'boolean', example: true },
                                message: {
                                    type: 'string',
                                    example: 'Category deleted successfully',
                                },
                            },
                        },
                    },
                },
            },
            400: {
                description: 'Invalid ID supplied',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            404: {
                description: 'Category not found',
                content: {
                    'application/json': {
                        schema: NotFoundErrorSchema,
                    },
                },
            },
            500: {
                description: 'Internal Server Error',
                content: {
                    'application/json': {
                        schema: InternalServerErrorSchema,
                    },
                },
            },
        },
    })
}

export default registerCategoryPaths
