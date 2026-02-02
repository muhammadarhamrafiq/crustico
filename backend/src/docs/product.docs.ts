import { registry } from '../lib/swagger'
import {
    BadRequestErrorSchema,
    ConflictErrorSchema,
    InternalServerErrorSchema,
    NotFoundErrorSchema,
    UnprocessableEntityErrorSchema,
    UnsupportedMediaTypeErrorSchema,
} from '../schemas/error.schema'
import {
    CreateProductResponseSchema,
    createProductSchema,
    UpdateProductResponseSchema,
    updateProductSchema,
} from '../schemas/productValidation.schemas'

const registerPaths = () => {
    registry.registerPath({
        method: 'post',
        path: '/product/upload-image',
        tags: ['Products'],
        summary: 'Upload product image (Step 1 - Get temporary image URL (optional))',
        description:
            'Upload an image file and receive a temporary URL to use when creating the product',
        requestBody: {
            content: {
                'multipart/form-data': {
                    schema: {
                        type: 'object',
                        properties: {
                            image: {
                                type: 'string',
                                format: 'binary',
                                description: 'Product image file (JPEG, PNG, GIF, WebP)',
                            },
                        },
                    },
                },
            },
            required: true,
        },
        responses: {
            200: {
                description: 'Image uploaded successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: {
                                    type: 'number',
                                    example: 200,
                                },
                                success: {
                                    type: 'boolean',
                                    example: true,
                                },
                                message: {
                                    type: 'string',
                                    example: 'Image uploaded successfully',
                                },
                                data: {
                                    type: 'object',
                                    properties: {
                                        url: {
                                            type: 'string',
                                            example: '/uploads/tmp/12018231-412-42141.jpg',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: {
                description: 'Invalid file or no file uploaded',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            415: {
                description: 'Unsupported file type',
                content: {
                    'application/json': {
                        schema: UnsupportedMediaTypeErrorSchema,
                    },
                },
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: InternalServerErrorSchema,
                    },
                },
            },
        },
    })

    registry.register('createProductSchema', createProductSchema)
    registry.registerPath({
        method: 'post',
        path: '/product/add',
        tags: ['Products'],
        summary: 'Create a new product (Step 2 - Create Product)',
        description: 'Create a new product using the provided details',
        requestBody: {
            description: 'Product creation payload',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/createProductSchema',
                    },
                },
            },
            required: true,
        },
        responses: {
            201: {
                description: 'Product created successfully',
                content: {
                    'application/json': {
                        schema: CreateProductResponseSchema,
                    },
                },
            },
            400: {
                description: 'Invalid input data',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            404: {
                description: 'Image not Found',
                content: {
                    'application/json': {
                        schema: NotFoundErrorSchema,
                    },
                },
            },
            409: {
                description: 'A unique value i.e name, sku, slug is already used',
                content: {
                    'application/json': {
                        schema: ConflictErrorSchema,
                    },
                },
            },
            422: {
                description: 'Invalid Category Reference',
                content: {
                    'application/json': {
                        schema: UnprocessableEntityErrorSchema,
                    },
                },
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: InternalServerErrorSchema,
                    },
                },
            },
        },
    })

    registry.register('updateProductSchema', updateProductSchema)
    registry.registerPath({
        method: 'patch',
        path: '/product/{id}/update',
        tags: ['Products'],
        summary: 'Update an exiting product',
        description: 'Update the product and returns the updated data',
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid',
                    description: 'UUID of the product to update',
                },
            },
        ],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/updateProductSchema',
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Product updated successfully',
                content: {
                    'application/json': {
                        schema: UpdateProductResponseSchema,
                    },
                },
            },
            400: {
                description: 'Invalid input data',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            404: {
                description: 'Product not found',
                content: {
                    'application/json': {
                        schema: NotFoundErrorSchema,
                    },
                },
            },
            409: {
                description: 'A unique value i.e name, sku, slug is already used',
                content: {
                    'application/json': {
                        schema: ConflictErrorSchema,
                    },
                },
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: InternalServerErrorSchema,
                    },
                },
            },
        },
    })

    registry.registerPath({
        method: 'patch',
        path: '/product/{id}/update-image',
        tags: ['Products'],
        summary: 'Upload product image for existing product',
        description: 'Upload an image file and update the product image',
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid',
                    description: 'UUID of the product to update the image for',
                },
            },
        ],
        requestBody: {
            content: {
                'multipart/form-data': {
                    schema: {
                        type: 'object',
                        properties: {
                            image: {
                                type: 'string',
                                format: 'binary',
                                description: 'Product image file (JPEG, PNG, GIF, WebP)',
                            },
                        },
                    },
                },
            },
            required: true,
        },
        responses: {
            200: {
                description: 'Image uploaded and product updated successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: {
                                    type: 'number',
                                    example: 200,
                                },
                                success: {
                                    type: 'boolean',
                                    example: true,
                                },
                                message: {
                                    type: 'string',
                                    example: 'Image updated successfully',
                                },
                                data: {
                                    type: 'object',
                                    properties: {
                                        image: {
                                            type: 'string',
                                            example: 'image/12018231-412-42141.jpg',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: {
                description: 'Invalid file or no file uploaded',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            415: {
                description: 'Unsupported file type',
                content: {
                    'application/json': {
                        schema: UnsupportedMediaTypeErrorSchema,
                    },
                },
            },
            404: {
                description: 'Product not found',
                content: {
                    'application/json': {
                        schema: NotFoundErrorSchema,
                    },
                },
            },
            500: {
                description: 'Internal server error',
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
        path: '/product/{id}/remove-image',
        tags: ['Products'],
        summary: 'Delete product image for existing product',
        description: 'Delete the product image associated with the specified product',
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid',
                    description: 'UUID of the product to delete the image for',
                },
            },
        ],
        responses: {
            200: {
                description: 'Image Removed Successfully',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: {
                                    type: 'number',
                                    example: 200,
                                },
                                success: {
                                    type: 'boolean',
                                    example: true,
                                },
                                message: {
                                    type: 'string',
                                    example: 'Image updated successfully',
                                },
                                data: {
                                    type: 'object',
                                    properties: {
                                        image: {
                                            type: 'string',
                                            example: 'image/12018231-412-42141.jpg',
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            400: {
                description: 'Invalid id params',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            404: {
                description: 'Product not found',
                content: {
                    'application/json': {
                        schema: NotFoundErrorSchema,
                    },
                },
            },
            500: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: InternalServerErrorSchema,
                    },
                },
            },
        },
    })
}

export default registerPaths
