import { registry } from '../lib/swagger'
import {
    createDealSchema,
    createDealResponseSchema,
    updateDealSchema,
    updateDealResponseSchema,
    addItemsSchema,
    addItemsResponseSchema,
} from '../schemas/dealsValidation.schemas'
import {
    BadRequestErrorSchema,
    ConflictErrorSchema,
    InternalServerErrorSchema,
    NotFoundErrorSchema,
    PreConditionFailedErrorSchema,
    UnprocessableEntityErrorSchema,
} from '../schemas/error.schema'

const registerDealPaths = () => {
    registry.register('createDeal', createDealSchema)
    registry.registerPath({
        method: 'post',
        path: '/api/v1/deals/add',
        tags: ['Deals'],
        summary: 'Add a new deal',
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        $ref: '#components/schemas/createProductSchema',
                    },
                },
            },
        },
        responses: {
            201: {
                description: 'Deal created successfully',
                content: {
                    'application/json': {
                        schema: createDealResponseSchema,
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
            409: {
                description: 'Deal with the same name or slug already exists',
                content: {
                    'application/json': {
                        schema: ConflictErrorSchema,
                    },
                },
            },
            422: {
                description: 'Invalid product or product variant reference',
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

    registry.register('updateDeal', updateDealSchema)
    registry.registerPath({
        method: 'patch',
        path: '/deal/{id}/update',
        summary: 'Update Deal',
        tags: ['Deals'],
        parameters: [
            {
                in: 'path',
                name: 'id',
                schema: {
                    type: 'string',
                    format: 'uuid',
                },
                required: true,
            },
        ],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        $ref: '#components/schemas/updateProductSchema',
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Deal updated successfully',
                content: {
                    'application/json': {
                        schema: updateDealResponseSchema,
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
            404: {
                description: 'Deal not found',
                content: {
                    'application/json': {
                        schema: NotFoundErrorSchema,
                    },
                },
            },
            409: {
                description: 'Name or slug is already used',
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

    registry.register('addItemsSchema', addItemsSchema)
    registry.registerPath({
        method: 'patch',
        path: '/deal/{id}/add-items',
        tags: ['Deals'],
        summary: 'Add items to deal',
        parameters: [
            {
                in: 'path',
                name: 'id',
                schema: {
                    type: 'string',
                    format: 'uuid',
                },
            },
        ],
        requestBody: {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        $ref: '#components/deals/addItemsSchema',
                    },
                },
            },
        },
        responses: {
            200: {
                description: 'Items add successfully',
                content: {
                    'application/json': {
                        schema: addItemsResponseSchema,
                    },
                },
            },
            400: {
                description: 'Invalid Request Format',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            404: {
                description: 'Deal not found',
                content: {
                    'application/json': {
                        schema: NotFoundErrorSchema,
                    },
                },
            },
            409: {
                description: 'Item already exits',
                content: {
                    'application/json': {
                        schema: ConflictErrorSchema,
                    },
                },
            },
            422: {
                description: 'Referenced productId or variant not found',
                content: {
                    'application/json': {
                        schema: UnprocessableEntityErrorSchema,
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
        path: '/deal/{id}/remove-deal',
        tags: ['Deals'],
        summary: 'Remove item from deal',
        parameters: [
            {
                in: 'path',
                name: 'id',
                schema: {
                    type: 'string',
                    format: 'uuid',
                },
            },
            {
                in: 'query',
                name: 'productId',
            },
            {
                in: 'query',
                name: 'productVariantId',
            },
        ],
        responses: {
            200: {
                description: 'Item Deleted Successfully',
                content: {
                    'application/json': {
                        schema: addItemsResponseSchema,
                    },
                },
            },
            400: {
                description: 'productId missing',
                content: {
                    'application/json': {
                        schema: BadRequestErrorSchema,
                    },
                },
            },
            404: {
                description: 'Deal/ Deal item not found',
                content: {
                    'application/json': {
                        schema: NotFoundErrorSchema,
                    },
                },
            },
            412: {
                description: '',
                content: {
                    'application/json': {
                        schema: PreConditionFailedErrorSchema,
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
        path: 'deals/{id}',
        tags: ['Deals'],
        summary: 'Get deal by id',
        parameters: [
            {
                in: 'path',
                name: 'id',
                schema: {
                    type: 'string',
                    format: 'uuid',
                },
            },
        ],
        responses: {
            200: {
                description: 'product fetched successsfully',
            },
            404: {
                description: 'product not found',
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
        method: 'get',
        path: '/deals',
        tags: ['Deals'],
        summary: 'Fetch all deals',
        parameters: [
            {
                in: 'path',
                name: 'id',
                schema: {
                    type: 'string',
                    format: 'uuid',
                },
            },
        ],
        responses: {
            200: {
                description: '',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                deals: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: {
                                                type: 'string',
                                                format: 'uuid',
                                            },
                                            name: {
                                                type: 'string',
                                            },
                                            slug: {
                                                type: 'string',
                                            },
                                            description: {
                                                type: 'string',
                                            },
                                            priceModifier: {
                                                type: 'number',
                                            },
                                        },
                                    },
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
        method: 'delete',
        path: '/deals/{id}',
        tags: ['Deals'],
        summary: 'Delete a deal',
        description: 'Deletes a deal by its ID',
        parameters: [
            {
                in: 'path',
                name: 'id',
                schema: {
                    type: 'string',
                    format: 'uuid',
                },
            },
        ],
        responses: {
            200: {
                description: 'Deal deleted successfully',
            },
            404: {
                description: 'Deal not found',
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

export default registerDealPaths
