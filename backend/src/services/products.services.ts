import ProductRepo from '../repositories/product.repository'
import VariantRepo from '../repositories/variant.repository'
import DealsRepo from '../repositories/deals.repository'
import type {
    addProductVariantsInput,
    createProductInput,
    updateProductInput,
    updateVariantInput,
} from '../schemas/productValidation.schemas'
import { removeUndefined, formatProduct } from '../utils/common'
import { deleteFile } from '../utils/deleteFile'
import { ApiError } from '../utils/apiError'
import { ProductWhereInput } from '../generated/prisma/models'

class ProductService {
    static async createProduct(productData: createProductInput) {
        return await ProductRepo.createProduct(productData)
    }

    static async updateProduct(id: string, productData: updateProductInput) {
        const cleaned = removeUndefined(productData)
        return await ProductRepo.updateProduct(id, cleaned)
    }

    static async updateProductImage(id: string, file: string | undefined) {
        if (!file) throw new ApiError(400, 'Image File not provided')
        const product = await ProductRepo.findById(id)
        try {
            const updatedProduct = await ProductRepo.updateProduct(id, { image: file })
            if (product?.image) deleteFile(product?.image)
            return updatedProduct
        } catch (err) {
            deleteFile(file)
            throw err
        }
    }

    static async removeProductImage(id: string) {
        const product = await ProductRepo.findById(id)
        const updatedProduct = await ProductRepo.updateProduct(id, { image: '' })
        if (product?.image) deleteFile(product?.image)
        return updatedProduct
    }

    static async addCategoriesToProduct(id: string, categoryIds: string[]) {
        const updatedProduct = await ProductRepo.addCategories(id, categoryIds)
        return updatedProduct
    }

    static async removeCategoryFromProduct(id: string, categoryId: string) {
        const product = await ProductRepo.findById(id)
        if (!product) {
            throw new ApiError(404, 'Product not found')
        }
        const updatedProduct = await ProductRepo.removeCategory(id, categoryId)
        return updatedProduct
    }

    static async addProductVariants(id: string, variant: addProductVariantsInput) {
        const exitingVariant = await ProductRepo.findVariantByLabel(id, variant.label)
        if (exitingVariant) {
            throw new ApiError(409, 'Variant with this label already exits')
        }
        const updatedProduct = await ProductRepo.addVariants(id, variant)
        return updatedProduct
    }

    static async updateVariant(id: string, variantData: updateVariantInput) {
        const cleaned = removeUndefined(variantData)
        if (cleaned.label) {
            const existingVariant = await VariantRepo.findById(id)
            if (!existingVariant) {
                throw new ApiError(404, 'Variant not found')
            }
            const variantWithSameLabel = await ProductRepo.findVariantByLabel(
                existingVariant.productId,
                cleaned.label
            )
            if (variantWithSameLabel && variantWithSameLabel.id !== id) {
                throw new ApiError(409, 'Variant with this label already exists')
            }
        }
        const updatedVariant = await VariantRepo.updateVariant(id, cleaned)
        return updatedVariant
    }

    static async deleteVariant(id: string, confirm: boolean) {
        const deals = await DealsRepo.countDealsWithVariant(id)
        if (deals > 0 && !confirm) {
            throw new ApiError(
                412,
                'Deletion not confirmed. All associated deals will also be deactivated.'
            )
        }
        const deletedVaraint = await VariantRepo.deleteVariant(id)
        return deletedVaraint
    }

    static async deleteProduct(id: string, confirm: boolean) {
        const deals = await DealsRepo.countDealsWithProduct(id)
        if (deals > 0 && !confirm) {
            throw new ApiError(
                412,
                'Deletion not confirmed. All associated deals will also be deactivated.'
            )
        }
        const deletedProduct = await ProductRepo.deleteProduct(id)
        return deletedProduct
    }

    static async getProductById(id: string) {
        const product = await ProductRepo.findById(id)
        if (!product) {
            throw new ApiError(404, 'Product not found')
        }

        const formattedProduct = formatProduct(product)
        return formattedProduct
    }

    static async getProducts(categoryId: string, search: string, page: number, limit: number) {
        const where: ProductWhereInput = {}
        if (categoryId) {
            where.productCategories = {
                some: {
                    categoryId: categoryId,
                },
            }
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
            ]
        }
        const products = await ProductRepo.findAll(where, page, limit)
        const totalProduct = await ProductRepo.countAll(where)
        const formattedProducts = products.map(formatProduct)

        return {
            products: formattedProducts,
            pagination: {
                page,
                limit,
                total: totalProduct,
                pages: Math.ceil(totalProduct / limit),
            },
        }
    }
}

export default ProductService
