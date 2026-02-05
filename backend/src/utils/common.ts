import { ProductGetPayload } from '../generated/prisma/models'

function removeUndefined<T extends Record<string, unknown>>(obj: T) {
    return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined)) as {
        [K in keyof T as T[K] extends undefined ? never : K]: Exclude<T[K], undefined>
    }
}

function formatProduct(
    product: ProductGetPayload<{
        include: {
            variants: true
            productCategories: {
                include: {
                    category: true
                }
            }
        }
    }>
) {
    const { productCategories, ...rest } = product
    return {
        ...rest,
        image: rest.image?.trim() === '' ? null : rest.image,
        categories: productCategories.map((pc) => pc.category),
    }
}

export { removeUndefined, formatProduct }
