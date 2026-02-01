import { z } from 'zod'

export const idParamsSchema = z.object({
    id: z.uuid('Id must be a valid UUID'),
})
