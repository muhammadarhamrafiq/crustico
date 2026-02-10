import { registry } from '../lib/swagger'
import {
    createDealSchema,
    createDealResponseSchema,
    updateDealSchema,
    updateDealResponseSchema,
} from '../schemas/dealsValidation.schemas'
import {
    BadRequestErrorSchema,
    ConflictErrorSchema,
    InternalServerErrorSchema,
    NotFoundErrorSchema,
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
}

export default registerDealPaths
