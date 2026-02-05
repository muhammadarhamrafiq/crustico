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
    productVariantSchema,
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

    registry.registerPath({
        method: 'patch',
        path: '/product/{id}/add-categories',
        tags: ['Products'],
        summary: 'Add categories to a product',
        description: 'Associate one or more categories with the specified product',
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid',
                    description: 'UUID of the product to add categories to',
                },
            },
        ],
        requestBody: {
            description: 'Categories to add to the product',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            categoryIds: {
                                type: 'array',
                                items: {
                                    type: 'string',
                                    format: 'uuid',
                                    description:
                                        'UUID of the category to associate with the product',
                                },
                                example: [
                                    '550e8400-e29b-41d4-a716-446655440000',
                                    '550e8400-e29b-41d4-a716-446655440001',
                                ],
                            },
                        },
                    },
                },
            },
            required: true,
        },
        responses: {
            200: {
                description: 'Categories added successfully',
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
                                    example: 'Categories added to product successfully',
                                },
                            },
                        },
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

    registry.registerPath({
        method: 'delete',
        path: '/product/{id}/remove-category/{categoryId}',
        tags: ['Products'],
        summary: 'Remove category from a product',
        description: 'Dissociate a category from the specified product',
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid',
                    description: 'UUID of the product to remove category from',
                },
            },
            {
                name: 'categoryId',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid',
                    description: 'UUID of the category to dissociate from the product',
                },
            },
        ],
        responses: {
            200: {
                description: 'Category removed successfully',
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
                                    example: 'Category removed from product successfully',
                                },
                            },
                        },
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
                description: 'Product or Category or their relation not found',
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

    registry.register('productVariantSchema', productVariantSchema)
    registry.registerPath({
        path: '/product/{id}/add-variants',
        method: 'patch',
        tags: ['Products'],
        summary: 'Add variants to a product',
        description: 'Add one or more variants to the specified product',
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid',
                    description: 'UUID of the product to add variants to',
                },
            },
        ],
        requestBody: {
            description: 'Variants to add to the product',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/productVariantSchema',
                    },
                },
            },
            required: true,
        },
        responses: {
            200: {
                description: 'Variants added successfully',
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
                                    example: 'Variants added to product successfully',
                                },
                            },
                        },
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
        path: '/product/update-variant/{id}',
        tags: ['Products'],
        summary: 'Update an existing product variant',
        description: 'Update the details of a specific product variant',
        parameters: [
            {
                name: 'id',
                in: 'path',
                required: true,
                schema: {
                    type: 'string',
                    format: 'uuid',
                    description: 'UUID of the product variant to update',
                },
            },
        ],
        requestBody: {
            description: 'Product variant update payload',
            content: {
                'application/json': {
                    schema: {
                        $ref: '#/components/schemas/productVariantSchema',
                    },
                },
            },
            required: true,
        },
        responses: {
            200: {
                description: 'Product variant updated successfully',
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
                                    example: 'Product variant updated successfully',
                                },
                            },
                        },
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
                description: 'Product variant not found',
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
