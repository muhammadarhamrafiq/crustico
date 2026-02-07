import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const categorySchema = z
    .object({
        name: z.string().trim().min(3, 'Name must contain at least 3 characters'),
        slug: z
            .string()
            .trim()
            .min(3, 'Slug must be at least 3 characters long')
            .toLowerCase()
            .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
        description: z
            .string()
            .trim()
            .min(10, 'Description should contain atleast 10 character')
            .optional()
            .default('No Description'),
    })
    .openapi('categorySchema', {
        example: {
            name: 'pizzas',
            slug: 'pizzas',
            description: 'pizzas require no description you all know that',
        },
    })

export const categoryResponse = z.object({
    status: z.number().openapi({ example: 201 }),
    success: z.boolean().openapi({ example: true }),
    message: z.string().openapi({ example: 'Category created successfully' }),
    data: categorySchema,
})
export type categoryInput = z.infer<typeof categorySchema>
