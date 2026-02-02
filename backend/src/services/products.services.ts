import ProductRepo from '../repositories/product.repository'
import type { createProductInput, updateProductInput } from '../schemas/productValidation.schemas'
import { removeUndefined } from '../utils/removeUndefined'
import { deleteFile } from '../utils/deleteFile'
import { ApiError } from '../utils/apiError'

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
}

export default ProductService
